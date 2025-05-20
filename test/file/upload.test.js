const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const app = require('../../index');

describe('POST /api/upload', () => {
    let token;

    before(async () => {
        const res = await request(app).post('/api/user/signin').send({
            username: 'center_admin_2',
            password: '123',
        });
        token = res.body.data.token;
    });

    it('should upload a file and attach it to homework', async () => {
        const fakeHomeworkId = '681c80212eebc40af4fb08e1';
        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('id', fakeHomeworkId)
            .field('type', 'homework')
            .attach('file', path.join(__dirname, 'test-file.txt'));

        expect(res.status).to.equal(200);
        expect(res.body.error).to.be.false;
        expect(res.body).to.have.property('location');
    });

    it('should return 400 if file is missing', async () => {
        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('id', '123')
            .field('type', 'homework');

        expect(res.status).to.equal(400);
        expect(res.body.error).to.be.true;
        expect(res.body.msg).to.equal('Invalid file uploaded.');
    });

    it('should return 500 if type is invalid', async () => {
        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('id', '123')
            .field('type', 'invalid_type')
            .attach('file', path.join(__dirname, 'test-file.txt'));

        expect(res.status).to.equal(500);
        expect(res.body.error).to.be.true;
        expect(res.body.msg).to.equal('Error uploading file.');
    });
});
