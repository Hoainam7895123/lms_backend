const { Router } = require('express');
const router = Router();

const { exportSubmissionsToExcel } = require('../services/submissionService');

router.get('/api/export-excel/homeworks/:homeworkId', async (req, res) => {
    try {
        const homework_id = req.params.homeworkId;

        const buffer = await exportSubmissionsToExcel(homework_id);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=submissions.xlsx');

        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo file Excel', error: error.message });
    }
});

module.exports = router;
