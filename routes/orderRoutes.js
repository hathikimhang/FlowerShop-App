const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/addOrder', orderController.createOrder);
router.get('/getAllOrders', orderController.getAllOrders);
router.put('/updateStatus/:id', orderController.updateStatus); // Dòng này quan trọng nè bà
router.delete('/deleteOrder/:id', orderController.deleteOrder);

module.exports = router;