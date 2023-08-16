const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Profile extends Sequelize.Model {
    async deposit(depositValue, t) {
      const newBalance = this.get('balance') + depositValue;
      await this.update({ balance: newBalance }, t ? { transaction: t } : null);
      return this.get('balance');
    }

    async isAbleToPay(job) {
      const isPermitted = await job.isUserPermitted(this.get('id'));
      const isUnpaid = !job.get('paid');
      const isEnoughMoney = this.get('balance') >= job.get('price');
      return isPermitted && isUnpaid && isEnoughMoney;
    }

    async pay(job) {
      const contractor = await job.getContractor();
      const isAbleToProceed = job && contractor && await this.isAbleToPay(job);
      if (!isAbleToProceed) throw (new Error('Job can not be paid'));

      const price = job.get('price');
      const clientBalanceToBe = this.get('balance') - price;
      const contractorBalanceToBe = contractor.get('balance') + price;
      return sequelize.transaction(async (t) => {
        await this.update({ balance: clientBalanceToBe }, { transaction: t });
        await contractor.update({ balance: contractorBalanceToBe }, { transaction: t });
        await job.update({
          paid: 1,
          paymentDate: Date.now(),
        }, { transaction: t });
        return { job, clientBalance: this.get('balance'), contractorBalance: contractor.get('balance') };
      });
    }

    static initModel() {
      Profile.init(
        {
          firstName: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          lastName: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          profession: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          balance: {
            type: Sequelize.DECIMAL(12, 2),
          },
          type: {
            type: Sequelize.ENUM('client', 'contractor'),
          },
        },
        {
          sequelize,
          modelName: 'Profile',
        },
      );
      return this;
    }
  }
  return Profile;
};
