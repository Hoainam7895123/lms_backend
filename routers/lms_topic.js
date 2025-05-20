const { Router } = require('express');
const router = Router();

const TopicModel = require('../models/lms_topic');
const {
    getTopicsOfCourse,
    addTopic,
    updatedTopic,
    getTopicByID,
    deleteTopicById,
} = require('../services/topicService');

router.get('/api/courses/:courseID/topics', async (req, res) => {
    try {
        const { courseID } = req.params;
        const topics = await getTopicsOfCourse(courseID);
        res.status(200).json({ error: false, data: topics });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.post('/api/courses/:courseID/topics', async (req, res) => {
    try {
        const { courseID } = req.params;
        const { name, description } = req.body;
        console.log(name, ' ', description, ' ', courseID);
        const topic = await addTopic(name, description, courseID);
        res.status(201).json({ error: false, data: topic });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.put('/api/topics/:topicID', async (req, res) => {
    try {
        const { topicID } = req.params;
        const { name, description } = req.body;
        const topic = await updatedTopic(name, description, topicID);
        res.status(200).json({ error: false, data: topic });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.get('/api/topics/:topicID', async (req, res) => {
    try {
        const { topicID } = req.params;
        const topic = await getTopicByID(topicID);
        res.status(200).json({ error: false, data: topic });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.delete('/api/topics/:topicID', async (req, res) => {
    try {
        const { topicID } = req.params;
        const topic = await TopicModel.findById(topicID);
        if (!topic) {
            res.status(400).json({ error: true, message: 'Topic not found' });
        }
        const result = await deleteTopicById(topicID);
        if (!result) {
            res.status(400).json({ error: true, message: 'Delete not found' });
        }
        res.status(200).json({ error: false, message: 'Delete topic successfully!' });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

module.exports = router;
