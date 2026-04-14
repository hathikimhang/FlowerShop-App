const Flower = require('../models/Flower');
const fs = require('fs');
const path = require('path');

const DEFAULT_IMAGE = '/assets/images/product-placeholder.svg';

const removeLocalImageIfExists = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('/assets/images/')) {
        return;
    }

    const filename = imageUrl.replace('/assets/images/', '');
    if (['logo-shop.svg', 'shop-background.svg', 'product-placeholder.svg', '.gitkeep'].includes(filename)) {
        return;
    }
    const filePath = path.join(__dirname, '..', 'public', 'assets', 'images', filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// 1. Lấy danh sách tất cả các mẫu hoa
const getAllFlowers = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const flowers = await Flower.find(query);
        res.status(200).json(flowers);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi lấy danh sách mẫu hoa", error: error.message }); 
    }
};

// 2. Thêm một mẫu hoa mới vào tiệm
const addFlower = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (req.file) {
            payload.image = `/assets/images/${req.file.filename}`;
        }

        if (!payload.image) {
            payload.image = DEFAULT_IMAGE;
        }

        const newFlower = new Flower(payload);
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

const updateFlowerImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui long chon file anh truoc khi tai len.' });
        }

        const flower = await Flower.findById(req.params.id);
        if (!flower) {
            return res.status(404).json({ message: 'Khong tim thay mau hoa nay' });
        }

        const oldImage = flower.image;
        flower.image = `/assets/images/${req.file.filename}`;
        await flower.save();

        removeLocalImageIfExists(oldImage);

        return res.status(200).json({ message: 'Cap nhat anh hoa thanh cong!', data: flower });
    } catch (error) {
        return res.status(400).json({ message: 'Loi khi cap nhat anh hoa', error: error.message });
    }
};

const deleteFlowerImage = async (req, res) => {
    try {
        const flower = await Flower.findById(req.params.id);
        if (!flower) {
            return res.status(404).json({ message: 'Khong tim thay mau hoa nay' });
        }

        const oldImage = flower.image;
        flower.image = DEFAULT_IMAGE;
        await flower.save();

        removeLocalImageIfExists(oldImage);
        return res.status(200).json({ message: 'Da xoa anh hien tai, da doi ve anh mac dinh.', data: flower });
    } catch (error) {
        return res.status(500).json({ message: 'Loi khi xoa anh hoa', error: error.message });
    }
};

// 4. Xóa một mẫu hoa khỏi hệ thống
const deleteFlower = async (req, res) => {
    try {
        const deletedFlower = await Flower.findByIdAndDelete(req.params.id);
        if (!deletedFlower) return res.status(404).json({ message: "Không tìm thấy mẫu hoa này" });
        removeLocalImageIfExists(deletedFlower.image);
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
    updateFlowerImage,
    deleteFlowerImage,
    deleteFlower 
};