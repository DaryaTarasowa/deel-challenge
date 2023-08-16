const { Contract } = require('./models/Contract');
const { Profile } = require('./models/Profile');
const { Job } = require('./models/Job');
const { sequelize } = require('./config/db');
const { settings } = require('./config/settings');

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

const adminFunctions = {
  depositTransaction: async ({ depositValue, user }) => sequelize.transaction(async (t) => {
    const totalDueAggregation = await Job.getUnpaidMoneyTotalForClient(user.get('id'), t);
    const totalDue = totalDueAggregation[0].total_price;

    const isAbleToDeposit = depositValue < totalDue * settings.DEPOSIT_UPPER_LIMIT;
    if (isAbleToDeposit) {
      return user.deposit(depositValue, t);
    }
    throw (new Error('Deposit value is too large'));
  }),
  deposit: async ({ depositValue, user }) => {
    const unpaidJobs = await Job.getUnpaidForUser(user.get('id'));
    const totalDue = unpaidJobs.reduce((acc, job) => acc + job.get('price'), 0);
    const isAbleToDeposit = depositValue < totalDue * settings.DEPOSIT_UPPER_LIMIT;
    if (isAbleToDeposit) {
      return user.deposit(depositValue, null);
    }
    throw (new Error('Deposit value is too large'));
  },
};

module.exports = {
  adminFunctions,
  sequelize,
  Profile,
  Contract,
  Job,
};
