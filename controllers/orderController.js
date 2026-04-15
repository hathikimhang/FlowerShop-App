const Order = require('../models/Order');
const Flower = require('../models/Flower');
const Customer = require('../models/Customer');

// --- 1. HÀM ĐỒNG BỘ KHÁCH HÀNG & THĂNG HẠNG ---
async function syncCustomer(name, phone, price) {
    try {
        console.log(">>> [HỆ THỐNG] ĐANG XỬ LÝ KHÁCH HÀNG:", phone);
        let cust = await Customer.findOne({ phone: phone });

        if (!cust) {
            cust = new Customer({
                customerName: name,
                phone: phone,
                totalSpent: Number(price),
                orderCount: 1,
                rank: 'Thường'
            });
        } else {
            cust.totalSpent += Number(price);
            cust.orderCount += 1;
            cust.customerName = name;

            const n = cust.orderCount;
            if (n >= 25) cust.rank = 'VIP';
            else if (n >= 15) cust.rank = 'Kim cương';
            else if (n >= 6) cust.rank = 'Vàng';
            else if (n >= 2) cust.rank = 'Bạc';
            else cust.rank = 'Thường';
        }
        await cust.save();
        console.log(">>> [THÀNH CÔNG] Đã tích lũy đơn cho khách!");
    } catch (err) {
        console.error(">>> [LỖI SYNC KHÁCH]:", err.message);
    }
}

// [POST] TẠO ĐƠN HÀNG MỚI
exports.createOrder = async (req, res) => {
    try {
        const { customerName, phone, flowerId, quantity, status } = req.body;
        
        const qtyOrder = parseInt(quantity);
        const flower = await Flower.findById(flowerId);
        if (!flower) return res.status(404).json({ message: "Hoa không tồn tại!" });

        const stockHienTai = Number(flower.stock);

        if (stockHienTai < qtyOrder) {
            return res.status(400).json({ message: `Hết hàng! Kho chỉ còn ${stockHienTai} bông.` });
        }

        const totalPrice = Number(flower.price) * qtyOrder;

        const newOrder = new Order({
            customerName, phone, flowerId,
            flowerName: flower.name,
            quantity: qtyOrder,
            totalPrice,
            status: status || 'Đang xử lý'
        });

        // 1. Lưu đơn hàng vào DB
        await newOrder.save();

        // 2. Trừ kho hoa
        flower.stock = stockHienTai - qtyOrder;
        await flower.save();
        
        // 3. LOGIC QUAN TRỌNG: Chỉ khi status là 'Đã giao' mới gọi hàm syncCustomer
        // Nếu là 'Đang xử lý' thì tuyệt đối ĐÉO làm gì bảng khách hàng hết
        if (status === 'Đã giao') {
            console.log(">>> [HỆ THỐNG] Đơn hàng Đã giao -> Tiến hành lưu khách.");
            await syncCustomer(customerName, phone, totalPrice);
        } else {
            console.log(">>> [HỆ THỐNG] Đơn chưa giao -> Chưa lưu vào danh sách khách hàng.");
        }

        res.status(201).json(newOrder);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// --- 3. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
exports.updateStatus = async (req, res) => {
    try {
        const { status, customerName, phone } = req.body;
        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) return res.status(404).json({ message: "Không thấy đơn" });

        let updateData = { status };
        if (oldOrder.status === 'Đang xử lý') {
            if (customerName) updateData.customerName = customerName;
            if (phone) updateData.phone = phone;
        }

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (status === 'Đã giao' && oldOrder.status !== 'Đã giao') {
            await syncCustomer(updatedOrder.customerName, updatedOrder.phone, updatedOrder.totalPrice);
        }

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- 4. XÓA ĐƠN HÀNG (HOÀN KHO CHUẨN) ---
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" });

        const flower = await Flower.findById(order.flowerId);
        if (flower) {
            // Hoàn lại số lượng (Ép kiểu số để tránh lỗi 18 + 8 = 188)
            flower.stock = Number(flower.stock) + Number(order.quantity);
            await flower.save();
            console.log(`>>> [KHO] Đã hoàn trả ${order.quantity} bông. Tồn mới: ${flower.stock}`);
        }

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Xóa đơn và hoàn kho thành công!" });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};

// --- 5. LẤY TẤT CẢ ĐƠN HÀNG ---
exports.getAllOrders = async (req, res) => {
    try { 
        res.json(await Order.find().sort({ createdAt: -1 })); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};