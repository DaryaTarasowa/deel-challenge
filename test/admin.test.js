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
});
