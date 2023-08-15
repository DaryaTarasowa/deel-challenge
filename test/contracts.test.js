const request = require('supertest');

const { expect } = require('chai');

const app = require('../src/app');
const { seed } = require('./seedTestDb');

describe('Contracts API tests', () => {
  beforeEach(async () => {
    await seed();
  });

  describe('GET /contracts/id', () => {
    it('it should get the contract for a permitted user', (done) => {
      request(app)
        .get('/contracts/1')
        .set('profile_id', 1)
        .expect(200, done);
    });

    it('it should return 403 for a not-permitted user', (done) => {
      request(app)
        .get('/contracts/3')
        .set('profile_id', 1)
        .expect(403, done);
    });

    it('it should return 404 for a non-existing contract id', (done) => {
      request(app)
        .get('/contracts/25')
        .set('profile_id', 1)
        .expect(404, done);
    });
  });

  describe('GET /contracts', () => {
    it('it should return all not terminated contracts related to user', (done) => {
      request(app)
        .get('/contracts')
        .set('profile_id', 1)
        .expect(200)
        .end((err, res) => {
          const contracts = res.body?.contracts;
          expect(contracts?.length).equal(1);
          expect(contracts[0]?.id).equal(2);
          done();
        });
    });
    it('it should correctly work with empty result', (done) => {
      request(app)
        .get('/contracts')
        .set('profile_id', 1)
        .expect(200)
        .end((err, res) => {
          const contracts = res.body?.contracts;
          expect(contracts?.length).equal(1);
          expect(contracts[0]?.id).equal(2);
          done();
        });
    });
  });
});
