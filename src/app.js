const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const { Contract } = app.get('models');

/**
 * Hard-coding profile_id, simulating the authentication
 */
app.use((req, res, next) => {
  req.headers.profile_id = req.headers?.profile_id ?? 1;
  next();
});

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  if (req.profile) {
    const { id } = req.params;
    const contract = await Contract.findOne({ where: { id } });
    if (!contract) {
      res.status(404).send({ message: `No Contract found with id ${id}` });
    }
    if (!contract.isUserPermitted(req.profile.get('id'))) {
      res
        .status(403)
        .send({ message: 'User is not permitted to view the contracr' });
    }
    res.send({ contract });
  }
  res.send('Not authenticated');
});

/**
 * @returns all not terminated contracts for a current user
 */
app.get('/contracts', getProfile, async (req, res) => {
  const profileId = req.profile.get('id');
  const contracts = await Contract.getAllForUser(profileId);
  res.send({ contracts });
});

module.exports = app;
