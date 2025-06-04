const { Schema, Types, model } = require('mongoose');
const SchemaObject = new Schema(
    {
        thread_id: {
            type: Types.ObjectId,
            ref: 'chat_thread',
            required: true,
            unique: false,
        },
        content: {
            type: String,
            required: true,
            unique: false,
        },
        sender: {
            type: String,
            required: true,
            unique: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('chat_history', SchemaObject);
