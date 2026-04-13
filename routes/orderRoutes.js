const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.post('/addOrder', requireAuth, requireRole('customer', 'admin'), orderController.createOrder);
router.get('/getAllOrders', requireAuth, requireRole('admin'), orderController.getAllOrders);
router.put('/updateOrder/:id', requireAuth, requireRole('admin'), orderController.updateOrder);
router.delete('/deleteOrder/:id', requireAuth, requireRole('admin'), orderController.deleteOrder);

module.exports = router;