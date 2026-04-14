const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Hàm tạo Token (Giữ nguyên)
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

// 2. Hàm Đăng ký (Register)
const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
        }

        const emailClean = email.toLowerCase().trim();
        const existing = await User.findOne({ email: emailClean });
        if (existing) {
            return res.status(400).json({ message: 'Email này đã được đăng ký.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: fullName.trim(),
            email: emailClean,
            passwordHash,
            role: 'customer'
        });

        const token = signToken(user);
        return res.status(201).json({
            message: 'Đăng ký thành công.',
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi đăng ký.', error: error.message });
    }
};

// 3. Hàm Đăng nhập (Login) - CÓ THÊM LOG DEBUG
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(">>> [BACKEND] Nhận yêu cầu đăng nhập cho:", email);

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
        }

        const emailClean = email.toLowerCase().trim();
        const user = await User.findOne({ email: emailClean });

        if (!user) {
            console.log(">>> [BACKEND] KHÔNG tìm thấy email này trong DB.");
            return res.status(401).json({ message: 'Thông tin đăng nhập không đúng.' });
        }

        const matched = await bcrypt.compare(password, user.passwordHash);
        console.log(">>> [BACKEND] Kết quả so khớp mật khẩu:", matched);

        if (!matched) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không đúng.' });
        }

        const token = signToken(user);
        console.log(">>> [BACKEND] Đăng nhập THÀNH CÔNG cho:", user.fullName);

        return res.status(200).json({
            message: 'Đăng nhập thành công.',
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(">>> [BACKEND] Lỗi server:", error.message);
        return res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// 4. Hàm lấy thông tin cá nhân (Me)
const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
        return res.status(200).json({ user });
    } catch (e) {
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// 5. Hàm cập nhật Profile
const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        await user.save();
        const updatedUser = user.toObject();
        delete updatedUser.passwordHash;
        return res.status(200).json({ message: 'Cập nhật thành công', user: updatedUser });
    } catch (e) {
        return res.status(500).json({ message: 'Lỗi', error: e.message });
    }
};

// 6. Hàm đổi mật khẩu
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        const matched = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!matched) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (e) {
        return res.status(500).json({ message: 'Lỗi', error: e.message });
    }
};

// --- QUAN TRỌNG NHẤT: XUẤT TẤT CẢ CÁC HÀM ---
module.exports = {
    register,
    login,
    me,
    updateProfile,
    updatePassword
};