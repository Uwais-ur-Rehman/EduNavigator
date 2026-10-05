const router = require('express').Router();
const c = require('../controllers/scholarship.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.list);
router.post('/', protect, adminOnly, c.create);

module.exports = router;
