const { Router } = require('express');
const router = Router();

const SlideModel = require('../models/slides');
const {
    getSlidesOfBlock,
    addSlide,
    updatedSlide,
    getSlideByID,
    deleteSlideById,
} = require('../services/slideService');
const checkOwnership = require('../helpers/checkOwnership');

router.get('/api/blocks/:blockID/slides', async (req, res) => {
    try {
        const slides = await getSlidesOfBlock(req.params.blockID);
        res.status(200).json({ error: false, data: slides });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.post('/api/blocks/:blockID/slides', async (req, res) => {
    try {
        // const result = await checkOwnership({
        //     type: 'block',
        //     id: req.params.blockID,
        //     teacherId: '67fd2c6740c7e06d1d5d839f', // cần thay bằng teacher thực tế từ auth
        // });
        // if (!result) {
        //     return res.status(403).json({
        //         error: true,
        //         message: 'You do not have permission to perform this action',
        //     });
        // }

        const { title, description, file } = req.body;
        const slide = await addSlide(title, description, file, req.params.blockID);
        res.status(201).json({ error: false, data: slide });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.put('/api/slides/:slideID', async (req, res) => {
    try {
        const { title, description, file } = req.body;
        const updated = await updatedSlide(title, description, file, req.params.slideID);
        res.status(200).json({ error: false, data: updated });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

router.get('/api/slides/:slideID', async (req, res) => {
    try {
        const slide = await getSlideByID(req.params.slideID);
        res.status(200).json({ error: false, data: slide });
    } catch (error) {
        res.status(404).json({ error: true, message: error.message });
    }
});

router.delete('/api/slides/:slideID', async (req, res) => {
    try {
        const slide = await SlideModel.findById(req.params.slideID);
        if (!slide) {
            return res.status(404).json({ error: true, message: 'Slide not found' });
        }

        const result = await deleteSlideById(req.params.slideID);
        if (!result) {
            return res.status(404).json({ error: true, message: 'Slide delete failed!' });
        }

        return res.status(200).json({ error: false, message: 'Slide deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

module.exports = router;
