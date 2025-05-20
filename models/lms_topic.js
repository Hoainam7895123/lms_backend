const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        course_id: {
            type: Types.ObjectId,
            ref: 'lms_course',
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('lms_topic', SchemaObject);
