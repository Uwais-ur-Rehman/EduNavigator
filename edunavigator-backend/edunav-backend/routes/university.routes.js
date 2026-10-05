const router = require('express').Router();
const c = require('../controllers/university.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/provinces', c.getProvinces);
router.get('/cities', c.getCities);
router.get('/categories', c.getCategories);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', protect, adminOnly, c.create);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);

module.exports = router;
