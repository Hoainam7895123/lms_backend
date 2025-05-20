const UserModel = require('../models/users');

const CourseModel = require('../models/lms_course');
const JoinRequestModel = require('../models/join_request');

async function getUserByID(userID) {
    const user = await UserModel.findById(userID);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

async function getAllStudentsOfCourse(courseID, page, limit) {
    const course = await CourseModel.findById(courseID).populate({
        path: 'students',
        options: {
            skip: (page - 1) * limit,
            limit: limit,
        },
    });

    if (!course) {
        throw new Error('Course not found');
    }

    if (!course.students || course.students.length === 0) {
        throw new Error('No students enrolled in this course');
    }

    // Bạn có thể trả thêm tổng số học viên nếu cần để frontend biết tổng số trang
    const totalStudents = await CourseModel.findById(courseID)
        .populate('students')
        .then(course => course.students.length);

    return {
        students: course.students,
        page: page,
        limit: limit,
        totalStudents: totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
    };
}

async function getAllTeacherOfCourse(courseID) {
    const course = await CourseModel.findById(courseID).populate('teachers');

    if (!course) {
        throw new Error('Course not found');
    }

    if (!course.teachers || course.teachers.length === 0) {
        throw new Error('No teachers enrolled in this course');
    }

    return course.teachers;
}

async function getAllTeachersNotInCourse(courseID, options = {}) {
    const { page = 1, limit = 10, search } = options;

    const course = await CourseModel.findById(courseID).lean();
    if (!course) {
        throw new Error('Course not found');
    }

    const teachersInCourse = course.teachers?.map(t => t.toString()) || [];

    const query = {
        role: 'ROLE_TEACHER',
        _id: { $nin: teachersInCourse },
    };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const total = await UserModel.countDocuments(query);

    const teachers = await UserModel.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('name email role active avatar')
        .lean();

    return {
        teachers,
        total,
        page,
        limit,
    };
}

module.exports = {
    getUserByID,
    getAllStudentsOfCourse,
    getAllTeacherOfCourse,
    getAllTeachersNotInCourse,
};
