const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/getAllInventory', requireAuth, requireRole('admin'), inventoryController.getAllInventory);
router.post('/addInventory/:id', requireAuth, requireRole('admin'), inventoryController.addInventory);
router.put('/updateInventory/:id', requireAuth, requireRole('admin'), inventoryController.updateInventory);
router.delete('/deleteInventory/:id', requireAuth, requireRole('admin'), inventoryController.deleteInventory);

module.exports = router;