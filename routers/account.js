const { Router } = require('express');
const router = Router();
const { signup, signin } = require('../services/accountService');
const UserModel = require('../models/users');
const jwt = require('jsonwebtoken');
const RefreshTokensModel = require('../models/refresh_tokens');
const { Types } = require('mongoose');
const sendResetEmail = require('../utils/sendResetEmail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// START: Login with google
// router.get(
//   "/google/login",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async (req, res) => {
//     if (!req.user) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     let googleUserInfo = {
//       id: req.user.id,
//       email: req.user.emails?.[0]?.value,
//       name: req.user.displayName,
//       avatar: req.user.photos?.[0]?.value,
//       provider: req.user.provider,
//     };

//     try {
//       const response = await googleAuth(
//         googleUserInfo.id,
//         googleUserInfo.email,
//         googleUserInfo.name,
//         googleUserInfo.avatar
//       );

//       const token = encodeURIComponent(response.token);
//       const refreshToken = encodeURIComponent(response.refresh_token);

//       res.redirect(
//         `http://localhost:8181/#/dashboard?token=${token}&refreshToken=${refreshToken}`
//       );
//     } catch (error) {
//       console.error("Google Auth Error:", error);
//       return res.redirect("/?error=ServerError");
//     }
//   }
// );

// router.get("/profile", (req, res) => {
//   if (!req.isAuthenticated()) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authenticated",
//     });
//   }
//   res.json({
//     error: false,
//     data: {
//       name: req.user.name,
//       auth_type: req.user.auth_type,
//       last_login: req.user.last_login,
//     },
//   });
// });

// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return res.status(500).json({
//         error: true,
//         message: "Logout failed",
//         error: err.message,
//       });
//     }

//     req.session = null;

//     return res.status(200).json({
//       error: false,
//       message: "Logout successful",
//     });
//   });
// });
// END: Login with google

router.post('/api/user/signup', async (req, res) => {
    console.log('Body:', req.body);
    const { username, password, email, name, role } = req.body;
    if (!username || !password || !email || !name || !role) {
        return res.status(400).json({
            error: true,
            message: 'Vui lòng cung cấp đầy đủ thông tin',
        });
    }

    try {
        const user = await signup(username, password, email, name, role);
        console.log('ok');
        return res.status(200).json({ error: false, data: user });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

router.post('/api/user/signin', async (req, res) => {
    console.log('Body: ', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            error: true,
            message: 'Vui lòng cung cấp đầy đủ thông tin',
        });
    }

    try {
        const user = await signin(username, password);
        return res.status(200).json({ error: false, data: user });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
});

router.post('/api/refresh_token', async (req, res) => {
    const refreshToken = req.body.refresh_token;

    const rf = await RefreshTokensModel.findOne({
        refresh_token: refreshToken,
    });

    try {
        await jwt.verify(refreshToken, process.env.TOKEN_KEY_REFRESH);

        const user = await UserModel.findOne({
            _id: new Types.ObjectId(rf.user_id),
        });

        user.token = jwt.sign(
            {
                uid: user._id,
            },
            process.env.TOKEN_KEY,
            {
                expiresIn: process.env.TOKEN_EXPIRE ?? '2h',
            }
        );
        user.refresh_token = refreshToken;

        // user
        return res.status(200).json({
            error: false,
            access_token: user.token,
            refresh_token: user.refresh_token,
            user: {
                id: user._id,
                display_name: user.username,
                avatar: user.avatar,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(403).json({
            message: 'Invalid refresh token',
        });
    }
});

router.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('Email: ', email);

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });

        // Tạo token
        const token = generateRandomString();

        user.resetToken = token;
        await user.save();

        await sendResetEmail(email, token);

        res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

router.post('/api/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.body;
        console.log('Token: ', token);
        const user = await UserModel.findOne({
            resetToken: token,
        });

        if (!user)
            return res.status(400).json({ error: true, msg: 'Token không hợp lệ hoặc đã hết hạn' });

        return res.status(200).json({ error: false, msg: 'Success' });
    } catch (error) {
        res.status(500).json({ error: true, msg: 'Lỗi server' });
    }
});

router.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);

    try {
        const user = await UserModel.findOne({
            resetToken: token,
        });

        if (!user)
            return res.status(200).json({ error: true, msg: 'Token không hợp lệ hoặc đã hết hạn' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = undefined;
        await user.save();
        console.log('User: ', user);

        return res.status(200).json({ error: false, msg: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ error: true, msg: 'Lỗi server' });
    }
});

router.post('/api/reset-password-teacher', async (req, res) => {
    try {
        const { username } = req.body;

        const user = await UserModel.findOne({
            username: username,
        });

        if (!user) return res.status(400).json({ error: true, message: 'Token error' });
        const hashedPassword = await bcrypt.hash('123', 10);
        user.password = hashedPassword;
        user.login_count = 0;
        await user.save();

        return res.status(200).json({ error: false, password: '123' });
    } catch (error) {
        res.status(500).json({ error: true, message: `Error ${error}` });
    }
});

module.exports = router;
