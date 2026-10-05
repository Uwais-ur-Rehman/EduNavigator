/**
 * EduNavigator Chatbot - Session Memory Schema
 * Stores active session history up to 5 conversation turns in MongoDB.
 */
const mongoose = require('mongoose');

const chatbotSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  history: [{
    _id: false,
    userMessage: String,
    botAnswer: String,
    intent: String,
    entities: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

chatbotSessionSchema.methods.addTurn = function (turn) {
  this.history.push(turn);
  if (this.history.length > 5) {
    this.history.shift(); // Keep latest 5 turns
  }
};

module.exports = mongoose.model('ChatbotSession', chatbotSessionSchema);
