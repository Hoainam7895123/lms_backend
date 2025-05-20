const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        video: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
        topic_id: {
            type: Types.ObjectId,
            ref: 'lms_topic',
            required: true,
        },
        deadline: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('lms_block', SchemaObject);
