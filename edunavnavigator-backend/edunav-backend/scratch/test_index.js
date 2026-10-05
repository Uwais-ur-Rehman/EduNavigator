require('dotenv').config();
const connectDB = require('../config/db');
const { getEntityIndex } = require('../chatbot/entityExtractor');

connectDB().then(async () => {
  const index = await getEntityIndex();
  console.log('Unis in index:', index.unis);
  process.exit(0);
});
