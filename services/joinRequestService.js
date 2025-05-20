const CourseModel = require('../models/lms_course');
const JoinRequestModel = require('../models/join_request');

async function getAllJoinRequest() {
    return await JoinRequestModel.find().populate('user', 'name email').populate('course', 'title');
}

async function getJoinRequestsByCenterAdmin(centerAdminId) {
    const courses = await CourseModel.find({ center_admin: centerAdminId }).select('_id');

    const courseIds = courses.map(course => course._id);

    const joinRequests = await JoinRequestModel.find({ course: { $in: courseIds } })
        .populate('user', 'name email') // lấy thông tin học viên
        .populate('course', 'name code'); // lấy thông tin khoá học
    return joinRequests;
}

async function joinRequestToCourse(studentId, courseId) {
    const join_request = await JoinRequestModel.create({
        user: studentId,
        course: courseId,
        message: 'Em rất muốn tham gia lớp này!',
    });

    return join_request;
}

module.exports = { getAllJoinRequest, getJoinRequestsByCenterAdmin, joinRequestToCourse };
