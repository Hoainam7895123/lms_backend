const bcrypt = require('bcrypt');
const User = require('../models/users'); // thay bằng path thực tế

async function initializeSystemAdmin() {
    try {
        const existingAdmin = await User.findOne({ role: 'ROLE_SYSTEM_ADMIN' });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10); // hoặc gen ngẫu nhiên rồi log ra

            const admin = new User({
                username: 'admin@lms.com',
                password: hashedPassword,
                auth_type: 'local',
                role: 'ROLE_SYSTEM_ADMIN',
                name: 'System Admin',
                login_count: '1',
            });

            await admin.save();
            console.log('✅ System Admin account created: admin@lms.com / admin123');
        } else {
            console.log('ℹ️ System Admin already exists');
        }
    } catch (err) {
        console.error('❌ Error creating system admin:', err);
    }
}

module.exports = initializeSystemAdmin;
