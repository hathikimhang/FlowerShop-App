const Order = require('../models/Order'); // Nhớ tạo file Order.js nha

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message }); 
    }
};

const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Không tìm thấy đơn hàng này" });
        res.status(200).json({ message: "Cập nhật đơn hàng thành công!", data: updatedOrder });
    } catch (error) { 
        res.status(400).json({ message: "Lỗi khi cập nhật đơn hàng", error: error.message }); 
    }
};

const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "Không tìm thấy đơn hàng này" });
        res.status(200).json({ message: "Đã xóa đơn hàng thành công!" });
    } catch (error) { 
        res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error: error.message }); 
    }
};

module.exports = { getAllOrders, updateOrder, deleteOrder };