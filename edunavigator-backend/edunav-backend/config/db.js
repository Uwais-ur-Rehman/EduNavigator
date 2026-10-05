const mongoose = require('mongoose');

async function autoSeed() {
  try {
    const University = require('../models/University');
    const Admission = require('../models/Admission');
    const Scholarship = require('../models/Scholarship');
    
    const count = await University.countDocuments();
    if (count === 0) {
      console.log('🌱 Database empty. Auto-seeding initial dataset...');
      const { universities, scholarships } = require('../data/seed');
      const created = await University.insertMany(universities);
      
      const admissions = created.map((u, i) => ({
        university: u._id,
        program: u.programs && u.programs.length > 0 ? u.programs[0].name : 'Undergraduate Program',
        session: 'Fall 2026',
        applyStart: new Date('2026-06-01'),
        applyDeadline: new Date(u.admissionStatus?.lastDate || `2026-08-30`),
        testDate: new Date('2026-09-15'),
        resultDate: new Date('2026-10-10'),
        eligibility: `Min ${u.admissionCriteria?.fscPercentage ?? 50}% in FSc + ${u.admissionCriteria?.entryTestPercentage ?? 50}% Entry Test`,
        applyLink: u.website,
        status: u.admissionStatus?.isOpen ? 'Open' : 'Closed',
      }));
      await Admission.insertMany(admissions);
      await Scholarship.insertMany(scholarships);
      console.log(`✅ Auto-seed complete: ${created.length} universities, ${admissions.length} admissions, and ${scholarships.length} scholarships loaded.`);
    } else {
      console.log(`📊 Database loaded with ${count} universities.`);
    }
  } catch (e) {
    console.error('⚠️ Auto-seed error:', e.message);
  }
}

module.exports = async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edunavnavigator';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB Atlas successfully');
    await autoSeed();
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection notice:', err.message);
    console.warn('⚠️ Ensure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access settings.');
    console.log('🔄 Launching In-Memory MongoDB Fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB Fallback Server successfully');
      await autoSeed();
    } catch (memErr) {
      console.error('❌ In-Memory MongoDB Fallback failed:', memErr.message);
    }
  }
};

