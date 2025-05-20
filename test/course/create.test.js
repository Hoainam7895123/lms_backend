const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');

describe('POST /api/users/courses', () => {
    let token;

    before(async () => {
        const res = await request(app).post('/api/user/signin').send({
            username: 'center_admin_2',
            password: '123',
        });

        token = res.body.data.token;
    });

    it('should return status 200 and course data for valid course input and valid token', async () => {
        const courseData = {
            name: 'New Course',
            description: 'This is a valid course description',
            image: 'valid-image-url',
        };

        const res = await request(app)
            .post('/api/users/courses')
            .set('Authorization', `Bearer ${token}`)
            .send({ data: courseData });

        expect(res.status).to.equal(200);
        expect(res.body.error).to.be.false;
        expect(res.body.data).to.have.property('name', 'New Course');
        expect(res.body.data).to.have.property('description', 'This is a valid course description');
    });

    it('should return status 401 if the user is not a teacher or if no token is provided', async () => {
        const courseData = {
            name: 'Invalid Course',
            description: 'This should fail',
            image: 'invalid-image-url',
        };
        const login = await request(app).post('/api/user/signin').send({
            username: 'teacher_1', // tài khoản không phải center_admin
            password: '123',
        });

        const invalidToken = login.body.data.token;

        const res2 = await request(app)
            .post('/api/users/courses')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({ data: courseData });

        expect(res2.status).to.equal(401);
        expect(res2.body).to.have.property('error', true);
        expect(res2.body.message).to.equal('You must not be teacher');
    });
});
