const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        name: {
            type: String,
            required: false,
        },
        user_id: {
            type: Types.ObjectId,
            ref: 'users',
            required: true,
            unique: false,
        },
        total_chat: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('chat_thread', SchemaObject);
