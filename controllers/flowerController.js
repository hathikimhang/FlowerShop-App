const Flower = require('../models/Flower');

// Lấy tất cả
exports.getAllFlowers = async (req, res) => {
    try {
        const flowers = await Flower.find();
        res.json(flowers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thêm hoa
exports.addFlower = async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        const flower = await Flower.create({
            name, category, price, stock,
            image: req.file ? req.file.path : null
        });
        res.status(201).json(flower);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cập nhật (Hàm này ông vừa sửa)
exports.updateFlower = async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        const updateData = { name, category, price: Number(price), stock: Number(stock) };
        if (req.file) updateData.image = req.file.path;

        const updated = await Flower.findByIdAndUpdate(req.params.id.trim(), updateData, { new: true });
        if (!updated) return res.status(404).json({ message: "Không tìm thấy hoa" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// XÓA HOA (HÀM NÀY PHẢI CÓ ĐỂ ROUTE GỌI)
exports.deleteFlower = async (req, res) => {
    try {
        const deleted = await Flower.findByIdAndDelete(req.params.id.trim());
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy hoa để xóa" });
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};