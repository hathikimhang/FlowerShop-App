const express = require('express');
const router = express.Router();
const flowerController = require('../controllers/flowerController');
const uploadFlowerImage = require('../middlewares/uploadFlowerImage');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/getAllFlowers', flowerController.getAllFlowers);
router.post('/addFlower', requireAuth, requireRole('admin'), uploadFlowerImage.single('image'), flowerController.addFlower);
router.put('/updateFlower/:id', requireAuth, requireRole('admin'), flowerController.updateFlower);
router.put('/updateFlowerImage/:id', requireAuth, requireRole('admin'), uploadFlowerImage.single('image'), flowerController.updateFlowerImage);
router.delete('/deleteFlowerImage/:id', requireAuth, requireRole('admin'), flowerController.deleteFlowerImage);
router.delete('/deleteFlower/:id', requireAuth, requireRole('admin'), flowerController.deleteFlower);

module.exports = router;