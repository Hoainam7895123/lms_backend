const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose'); // Import mongoose để lấy Types
const app = require('../../index');
const SubmissionModel = require('../../models/submissions');
const HomeworkModel = require('../../models/homeworks');
const BlockModel = require('../../models/lms_block');
const TopicModel = require('../../models/lms_topic');
const CourseModel = require('../../models/lms_course');
const ExcelJS = require('exceljs');

describe('Export Submissions to Excel API', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should export submissions to Excel successfully', async () => {
        // Mock valid ObjectId
        const homeworkId = new mongoose.Types.ObjectId().toString();
        const homeworkIdObject = new mongoose.Types.ObjectId(homeworkId); // ObjectId cho truy vấn
        const mockSubmissions = [
            {
                _id: new mongoose.Types.ObjectId(),
                homework_id: homeworkIdObject, // Đảm bảo homework_id là ObjectId
                student_id: {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'John Doe',
                    student_code: 'ST001',
                },
                file: 'file1.pdf',
                comment: 'Good work',
                score: '8',
                rated_by: { _id: new mongoose.Types.ObjectId(), name: 'Teacher One' },
                date_of_submission: new Date('2025-05-20T10:00:00Z'),
                status: true,
            },
        ];
        const mockHomework = {
            _id: homeworkIdObject,
            title: 'Homework 1',
            block_id: new mongoose.Types.ObjectId(),
        };
        const mockBlock = {
            _id: new mongoose.Types.ObjectId(),
            topic_id: new mongoose.Types.ObjectId(),
        };
        const mockTopic = {
            _id: new mongoose.Types.ObjectId(),
            course_id: new mongoose.Types.ObjectId(),
        };
        const mockCourse = { _id: new mongoose.Types.ObjectId(), name: 'Math Course' };

        // Mock database queries
        sandbox
            .stub(SubmissionModel, 'find')
            .withArgs({ homework_id: homeworkIdObject }) // Mock chính xác với ObjectId
            .returns({
                populate: sinon.stub().returnsThis(),
                lean: sinon.stub().resolves(mockSubmissions),
            });
        sandbox
            .stub(HomeworkModel, 'findById')
            .withArgs(homeworkId) // findById nhận chuỗi
            .resolves(mockHomework);
        sandbox.stub(BlockModel, 'findById').resolves(mockBlock);
        sandbox.stub(TopicModel, 'findById').resolves(mockTopic);
        sandbox.stub(CourseModel, 'findById').resolves(mockCourse);

        // Mock ExcelJS writeBuffer
        const mockBuffer = Buffer.from('mocked-excel-content');
        sandbox.stub(ExcelJS.Workbook.prototype.xlsx, 'writeBuffer').resolves(mockBuffer);

        const response = await request(app)
            .get(`/api/export-excel/homeworks/${homeworkId}`)
            .expect(
                'Content-Type',
                /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/
            )
            .expect('Content-Disposition', /attachment; filename=submissions\.xlsx/)
            .expect(200);

        expect(response.body).to.be.instanceOf(Buffer);
        expect(response.body).to.equal(mockBuffer);
    });

    it('should return 500 if no submissions are found', async () => {
        const homeworkId = new mongoose.Types.ObjectId().toString();
        const homeworkIdObject = new mongoose.Types.ObjectId(homeworkId);
        const mockHomework = {
            _id: homeworkIdObject,
            title: 'Homework 1',
            block_id: new mongoose.Types.ObjectId(),
        };
        const mockBlock = {
            _id: new mongoose.Types.ObjectId(),
            topic_id: new mongoose.Types.ObjectId(),
        };
        const mockTopic = {
            _id: new mongoose.Types.ObjectId(),
            course_id: new mongoose.Types.ObjectId(),
        };
        const mockCourse = { _id: new mongoose.Types.ObjectId(), name: 'Math Course' };

        // Mock empty submissions
        sandbox
            .stub(SubmissionModel, 'find')
            .withArgs({ homework_id: homeworkIdObject }) // Mock chính xác với ObjectId
            .returns({
                populate: sinon.stub().returnsThis(),
                lean: sinon.stub().resolves([]),
            });
        sandbox.stub(HomeworkModel, 'findById').withArgs(homeworkId).resolves(mockHomework);
        sandbox.stub(BlockModel, 'findById').resolves(mockBlock);
        sandbox.stub(TopicModel, 'findById').resolves(mockTopic);
        sandbox.stub(CourseModel, 'findById').resolves(mockCourse);

        const response = await request(app)
            .get(`/api/export-excel/homeworks/${homeworkId}`)
            .expect('Content-Type', /json/)
            .expect(500);

        expect(response.body).to.have.property(
            'message',
            'Không tìm thấy bài nộp nào cho bài tập này'
        );
    });

    it('should return 500 on server error', async () => {
        const homeworkId = new mongoose.Types.ObjectId().toString();

        // Mock database query to throw error
        sandbox.stub(SubmissionModel, 'find').throws(new Error('Database error'));

        const response = await request(app)
            .get(`/api/export-excel/homeworks/${homeworkId}`)
            .expect('Content-Type', /json/)
            .expect(500);

        expect(response.body).to.have.property('message', 'Lỗi server khi tạo file Excel');
        expect(response.body).to.have.property('error', 'Database error');
    });
});
