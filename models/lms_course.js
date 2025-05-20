const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        image: {
            type: String,
            required: false,
        },
        center_admin: {
            type: Types.ObjectId,
            ref: 'users',
        },
        teachers: [
            {
                type: Types.ObjectId,
                ref: 'users',
            },
        ],
        students: [
            {
                type: Types.ObjectId,
                ref: 'users',
            },
        ],
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('lms_course', SchemaObject);
