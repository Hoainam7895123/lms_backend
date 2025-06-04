const ExcelJS = require('exceljs');

const BlockModel = require('../models/lms_block');
const HomeworkModel = require('../models/homeworks');
const SubmissionModel = require('../models/submissions');
const TopicModel = require('../models/lms_topic');
const CourseModel = require('../models/lms_course');
const UserModel = require('../models/users');

async function submitHomework(homeworkId, studentId, file) {
    const date = new Date();
    const submitHomework = await SubmissionModel.findOneAndUpdate(
        { homework_id: homeworkId, student_id: studentId },
        {
            file: file,
            date_of_submission: date,
        },
        { new: true }
    );

    if (!submitHomework) {
        throw new Error('Submission not found');
    }

    return submitHomework;
}

async function mark(submissionId, comment, score, teacherId) {
    const submission = await SubmissionModel.findById(submissionId);
    submission.comment = comment;
    submission.score = score;
    submission.rated_by = teacherId;

    submission.save();
    return submission;
}

async function getAllSubmissionOfHomework(homeworkId) {
    const submissions = await SubmissionModel.find({ homework_id: homeworkId }).populate(
        'student_id'
    );
    return submissions;
}

async function getAllSubmissionOfStudent(studentId) {
    const submissions = await SubmissionModel.find({ student_id: studentId });
    return submissions;
}

async function exportSubmissionsToExcel(homework_id) {
    try {
        // Lấy dữ liệu từ database
        const submissions = await SubmissionModel.find({ homework_id })
            .populate('homework_id', 'title')
            .populate('student_id', 'name student_code')
            .populate('rated_by', 'name')
            .lean();

        const homework = await HomeworkModel.findById(homework_id);
        const block = await BlockModel.findById(homework.block_id);
        const topic = await TopicModel.findById(block.topic_id);
        const course = await CourseModel.findById(topic.course_id); // Giả định topic có course_id

        if (!submissions.length) {
            throw new Error('Không tìm thấy bài nộp nào cho bài tập này');
        }

        // Tạo workbook và worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Submissions_${homework_id}`, {
            properties: { defaultRowHeight: 20, defaultColWidth: 20 },
        });

        // Thêm metadata
        worksheet.mergeCells('A1:I1');
        worksheet.getCell('A1').value = `BÁO CÁO BÀI NỘP - ${
            course?.name || 'Khóa học không xác định'
        }`;
        worksheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF003087' },
        };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 40;

        worksheet.mergeCells('A2:B2');
        worksheet.getCell('A2').value = `Bài tập: ${homework?.title || 'N/A'}`;
        worksheet.getCell('A2').font = { size: 12, bold: true };

        worksheet.mergeCells('A3:B3');
        worksheet.getCell('A3').value = `Mã bài tập: ${homework_id}`;
        worksheet.getCell('A3').font = { size: 12 };

        worksheet.mergeCells('A4:B4');
        worksheet.getCell('A4').value = `Thời gian xuất: ${new Date().toLocaleString('vi-VN', {
            dateStyle: 'full',
            timeStyle: 'short',
        })}`;

        worksheet.getCell('A4').font = { size: 12 };

        // Định dạng metadata
        for (let i = 2; i <= 4; i++) {
            worksheet.getRow(i).height = 25;
            worksheet.getRow(i).getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
        }

        // Định nghĩa cột
        worksheet.columns = [
            { header: 'STT', key: 'index', width: 8 },
            { header: 'Tên học sinh', key: 'student_name', width: 25 },
            { header: 'Mã học sinh', key: 'student_code', width: 15 },
            { header: 'File nộp', key: 'file', width: 30 },
            { header: 'Nhận xét', key: 'comment', width: 35 },
            { header: 'Điểm', key: 'score', width: 10 },
            { header: 'Người chấm', key: 'rated_by', width: 20 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Thời gian nộp', key: 'created_at', width: 20 },
        ];

        // Định dạng header
        const headerRow = worksheet.getRow(6); // Bảng bắt đầu từ hàng 6
        headerRow.values = [
            'STT',
            'Tên học sinh',
            'Mã học sinh',
            'File nộp',
            'Nhận xét',
            'Điểm',
            'Người chấm',
            'Trạng thái',
            'Thời gian nộp',
        ];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF005B9E' } };
        headerRow.height = 30;

        // Thêm dữ liệu
        let gradedCount = 0;
        submissions.forEach((submission, index) => {
            const score = submission.score ?? 0; // Gán score = 0 nếu null/undefined
            let isGraded = true;
            if (score === '0') {
                isGraded = false;
            }

            if (isGraded) gradedCount++;

            const row = worksheet.addRow({
                index: index + 1,
                student_name: submission.student_id?.name || 'N/A',
                student_code: submission.student_id?.student_code || 'N/A',
                file: submission.file || 'N/A',
                comment: submission.comment || 'N/A',
                score: score,
                rated_by: submission.rated_by?.name || 'N/A',
                status: isGraded ? 'Đã chấm' : 'Chưa chấm',
                created_at: submission.date_of_submission
                    ? new Date(submission.date_of_submission).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                      })
                    : 'N/A',
            });

            // Định dạng ô trạng thái
            const statusCell = row.getCell('status');
            statusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: isGraded ? 'FF00FF00' : 'FFFF0000' },
            };

            // Căn giữa và thêm viền
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Thêm thống kê
        const lastRow = submissions.length + 8;
        worksheet.mergeCells(`A${lastRow}:B${lastRow}`);
        worksheet.getCell(`A${lastRow}`).value = 'Điểm trung bình';
        worksheet.getCell(`C${lastRow}`).value = {
            formula: `AVERAGE(F7:F${submissions.length + 6})`,
            result: undefined,
        };
        worksheet.getCell(`A${lastRow}`).font = { bold: true };
        worksheet.getCell(`C${lastRow}`).font = { bold: true };

        worksheet.mergeCells(`A${lastRow + 1}:B${lastRow + 1}`);
        worksheet.getCell(`A${lastRow + 1}`).value = 'Tổng số bài nộp';
        worksheet.getCell(`C${lastRow + 1}`).value = submissions.length;
        worksheet.getCell(`A${lastRow + 1}`).font = { bold: true };

        worksheet.mergeCells(`A${lastRow + 2}:B${lastRow + 2}`);
        worksheet.getCell(`A${lastRow + 2}`).value = 'Số bài đã chấm';
        worksheet.getCell(`C${lastRow + 2}`).value = gradedCount;
        worksheet.getCell(`A${lastRow + 2}`).font = { bold: true };

        // Định dạng ô thống kê
        for (let i = lastRow; i <= lastRow + 2; i++) {
            worksheet.getRow(i).eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        }

        // Tự động điều chỉnh chiều rộng cột
        worksheet.columns.forEach(column => {
            column.width = column.width || 20;
        });

        // Xuất file
        return await workbook.xlsx.writeBuffer();
    } catch (error) {
        console.error('Lỗi trong exportSubmissionsToExcel:', error);
        throw new Error(error.message);
    }
}

module.exports = {
    submitHomework,
    mark,
    getAllSubmissionOfHomework,
    getAllSubmissionOfStudent,
    exportSubmissionsToExcel,
};
