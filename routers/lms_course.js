const { Router } = require('express');
const router = Router();
const UserModel = require('../models/users');
const CourseModel = require('../models/lms_course');
const JoinRequestModel = require('../models/join_request');
const { authenticateToken } = require('../helpers/auth');
const {
    getCoursesOfUser,
    addCourse,
    joinCourse,
    deleteAll,
    updatedCourse,
    getCourseByID,
    deleteCourseById,
    grantTeacherRoleToCourse,
    getCoursesOfUsers,
} = require('../services/courseService');
const {
    getUserByID,
    getAllStudentsOfCourse,
    getAllTeacherOfCourse,
} = require('../services/userService');

// router.get('/api/users/courses', authenticateToken, async (req, res) => {
//     try {

//         const userID = req.user.id;
//         const courses = await getCoursesOfUser(userID);
//         return res.status(200).json({ error: false, data: courses });
//     } catch (error) {
//         return res.status(400).json({ error: true, message: error.message });
//     }
// });

router.get('/api/users/courses', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        const role = user?.role;
        console.log('UserId: ', userId);
        console.log('UserId: ', role);

        const courses = await getCoursesOfUsers(userId, role);
        return res.status(200).json({ error: false, data: courses });
    } catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/courses/:courseID', async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const course = await getCourseByID(courseID);
        return res.status(200).json({ error: false, data: course });
    } catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

router.post('/api/users/courses', authenticateToken, async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await UserModel.findById(userID);
        if (!user || user.role !== 'ROLE_CENTER_ADMIN') {
            return res.status(401).json({ error: true, message: 'You must not be teacher' });
        }
        const { name, description, image } = req.body.data;
        const course = await addCourse(name, description, image, userID);
        return res.status(200).json({ error: false, data: course });
    } catch (error) {
        return res.status(401).json({ error: true, message: error.message });
    }
});

// Đồng ý cho học viên vào khoá học
router.post('/api/users/:studentID/courses/:courseID/join', async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const studentID = req.params.studentID;
        const { joinRequestId, status } = req.body;
        console.log('courseID: ', courseID);
        console.log('studentID: ', studentID);
        console.log('BODY:', req.body);

        const joinRequest = await JoinRequestModel.findById(joinRequestId);
        joinRequest.status = status;
        joinRequest.save();

        const user = await UserModel.findById(studentID);
        if (!user || user.role === 'ROLE_TEACHER') {
            return res.status(400).json({ error: true, message: 'You must not be student' });
        }
        const updatedCourse = await joinCourse(studentID, courseID);
        return res.status(200).json({ error: false, data: updatedCourse });
    } catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

router.put('/api/courses/:courseID', async (req, res) => {
    try {
        console.log('Body:', req.body);
        const courseID = req.params.courseID;
        console.log('Course ID:', courseID);
        const courses = await getCourseByID(courseID);
        console.log('Courses:', courses);
        const { name, description, image } = req.body.data;
        const course = await updatedCourse(courseID, name, description, image);
        return res.status(200).json({ error: false, data: course });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
});

router.delete('/api/courses/:courseID', async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const success = await deleteCourseById(courseID);
        if (success) {
            return res.status(200).json({ error: false, message: 'Course deleted successfully' });
        }
        return res.status(404).json({ error: true, message: 'Course not found' });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
});

router.delete('/api/courses', async (req, res) => {
    try {
        const success = await deleteAll();
        if (success) {
            return res
                .status(200)
                .json({ error: false, message: 'All courses deleted successfully' });
        } else {
            return res.status(404).json({ data: true, message: 'No courses found to delete' });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
});

// Thêm giáo viên vào khoá học
router.post('/api/courses/:courseID/teachers/:teacherID', async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const teacherID = req.params.teacherID;
        const updatedCourse = await grantTeacherRoleToCourse(courseID, teacherID);
        return res.status(200).json({ error: false, data: updatedCourse });
    } catch (error) {
        return res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/courses/:courseID/students', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const courseID = req.params.courseID;

        // Tìm course
        const course = await CourseModel.findById(courseID).populate('students');
        if (!course) {
            return res.status(404).json({ error: true, message: 'Course not found' });
        }

        // Lọc danh sách học sinh
        let students = course.students || [];

        // Nếu có từ khóa search
        if (search) {
            const keyword = search.toLowerCase();
            students = students.filter(
                student =>
                    (student.name && student.name.toLowerCase().includes(keyword)) ||
                    (student.email && student.email.toLowerCase().includes(keyword))
            );
        }

        const total = students.length;

        // Phân trang thủ công
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + Number(limit);
        const paginatedStudents = students.slice(startIndex, endIndex);

        res.status(200).json({
            error: false,
            data: {
                students: paginatedStudents,
                total: total,
                page: Number(page),
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Server error' });
    }
});

router.get('/api/courses/:courseID/teachers', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const courseID = req.params.courseID;

        // Tìm course
        const course = await CourseModel.findById(courseID).populate('teachers');
        if (!course) {
            return res.status(404).json({ error: true, message: 'Course not found' });
        }

        // Lọc danh sách giáo viên
        let teachers = course.teachers || [];

        // Nếu có từ khóa search
        if (search) {
            const keyword = search.toLowerCase();
            teachers = teachers.filter(
                teacher =>
                    (teacher.name && teacher.name.toLowerCase().includes(keyword)) ||
                    (teacher.email && teacher.email.toLowerCase().includes(keyword))
            );
        }

        const total = teachers.length;

        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + Number(limit);
        const paginatedTeachers = teachers.slice(startIndex, endIndex);

        res.status(200).json({
            error: false,
            data: {
                teachers: paginatedTeachers,
                total: total,
                page: Number(page),
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Server error' });
    }
});

module.exports = router;
