const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');

describe('POST /api/courses/:courseId/join-request', () => {
    let token;

    before(async () => {
        // Giả sử tài khoản này hợp lệ và có thể join course
        const res = await request(app).post('/api/user/signin').send({
            username: 'center_admin_2',
            password: '123',
        });
        token = res.body.data.token;
    });

    it('should return 200 and create join request successfully', async () => {
        const courseId = '682b503d065c9c736e9568e0';
        const res = await request(app)
            .post(`/api/courses/${courseId}/join-request`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.status).to.equal(200);
    });

    it('should return 400 if course invalid', async () => {
        const invalidCourseId = '682b503d065c9c736e9568e1';

        const res = await request(app)
            .post(`/api/courses/${invalidCourseId}/join-request`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.status).to.equal(400);
    });
});
