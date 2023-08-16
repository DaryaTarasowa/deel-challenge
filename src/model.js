// TODO refactor and remove this file

const { Contract } = require('./models/Contract');
const { Profile } = require('./models/Profile');
const { Job } = require('./models/Job');
const { sequelize } = require('./config/db');

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
