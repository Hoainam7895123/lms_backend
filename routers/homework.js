const express = require('express');
const router = express.Router();
const HomeworkModel = require('../models/homeworks');
const {
    getHomeworksOfBlock,
    addHomework,
    updatedHomework,
    getHomeworkByID,
    deleteHomeworkById,
} = require('../services/homeworkService');
const checkOwnership = require('../helpers/checkOwnership');

router.get('/api/blocks/:blockID/homeworks', async (req, res) => {
    try {
        const homeworks = await getHomeworksOfBlock(req.params.blockID);
        res.status(200).json({ error: false, data: homeworks });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.post('/api/blocks/:blockID/homeworks', async (req, res) => {
    try {
        // const result = await checkOwnership({
        //     type: 'block',
        //     id: req.params.blockID,
        //     teacherId: '67fd2c6740c7e06d1d5d839f', // Thay bằng teacher thực tế từ auth
        // });

        // if (!result) {
        //     return res.status(403).json({
        //         error: true,
        //         message: 'You do not have permission to perform this action',
        //     });
        // }

        const { title, description, deadline } = req.body;
        const homework = await addHomework(title, description, deadline, req.params.blockID);
        res.status(201).json({ error: false, data: homework });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.put('/api/homeworks/:homeworkID', async (req, res) => {
    try {
        const { name, description, video, image } = req.body;
        const updated = await updatedHomework(
            name,
            description,
            video,
            image,
            req.params.homeworkID
        );
        res.status(200).json({ error: false, data: updated });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/homeworks/:homeworkID', async (req, res) => {
    try {
        const homework = await getHomeworkByID(req.params.homeworkID);
        res.status(200).json({ error: false, data: homework });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.delete('/api/homeworks/:homeworkID', async (req, res) => {
    try {
        const homework = await HomeworkModel.findById(req.params.homeworkID);
        if (!homework) {
            return res.status(404).json({ error: true, message: 'Homework not found' });
        }

        const result = await deleteHomeworkById(req.params.homeworkID);
        if (!result) {
            return res.status(404).json({ error: true, message: 'Homework delete failed!' });
        }

        return res.status(200).json({ error: false, message: 'Homework deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

module.exports = router;
