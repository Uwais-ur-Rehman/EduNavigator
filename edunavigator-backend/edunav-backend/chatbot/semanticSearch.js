/**
 * EduNavigator Chatbot - Semantic Search Engine
 * Uses transformer sentence embeddings to semantically match queries with database entities & programs.
 */
const { getEmbedding, cosineSimilarity } = require('./embeddingService');
const cache = require('./cache');

async function semanticMatchProgram(programQuery, programsList) {
  if (!programQuery || !programsList || programsList.length === 0) return null;

  const queryLower = programQuery.toLowerCase().trim();

  // 1. Direct string match
  for (const prog of programsList) {
    if (!prog.name) continue;
    const pName = prog.name.toLowerCase();
    if (pName === queryLower || pName.includes(queryLower) || queryLower.includes(pName)) {
      return prog;
    }
  }

  // 2. Vector embedding similarity search
  try {
    let queryVector = cache.getEmbedding(programQuery);
    if (!queryVector) {
      queryVector = await getEmbedding(programQuery);
      cache.setEmbedding(programQuery, queryVector);
    }

    let bestProg = null;
    let maxSim = -1;

    for (const prog of programsList) {
      if (!prog.name) continue;
      let progVector = cache.getEmbedding(prog.name);
      if (!progVector) {
        progVector = await getEmbedding(prog.name);
        cache.setEmbedding(prog.name, progVector);
      }
      const sim = cosineSimilarity(queryVector, progVector);
      if (sim > maxSim) {
        maxSim = sim;
        bestProg = prog;
      }
    }

    if (maxSim > 0.45) {
      return bestProg;
    }
  } catch (err) {
    console.error('⚠️ [SemanticSearch] Program vector error:', err.message);
  }

  return null;
}

async function semanticMatchUniversity(uniQuery, unisList) {
  if (!uniQuery || !unisList || unisList.length === 0) return null;

  const queryLower = uniQuery.toLowerCase().trim();

  for (const uni of unisList) {
    const nameLower = (uni.name || '').toLowerCase();
    const shortLower = (uni.shortName || '').toLowerCase();
    if (nameLower.includes(queryLower) || queryLower.includes(shortLower) || queryLower.includes(nameLower)) {
      return uni;
    }
  }

  try {
    let queryVector = cache.getEmbedding(uniQuery);
    if (!queryVector) {
      queryVector = await getEmbedding(uniQuery);
      cache.setEmbedding(uniQuery, queryVector);
    }

    let bestUni = null;
    let maxSim = -1;

    for (const uni of unisList) {
      const uniText = `${uni.shortName || ''} ${uni.name || ''} ${uni.city || ''} ${uni.campus || ''}`;
      let uniVector = cache.getEmbedding(uniText);
      if (!uniVector) {
        uniVector = await getEmbedding(uniText);
        cache.setEmbedding(uniText, uniVector);
      }
      const sim = cosineSimilarity(queryVector, uniVector);
      if (sim > maxSim) {
        maxSim = sim;
        bestUni = uni;
      }
    }

    if (maxSim > 0.45) {
      return bestUni;
    }
  } catch (err) {
    console.error('⚠️ [SemanticSearch] University vector error:', err.message);
  }

  return null;
}

module.exports = {
  semanticMatchProgram,
  semanticMatchUniversity
};
