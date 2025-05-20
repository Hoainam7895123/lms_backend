const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require("../models/users_ai_model"); // Điều chỉnh đường dẫn tới model

module.exports = (passport, PORT) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.DOMAIN + '/auth/google/callback', //`http://localhost:${PORT}/auth/google/callback`, // URL callback sau khi đăng nhập
            },
            async (accessToken, refreshToken, profile, done) => {
                return done(null, profile);

                //return profile;
                // try {
                //     let user = await User.findOne({ auth_id: profile.id });
                //     if (!user) {
                //         user = await new User({
                //             auth_type: "google",
                //             auth_id: profile.id,
                //             name: profile.displayName,
                //             last_login: new Date(),
                //             active: 1,
                //         }).save();
                //     } else {
                //         // Cập nhật name và last_login nếu user đã tồn tại
                //         user.name = profile.displayName;
                //         user.last_login = new Date();
                //         await user.save();
                //     }
                //     return done(null, user);
                // } catch (err) {
                //     return done(err, null);
                // }
            }
        )
    );
};
