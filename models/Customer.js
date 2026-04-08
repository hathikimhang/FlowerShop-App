const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // Số điện thoại là duy nhất không được trùng
    address: { type: String },
    memberTier: {
        type: String,
        enum: ['Thường', 'Bạc', 'Vàng', 'Kim Cương', 'VIP'],
        default: 'Thường' // Mặc định khách mới là hạng Thường
    },
    totalSpent: { type: Number, default: 0 }, // Tổng tiền khách đã chi tiêu tại tiệm
    note: { type: String } // Ghi chú sở thích khách (VD: hay mua hoa hồng đỏ)
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);