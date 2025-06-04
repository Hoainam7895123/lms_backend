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

async function getCoursesAndStudentsForUser(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role !== 'ROLE_CENTER_ADMIN' && user.role !== 'ROLE_TEACHER') {
        throw new Error('User is not allowed to access courses');
    }

    // Tìm tất cả các khóa học mà user là center_admin hoặc là teacher
    const courses = await CourseModel.find({
        $or: [{ center_admin: user._id }, { teachers: user._id }],
    }).populate('students'); // populate để lấy thông tin sinh viên luôn

    const teacherCoures = await CourseModel.find({ center_admin: user._id }).populate('teachers'); // populate để lấy thông tin sinh viên luôn
    // Duyệt qua từng khóa học và thu thập học sinh không trùng
    const studentMap = new Map();
    courses.forEach(course => {
        course.students.forEach(student => {
            studentMap.set(student._id.toString(), student);
        });
    });

    // Chuyển map về mảng học sinh không trùng
    const uniqueStudents = Array.from(studentMap.values());

    return {
        courses,
        students: uniqueStudents,
        teachers: teacherCoures.length,
    };
}

module.exports = {
    getUserByID,
    getAllStudentsOfCourse,
    getAllTeacherOfCourse,
    getAllTeachersNotInCourse,
    getCoursesAndStudentsForUser,
};
