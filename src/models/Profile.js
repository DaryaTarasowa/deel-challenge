const Sequelize = require('sequelize');

const { sequelize } = require('../config/db');

const { Job } = sequelize.models;

class Profile extends Sequelize.Model {
  async isAbleToPay(job) {
    const isPermitted = await job.isUserPermitted(this.get('id'));
    const isUnpaid = !job.get('paid');
    const isEnoughMoney = this.get('balance') >= job.get('price');
    return isPermitted && isUnpaid && isEnoughMoney;
  }

  async pay(job) {
    if (job && await this.isAbleToPay(job)) {
      const balanceToBe = this.get('balance') - job.get('price');
      const result = await sequelize.transaction(async (t) => {
        await this.update({ balance: balanceToBe }, { transaction: t });
        await job.update({
          paid: 1,
          paymentDate: Date.now(),
        }, { transaction: t });
        return { job, balance: this.get('balance') };
      });
      return result;
    }
    throw (new Error('Job can not be paid'));
  }
}

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

module.exports = {
  Profile,
};
