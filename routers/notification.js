const { Router } = require('express');
const router = Router();

const {
    getAllNotificationsNotIsRead,
    markAllNotificationsAsRead,
    getTwentyNotifications,
} = require('../services/notification-service');
const { authenticateToken } = require('../helpers/auth');

router.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('User ID:', userId);
        const notificationsNotIsRead = await getTwentyNotifications(userId);
        return res.status(200).json({ error: false, data: notificationsNotIsRead });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/notificationsNotIsRead', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('User ID:', userId);
        const notificationsNotIsRead = await getAllNotificationsNotIsRead(userId);
        return res.status(200).json({ error: false, data: notificationsNotIsRead });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.post('/api/notifications/mark-as-read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllNotificationsAsRead(userId);
        return res.status(200).json({ error: false, message: 'Success' });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

module.exports = router;
