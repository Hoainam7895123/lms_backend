const BlockModel = require('../models/lms_block');
const HomeworkModel = require('../models/homeworks');
const SubmissionModel = require('../models/submissions');
const UserModel = require('../models/users');
const TopicModel = require('../models/lms_topic');
const CourseModel = require('../models/lms_course');

async function getHomeworksOfBlock(blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Block not found');
    }
    const homeworks = await HomeworkModel.find({ block_id: blockID });
    return homeworks;
}

async function addHomework(title, description, deadline, blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Block not found');
    }
    const topic = await TopicModel.findById(block.topic_id);
    const course = await CourseModel.findById(topic.course_id);
    const students = course.students;

    const homework = new HomeworkModel({
        title,
        description,
        deadline,
        block_id: blockID,
    });

    await homework.save();

    await Promise.all(
        students.map(student =>
            SubmissionModel.create({
                homework_id: homework._id,
                student_id: student,
            })
        )
    );

    return homework;
}

async function updatedHomework(title, description, file, deadline, homeworkID) {
    const homework = await HomeworkModel.findById(homeworkID);
    if (!homework) {
        throw new Error('Homework not found');
    }

    homework.title = title;
    homework.description = description;
    homework.file = file;
    homework.deadline = deadline;
    await homework.save();
    return homework;
}

async function getHomeworkByID(homeworkID) {
    const homework = await HomeworkModel.findById(homeworkID);
    if (!homework) {
        throw new Error('Homework not found');
    }
    return homework;
}

async function deleteHomeworkById(homeworkID) {
    const result = await HomeworkModel.deleteOne({ _id: homeworkID });
    if (result.deletedCount === 0) {
        throw new Error('Slide not found');
    }
    return true;
}

module.exports = {
    getHomeworksOfBlock,
    addHomework,
    updatedHomework,
    getHomeworkByID,
    deleteHomeworkById,
};
