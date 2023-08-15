const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const { Contract, Profile, Job } = app.get('models');

/**
 * Hard-coding profile_id, simulating the authentication
 */
app.use((req, res, next) => {
  req.headers.profile_id = req.headers?.profile_id ?? 1;
  next();
});

/**
 * @returns contract object by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  if (!req.profile) res.status(403).send({ message: 'Not authenticated' });

  const { id } = req.params;
  const contract = await Contract.findOne({ where: { id } });
  if (!contract) {
    res.status(404).send({ message: `No Contract found with id ${id}` });
  }
  if (!contract.isUserPermitted(req.profile.get('id'))) {
    return res
      .status(403)
      .send({ message: 'User is not permitted to view the contractor' });
  }
  return res.send({ contract });
});

/**
 * @returns object with all not terminated contracts for a current user
 */
app.get('/contracts', getProfile, async (req, res) => {
  if (req.profile) {
    const profileId = req.profile.get('id');
    const contracts = await Contract.getAllForUser(profileId);
    return res.send({ contracts });
  }
  return res.status(403).send({ message: 'Not authenticated' });
});

/**
 * @returns all unpaid jobs from not-terminated contracts for a current user
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
  if (!req.profile) return res.status(403).send({ message: 'Not authenticated' });

  const profileId = req.profile.get('id');
  const jobs = await Job.getUnpaidForUser(profileId);
  return res.status(200).send({ jobs });
});

// TODO change to post
app.get('/jobs/:jobId/pay', getProfile, async (req, res) => {
  if (!req.profile) return res.status(403).send({ message: 'Not authenticated' });

  const profileId = req.profile.get('id');
  const { jobId } = req.params;
  const jobToPay = await Job.findByPk(jobId);
  if (jobToPay) {
    const paidJob = await jobToPay.pay(profileId);
    return res.send({ job: paidJob });
  }
  return res.status(400).send({ message: 'Job not found' });
});

module.exports = app;
