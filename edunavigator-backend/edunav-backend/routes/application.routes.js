const router = require('express').Router();
const c = require('../controllers/application.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, c.apply);
router.get('/mine', protect, c.myApplications);
router.get('/:id', protect, c.getById);
router.patch('/:id/cancel', protect, c.cancelApplication);
router.get('/', protect, adminOnly, c.all);
router.patch('/:id/status', protect, adminOnly, c.updateStatus);

module.exports = router;
