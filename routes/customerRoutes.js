const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/getAllCustomers', customerController.getAllCustomers);
router.delete('/deleteCustomer/:id', customerController.deleteCustomer);

module.exports = router;