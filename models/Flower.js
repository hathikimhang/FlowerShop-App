const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { 
        type: String, 
        required: true,
        enum: ['Hoa sinh nhật', 'Hoa khai trương', 'Hoa tình yêu', 'Khác'] 
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true }, // Lưu path: /assets/images/ten-file.jpg
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, default: 'Mẫu hoa xinh xắn từ Flower Boutique.' }
}, { timestamps: true });

module.exports = mongoose.model('Flower', flowerSchema);