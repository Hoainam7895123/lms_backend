const UserModel = require('../models/users');
const jwt = require('jsonwebtoken');
const RefreshTokensModel = require('../models/refresh_tokens');

async function googleLogin(googleID, email, name, avatar) {
    let registryResponseCode = 0;

    let user = await UserModel.findOne({ auth_id: googleID, auth_type: 'google' });
    if (!user) {
        user = await UserModel.create({
            name: name,
            email: email,
            active: 0,
            auth_id: googleID,
            auth_type: 'google',
            avatar: avatar,
            last_login: new Date(),
        });
    } else {
        user.name = name;
        // user.login_count = user.login_count + 1;
        user.last_login = new Date();
        await user.save();
    }
    const token = jwt.sign(
        {
            uid: user._id,
        },
        process.env.TOKEN_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRE ?? '2h',
        }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
        {
            uid: user._id,
        },
        process.env.TOKEN_KEY_REFRESH,
        {
            expiresIn: process.env.TOKEN_KEY_REFRESH_EXPIRE ?? '7d',
        }
    );

    await saveRefreshToken(user._id, refreshToken);

    return {
        id: user._id,
        name: user.name,
        token: token,
        refresh_token: refreshToken,
        active: user.active,
        registryResponseCode,
    };
}

async function saveRefreshToken(userID, refresh_token) {
    const user = await RefreshTokensModel.findOne({
        user_id: userID,
    });
    if (user) {
        //update refresh token
        await RefreshTokensModel.updateOne(
            {
                user_id: userID,
            },
            {
                $set: {
                    refresh_token: refresh_token,
                },
            }
        );
    } else {
        //insert refresh token
        let writeKeyObject = {
            user_id: userID,
            refresh_token: refresh_token,
        };
        await RefreshTokensModel.create(writeKeyObject);
    }
}

module.exports = { googleLogin, saveRefreshToken };
