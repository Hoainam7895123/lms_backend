const mongoose = require('mongoose');
const initializeSystemAdmin = require('./create_admin_account');

// process.env.MONGODB_URI
module.exports = () => {
    const connectWithRetry = function () {
        // Tắt cảnh báo truy vấn không khai báo rõ ràng. Cái này giúp code không bị lỗi khi bạn dùng các truy vấn không khớp schema hoàn toàn
        mongoose.set('strictQuery', false);
        return mongoose.connect(process.env.CONNECTION_STRING, {
            //   useNewUrlParser: true,
        });
    };
    connectWithRetry();

    mongoose.connection.on('open', async () => {
        console.log('MongoDB : Connected successfully');

        await initializeSystemAdmin();
    });

    mongoose.connection.on('error', err => {
        console.log(`MongoDB ERROR : ${err}`);
        console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
        setTimeout(connectWithRetry, 5000);
    });
};
