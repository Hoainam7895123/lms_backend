const { Schema, model, Types } = require('mongoose');
const SchemaObject = new Schema(
    {
        name: {
            type: String,
            required: false,
            unique: false,
        },
        auth_type: {
            type: String,
            required: true,
        },
        auth_id: {
            type: String,
            required: false,
            unique: true,
        },
        username: {
            type: String,
            unique: true,
            required: function () {
                return this.auth_type === 'local';
            },
        },
        password: {
            type: String,
            required: function () {
                return this.auth_type === 'local';
            },
        },
        role: {
            type: String,
            required: true,
            enum: ['ROLE_SYSTEM_ADMIN', 'ROLE_CENTER_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'],
        },
        email: {
            type: String,
            required: false,
        },
        token: {
            type: String,
            required: false,
        },
        avatar: {
            type: String,
            required: false,
        },
        active: {
            type: Number,
            required: false,
        },
        last_login: {
            type: Date,
            required: false,
        },
        login_count: {
            type: Number,
            default: 0,
        },
        created_by: {
            type: Types.ObjectId,
            ref: 'users',
            required: false,
        },
        token_expiry: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = model('users', SchemaObject);
