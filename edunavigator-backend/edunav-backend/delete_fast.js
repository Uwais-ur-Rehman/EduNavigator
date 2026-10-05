const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  console.log('Connecting to MongoDB ...');
  await mongoose.connect(uri);

  const filter = {
    $or: [
      { name: { $regex: /fast/i } },
      { shortName: { $regex: /fast/i } },
      { name: { $regex: /nuces/i } },
      { shortName: { $regex: /nuces/i } }
    ]
  };

  const matches = await University.find(filter);
  console.log(`Found ${matches.length} matching FAST University document(s):`);
  matches.forEach(u => console.log(` - [${u._id}] ${u.name} (${u.shortName}) in ${u.city}`));

  if (matches.length > 0) {
    const res = await University.deleteMany(filter);
    console.log(`✅ Deleted ${res.deletedCount} document(s) from 'universities' collection.`);
  } else {
    console.log('No matching FAST university documents found.');
  }

  await mongoose.connection.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
