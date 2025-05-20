const express = require('express');
const router = express.Router();
const BlockModel = require('../models/lms_block');
const {
    getBlocksOfTopic,
    addBlock,
    updatedBlock,
    getBlockByID,
    deleteBlockById,
} = require('../services/blockService');
const { addNotifications } = require('../services/notification-service');
const checkOwnership = require('../helpers/checkOwnership');
const NotificationModel = require('../models/notifications');

router.get('/api/topics/:topicID/blocks', async (req, res) => {
    try {
        const blocks = await getBlocksOfTopic(req.params.topicID);
        res.status(200).json({ error: false, data: blocks });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.post('/api/topics/:topicID/blocks', async (req, res) => {
    try {
        // const result = await checkOwnership({
        //     type: 'topic',
        //     id: req.params.topicID,
        //     teacherId: '67fd2c6740c7e06d1d5d839f',
        // });

        // if (!result) {
        //     return res.status(403).json({
        //         error: true,
        //         message: 'You do not have permission to perform this action',
        //     });
        // }

        const { name, description, video, deadline } = req.body;
        const block = await addBlock(name, description, video, deadline, req.params.topicID);
        const result = await addNotifications(block._id, req.params.topicID, block.name);
        console.log('Result: ', result);
        res.status(201).json({ error: false, data: block });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.put('/api/blocks/:blockID', async (req, res) => {
    try {
        const { name, description, video, deadline } = req.body;
        const updated = await updatedBlock(name, description, video, deadline, req.params.blockID);
        res.status(200).json({ error: false, data: updated });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/blocks/:blockID', async (req, res) => {
    try {
        const block = await getBlockByID(req.params.blockID);
        res.status(200).json({ error: false, data: block });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.delete('/api/blocks/:blockID', async (req, res) => {
    try {
        const block = await BlockModel.findById(req.params.blockID);
        if (!block) {
            return res.status(404).json({ error: true, message: 'Block not found' });
        }
        const result = await deleteBlockById(req.params.blockID);
        if (!result) {
            return res.status(404).json({ error: true, message: 'Block delted failed!' });
        }

        return res.status(200).json({ error: false, message: 'Block deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

module.exports = router;
