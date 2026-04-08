const Customer = require('../models/Customer'); // Nhớ tạo file Customer.js nha

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng", error: error.message }); 
    }
};

const updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCustomer) return res.status(404).json({ message: "Không tìm thấy khách hàng này" });
        res.status(200).json({ message: "Cập nhật hạng VIP thành công!", data: updatedCustomer });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi cập nhật thông tin khách", error: error.message }); 
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) return res.status(404).json({ message: "Không tìm thấy khách hàng này" });
        res.status(200).json({ message: "Đã xóa dữ liệu khách hàng cũ!" });
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi xóa khách hàng", error: error.message }); 
    }
};

module.exports = { getAllCustomers, updateCustomer, deleteCustomer };