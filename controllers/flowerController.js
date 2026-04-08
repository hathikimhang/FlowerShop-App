const Flower = require('../models/Flower');

// 1. Lấy danh sách tất cả các mẫu hoa
const getAllFlowers = async (req, res) => {
    try {
        const flowers = await Flower.find();
        res.status(200).json(flowers);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi lấy danh sách mẫu hoa", error: error.message }); 
    }
};

// 2. Thêm một mẫu hoa mới vào tiệm
const addFlower = async (req, res) => {
    try {
        const newFlower = new Flower(req.body);
        const savedFlower = await newFlower.save();
        res.status(201).json({ message: "Thêm mẫu hoa thành công!", data: savedFlower });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi thêm mẫu hoa mới", error: error.message }); 
    }
};

// 3. Cập nhật thông tin hoa (Sửa giá, đổi trạng thái...)
const updateFlower = async (req, res) => {
    try {
        // { new: true } để nó trả về data mới nhất sau khi sửa xong
        const updatedFlower = await Flower.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFlower) return res.status(404).json({ message: "Không tìm thấy mẫu hoa này" });
        res.status(200).json({ message: "Cập nhật thông tin hoa thành công!", data: updatedFlower });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi cập nhật hoa", error: error.message }); 
    }
};

// 4. Xóa một mẫu hoa khỏi hệ thống
const deleteFlower = async (req, res) => {
    try {
        const deletedFlower = await Flower.findByIdAndDelete(req.params.id);
        if (!deletedFlower) return res.status(404).json({ message: "Không tìm thấy mẫu hoa này" });
        res.status(200).json({ message: "Đã xóa mẫu hoa thành công!" });
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi xóa hoa", error: error.message }); 
    }
};

// Xuất khẩu mấy cái hàm này ra cho Route xài
module.exports = { 
    getAllFlowers, 
    addFlower, 
    updateFlower, 
    deleteFlower 
};