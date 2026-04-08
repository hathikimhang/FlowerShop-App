const express = require('express');
const router = express.Router();
const flowerController = require('../controllers/flowerController');

router.get('/getAllFlowers', flowerController.getAllFlowers);
router.post('/addFlower', flowerController.addFlower);
router.put('/updateFlower/:id', flowerController.updateFlower);
router.delete('/deleteFlower/:id', flowerController.deleteFlower);

module.exports = router;