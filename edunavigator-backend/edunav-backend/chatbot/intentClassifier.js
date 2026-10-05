/**
 * EduNavigator Chatbot - Intent Classifier
 * Vector-based intent classification using lightweight transformer sentence embeddings across 12 intent categories.
 */
const { getEmbedding, cosineSimilarity } = require('./embeddingService');
const cache = require('./cache');

const INTENT_PROTOTYPES = {
  Greetings: [
    'hello hi hey good morning good evening greetings',
    'who are you what can you do help me'
  ],
  'University Information': [
    'tell me about university overview description public private sector type',
    'is university public or private sector overview details'
  ],
  'Program Availability': [
    'does university offer BS Computer Science degree program available',
    'which universities offer software engineering AI BBA courses degrees'
  ],
  'Fee Queries': [
    'what is the semester fee tuition fee charges cost price per semester',
    'how much is the fee for computer science under 100000 80000 budget'
  ],
  'Admission Queries': [
    'is admission open active status last date closing date deadline open today',
    'can I apply now entry test date application schedule'
  ],
  Scholarships: [
    'are scholarships financial aid merit scholarship need based available',
    'how to get scholarship fee waiver financial assistance'
  ],
  Hostel: [
    'does university have hostel facilities accommodation boys girls boarding fee'
  ],
  Facilities: [
    'what facilities transport library labs sports gym internet available'
  ],
  Recommendations: [
    'recommend suggest top public private universities in Lahore KP under 80000 for CS AI'
  ],
  Comparison: [
    'compare FAST and COMSATS difference between NUST and FAST vs versus better'
  ],
  'Campus Information': [
    'how many campuses does university have campus list branch locations count total campuses'
  ],
  'Contact Information': [
    'phone number email address official website contact details link helpline'
  ]
};

let prototypesInitialized = false;

async function initIntentPrototypes() {
  if (prototypesInitialized) return;
  for (const [intent, phrases] of Object.entries(INTENT_PROTOTYPES)) {
    const combinedPhrase = phrases.join(' ');
    let vector = cache.getIntentEmbedding(intent);
    if (!vector) {
      vector = await getEmbedding(combinedPhrase);
      cache.setIntentEmbedding(intent, vector);
    }
  }
  prototypesInitialized = true;
}

async function classifyIntent(userQuery) {
  if (!userQuery || !userQuery.trim()) return 'Greetings';

  await initIntentPrototypes();
  const queryVector = await getEmbedding(userQuery);

  let bestIntent = 'University Information';
  let maxScore = -1;

  for (const intent of Object.keys(INTENT_PROTOTYPES)) {
    const prototypeVector = cache.getIntentEmbedding(intent);
    if (!prototypeVector) continue;
    const sim = cosineSimilarity(queryVector, prototypeVector);
    if (sim > maxScore) {
      maxScore = sim;
      bestIntent = intent;
    }
  }

  const lower = userQuery.toLowerCase();

  // Rule boosts for 100% precision
  if (/\b(hi|hello|hey|greetings|aoa|assalam)\b/.test(lower) && lower.split(' ').length <= 4) {
    return 'Greetings';
  }

  // Priority Rule: Recommendation / Search intent for multi-university queries
  const isRecommendationQuery =
    /\b(recommend|suggest|list|find|show|search)\b/i.test(lower) ||
    /\b(which|what|any|show|list|find|search|recommend|suggest)\s+(universities|unis|colleges|institutes)\b/i.test(lower) ||
    /\b(universities|unis|colleges|institutes)\s+(offering|offer|available|in|under|with|have|that|which)\b/i.test(lower) ||
    (/\b(which|what)\b/i.test(lower) && /\b(universities|unis|colleges|institutes)\b/i.test(lower)) ||
    (/\b(which|what)\s+have\s+admissions?\s+open\b/i.test(lower)) ||
    (/\b(under|below|budget)\s*\d+/i.test(lower) && !/\b(fast|nust|comsats|lums|uet|giki|pu|iba)\b/i.test(lower));

  if (isRecommendationQuery) {
    return 'Recommendations';
  }

  if (/\b(public|private|sector)\b/.test(lower) && !/\b(recommend|suggest|under|fee|offer)\b/.test(lower)) {
    return 'University Information';
  }
  if (/\b(compare|vs|versus|difference|better)\b/.test(lower) && (lower.includes('and') || lower.includes('vs') || lower.includes('or'))) {
    return 'Comparison';
  }
  if (/\b(fee|fees|cost|tuition|charges|dues|price)\b/.test(lower) || /\b(under|below|budget)\s*\d+/i.test(lower)) {
    return 'Fee Queries';
  }
  if (/\b(deadline|last date|closing date|close date|open|open today|admission status|is admission open)\b/.test(lower)) {
    return 'Admission Queries';
  }
  if (/\b(scholarship|scholarships|financial aid)\b/.test(lower)) {
    return 'Scholarships';
  }
  if (/\b(hostel|accommodation|boarding|boys hostel|girls hostel)\b/.test(lower)) {
    return 'Hostel';
  }
  if (/\b(ranking|ranked|rank|hec)\b/.test(lower)) {
    return 'University Information';
  }
  if (/\b(phone|email|website|official website|contact|address|url)\b/.test(lower)) {
    return 'Contact Information';
  }
  if (/\b(how many campuses|campuses|campus list|where are.*campuses)\b/.test(lower)) {
    return 'Campus Information';
  }
  if (/\b(offer|offers|offering|available|courses|degree)\b/.test(lower)) {
    return 'Program Availability';
  }

  return bestIntent;
}

module.exports = {
  classifyIntent,
  initIntentPrototypes
};
