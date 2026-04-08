const Inventory = require('../models/Inventory'); // Nhớ tạo file Inventory.js nha

const getAllInventory = async (req, res) => {
    try {
        const inventoryList = await Inventory.find();
        res.status(200).json(inventoryList);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi lấy danh sách kho", error: error.message }); 
    }
};

// Hàm nhập thêm kho (Bà gắn /:id trên link nên tui lấy ID đó gán vào dữ liệu luôn nha)
const addInventory = async (req, res) => {
    try {
        const newInventory = new Inventory({ ...req.body, flowerId: req.params.id });
        const savedInventory = await newInventory.save();
        res.status(201).json({ message: "Đã nhập kho thành công!", data: savedInventory });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi nhập kho", error: error.message }); 
    }
};

const updateInventory = async (req, res) => {
    try {
        const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInventory) return res.status(404).json({ message: "Không tìm thấy mã kho này" });
        res.status(200).json({ message: "Cập nhật tồn kho thành công!", data: updatedInventory });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi cập nhật kho", error: error.message }); 
    }
};

const deleteInventory = async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedInventory) return res.status(404).json({ message: "Không tìm thấy mã kho này" });
        res.status(200).json({ message: "Đã xuất hủy hoa thành công!" });
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi xuất hủy", error: error.message }); 
    }
};

module.exports = { getAllInventory, addInventory, updateInventory, deleteInventory };