const Sequelize = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize) => {
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

    static initModel() {
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
      return this;
    }
  }
  return Contract;
};
