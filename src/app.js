const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const { isAdmin } = require('./middleware/isAdmin');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const { Contract, Job, Profile } = app.get('models');
const DEPOSIT_UPPER_LIMIT = 0.25;

app.use((req, res, next) => {
  req.headers.profile_id = req.headers?.profile_id ?? 1;
  next();
});

app.use('/balances', (req, res, next) => {
  req.headers.is_admin = req.headers?.is_admin ?? true;
  next();
});

app.use('/admin', (req, res, next) => {
  req.headers.is_admin = req.headers?.is_admin ?? true;
  next();
});

app.get('/contracts/:id', getProfile, async (req, res) => {
  const { id } = req.params;
  const contract = await Contract.findByPk(id);
  if (!contract) {
    res.status(404).send({ message: `No Contract found with id ${id}` });
  }
  const permitted = await contract.isUserPermitted(req.profile.get('id'));
  return permitted ? res.send({ contract }) : res.status(403).end();
});

app.get('/contracts', getProfile, async (req, res) => {
  const profileId = req.profile.get('id');
  const contracts = await Contract.getAllForUser(profileId);
  return res.send({ contracts });
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const profileId = req.profile.get('id');
  const jobs = await Job.getUnpaidForUser(profileId);
  return res.status(200).send({ jobs });
});

app.post('/jobs/:jobId/pay', getProfile, async (req, res) => {
  const { jobId } = req.params;
  const jobToPay = await Job.findByPk(jobId);

  try {
    const { job, clientBalance, contractorBalance } = await req.profile.pay(jobToPay);
    return res.status(200).send({
      job, clientBalance, contractorBalance,
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post('/balances/depositTransaction/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  const depositValue = req.body?.depositValue ?? 5;
  const user = await Profile.findByPk(userId);

  try {
    const newValue = await sequelize.transaction(async (t) => {
      const totalDueAggregation = await Job.getUnpaidMoneyTotalForClient(userId, t);
      const totalDue = totalDueAggregation[0].total_price;

      const isAbleToDeposit = depositValue < totalDue * DEPOSIT_UPPER_LIMIT;
      if (isAbleToDeposit) {
        return user.deposit(depositValue, t);
      }
      throw (new Error('Deposit value is too large'));
    });

    return res.status(200).send({ userId, newValue });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post('/balances/deposit/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  const depositValue = req.body?.depositValue ?? 5;
  const user = await Profile.findByPk(userId);

  try {
    const unpaidJobs = await Job.getUnpaidForUser(userId);
    const totalDue = unpaidJobs.reduce((acc, job) => acc + job.get('price'), 0);

    const isAbleToDeposit = depositValue < totalDue * DEPOSIT_UPPER_LIMIT;
    if (isAbleToDeposit) {
      const newBalance = await user.deposit(depositValue, null);
      return res.status(200).send({ newBalance });
    }
    throw (new Error('Deposit value is too large'));
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

module.exports = app;
