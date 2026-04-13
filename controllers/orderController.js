const Order = require('../models/Order'); // Nhớ tạo file Order.js nha
const Customer = require('../models/Customer');
const Flower = require('../models/Flower');
const Inventory = require('../models/Inventory');

const normalizePhone = (phone) => (phone || '').trim();

const deductInventoryForFlower = async (flowerId, quantity) => {
    let remaining = quantity;
    const lots = await Inventory.find({
        flowerId,
        remainingQuantity: { $gt: 0 },
        status: { $ne: 'Đã xuất hủy' }
    }).sort({ createdAt: 1 });

    for (const lot of lots) {
        if (remaining <= 0) break;
        const used = Math.min(lot.remainingQuantity, remaining);
        lot.remainingQuantity -= used;
        remaining -= used;

        if (lot.remainingQuantity <= 0) {
            lot.status = 'Đã xuất hủy';
        }
        await lot.save();
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            cardMessage,
            deliveryTime,
            flowerId,
            quantity = 1
        } = req.body;

        if (!fullName || !phone || !address || !flowerId) {
            return res.status(400).json({
                message: 'Thiếu thông tin bắt buộc (fullName, phone, address, flowerId).'
            });
        }

        const normalizedPhone = normalizePhone(phone);
        let customer = await Customer.findOne({ phone: normalizedPhone });
        if (!customer) {
            customer = await Customer.create({
                fullName,
                phone: normalizedPhone,
                address
            });
        } else {
            customer.fullName = fullName;
            customer.address = address;
            await customer.save();
        }

        const flower = await Flower.findById(flowerId);
        if (!flower) {
            return res.status(404).json({ message: 'Không tìm thấy mẫu hoa đã chọn.' });
        }

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Số lượng đặt hàng không hợp lệ.' });
        }

        if (flower.stock < qty) {
            return res.status(400).json({ message: 'Số lượng tồn kho không đủ để xử lý đơn.' });
        }

        const totalAmount = flower.price * qty;
        const newOrder = await Order.create({
            customerId: customer._id,
            items: [{ flowerId: flower._id, quantity: qty, price: flower.price }],
            totalAmount,
            deliveryAddress: address,
            deliveryTime: deliveryTime ? new Date(deliveryTime) : undefined,
            cardMessage
        });

        flower.stock -= qty;
        if (flower.stock <= 0) {
            flower.stock = 0;
            flower.isAvailable = false;
        }
        await flower.save();
        await deductInventoryForFlower(flower._id, qty);

        customer.totalSpent += totalAmount;
        await customer.save();

        res.status(201).json({
            message: 'Đặt hoa thành công! Đơn hàng đã được tạo.',
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo đơn hàng mới', error: error.message });
    }
};

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

module.exports = { createOrder, getAllOrders, updateOrder, deleteOrder };