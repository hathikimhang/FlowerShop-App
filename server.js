const express = require('express');
const path = require('path');
require('dotenv').config();

const flowerRoutes = require('./routes/flowerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./database/db');
const ensureDefaultAdmin = require('./utils/seedAdmin');


const cors = require('cors');

// Khởi tạo app Express
const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE ---
// Cho phép Front-end (khác port/domain) gọi API mà không bị chặn
app.use(cors());
// Parse dữ liệu gửi lên từ form/Front-end thành định dạng JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. KẾT NỐI DATABASE MONGODB ---
connectDB();
ensureDefaultAdmin().catch((error) => {
    console.error('Khong the tao admin mac dinh:', error.message);
});

// --- 3. PHỤC VỤ FILE FRONTEND ---
app.use(express.static(path.join(__dirname, 'public')));

// Gắn từng route vào đúng đường link gốc của nó
app.use('/api/auth', authRoutes);
app.use('/api/flowers', flowerRoutes); // Link cho quản lý Hoa 
app.use('/api/orders', orderRoutes);       // Link mới cho Đơn Hàng
app.use('/api/inventory', inventoryRoutes); // Link mới cho Kho
app.use('/api/customers', customerRoutes);  // Link mới cho Khách hàng


// Route test thử xem server sống không
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// --- 4. KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});