const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: 
    { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: 
    { 
        type: String,
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    passwordHash: 
    { 
        type: String, 
        required: true 
    },
    role: 
    {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    phone: 
    { 
        type: String, 
        trim: true 
    },
    address: 
    { type: String, 
        trim: true 
    },
    memberTier: {
        type: String,
        enum: ['Thường', 'Bạc', 'Vàng', 'Kim Cương', 'VIP'],
        default: 'Thường'
    },
    totalSpent: 
    { 
        type: Number, 
        default: 0 
    },
    note: 
    { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);