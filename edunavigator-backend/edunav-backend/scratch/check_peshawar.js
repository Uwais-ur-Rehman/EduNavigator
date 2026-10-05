require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const all = await University.find({});
  console.log("Total universities in DB:", all.length);
  const names = all.map(u => ({ id: u._id, name: u.name, acronym: u.acronym, shortName: u.shortName, aliases: u.aliases, city: u.city, location: u.location, sector: u.sector, ranking: u.hecRanking, website: u.website, topPrograms: u.topPrograms, admissions: u.admissions }));
  console.log("All Unis:", JSON.stringify(names, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
