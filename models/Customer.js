const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    totalSpent: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    rank: { type: String, default: 'Thường' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);