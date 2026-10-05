const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  await mongoose.connect(uri);

  const sindhUnis = await University.find({ province: { $regex: /sindh/i } });
  console.log(`Found ${sindhUnis.length} Sindh universities in DB:`);
  sindhUnis.forEach(u => console.log(` - ${u.name} (${u.shortName || ''}) in ${u.city}`));

  const distinctCities = [...new Set(sindhUnis.map(u => u.city).filter(Boolean))].sort();
  console.log('\nDistinct Sindh cities/districts currently in DB:', distinctCities);

  await mongoose.connection.close();
}

run().catch(console.error);
