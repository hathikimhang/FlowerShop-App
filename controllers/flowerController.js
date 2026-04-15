const Flower = require('../models/Flower');

// LẤY TẤT CẢ
exports.getAllFlowers = async (req, res) => {
    try {
        const flowers = await Flower.find().sort({ createdAt: -1 });
        res.json(flowers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hàm hỗ trợ lấy tên folder (phải giống hệt bên middleware nhé)
const getFolderName = (category) => {
    if (!category) return 'khac';
    return category.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
};

exports.addFlower = async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn ảnh!" });

        const folderName = getFolderName(category);

        const flower = await Flower.create({
            name,
            category,
            price: Number(price),
            stock: Number(stock),
            // LƯU ĐÚNG ĐƯỜNG DẪN CÓ FOLDER CON
            image: `/assets/images/${folderName}/${req.file.filename}`
        });
        res.status(201).json(flower);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateFlower = async (req, res) => {
    try {
        const { name, category, price, stock } = req.body;
        const updateData = { name, category, price: Number(price), stock: Number(stock) };

        if (req.file) {
            const folderName = getFolderName(category);
            updateData.image = `/assets/images/${folderName}/${req.file.filename}`;
        }

        const updated = await Flower.findByIdAndUpdate(req.params.id.trim(), updateData, { new: true });
        if (!updated) return res.status(404).json({ message: "Không tìm thấy hoa" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// XÓA
exports.deleteFlower = async (req, res) => {
    try {
        const deleted = await Flower.findByIdAndDelete(req.params.id.trim());
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy hoa" });
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};