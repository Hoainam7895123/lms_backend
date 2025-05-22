const { Router } = require('express');
const router = Router();

const UserModel = require('../models/users');

const {
    getUserByID,
    getAllTeachersNotInCourse,
    joinRequestToCourse,
    getCoursesAndStudentsForUser,
} = require('../services/userService');
const { authenticateToken } = require('../helpers/auth');

router.get('/api/users/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const user = await getUserByID(userID);
        return res.status(200).json({ error: false, data: user });
    } catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, active } = req.query;
        const currentUserId = req.user.id;
        const user = await UserModel.findById(currentUserId);

        const query = {};
        if (user.role === 'ROLE_CENTER_ADMIN') {
            query.created_by = currentUserId;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) {
            query.role = role;
        }
        if (active !== undefined && active !== '') {
            query.active = Number(active);
        }

        const users = await UserModel.find(query)
            .skip((page - 1) * limit) // Bỏ qua các bản ghi không thuộc trang hiện tại
            .limit(Number(limit)) // Giới hạn số bản ghi trả về
            .select('name username email role active last_login') // Chỉ lấy các trường cần thiết
            .lean(); // Chuyển thành object JavaScript thuần

        const total = await UserModel.countDocuments(query);

        // Trả về kết quả
        res.status(200).json({
            error: false,
            data: { users, total, page: Number(page), limit: Number(limit) },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Lỗi server' });
    }
});

// Lấy ra list teacher không thuộc khoá học
router.get('/api/users/courses/:courseId', authenticateToken, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { page = 1, limit = 10, search } = req.query;
        console.log('Query: ', req.query);

        const response = await getAllTeachersNotInCourse(courseId, {
            page: Number(page),
            limit: Number(limit),
            search,
        });
        console.log('Response:', response);

        return res.status(200).json({ error: false, data: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Lỗi server' });
    }
});

router.get('/api/users/info/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('UserId: ', userId);
        const user = await getUserByID(userId);
        return res.status(200).json({ error: false, data: user });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
});

router.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await getCoursesAndStudentsForUser(userId);
        return res.status(200).json({ error: false, data: response });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
});

module.exports = router;
