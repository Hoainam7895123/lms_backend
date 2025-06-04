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
        subject: 'Mã xác thực đặt lại mật khẩu',
        html: `
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhập mã xác thực bên dưới để tiếp tục:</p>
            <h2 style="letter-spacing: 2px;">${token}</h2>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <p>Trân trọng,<br>Your App Team</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendResetEmail;
