/**
 * EduNavigator Chatbot - Express Routes
 * Mounts POST /api/chat endpoint with rate-limiting middleware.
 */
const express = require('express');
const router = express.Router();
const { handleChat, rateLimiter } = require('./controller');

// POST /api/chat
router.post('/', rateLimiter, handleChat);

module.exports = router;
