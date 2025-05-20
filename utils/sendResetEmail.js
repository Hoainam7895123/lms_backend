// utils/sendResetEmail.js
const nodemailer = require('nodemailer');

async function sendResetEmail(toEmail, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hoainam7895123@gmail.com',
            pass: 'ohna ufmu enii piiy',
        },
    });

    const mailOptions = {
        from: '"Your App" <your-email@gmail.com>',
        to: toEmail,
        subject: 'Đặt lại mật khẩu',
        html: `<p>Click vào link bên dưới để đặt lại mật khẩu:</p>
           <a href="https://yourdomain.com/reset-password?token=${token}">Reset mật khẩu</a>`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendResetEmail;
