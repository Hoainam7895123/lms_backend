const { Router } = require('express');
// const passport = require('passport');
const { googleLogin } = require('../services/authService');

const router = Router();

// router.get('/google/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     async (req, res) => {
//         if (!req.user) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }

//         let googleUserInfo = {
//             id: req.user.id,
//             email: req.user.emails?.[0]?.value,
//             name: req.user.displayName,
//             avatar: req.user.photos?.[0]?.value,
//             provider: req.user.provider,
//         };

//         try {
//             const response = await googleLogin(
//                 googleUserInfo.id,
//                 googleUserInfo.email,
//                 googleUserInfo.name,
//                 googleUserInfo.avatar
//             );

//             const token = encodeURIComponent(response.token);
//             const refreshToken = encodeURIComponent(response.refresh_token);

//             res.redirect(
//                 `${process.env.DOMAIN}/#/dashboard?token=${token}&refreshToken=${refreshToken}`
//             );
//         } catch (error) {
//             console.error('Google Auth Error:', error);
//             return res.redirect('/?error=ServerError');
//         }
//     }
// );

// router.get('/profile', (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.status(401).json({
//             success: false,
//             message: 'Not authenticated',
//         });
//     }
//     res.json({
//         error: false,
//         data: {
//             name: req.user.name,
//             auth_type: req.user.auth_type,
//             last_login: req.user.last_login,
//         },
//     });
// });

// router.get('/logout', (req, res) => {
//     req.logout(err => {
//         if (err) {
//             return res.status(500).json({
//                 error: true,
//                 message: 'Logout failed',
//                 error: err.message,
//             });
//         }

//         req.session = null;

//         return res.status(200).json({
//             error: false,
//             message: 'Logout successful',
//         });
//     });
// });

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/api/auth/google-id-token', async (req, res) => {
    try {
        console.log('Starting token verification...');
        // Lấy token từ header
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.replace('Bearer ', '');

        console.log('ID Token:', idToken);

        // Xác thực token
        const ticket = await client.verifyIdToken({
            idToken,
            // audience: process.env.GOOGLE_CLIENT_ID,
            audience: '731558230952-ht71h2rcefjltono0r4sggsk43pvj0dp.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        const response = await googleLogin(googleId, email, name, picture);

        res.json({
            token: response.token,
            refreshToken: response.refresh_token,
        });
    } catch (err) {
        console.error('Token verify failed:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
