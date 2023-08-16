const request = require('supertest');

const { expect } = require('chai');

const app = require('../src/app');
const { seed } = require('./seedTestDb');

describe('Admin API tests', () => {
  beforeEach(async () => {
    await seed();
  });

  describe('POST /balances/deposit/user_id', () => {
    it('it should be able to deposit as an admin', (done) => {
      request(app)
        .post('/balances/deposit/1')
        .send({ depositValue: 5 })
        .set('is_admin', 1)
        .expect(200)
        .end((err, res) => {
          expect(res.body.newBalance).equal(1155);
          done();
        });
    });

    it('it should not be able to deposit as an non-admin', (done) => {
      request(app)
        .post('/balances/deposit/1')
        .send({ depositValue: 5 })
        .set('is_admin', 0)
        .expect(403)
        .end((err, res) => {
          expect(res.body.message).equal('This route is accessible only by admins');
          done();
        });
    });
    it('it should not be able to deposit too much', (done) => {
      request(app)
        .post('/balances/deposit/1')
        .send({ depositValue: 500 })
        .set('is_admin', 1)
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).equal('Deposit value is too large');
          done();
        });
    });
    it('it works correctly if a user does not exist', (done) => {
      request(app)
        .post('/balances/deposit/35')
        .send({ depositValue: 5 })
        .set('is_admin', 1)
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).equal('User does not exist');
          done();
        });
    });
  });

  describe('GET /admin/getBestProfession', () => {
    it('it should return error message if no date provided', (done) => {
      request(app)
        .get('/admin/best-profession')
        .set('is_admin', 1)
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).equal('Invalid date range');
          done();
        });
    });
    it('it should return correct result with correct date range', (done) => {
      request(app)
        .get('/admin/best-profession?start=2020-08-10&end=2020-08-17')
        .set('is_admin', 1)
        .expect(200)
        .end((err, res) => {
          expect(res.body.best_profession).equal('Programmer');
          expect(res.body.max_payment).equal(2683);
          done();
        });
    });
    it('it should return correct result with correct date range', (done) => {
      request(app)
        .get('/admin/best-profession?start=2020-08-10&end=2020-08-14')
        .set('is_admin', 1)
        .expect(200)
        .end((err, res) => {
          expect(res.body.best_profession).equal('Musician');
          expect(res.body.max_payment).equal(21);
          done();
        });
    });
    it('it should return error with incorrect date range', (done) => {
      request(app)
        .get('/admin/best-profession?start=2020-08-1000&end=2020-08-17')
        .set('is_admin', 1)
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).equal('Invalid date range');
          done();
        });
    });

    it('it should return error if a start larger than an end', (done) => {
      request(app)
        .get('/admin/best-profession?start=2020-08-17&&end=2020-08-10')
        .set('is_admin', 1)
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).equal('Invalid date range');
          done();
        });
    });
  });
});
