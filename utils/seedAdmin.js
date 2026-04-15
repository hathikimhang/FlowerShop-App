const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ensureDefaultAdmin = async () => {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@flowershop.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Shop Admin';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
        return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
        fullName: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin'
    });

    console.log(`Da tao tai khoan admin mac dinh: ${adminEmail}`);
};

module.exports = ensureDefaultAdmin;