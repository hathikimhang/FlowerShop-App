const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    // Khóa ngoại (Foreign Key) liên kết với bảng Flower
    flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
    
    importQuantity: { type: Number, required: true }, // Số lượng nhập lô này
    remainingQuantity: { type: Number, required: true }, // Số lượng còn lại sau khi bán
    importPrice: { type: Number, required: true }, // Giá vốn lúc nhập vào (để tính lãi)
    supplier: { type: String, default: 'Chợ hoa sỉ' }, // Nguồn nhập
    
    status: {
        type: String,
        enum: ['Còn mới', 'Sắp héo', 'Đã xuất hủy'],
        default: 'Còn mới'
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);