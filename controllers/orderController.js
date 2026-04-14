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
            items = [],
            flowerId,
            quantity = 1
        } = req.body;

        if (!fullName || !phone || !address) {
            return res.status(400).json({
                message: 'Thiếu thông tin bắt buộc (fullName, phone, address).'
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

        const payloadItems = Array.isArray(items) && items.length > 0
            ? items
            : [{ flowerId, quantity }];

        if (!payloadItems[0]?.flowerId) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất một sản phẩm trong giỏ hàng.' });
        }

        const normalizedItems = payloadItems.map((item) => ({
            flowerId: item.flowerId,
            quantity: Number(item.quantity)
        }));

        for (const item of normalizedItems) {
            if (!item.flowerId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ message: 'Dữ liệu giỏ hàng không hợp lệ.' });
            }
        }

        const flowerIds = normalizedItems.map((item) => item.flowerId);
        const flowers = await Flower.find({ _id: { $in: flowerIds } });
        const flowerMap = new Map(flowers.map((flower) => [String(flower._id), flower]));

        const orderItems = [];
        let totalAmount = 0;

        for (const item of normalizedItems) {
            const flower = flowerMap.get(String(item.flowerId));
            if (!flower) {
                return res.status(404).json({ message: 'Có mẫu hoa trong giỏ hàng không còn tồn tại.' });
            }

            if (flower.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm "${flower.name}" không đủ tồn kho.` });
            }

            orderItems.push({
                flowerId: flower._id,
                quantity: item.quantity,
                price: flower.price
            });
            totalAmount += flower.price * item.quantity;
        }

        const newOrder = await Order.create({
            customerId: customer._id,
            items: orderItems,
            totalAmount,
            deliveryAddress: address,
            deliveryTime: deliveryTime ? new Date(deliveryTime) : undefined,
            cardMessage
        });

        for (const item of orderItems) {
            const flower = flowerMap.get(String(item.flowerId));
            flower.stock -= item.quantity;
            if (flower.stock <= 0) {
                flower.stock = 0;
                flower.isAvailable = false;
            }
            await flower.save();
            await deductInventoryForFlower(flower._id, item.quantity);
        }

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