const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { processChatMessage } = require('../chatbot/chatbotService');

async function testQueries() {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edunavigator';
  await mongoose.connect(dbUri);
  console.log('✅ Connected to MongoDB for testing');

  const testCases = [
    { name: 'Test 1: BBA in Lahore', query: 'Which universities offer BBA in Lahore?' },
    { name: 'Test 2: BS CS in Peshawar', query: 'Which universities offer BS Computer Science in Peshawar?' },
    { name: 'Test 3: Public in KP', query: 'Recommend public universities in KP.' },
    { name: 'Test 4: Private in Islamabad', query: 'Suggest private universities in Islamabad.' },
    { name: 'Test 5: Artificial Intelligence', query: 'Show universities offering Artificial Intelligence.' },
    { name: 'Test 6: Unis in Lahore', query: 'List universities in Lahore.' },
    { name: 'Test 7: Under 80,000', query: 'Find universities under Rs. 80,000.' },
    { name: 'Test 8: Admissions open', query: 'Which universities have admissions open?' }
  ];

  for (const tc of testCases) {
    console.log(`\n========================================`);
    console.log(`📌 ${tc.name}`);
    console.log(`Query: "${tc.query}"`);
    const res = await processChatMessage('test_session_' + Date.now(), tc.query);
    console.log(`Classified Intent: ${res.intent}`);
    console.log(`Extracted Entities:`, JSON.stringify(res.entities));
    console.log(`Bot Response:\n${res.answer}`);
  }

  console.log(`\n========================================`);
  console.log(`📌 Test 9: Conversation History Coreference Isolation Test`);
  const session = 'history_test_session_' + Date.now();
  console.log(`Turn 1: "Is admission open in UOP?"`);
  const res1 = await processChatMessage(session, 'Is admission open in UOP?');
  console.log(`Turn 1 Intent: ${res1.intent}, Uni: ${res1.entities.university}`);
  console.log(`Turn 1 Answer summary: ${res1.answer.substring(0, 80)}...`);

  console.log(`\nTurn 2: "Which universities offer BBA in Lahore?"`);
  const res2 = await processChatMessage(session, 'Which universities offer BBA in Lahore?');
  console.log(`Turn 2 Intent: ${res2.intent}, Uni: ${res2.entities.university}`);
  console.log(`Turn 2 Answer:\n${res2.answer}`);

  await mongoose.disconnect();
  console.log('\n✅ Testing finished.');
  process.exit(0);
}

testQueries().catch(err => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
