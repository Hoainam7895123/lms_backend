const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
require('./helpers/mongo')();
const routes = require('./routers/index');

const session = require('express-session');
const configurePassport = require('./passport');
const { createIndex, checkIndexExists } = require('./helpers/vector-db');

const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: '*',
        methods: '*',
        credentials: true,
    })
);

app.use(
    session({
        secret: 'your-secret-key', // Thay bằng chuỗi bí mật
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false, // Đặt true khi sử dụng https
            maxAge: 60 * 60 * 1000, // Thời gian tồn tại của cookie, ví dụ 1 giờ
            expires: new Date(Date.now() + 3600000),
        },
    })
);

const init = async () => {
    // const indexExists = await checkIndexExists();
    // if (!indexExists) {
    await createIndex();
    // } else {
    //     const stats = await checkIndexExists();
    //     if (stats) {
    //         console.log('Index exists. Stats:', stats);
    //     } else {
    //         console.log('Index does not exist.');
    //     }
    //     const response = await describeIndexStats();
    // }
};

configurePassport(app, PORT);

app.use(express.json());

app.use('/', express.static('../public'));

app.use(routes);

app.listen(PORT, '0.0.0.0', async () => {
    // await init();
    console.log(`Server đang chạy tại http://localhost:${PORT || 3000}`);
});

module.exports = app; // Export đúng app tại đây
