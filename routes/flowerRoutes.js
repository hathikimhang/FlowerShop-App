const express = require('express');
const router = express.Router();
const flowerController = require('../controllers/flowerController');
const uploadFlowerImage = require('../middlewares/uploadFlowerImage');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// GET ALL
router.get('/getAllFlowers', flowerController.getAllFlowers);

// ADD
router.post('/addFlower', requireAuth, requireRole('admin'), uploadFlowerImage.single('image'), flowerController.addFlower);

// UPDATE
router.put('/updateFlower/:id', requireAuth, requireRole('admin'), uploadFlowerImage.single('image'), flowerController.updateFlower);

// DELETE (Dòng này hay lỗi nếu hàm deleteFlower bên Controller không tồn tại)
router.delete('/deleteFlower/:id', requireAuth, requireRole('admin'), flowerController.deleteFlower);

module.exports = router;