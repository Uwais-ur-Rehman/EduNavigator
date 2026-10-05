const router = require('express').Router();
const c = require('../controllers/contact.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', c.submit);
router.get('/', protect, adminOnly, c.list);

module.exports = router;
