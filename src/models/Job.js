const Sequelize = require('sequelize');

const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const { Contract, Profile } = sequelize.models;

class Job extends Sequelize.Model {
  static getUnpaidForUser(profileId) {
    return this.findAll({
      include: [
        {
          model: Contract,
          required: true,
          attributes: [],
          where: {
            [Op.or]: {
              clientId: profileId,
              ContractorId: profileId,
            },
            status: { [Op.ne]: 'terminated' },
          },
        },
      ],
      where: {
        paid: null,
      },
    });
  }

  static async getUnpaidMoneyTotalForClient(clientId, t) {
    const aggregated = await this.findAll(
      {
        attributes: [
          [sequelize.fn('sum', sequelize.col('price')), 'total_price'],
        ],
        raw: true,
        where: {
          paid: null,
        },
        include: [
          {
            model: Contract,
            required: true,
            attributes: [],
            where: {
              clientId,
              status: { [Op.ne]: 'terminated' },
            },
          },
        ],
      },
      { transaction: t },
    );
    return aggregated;
  }

  async isUserPermitted(profileId) {
    const contract = await Contract.findByPk(this.get('ContractId'));
    return contract?.isUserPermitted(profileId);
  }

  async getContractor() {
    const contract = await Contract.findByPk(this.get('ContractId'));
    const contractorId = contract.get('ContractorId');
    return Profile.findByPk(contractorId);
  }

  async getClient() {
    const contract = await Contract.findByPk(this.get('ContractId'));
    const clientId = contract.get('ClientId');
    return Profile.findByPk(clientId);
  }
}

Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  },
);

module.exports = {
  Job,
};
