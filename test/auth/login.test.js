const request = require('supertest');
const app = require('../../index');
const { expect } = require('chai');

describe('POST /api/user/signin', () => {
    it('should return 400 if username or password is missing', done => {
        request(app)
            .post('/api/user/signin')
            .send({ username: '' }) // thiếu password
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property('error', true);
                done();
            });
    });

    it('should return 200 for valid credentials', done => {
        request(app)
            .post('/api/user/signin')
            .send({ username: 'center_admin_2', password: '123' })
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('data');
                done();
            });
    });
});
