/**
 * EduNavigator Chatbot - In-Memory Cache
 * Fast in-memory storage for precomputed embeddings, entity maps, and session context.
 */

class ChatbotCache {
  constructor() {
    this.embeddingsCache = new Map();
    this.entitiesIndex = null;
    this.intentEmbeddings = new Map();
  }

  getEmbedding(text) {
    return this.embeddingsCache.get(text.toLowerCase().trim());
  }

  setEmbedding(text, vector) {
    const key = text.toLowerCase().trim();
    if (this.embeddingsCache.size > 1000) {
      const firstKey = this.embeddingsCache.keys().next().value;
      this.embeddingsCache.delete(firstKey);
    }
    this.embeddingsCache.set(key, vector);
  }

  getEntitiesIndex() {
    return this.entitiesIndex;
  }

  setEntitiesIndex(index) {
    this.entitiesIndex = index;
  }

  getIntentEmbedding(intentName) {
    return this.intentEmbeddings.get(intentName);
  }

  setIntentEmbedding(intentName, vector) {
    this.intentEmbeddings.set(intentName, vector);
  }

  clear() {
    this.embeddingsCache.clear();
    this.entitiesIndex = null;
    this.intentEmbeddings.clear();
  }
}

module.exports = new ChatbotCache();
