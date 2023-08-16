const express = require('express');
const bodyParser = require('body-parser');

const { sequelize } = require('./models');
const { getProfile } = require('./middleware/getProfile');
const { isAdmin } = require('./middleware/isAdmin');

const contractController = require('./controllers/contractController');
const jobController = require('./controllers/jobController');
const adminController = require('./controllers/adminController');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/** Hardcoding profile_id header for local testing */
app.use((req, res, next) => {
  req.headers.profile_id = req.headers?.profile_id ?? 1;
  next();
});

/** Hardcoding is_admin header for local testing */
app.use('/balances', (req, res, next) => {
  req.headers.is_admin = typeof req.headers?.is_admin === 'undefined' ? 0 : req.headers.is_admin;
  next();
});

/** Hardcoding is_admin header for local testing */
app.use('/admin', (req, res, next) => {
  req.headers.is_admin = typeof req.headers?.is_admin === 'undefined' ? 0 : req.headers.is_admin;
  next();
});

app.get('/contracts/:id', getProfile, contractController.getContract);

app.get('/contracts', getProfile, contractController.getActiveContracts);

app.get('/jobs/unpaid', getProfile, jobController.getUnpaidJobsForUser);

app.post('/jobs/:jobId/pay', getProfile, jobController.payJobWithValidation);

app.post('/balances/deposit/:userId', isAdmin, adminController.depositToUserWithLimit);

module.exports = app;
