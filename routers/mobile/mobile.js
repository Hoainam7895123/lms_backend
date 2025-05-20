const { Router } = require('express');
const { authenticateToken } = require('../../helpers/auth');
const router = Router();
const CourseModel = require('../../models/lms_course');

router.get('/api/moible/search', authenticateToken, async function (req, res) {
    try {
        const code = req.query.code;

        console.log('Code: ', code);

        if (!code) {
            return res.status(400).json({ error: true, msg: 'Thiếu mã lớp học (code)' });
        }

        const course = await CourseModel.findOne({ code: code }).populate('center_admin');

        console.log('Course: ', course);

        if (!course) {
            return res
                .status(404)
                .json({ error: true, msg: 'Không tìm thấy lớp học với mã đã nhập' });
        }

        return res.status(200).json({ error: false, data: course });
    } catch (error) {
        console.log('Error!');
    }
});

module.exports = router;
