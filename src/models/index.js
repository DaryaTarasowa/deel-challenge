// TODO refactor

const { sequelize } = require('../config/db');

const jobModel = require('./Job')(sequelize);
const contractModel = require('./Contract')(sequelize);
const profileModel = require('./Profile')(sequelize);

const initModels = () => {
  const Job = jobModel.initModel();
  const Contract = contractModel.initModel();
  const Profile = profileModel.initModel();

  Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
  Contract.belongsTo(Profile, { as: 'Contractor' });
  Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
  Contract.belongsTo(Profile, { as: 'Client' });
  Contract.hasMany(Job);
  Job.belongsTo(Contract);

  return { Job, Contract, Profile };
};

module.exports = {
  sequelize,
  initModels,
};
