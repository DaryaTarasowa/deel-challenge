const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const { sequelize } = require('../config/db');

class Contract extends Sequelize.Model {
  static getAllForUser(profileId) {
    return this.findAll({
      where: {
        [Op.and]: {
          [Op.or]: {
            clientId: profileId,
            ContractorId: profileId,
          },
          status: { [Op.ne]: 'terminated' },
        },
      },
    });
  }

  isUserPermitted(profileId) {
    return (
      this.get('ContractorId') === profileId
      || this.get('ClientId') === profileId
    );
  }
}

Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  },
);

module.exports = {
  Contract,
};
