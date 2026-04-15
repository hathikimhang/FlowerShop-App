const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower' },
    flowerName: { type: String },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'], 
        default: 'Đang xử lý' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);