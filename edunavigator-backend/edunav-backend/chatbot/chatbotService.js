/**
 * EduNavigator Chatbot - Core Pipeline Service Orchestrator
 * Pipeline: User Question -> Preprocessing -> Transformer -> Intent Classification -> Entity Extraction -> Memory -> DB Retrieval -> Response Formatter -> Save Session -> Final Response
 */
const { classifyIntent } = require('./intentClassifier');
const { extractEntities } = require('./entityExtractor');
const { resolveCoreferences, getSessionHistory, saveTurn } = require('./conversationMemory');
const { queryDatabase } = require('./databaseService');
const { formatResponse } = require('./responseFormatter');

/**
 * Sanitizes input string to prevent XSS, HTML injection, prompt injection, and limits length to 500 chars.
 */
function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text.trim();
  if (clean.length > 500) {
    clean = clean.substring(0, 500);
  }
  // Remove potentially dangerous HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '');
  return clean;
}

/**
 * Executes the full chatbot pipeline.
 */
async function processChatMessage(sessionId, rawUserMessage) {
  const cleanQuery = sanitizeInput(rawUserMessage);

  if (!cleanQuery) {
    return {
      answer: "Please enter a valid question.",
      intent: 'Greetings',
      entities: {}
    };
  }

  // 1. Get 5-turn session history
  const history = await getSessionHistory(sessionId);

  // 2. Transformer Intent Classification (12 Intents)
  const intent = await classifyIntent(cleanQuery);

  // 3. Entity Extraction
  const rawEntities = await extractEntities(cleanQuery);
  rawEntities.userQuery = cleanQuery; // Pass query for targeted formatting checks

  // 4. Conversation Memory & Coreference Resolution ("its fee" -> FAST)
  const resolvedEntities = resolveCoreferences(cleanQuery, rawEntities, history, intent);
  if (intent === 'Recommendations') {
    resolvedEntities.university = null;
    resolvedEntities.campus = null;
  }

  // 5. Database Retrieval (Authoritative MongoDB Lookup)
  let dbData = null;
  if (intent !== 'Greetings') {
    dbData = await queryDatabase(intent, resolvedEntities);
  } else {
    dbData = { type: 'greeting' };
  }

  // 6. Targeted Natural Response Formatting
  const answer = formatResponse(intent, dbData, resolvedEntities);

  // 7. Save turn to Session Memory
  await saveTurn(sessionId, {
    userMessage: cleanQuery,
    botAnswer: answer,
    intent,
    entities: resolvedEntities,
    timestamp: new Date()
  });

  return {
    answer,
    intent,
    entities: resolvedEntities
  };
}

module.exports = {
  processChatMessage,
  sanitizeInput
};
