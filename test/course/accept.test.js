const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');

describe('POST /api/users/:studentID/courses/:courseID/join', () => {
    let token;

    before(async () => {
        // Đăng nhập người kiểm duyệt để lấy token
        const res = await request(app).post('/api/user/signin').send({
            username: 'center_admin_2',
            password: '123',
        });
        token = res.body.data.token;
    });

    it('should return 200 when approving join request successfully', async () => {
        const studentID = '6804638c2b761661ff370632';
        const courseID = '682b503d065c9c736e9568e0';
        const res = await request(app)
            .post(`/api/users/${studentID}/courses/${courseID}/join`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                joinRequestId: '682c932063a8c7e7914373fd',
                status: 'accepted',
            });

        expect(res.status).to.equal(200);
    });

    it('should return 400 if student is teacher', async () => {
        const teacherID = '6804638c2b761661ff370632'; // người dùng có role là teacher
        const courseID = '682b503d065c9c736e9568e0';

        const res = await request(app)
            .post(`/api/users/${teacherID}/courses/${courseID}/join`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                joinRequestId: '682c932063a8c7e7914373fd',
                status: 'accepted',
            });

        expect(res.status).to.equal(400);
    });

    it('should return 400 if student not found', async () => {
        const fakeStudentID = '000000000000000000000000'; // không tồn tại
        const courseID = '682b503d065c9c736e9568e0';

        const res = await request(app)
            .post(`/api/users/${fakeStudentID}/courses/${courseID}/join`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                joinRequestId: '682c503d065c9c736e9568f9',
                status: 'accepted',
            });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('You must not be student');
    });

    it('should return 400 if joinRequestId is invalid', async () => {
        const studentID = '664ac41be2cc78fa73e5c2c1';
        const courseID = '682b503d065c9c736e9568e0';

        const res = await request(app)
            .post(`/api/users/${studentID}/courses/${courseID}/join`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                joinRequestId: 'invalid_id_123',
                status: 'accepted',
            });

        expect(res.status).to.equal(400);
        expect(res.body.error).to.be.true;
    });

    it('should return 400 if missing status in body', async () => {
        const studentID = '664ac41be2cc78fa73e5c2c1';
        const courseID = '682b503d065c9c736e9568e0';

        const res = await request(app)
            .post(`/api/users/${studentID}/courses/${courseID}/join`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                joinRequestId: '682c503d065c9c736e9568f9',
                // thiếu status
            });

        expect(res.status).to.equal(400);
    });
});
