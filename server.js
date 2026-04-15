const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

// Import các Routes của bà
const flowerRoutes = require('./routes/flowerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');

// Import Database và Utils
const connectDB = require('./database/db');
const ensureDefaultAdmin = require('./utils/seedAdmin');

// Khởi tạo app Express
const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. KẾT NỐI DATABASE MONGODB ---
connectDB();
ensureDefaultAdmin().catch((error) => {
    console.error('Khong the tao admin mac dinh:', error.message);
});

// --- 3. PHỤC VỤ FILE TĨNH (STATIC) ---
// Sửa dòng này để nhận diện đúng toàn bộ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// --- 4. GẮN CÁC ROUTE API ---
app.use('/api/auth', authRoutes);
app.use('/api/flowers', flowerRoutes);      // Quản lý Hoa 
app.use('/api/orders', orderRoutes);        // Đơn Hàng
app.use('/api/inventory', inventoryRoutes);  // Kho
app.use('/api/customers', customerRoutes);   // Khách hàng

// Route test thử xem server sống không (trả về trang login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// --- 5. KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});