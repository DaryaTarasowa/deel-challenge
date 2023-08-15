const Sequelize = require('sequelize');

const mode = process.env.NODE_ENV;
const storage = mode === 'test' ? './database-test.sqlite3' : './database.sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
});

module.exports = {
  sequelize,
};
