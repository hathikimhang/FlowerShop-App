const Customer = require('../models/Customer');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ totalSpent: -1 }); // Ưu tiên đại gia lên đầu
        res.json(customers);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Xóa khách hàng (Khi khách này "phốt" hoặc dữ liệu rác)
exports.deleteCustomer = async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa khách hàng khỏi hệ thống!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};