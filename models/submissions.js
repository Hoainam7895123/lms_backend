const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        homework_id: {
            type: Types.ObjectId,
            ref: 'homeworks',
            required: true,
        },
        student_id: {
            type: Types.ObjectId,
            ref: 'users',
        },
        file: {
            type: String,
            required: false,
        },
        comment: {
            type: String,
            required: false,
        },
        score: {
            type: String,
            require: false,
            default: 0,
        },
        rated_by: {
            type: Types.ObjectId,
            ref: 'users',
        },
        date_of_submission: {
            type: Date,
            required: false,
        },
        status: {
            type: Boolean,
            required: false,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('submissions', SchemaObject);
