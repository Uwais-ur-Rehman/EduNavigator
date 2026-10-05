require('dotenv').config();
const connectDB = require('../config/db');
const University = require('../models/University');
const { extractEntities } = require('../chatbot/entityExtractor');
const { detectIntents } = require('../chatbot/intentDetector');
const dbRetriever = require('../chatbot/databaseRetriever');
const { processChatMessage } = require('../chatbot/ragService');

connectDB().then(async () => {
  const query = 'does agriculture university peshawar offer bs computer science';
  console.log('Query:', query);

  const intents = detectIntents(query);
  console.log('Intents:', intents);

  const entities = extractEntities(query);
  console.log('Entities:', entities);

  const doc = await University.findOne({
    $or: [
      { name: { $regex: /Agriculture/i } },
      { shortName: { $regex: /UAP/i } }
    ]
  }).lean();

  if (doc) {
    console.log('\n--- UAP DOC IN DB ---');
    console.log('Name:', doc.name);
    console.log('ShortName:', doc.shortName);
    console.log('City:', doc.city);
    console.log('Programs count:', doc.programs ? doc.programs.length : 0);
    if (doc.programs) {
      console.log('Programs list:', doc.programs.map(p => p.name));
    }
  } else {
    console.log('UAP DOC NOT FOUND IN DB');
  }

  console.log('\n--- TESTING findProgram ---');
  const progRes = await dbRetriever.findProgram(entities, query);
  console.log('findProgram result:', progRes);

  console.log('\n--- TESTING processChatMessage ---');
  const res = await processChatMessage('test-uap-session', query);
  console.log('Chatbot Answer:\n', res);

  process.exit(0);
});
