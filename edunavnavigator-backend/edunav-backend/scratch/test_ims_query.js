require('dotenv').config();
const connectDB = require('../config/db');
const University = require('../models/University');

connectDB().then(async () => {
  const docByName = await University.findOne({ name: 'Institute of Management Sciences' }).lean();
  console.log('Doc by exact name:', docByName ? { id: docByName._id, name: docByName.name, shortName: docByName.shortName, sector: docByName.sector } : 'NOT FOUND');

  const docByRegex = await University.find({ name: { $regex: /Institute of Management Sciences/i } }).lean();
  console.log('Docs by regex name:', docByRegex.map(d => ({ id: d._id, name: d.name })));

  process.exit(0);
});
