const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Liên kết với bảng User (Ai là người đặt đơn này?)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Thông tin người nhận cụ thể cho lần đặt này
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    
    // Khách có thể mua nhiều loại hoa cùng lúc, nên để dạng Mảng (Array)
    items: [{
        flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true } // LƯU Ý: Phải lưu giá ngay lúc mua, lỡ mai mốt hoa lên giá thì bill cũ không bị đổi
    }],
    
    totalAmount: { type: Number, required: true }, // Tổng tiền của hóa đơn
    deliveryAddress: { type: String, required: true }, // Giao đi đâu
    deliveryTime: { type: Date }, // Mấy giờ giao
    cardMessage: { type: String }, // Lời nhắn viết trên thiệp
    
    status: {
        type: String,
        enum: ['Mới nhận', 'Đang cắm', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
        default: 'Mới nhận'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);