const { Router } = require('express');
const router = Router();
const { authenticateToken } = require('../helpers/auth');
const { createCenterAdmin, changePassword } = require('../services/accountService');
const UserModel = require('../models/users');
const jwt = require('jsonwebtoken');

router.post('/api/accounts/create-center-admin', authenticateToken, async (req, res) => {
    try {
        console.log('BODY: ', req.body);
        const adminId = req.user.id;
        const admin = await UserModel.findById(adminId);
        console.log('admin: ', admin);
        let role;
        if (admin.role === 'ROLE_SYSTEM_ADMIN') {
            role = 'ROLE_CENTER_ADMIN';
        }
        console.log('ROLE 1: ', role);
        if (admin.role === 'ROLE_CENTER_ADMIN') {
            role = 'ROLE_TEACHER';
        }
        console.log('ROLE 2: ', role);

        const { username, password, name } = req.body;
        const user = await UserModel.findOne({ username: username });
        if (user) {
            return res.status(400).json({
                error: true,
                message: 'Username already exists. Please choose a different username.',
            });
        }
        const response = await createCenterAdmin(username, password, name, role, adminId);

        return res.status(200).json({
            error: false,
            data: response,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

router.post('/api/accounts/change-password', authenticateToken, async (req, res) => {
    try {
        console.log('BODY: ', req.body);
        const { oldPass, newPass } = req.body;
        const userId = req.user.id;
        const response = await changePassword(oldPass, newPass, userId);
        if (response) {
            return res.status(200).json({
                error: false,
                data: response,
            });
        }
        return res.status(404).json({
            error: false,
            message: 'Change password failed',
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

module.exports = router;
