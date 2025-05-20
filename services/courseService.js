const CourseModel = require('../models/lms_course');
const UserModel = require('../models/users');
const TopicModel = require('../models/lms_topic');
const BlockModel = require('../models/lms_block');

async function getCoursesOfUser(userID) {
    const courses = await CourseModel.find({ center_admin: userID });
    return courses;
}

async function getCoursesOfUsers(userID, role) {
    let query = {};

    switch (role) {
        case 'ROLE_STUDENT':
            query = { students: userID };
            break;
        case 'ROLE_TEACHER':
            query = { teachers: userID };
            break;
        case 'ROLE_CENTER_ADMIN':
            query = { center_admin: userID };
            break;
        default:
            throw new Error('Vai trò không hợp lệ');
    }

    const courses = await CourseModel.find(query)
        .populate('center_admin', 'name email')
        .populate('teachers', 'name email')
        .populate('students', 'name email');

    return courses;
}

async function addCourse(name, description, image, userId) {
    const key = generateLicenseKey();
    const course = new CourseModel({
        name,
        code: key,
        description,
        image,
        center_admin: userId,
    });
    await course.save();
    return course;
}

async function grantTeacherRoleToCourse(courseID, teacherID) {
    const course = await CourseModel.findById(courseID);
    course.teachers.push(teacherID);
    await course.save();
    return course;
}

async function updatedCourse(courseID, name, description, image) {
    const course = await CourseModel.findById(courseID);
    console.log('At servie: 1', course);

    if (!course) {
        throw new Error('Course not found');
    }
    console.log('At servie: 2', course);
    console.log('Name: ', name);
    console.log('Description: ', description);
    console.log('Image: ', image);

    course.name = name;
    course.description = description;
    course.image = image;
    console.log('At servie:', course);
    await course.save();
    return course;
}

async function getCourseByID(courseID) {
    const course = await CourseModel.findById(courseID);
    if (!course) {
        throw new Error('Course not found');
    }
    return course;
}

async function joinCourse(studentID, courseID) {
    const course = await CourseModel.findById(courseID);
    if (!course) {
        throw new Error('Course not found');
    }
    if (course.students.includes(studentID)) {
        throw new Error('Student already enrolled in this course');
    }
    course.students.push(studentID);
    await course.save();
    return course;
}

async function deleteCourseById(courseID) {
    const course = await CourseModel.findById(courseID);
    if (!course) {
        throw new Error('Course not found');
    }

    const topics = await TopicModel.find({ course_id: courseID });

    for (const topic of topics) {
        await BlockModel.deleteMany({ topic_id: topic._id });
    }

    await TopicModel.deleteMany({
        _id: { $in: topics.map(topic => topic._id) },
    });

    const result = await CourseModel.deleteOne({ _id: courseID });
    if (result.deletedCount === 0) {
        throw new Error('Course not found');
    }
    return true;
}

async function deleteAll() {
    const result = await CourseModel.deleteMany({});
    if (result.deletedCount === 0) {
        return false;
    }
    return true; // chứa thông tin như deletedCount
}

const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 6; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
};

module.exports = {
    getCoursesOfUser,
    addCourse,
    joinCourse,
    deleteAll,
    updatedCourse,
    getCourseByID,
    deleteCourseById,
    grantTeacherRoleToCourse,
    getCoursesOfUsers,
};
