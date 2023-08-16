const request = require('supertest');

const { expect } = require('chai');

const app = require('../../src/app');
const { seed } = require('../seedTestDb');

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

  describe('POST /jobs/job_id/pay', () => {
    it('it should pay for the job and return an error if tried to pay again', (done) => {
      request(app)
        .post('/jobs/2/pay')
        .set('profile_id', 1)
        .expect(200)
        .end((err, res) => {
          const { job, clientBalance, contractorBalance } = res.body;
          expect(job.paid).equal(true);
          expect(clientBalance).equal(949);
          expect(contractorBalance).equal(1415);
          request(app)
            .post('/jobs/2/pay')
            .set('profile_id', 1)
            .expect(400, done);
        });
    });
  });
});
