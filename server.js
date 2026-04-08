const express = require('express');
const mongoose = require('mongoose');

const flowerRoutes = require('./routes/flowerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');


const cors = require('cors');

// Khởi tạo app Express
const app = express();
const PORT = 3000;

// --- 1. MIDDLEWARE ---
// Cho phép Front-end (khác port/domain) gọi API mà không bị chặn
app.use(cors());
// Parse dữ liệu gửi lên từ form/Front-end thành định dạng JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. KẾT NỐI DATABASE MONGODB ---
// Nhớ đổi 'student_management' thành tên database thực tế của bà nha
const mongoURI = 'mongodb://127.0.0.1:27017/student_management'; 

mongoose.connect(mongoURI)
    .then(() => console.log('🟢 Đã kết nối thành công với MongoDB!'))
    .catch(err => console.error('🔴 Lỗi kết nối MongoDB:', err));
-
// Gắn từng route vào đúng đường link gốc của nó
app.use('/api/flowers', flowerRoutes); // Link cho quản lý Hoa 
app.use('/api/orders', orderRoutes);       // Link mới cho Đơn Hàng
app.use('/api/inventory', inventoryRoutes); // Link mới cho Kho
app.use('/api/customers', customerRoutes);  // Link mới cho Khách hàng


// Route test thử xem server sống không
app.get('/', (req, res) => {
    res.send('<h1>Server Backend đang chạy ngon lành nha! 🚀</h1>');
});

// --- 4. KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});