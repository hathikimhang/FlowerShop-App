const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/getAllCustomers', requireAuth, requireRole('admin'), customerController.getAllCustomers);
router.put('/updateCustomer/:id', requireAuth, requireRole('admin'), customerController.updateCustomer);
router.delete('/deleteCustomer/:id', requireAuth, requireRole('admin'), customerController.deleteCustomer);

module.exports = router;