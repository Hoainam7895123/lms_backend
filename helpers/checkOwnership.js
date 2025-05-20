const Topic = require('../models/lms_topic');
const Course = require('../models/lms_course');
const Block = require('../models/lms_block');
const Slide = require('../models/slides');

const checkOwnership = async ({ type, id, teacherId }) => {
    let course;

    switch (type) {
        case 'course':
            course = await Course.findById(id);
            break;

        case 'topic':
            const topic = await Topic.findById(id).populate('course_id');
            if (!topic || !topic.course_id) return false;
            course = topic.course_id;
            break;

        case 'block':
            const block = await Block.findById(id).populate({
                path: 'topic_id',
                populate: { path: 'course_id' },
            });
            if (!block || !block.topic_id || !block.topic_id.course_id) return false;
            course = block.topic_id.course_id;
            break;

        case 'slide':
            // ví dụ: Slide -> Block -> Topic -> Course
            const slide = await Slide.findById(id).populate({
                path: 'block_id',
                populate: {
                    path: 'topic_id',
                    populate: { path: 'course_id' },
                },
            });
            if (
                !slide ||
                !slide.block_id ||
                !slide.block_id.topic_id ||
                !slide.block_id.topic_id.course_id
            )
                return false;
            course = slide.block_id.topic_id.course_id;
            break;

        default:
            throw new Error('Invalid type');
    }

    if (!course || !Array.isArray(course.teachers)) return false;

    return course.teachers.some(t => String(t) === String(teacherId));
};

module.exports = checkOwnership;
