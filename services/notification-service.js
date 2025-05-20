const NotificationModel = require('../models/notifications');
const TopicModel = require('../models/lms_topic');
const BlockModel = require('../models/lms_block');
const CourseModel = require('../models/lms_course');
const SubmissionModel = require('../models/submissions');
const HomeworkModel = require('../models/homeworks');
// const UserModel = require('../models/users');

async function addNotifications(block_id, topic_id, title) {
    const topic = await TopicModel.findById(topic_id);
    const course = await CourseModel.findById(topic.course_id);
    const block = await BlockModel.findById(block_id);

    const students = course.students;

    const notifications = students.map(student => ({
        recipient: student._id,
        course_id: course._id,
        block_id: block._id,
        title: 'Bài giảng mới',
        message: `Khoá học ${course.name} vừa ra bài học mới: ${title}`,
    }));

    const result = await NotificationModel.insertMany(notifications);
    return result;
}

async function addNotificationsForScoring(submission_id) {
    const submission = await SubmissionModel.findById(submission_id);
    const homework = await HomeworkModel.findById(submission.homework_id);
    const block = await BlockModel.findById(homework.block_id);
    const topic = await TopicModel.findById(block.topic_id);
    const course = await CourseModel.findById(topic.course_id);

    const notifications = await NotificationModel.create({
        recipient: submission.student_id,
        title: 'Đã có điểm !!!',
        message: `Bài tập ${homework.title} đã có điểm và nhận xét rồi`,
        course_id: course._id,
        block_id: block.block_id,
        submission_id: submission._id,
    });

    await NotificationModel.insertMany(notifications);
}

async function getAllNotificationsNotIsRead(userId) {
    const notifications = await NotificationModel.find({
        recipient: userId,
        is_read: false,
    });
    return notifications;
}

async function getTwentyNotifications(userId) {
    const notificationsNotIsRead = await getAllNotificationsNotIsRead(userId);

    if (notificationsNotIsRead.length < 20) {
        return await NotificationModel.find({ recipient: userId })
            .sort({ createdAt: -1 }) // đảm bảo lấy mới nhất
            .limit(20);
    } else {
        return notificationsNotIsRead;
    }
}

async function markAllNotificationsAsRead(userId) {
    await NotificationModel.updateMany(
        { recipient: userId, is_read: false },
        { $set: { is_read: true } }
    );
}

module.exports = {
    addNotifications,
    addNotificationsForScoring,
    getAllNotificationsNotIsRead,
    markAllNotificationsAsRead,
    getTwentyNotifications,
};
