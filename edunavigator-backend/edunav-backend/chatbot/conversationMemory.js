/**
 * EduNavigator Chatbot - Conversation Memory Module
 * Manages 5-turn conversation history and resolves pronouns & implicit coreferences.
 */
const ChatbotSession = require('./model');

/**
 * Resolves pronouns ("its", "their", "that university") to past entities from history.
 */
function resolveCoreferences(userQuery, currentEntities, history, intent = null) {
  const resolved = { ...currentEntities };

  // Recommendation intent must search across DB and NEVER inherit a single university from past turns
  if (intent === 'Recommendations') {
    resolved.university = null;
    resolved.campus = null;
    return resolved;
  }

  if (!history || history.length === 0) return resolved;

  const lower = (userQuery || '').toLowerCase();

  const isRecQuery =
    /\b(recommend|suggest|list|find|show|search)\b/i.test(lower) ||
    /\b(which|what|any)\s+(universities|unis|colleges|institutes)\b/i.test(lower) ||
    /\b(universities|unis|colleges|institutes)\s+(offering|offer|available|in|under|with|have|that|which)\b/i.test(lower);

  if (isRecQuery) {
    resolved.university = null;
    resolved.campus = null;
    return resolved;
  }

  const hasPronounOrImplicit = /\b(its|it|their|this|that|the university|the campus)\b/.test(lower) ||
    (!resolved.university && (resolved.program || resolved.fee || resolved.admissionStatus || resolved.hostel || resolved.scholarship || lower.includes('fee') || lower.includes('admission')));

  if (hasPronounOrImplicit) {
    for (let i = history.length - 1; i >= 0; i--) {
      const prevTurn = history[i];
      if (prevTurn && prevTurn.entities) {
        if (!resolved.university && prevTurn.entities.university) {
          resolved.university = prevTurn.entities.university;
        }
        if (!resolved.campus && prevTurn.entities.campus) {
          resolved.campus = prevTurn.entities.campus;
        }
        if (!resolved.program && prevTurn.entities.program) {
          resolved.program = prevTurn.entities.program;
        }
        if (!resolved.city && prevTurn.entities.city) {
          resolved.city = prevTurn.entities.city;
        }
        if (resolved.university) break;
      }
    }
  }

  return resolved;
}

async function getSessionHistory(sessionId) {
  if (!sessionId) return [];
  const session = await ChatbotSession.findOne({ sessionId });
  return session ? session.history : [];
}

async function saveTurn(sessionId, turnData) {
  if (!sessionId) return;
  let session = await ChatbotSession.findOne({ sessionId });
  if (!session) {
    session = new ChatbotSession({ sessionId, history: [] });
  }
  session.addTurn(turnData);
  await session.save();
}

module.exports = {
  resolveCoreferences,
  getSessionHistory,
  saveTurn
};
