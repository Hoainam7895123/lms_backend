const express = require('express');
const router = express.Router();

const JoinRequestModel = require('../models/join_request');
const CourseModel = require('../models/lms_course');

const { authenticateToken } = require('../helpers/auth');
const {
    getAllJoinRequest,
    getJoinRequestsByCenterAdmin,
    joinRequestToCourse,
} = require('../services/joinRequestService');

router.get('/api/join-requests', authenticateToken, async (req, res) => {
    try {
        const requests = await getAllJoinRequest();
        res.status(200).json({ error: false, data: requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: 'Lỗi server' });
    }
});

router.get('/api/join-requests/center', authenticateToken, async (req, res) => {
    try {
        const centerAdminId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        console.log(req.query);

        // Lấy các khóa học do center admin tạo
        const courses = await CourseModel.find({ center_admin: centerAdminId }).select('_id');
        const courseIds = courses.map(course => course._id);

        // Tạo query lọc theo courseIds và (nếu có) status
        const query = {
            course: { $in: courseIds },
        };
        if (status) {
            query.status = status;
        }

        // Lấy tổng số bản ghi phù hợp
        const total = await JoinRequestModel.countDocuments(query);

        // Lấy dữ liệu join requests kèm phân trang
        const joinRequests = await JoinRequestModel.find(query)
            .populate('user', 'name email')
            .populate('course', 'name code')
            .skip((page - 1) * limit)
            .limit(Number(limit));
        console.log('Join Requests: ', joinRequests);

        res.status(200).json({
            error: false,
            data: {
                requests: joinRequests,
                total,
                page: Number(page),
                limit: Number(limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: 'Lỗi server' });
    }
});

router.post('/api/courses/:courseId/join-request', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;

        const course = await CourseModel.findById(courseId);
        if (!course) {
            res.status(400).json({ error: true, message: 'Course không tồn tại' });
        }

        const response = await joinRequestToCourse(userId, courseId);

        return res.status(200).json({ error: false, data: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Lỗi server' });
    }
});

module.exports = router;
