const { Schema, model, Types } = require('mongoose');

const SchemaObject = new Schema(
    {
        document_id: {
            type: Types.ObjectId,
            required: true,
        },
        chunk_index: {
            type: Number,
            required: true,
        },
        chunk_text: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

module.exports = model('document_chunks', SchemaObject);
