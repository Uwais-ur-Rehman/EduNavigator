const logger = require('../utils/logger');
const { runAllUniversities, runScraperForUniversity, statusState, addStatusLog } = require('../scrapers/shared/scraperRunner');
const universities = require('../scrapers/shared/universityRegistry');

/**
 * REST controller for running all scraper triggers.
 * Initiates the sequence in the background to prevent server timeouts.
 */
exports.runAll = async (req, res, next) => {
  try {
    if (statusState.status === 'scraping') {
      return res.status(400).json({ 
        success: false, 
        message: `Scraper is already running on: ${statusState.currentUniversity || 'batch sweep'}` 
      });
    }

    logger.info('[INFO] Admin requested background university scraper sweep');
    
    // Trigger in the background
    runAllUniversities({ delayMs: 2000 }).catch(err => {
      logger.error(`[ERROR] Background full scraping sweep failed: ${err.message}`);
    });

    res.json({
      success: true,
      message: 'Full university scraping sweep successfully started in the background.',
      status: 'scraping'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger background scraping for a single university.
 * Lookup by name or shortName (e.g. "NUST", "FAST").
 */
exports.runSingle = async (req, res, next) => {
  try {
    const targetName = req.params.name;
    const target = universities.find(
      (u) => u.name.toLowerCase() === targetName.toLowerCase() || 
             (u.shortName && u.shortName.toLowerCase() === targetName.toLowerCase())
    );

    if (!target) {
      return res.status(404).json({ 
        success: false, 
        message: `University target '${targetName}' not found in registry.` 
      });
    }

    if (statusState.status === 'scraping') {
      return res.status(400).json({ 
        success: false, 
        message: `Scraper is currently busy crawling: ${statusState.currentUniversity || 'another target'}` 
      });
    }

    logger.info(`[INFO] Admin requested scraper trigger for: ${target.name}`);
    
    // Trigger run in the background
    runScraperForUniversity(target).catch(err => {
      logger.error(`[ERROR] Background scraper run for ${target.name} failed: ${err.message}`);
    });

    res.json({
      success: true,
      message: `Scraper started for ${target.name} in the background.`,
      status: 'scraping'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve the current real-time scraper running status, counters, and in-memory log cache.
 */
exports.getStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      status: statusState.status,
      currentUniversity: statusState.currentUniversity,
      processedCount: statusState.processedCount,
      totalCount: statusState.totalCount,
      errors: statusState.errors,
      logs: statusState.logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches the raw file logging data from Winston logs.
 */
exports.getLogs = async (req, res, next) => {
  try {
    const fs = require('fs-extra');
    const path = require('path');
    const logFile = path.join(__dirname, '..', 'logs', 'scraper.log');
    
    const exists = await fs.pathExists(logFile);
    if (!exists) {
      return res.json({ success: true, logs: [] });
    }

    const content = await fs.readFile(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Return last 200 log statements
    res.json({ 
      success: true, 
      logs: lines.slice(-200) 
    });
  } catch (error) {
    next(error);
  }
};
