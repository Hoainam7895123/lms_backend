const { Router } = require('express');
const multer = require('multer');
const uploadService = require('../services/upload-service');
const HomeworkModel = require('../models/homeworks');
const SlideModel = require('../models/slides');
const SubmissionModel = require('../models/submissions');
const router = Router();

// Cấu hình multer với giới hạn kích thước
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

router.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.body;
        const { type } = req.body;

        if (!req.file || !req.file.buffer || !req.file.originalname) {
            return res.status(400).json({ error: true, msg: 'Invalid file uploaded.' });
        }
        const fileLocation = await uploadService.uploadFile(req.file);

        switch (type) {
            case 'homework':
                const homework = await HomeworkModel.findById(id);
                homework.file = fileLocation;
                await homework.save();
                break;
            case 'slide':
                const slide = await SlideModel.findById(id);
                slide.file = fileLocation;
                await slide.save();
                break;
            case 'submission':
                const submission = await SubmissionModel.findById(id);
                submission.file = fileLocation;
                await submission.save();
                break;
            default:
                throw new Error('Vai trò không hợp lệ');
        }

        console.log('file: ', fileLocation);
        res.status(200).json({
            error: false,
            location: fileLocation,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: true, msg: 'Error uploading file.' });
    }
});

module.exports = router;
