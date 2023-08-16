const { Profile, Contract, Job } = require('../src/models');
const { profiles, contracts, jobs } = require('./fixtures');

const seed = async () => {
  // create tables
  await Profile.sync({ force: true });
  await Contract.sync({ force: true });
  await Job.sync({ force: true });
  // insert data
  await Promise.all(
    profiles.map((profile) => Profile.create(profile)),
  );
  await Promise.all(
    contracts.map((contract) => Contract.create(contract)),
  );
  await Promise.all(
    jobs.map((job) => Job.create(job)),
  );
};

module.exports = {
  seed,
};
