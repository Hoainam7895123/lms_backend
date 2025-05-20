const TopicModel = require('../models/lms_topic');
const CourseModel = require('../models/lms_course');
const BlockModel = require('../models/lms_block');

async function getTopicsOfCourse(courseID) {
    const course = await CourseModel.findById(courseID);
    if (!course) {
        throw new Error('Course not found');
    }
    const topics = await TopicModel.find({ course_id: courseID });
    return topics;
}

async function addTopic(name, description, courseID) {
    const course = await CourseModel.findById(courseID);
    if (!course) {
        throw new Error('Course not found');
    }
    const topic = new TopicModel({
        name,
        description,
        course_id: courseID,
    });
    await topic.save();
    return topic;
}

async function updatedTopic(name, description, topicID) {
    const topic = await TopicModel.findById(topicID);
    if (!topic) {
        throw new Error('Topic not found');
    }
    topic.name = name;
    topic.description = description;
    await topic.save();
    return topic;
}

async function deleteTopicById(topicID) {
    const blocks = await BlockModel.find({ topic_id: topicID });

    for (const block of blocks) {
        await BlockModel.deleteMany({ topic_id: block._id });
    }

    const result = await TopicModel.deleteOne({ _id: topicID });
    if (result.deletedCount === 0) {
        throw new Error('Course not found');
    }
    return true;
}

async function getTopicByID(topicID) {
    const topic = await TopicModel.findById(topicID);
    if (!topic) {
        throw new Error('Topic not found');
    }
    return topic;
}

module.exports = {
    getTopicsOfCourse,
    addTopic,
    updatedTopic,
    getTopicByID,
    deleteTopicById,
};
