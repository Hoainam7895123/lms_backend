const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JoinRequestSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'lms_course',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        message: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = mongoose.model('join_request', JoinRequestSchema);
