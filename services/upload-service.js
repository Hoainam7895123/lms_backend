const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const mkdirp = require('mkdirp'); // Đảm bảo thư viện mkdirp đã được cài đặt
const { v4: uuidv4 } = require('uuid'); // Thêm uuid để tạo tên tệp duy nhất

// Kiểm tra biến môi trường
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not configured properly.');
}

// Cập nhật cấu hình AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const s3 = new AWS.S3();

// Đảm bảo thư mục temp tồn tại
const tempDir = path.join(__dirname, 'temp');
mkdirp.sync(tempDir); // Tạo thư mục nếu chưa có

// Hàm làm sạch tên tệp
const cleanFileName = fileName => {
    return fileName.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
};

const uploadFile = async file => {
    try {
        // Làm sạch và tạo tên tệp duy nhất
        const cleanedFileName = cleanFileName(file.originalname);
        const uniqueFileName = `${uuidv4()}-${cleanedFileName}`;
        const filePath = path.join(tempDir, uniqueFileName);

        // Lưu tệp vào thư mục temp
        fs.writeFileSync(filePath, file.buffer);

        // Xác định loại nội dung
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        // Tải lên S3
        const params = {
            Bucket: 'mybucket-20250506',
            Key: uniqueFileName,
            Body: fs.createReadStream(filePath),
            ContentType: mimeType,
        };

        const data = await s3.upload(params).promise();
        console.log('File uploaded successfully:', data.Location);

        return data.Location;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file to S3');
    } finally {
    }
};

module.exports = { uploadFile };
