const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/getAllOrders', orderController.getAllOrders);
router.put('/updateOrder/:id', orderController.updateOrder);
router.delete('/deleteOrder/:id', orderController.deleteOrder);

module.exports = router;