const mongoose = require('mongoose');

// Định nghĩa cấu trúc dữ liệu cho một mẫu hoa (Mongoose Schema)
const flowerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên mẫu hoa là bắt buộc'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Phải chọn danh mục (Sinh nhật, Khai trương...)'],
        enum: ['Hoa sinh nhật', 'Hoa khai trương', 'Hoa tình yêu', 'Khác'],
        default: 'Khác'
    },
    price: {
        type: Number,
        required: [true, 'Giá tiền không được để trống'],
        min: [0, 'Giá tiền không thể âm']
    },
    image: {
        type: String, 
        required: [true, 'Phải có link ảnh để hiển thị lên Storefront']
    },
    description: {
        type: String,
        trim: true,
        default: 'Mẫu hoa xinh xắn thiết kế riêng bởi Flower Boutique.'
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Số lượng kho không thể âm']
    },
    isAvailable: {
        type: Boolean,
        default: true // Để bật/tắt hiển thị mẫu hoa trên trang chủ
    }
}, {
    // Tự động tạo field createdAt và updatedAt
    timestamps: true 
});

// Xuất Model để các file khác (Controller) có thể sử dụng
module.exports = mongoose.model('Flower', flowerSchema);