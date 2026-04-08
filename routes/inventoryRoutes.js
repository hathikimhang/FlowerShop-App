const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/getAllInventory', inventoryController.getAllInventory);
router.post('/addInventory/:id', inventoryController.addInventory);
router.put('/updateInventory/:id', inventoryController.updateInventory);
router.delete('/deleteInventory/:id', inventoryController.deleteInventory);

module.exports = router;