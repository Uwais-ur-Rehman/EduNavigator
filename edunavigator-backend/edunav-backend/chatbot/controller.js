/**
 * EduNavigator Chatbot - Express Controller
 * Handles request validation, rate limiting, and response dispatching for POST /api/chat.
 */
const { processChatMessage } = require('./chatbotService');

// In-memory rate limiting store (30 requests / minute / IP)
const rateLimitMap = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 30;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      answer: "Too many messages sent. Please pause for a moment and try again."
    });
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
}

async function handleChat(req, res) {
  try {
    const userMessage = req.body.message || req.body.query || req.body.prompt;
    const sessionId = req.body.sessionId || req.headers['x-session-id'] || 'default_session';

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        answer: "Please provide a valid question in the request body."
      });
    }

    const result = await processChatMessage(sessionId, userMessage);

    return res.json({
      success: true,
      answer: result.answer,
      intent: result.intent,
      entities: result.entities
    });
  } catch (error) {
    console.error('❌ [ChatbotController] Processing Error:', error);
    return res.status(500).json({
      success: false,
      answer: "I couldn't find this information in the EduNavigator database."
    });
  }
}

module.exports = {
  handleChat,
  rateLimiter
};
