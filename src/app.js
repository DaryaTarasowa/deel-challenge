// TODO split into separate routers

const express = require('express');
const bodyParser = require('body-parser');

const { sequelize, initModels } = require('./models');
const { getProfile } = require('./middleware/getProfile');
const { isAdmin } = require('./middleware/isAdmin');

const contractController = require('./controllers/contractController');
const jobController = require('./controllers/jobController');
const adminController = require('./controllers/adminController');

const app = express();
app.use(bodyParser.json());

const models = initModels();

app.set('sequelize', sequelize);
app.set('models', models);

/**
 * Hardcoding profile_id header for local browser testing
 */
app.use((req, res, next) => {
  req.headers.profile_id = req.headers?.profile_id ?? 1;
  next();
});

/**
 * Hardcoding is_admin header for local browser testing
 */
app.use('/balances', (req, res, next) => {
  req.headers.is_admin = typeof req.headers?.is_admin === 'undefined' ? 1 : req.headers.is_admin;
  next();
});

/**
 * Hardcoding is_admin header for local browser testing
 */
app.use('/admin', (req, res, next) => {
  req.headers.is_admin = typeof req.headers?.is_admin === 'undefined' ? 1 : req.headers.is_admin;
  next();
});

/**
 * returns { "contract": {Contract} }
 */
app.get('/contracts/:id', getProfile, contractController.getContract);

/**
 * return {"contracts": [{Contract}]}
 */
app.get('/contracts', getProfile, contractController.getActiveContracts);

/**
 * returns {"jobs": [{Job}]}
 */
app.get('/jobs/unpaid', getProfile, jobController.getUnpaidJobsForUser);

/**
 * returns {{Job}, {"clientBalance": Integer}, {"contractorBalance": Integer}}
 */
app.post('/jobs/:jobId/pay', getProfile, jobController.payJobWithValidation);

/**
 * returns {"newBalance": Integer}
 */
app.post('/balances/deposit/:userId', isAdmin, adminController.depositToUserWithLimit);

/**
 * returns {"bestProfession": String, "maxPayment": Integer}
 */
app.get('/admin/best-profession', isAdmin, adminController.getBestProfession);

/**
 * returns {"bestClients": {id: Integer, paid: Integer, fullName: string}}
 */
app.get('/admin/best-clients', isAdmin, adminController.getBestClients);

module.exports = app;
