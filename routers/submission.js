const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../helpers/auth');

const {
    submitHomework,
    mark,
    getAllSubmissionOfHomework,
    getAllSubmissionOfStudent,
} = require('../services/submissionService');

const SubmissionModel = require('../models/submissions');

router.post('/api/submissions/homeworks/:homeworkId', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        const homeworkId = req.params.homeworkId;
        const { file } = req.body;

        if (!homeworkId || !studentId || !file) {
            return res.status(400).json({ error: true, message: 'Thiếu thông tin đầu vào.' });
        }

        const submission = await submitHomework(homeworkId, studentId, file);
        res.status(201).json({ error: false, data: { submission } });
    } catch (err) {
        console.error('Lỗi submit:', err);
        res.status(500).json({ error: true, message: 'Đã xảy ra lỗi khi nộp bài.' });
    }
});

router.get('/api/submission/homeworks/:homeworkId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const homeworkId = req.params.homeworkId;
        if (!homeworkId || !userId) {
            return res.status(400).json({ error: true, message: 'Thiếu thông tin đầu vào.' });
        }

        const submission = await SubmissionModel.findOne({
            student_id: userId,
            homework_id: homeworkId,
        });

        res.status(200).json({ error: false, data: submission });
    } catch (error) {
        console.error('Lỗi submit:', error);
        res.status(500).json({ error: true, message: 'Đã xảy ra lỗi khi nộp bài.' });
    }
});

router.put('/api/submissions/:submissionId/mark', authenticateToken, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const submissionId = req.params.submissionId;
        const { comment, score } = req.body;

        if (!comment || score === undefined || !teacherId) {
            return res.status(400).json({ error: true, message: 'Thiếu thông tin chấm điểm.' });
        }

        const updated = await mark(submissionId, comment, score, teacherId);
        res.status(200).json({ error: false, data: { updated } });
    } catch (err) {
        console.error('Lỗi chấm điểm:', err);
        res.status(500).json({ error: true, message: 'Đã xảy ra lỗi khi chấm điểm.' });
    }
});

router.get('/api/submissions/homeworks/:homeworkId', async (req, res) => {
    try {
        const { homeworkId } = req.params;

        const submissions = await getAllSubmissionOfHomework(homeworkId);
        res.status(200).json({ error: false, data: { submissions } });
    } catch (err) {
        console.error('Lỗi lấy danh sách submissions:', err);
        res.status(500).json({ error: true, message: 'Không thể lấy submissions.' });
    }
});

router.get('/api/submissions/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const submissions = await getAllSubmissionOfStudent(studentId);

        res.status(200).json({ error: false, data: submissions });
    } catch (error) {
        console.error('Lỗi lấy danh sách submissions:', err);
        res.status(500).json({ error: true, message: 'Không thể lấy submissions.' });
    }
});

module.exports = router;
