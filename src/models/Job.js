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
            [Op.and]: {
              [Op.or]: {
                clientId: profileId,
                ContractorId: profileId,
              },
              status: { [Op.ne]: 'terminated' },
            },
          },
        },
      ],
      where: {
        paid: null,
      },
    });
  }

  async isUserPermitted(profileId) {
    const contract = await Contract.findByPk(this.get('ContractId'));
    return await contract?.isUserPermitted(profileId) ?? false;
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
