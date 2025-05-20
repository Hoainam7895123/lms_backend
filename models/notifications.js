const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        recipient: {
            type: Types.ObjectId,
            ref: 'users',
        },
        title: {
            type: String,
            required: false,
        },
        message: {
            type: String,
            required: false,
        },
        is_read: {
            type: Boolean,
            required: false,
            default: false,
        },
        course_id: {
            type: Types.ObjectId,
            ref: 'lms_course',
            required: false,
        },
        block_id: {
            type: Types.ObjectId,
            ref: 'lms_block',
            required: false,
        },
        submission_id: {
            type: Types.ObjectId,
            ref: 'submissions',
            required: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('notifications', SchemaObject);
