const request = require('supertest');

const { expect } = require('chai');

const app = require('../src/app');
const { seed } = require('./seedTestDb');

describe('Jobs API tests', () => {
  beforeEach(async () => {
    await seed();
  });

  describe('GET /jobs/unpaid', () => {
    it('it should return all not paid jobs for active contracts related to user', (done) => {
      request(app)
        .get('/jobs/unpaid')
        .set('profile_id', 2)
        .expect(200)
        .end((err, res) => {
          const { jobs } = res.body;
          expect(jobs?.length).equal(4);
          const jobIdsToBe = [4, 5, 16, 17];
          jobs.map((job) => expect(jobIdsToBe).include(job.id));
          done();
        });
    });
  });
});
