const router = require('express').Router();
const c = require('../controllers/scraper.controller');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/scraper/all - Starts full background university scraping
router.post('/all', protect, adminOnly, c.runAll);

// POST /api/scraper/:name - Starts background scraping for a single university (e.g. /api/scraper/NUST)
router.post('/:name', protect, adminOnly, c.runSingle);

// GET /api/scraper/status - Returns status info, processed counts, and memory log buffer
router.get('/status', protect, adminOnly, c.getStatus);

// GET /api/scraper/logs - Returns file log history (last 200 log statements)
router.get('/logs', protect, adminOnly, c.getLogs);

module.exports = router;
