const Sequelize = require('sequelize');

const mode = process.env.NODE_ENV;
const storage = mode === 'dev' ? './database.sqlite3' : './database-test.sqlite3';
const loggingEnabled = mode === 'dev';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: loggingEnabled,
  storage,
});

module.exports = {
  sequelize,
};
