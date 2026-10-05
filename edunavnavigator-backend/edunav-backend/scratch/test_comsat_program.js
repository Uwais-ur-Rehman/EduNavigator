require('dotenv').config();
const connectDB = require('../config/db');
const { processChatMessage } = require('../chatbot/ragService');

connectDB().then(async () => {
  const query = 'does comsat university offer bscs at abbottabad campus';
  console.log('Query:', query);

  const res = await processChatMessage('test-comsat-prog-' + Date.now(), query);
  console.log('Chatbot Answer:\n', res);

  process.exit(0);
});
