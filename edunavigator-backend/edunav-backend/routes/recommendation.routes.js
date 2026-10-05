const router = require('express').Router();
const c      = require('../controllers/recommendation.controller');

router.post('/',         c.recommend);   // Main recommendation endpoint
router.post('/retrain',  c.retrain);     // Trigger ML model retraining

module.exports = router;
