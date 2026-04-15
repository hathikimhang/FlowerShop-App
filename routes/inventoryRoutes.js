const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/history', requireAuth, invController.getHistory);
router.post('/add', requireAuth, requireRole('admin'), invController.addNote);
router.put('/:id', requireAuth, requireRole('admin'), invController.updateNote);
router.delete('/:id', requireAuth, requireRole('admin'), invController.deleteNote);

module.exports = router;