const router = require('express').Router();
const c = require('../controllers/compare.controller');
router.post('/', c.compare);
router.get('/', c.compare);
module.exports = router;
