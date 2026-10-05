const router = require('express').Router();
const c = require('../controllers/admission.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.list);
router.get('/upcoming', c.upcoming);
router.post('/', protect, adminOnly, c.create);

module.exports = router;
