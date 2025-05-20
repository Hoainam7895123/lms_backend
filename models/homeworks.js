const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        block_id: {
            type: Types.ObjectId,
            ref: 'lms_block',
            required: true,
        },
        file: {
            type: String,
            required: false,
        },
        deadline: {
            type: Date,
            require: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('homeworks', SchemaObject);
