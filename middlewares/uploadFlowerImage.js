const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'assets', 'images');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const fileFilter = (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }
    return cb(new Error('Chi chap nhan file JPG/PNG/WEBP'));
};

const uploadFlowerImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = uploadFlowerImage;
