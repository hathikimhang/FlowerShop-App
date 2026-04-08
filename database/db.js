const mongoose = require('mongoose');

// Hàm kết nối với cơ sở dữ liệu MongoDB
const connectDB = async () => {
    try {
        // Lấy đường link kết nối từ file .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Đã kết nối MongoDB thành công: ${conn.connection.host} 🎉`);
    } catch (error) {
        console.error(`Lỗi kết nối database: ${error.message}`);
        process.exit(1); // Dừng hệ thống nếu không kết nối được DB
    }
};

// Xuất hàm này ra để file server.js hoặc test-db.js xài
module.exports = connectDB;