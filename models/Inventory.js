const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    flowerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Flower', 
        required: true 
    },
    changeAmount: { 
        type: Number, 
        required: true // Số dương là nhập, số âm là xuất/hàng lỗi
    },
    reason: { 
        type: String, 
        enum: ['Nhập hàng', 'Hàng lỗi', 'Trả hàng', 'Kiểm kho'], 
        default: 'Nhập hàng' 
    },
    note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);