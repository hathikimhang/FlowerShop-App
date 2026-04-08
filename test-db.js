require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database/db');
const Flower = require('./models/Flower');

const testSchema = async () => {
    // 1. Gọi hàm kết nối Database
    await connectDB(); 

    try {
        // 2. Tạo một data hoa ảo
        const dummyFlower = new Flower({
            name: "Lẵng Hoa Hồng Pastel",
            category: "Hoa tình yêu", // Phải gõ đúng chữ trong enum nha
            price: 350000,
            image: "https://link-anh-tam.com/hong-pastel.jpg",
            description: "Lẵng hoa hồng nhập khẩu sang trọng, thiết kế vintage.",
            stock: 5
        });

        // 3. Lưu vào MongoDB
        const savedFlower = await dummyFlower.save();
        console.log("✅ TEST THÀNH CÔNG! Dữ liệu đã vào DB:\n", savedFlower);

    } catch (error) {
        // Bắt lỗi nếu nhập sai cấu trúc Schema
        console.log("❌ LỖI RỒI BÀ ƠI:\n", error.message);
    } finally {
        // 4. Ngắt kết nối để dừng terminal
        mongoose.connection.close();
    }
};

// Chạy hàm
testSchema();