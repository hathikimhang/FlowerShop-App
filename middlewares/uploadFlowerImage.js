const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Hàm chuẩn hóa tên danh mục thành tên thư mục (Hoa sinh nhật -> hoasinhnhat)
const getFolderName = (category) => {
    if (!category) return 'khac';
    return category.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lấy folderName dựa trên category gửi từ Frontend
        const folderName = getFolderName(req.body.category);
        const dest = path.join(__dirname, '..', 'public', 'assets', 'images', folderName);

        // Tự động tạo thư mục nếu chưa có (ví dụ thư mục hoasinhnhat)
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
};

const uploadFlowerImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = uploadFlowerImage;