const Sequelize = require('sequelize');

const mode = process.env.NODE_ENV;
const storage = mode === 'dev' ? './database.sqlite3' : './database-test.sqlite3';

/* eslint-disable-next-line no-console */
const loggingOutput = mode === 'dev' ? console.log : false;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: loggingOutput,
  storage,
});

module.exports = {
  sequelize,
};
