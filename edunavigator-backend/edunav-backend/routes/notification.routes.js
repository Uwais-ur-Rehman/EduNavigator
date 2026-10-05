const router = require('express').Router();
const c = require('../controllers/notification.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, c.mine);
router.patch('/:id/read', protect, c.markRead);
router.post('/', protect, adminOnly, c.create);

module.exports = router;
