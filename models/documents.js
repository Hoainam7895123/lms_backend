const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        user_id: {
            type: Types.ObjectId,
            required: true,
        },
        content: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('document_file', SchemaObject);
