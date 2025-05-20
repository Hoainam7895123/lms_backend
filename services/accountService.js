const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserModel = require('../models/users');
const RefreshTokensModel = require('../models/refresh_tokens');

// Login with goole
async function googleAuth(googleID, email, name, avatar) {
    let user = await UserModel.findOne({
        auth_id: googleID,
        auth_type: 'google',
    });

    if (!user) {
        user = await UserModel.create({
            name: name,
            email: email,
            active: true,
            auth_id: googleID,
            auth_type: 'google',
            avatar: avatar,
            last_login: new Date(),
        });
    } else {
        user.name = name;
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

async function signup(username, password, email, name, role) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        auth_type: 'local',
        auth_id: username,
        active: true,
        username: username,
        password: hashedPassword,
        email: email,
        name: name,
        role: role,
    });

    const token = jwt.sign(
        {
            uid: user._id,
        },
        process.env.TOKEN_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRE ?? '2h',
        }
    );

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
    };
}

async function signin(username, password) {
    const user = await UserModel.findOne({ username });
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
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
        token: token,
        refresh_token: refreshToken,
        user: {
            id: user._id,
            name: user.name,
            active: user.active,
            login_count: user.login_count,
            role: user.role,
        },
    };
}

async function saveRefreshToken(userID, refresh_token) {
    const user = await RefreshTokensModel.findOne({
        user_id: userID,
    });
    if (user) {
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
        let writeKeyObject = {
            user_id: userID,
            refresh_token: refresh_token,
        };
        await RefreshTokensModel.create(writeKeyObject);
    }
}

async function createCenterAdmin(username, password, name, role, userId) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        auth_type: 'local',
        auth_id: username,
        active: true,
        username: username,
        password: hashedPassword,
        name: name,
        role: role,
        created_by: userId,
    });

    return user;
}

async function changePassword(oldPass, newPass, usesId) {
    const user = await UserModel.findById(usesId);
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
        throw new Error('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    user.login_count = user.login_count + 1;
    user.save();
    return user;
}

module.exports = {
    createCenterAdmin,
    googleAuth,
    signup,
    signin,
    changePassword,
};
