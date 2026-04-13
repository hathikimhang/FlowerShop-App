const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
        },
        process.env.JWT_SECRET || 'flower_shop_secret_key',
        { expiresIn: '7d' }
    );
};

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Vui long nhap day du ho ten, email va mat khau.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({ message: 'Email nay da duoc dang ky.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            role: 'customer'
        });

        const token = signToken(user);
        return res.status(201).json({
            message: 'Dang ky thanh cong.',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Loi khi dang ky tai khoan.', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui long nhap email va mat khau.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Thong tin dang nhap khong dung.' });
        }

        const matched = await bcrypt.compare(password, user.passwordHash);
        if (!matched) {
            return res.status(401).json({ message: 'Thong tin dang nhap khong dung.' });
        }

        const token = signToken(user);
        return res.status(200).json({
            message: 'Dang nhap thanh cong.',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Loi khi dang nhap.', error: error.message });
    }
};

const me = async (req, res) => {
    return res.status(200).json({
        user: {
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            fullName: req.user.fullName
        }
    });
};

module.exports = { register, login, me };
