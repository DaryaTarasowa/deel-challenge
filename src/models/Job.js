// TODO how to declare {Contract, Profile}
const Sequelize = require('sequelize');

const { Op } = Sequelize;

module.exports = (sequelize) => {
  class Job extends Sequelize.Model {
    static getUnpaidForUser(profileId) {
      const { Contract } = sequelize.models;
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
      const { Contract } = sequelize.models;
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

    static getBestClientForTime({ startDate, endDate, limit }) {
      const { Contract, Profile } = sequelize.models;
      return this.findAll({
        attributes: [
          [sequelize.col('Contract.Client.id'), 'id'],
          [sequelize.literal("firstName || ' ' || lastName"), 'fullName'],
          [sequelize.fn('sum', sequelize.col('price')), 'paid'],
        ],
        where: {
          paid: true,
          paymentDate: { [Op.between]: [startDate, endDate] },
        },
        raw: true,
        order: sequelize.literal('paid DESC'),
        group: ['Contract.Client.id'],
        limit,
        include: [
          {
            model: Contract,
            as: 'Contract',
            required: true,
            attributes: [],
            include: [{
              model: Profile,
              as: 'Client',
              required: true,
              attributes: [],
            }],
          },
        ],
      });
    }

    static getBestProfessionForTime({ startDate, endDate }) {
      const { Contract, Profile } = sequelize.models;
      return this.findOne({
        attributes: [
          [sequelize.fn('sum', sequelize.col('price')), 'maxPayment'],
          [sequelize.col('Contract.Contractor.profession'), 'bestProfession'],
        ],
        where: {
          paid: true,
          paymentDate: { [Op.between]: [startDate, endDate] },
        },
        raw: true,
        group: ['profession'],
        order: sequelize.literal('maxPayment DESC'),
        limit: 1,
        include: [
          {
            model: Contract,
            as: 'Contract',
            required: true,
            attributes: [],
            include: [{
              model: Profile,
              as: 'Contractor',
              required: true,
              attributes: [],
            }],
          },
        ],
      });
    }

    async isUserPermitted(profileId) {
      const { Contract } = sequelize.models;
      const contract = await Contract.findByPk(this.get('ContractId'));
      return contract?.isUserPermitted(profileId);
    }

    async getContractor() {
      const { Contract, Profile } = sequelize.models;
      const contract = await Contract.findByPk(this.get('ContractId'));
      const contractorId = contract.get('ContractorId');
      return Profile.findByPk(contractorId);
    }

    async getClient() {
      const { Contract, Profile } = sequelize.models;
      const contract = await Contract.findByPk(this.get('ContractId'));
      const clientId = contract.get('ClientId');
      return Profile.findByPk(clientId);
    }

    static initModel() {
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
      return this;
    }
  }

  return Job;
};
