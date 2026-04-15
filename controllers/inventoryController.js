const Inventory = require('../models/Inventory');
const Flower = require('../models/Flower');

// 1. READ: Lấy danh sách lịch sử kho
exports.getHistory = async (req, res) => {
    try {
        const history = await Inventory.find()
            .populate('flowerId', 'name') // Lấy thêm tên hoa từ bảng Flower
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. CREATE: Thêm phiếu mới & Cập nhật tồn kho Hoa
exports.addNote = async (req, res) => {
    try {
        const { flowerId, changeAmount, reason, note } = req.body;
        
        // Tạo phiếu
        const newNote = await Inventory.create({ flowerId, changeAmount, reason, note });
        
        // Cộng/Trừ vào stock của Hoa
        await Flower.findByIdAndUpdate(flowerId, {
            $inc: { stock: Number(changeAmount) }
        });

        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. UPDATE: Sửa phiếu & Tính toán lại tồn kho (Logic khó nhất)
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { changeAmount, reason, note } = req.body;

        const oldNote = await Inventory.findById(id);
        if (!oldNote) return res.status(404).json({ message: "Không tìm thấy phiếu" });

        // Tính chênh lệch: Lấy số mới trừ số cũ
        // Ví dụ: Cũ nhập 10, mới sửa thành 15 -> Tăng thêm 5 vào kho Hoa
        const offset = Number(changeAmount) - oldNote.changeAmount;

        const updatedNote = await Inventory.findByIdAndUpdate(id, 
            { changeAmount, reason, note }, 
            { new: true }
        );

        // Cập nhật lại kho Hoa theo độ chênh lệch
        await Flower.findByIdAndUpdate(oldNote.flowerId, { $inc: { stock: offset } });

        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. DELETE: Xóa phiếu & Hoàn tác tồn kho
exports.deleteNote = async (req, res) => {
    try {
        const note = await Inventory.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Không tìm thấy phiếu" });

        // Hoàn tác: Trừ ngược lại số lượng đã thay đổi
        await Flower.findByIdAndUpdate(note.flowerId, { $inc: { stock: -note.changeAmount } });

        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa và hoàn tác kho" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};