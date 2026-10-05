/**
 * EduNavigator Migration Script
 * Removes obsolete fields from all existing university documents in MongoDB:
 * - admissionStatus.isOpen
 * - description
 * - HECNationalUniversityRanking
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function runMigration() {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edunavigator';
  console.log(`Connecting to MongoDB Atlas...`);
  await mongoose.connect(mongoURI);

  const result = await mongoose.connection.collection('universities').updateMany(
    {},
    {
      $unset: {
        "admissionStatus.isOpen": "",
        "description": "",
        "HECNationalUniversityRanking": ""
      }
    }
  );

  console.log(`\n============================================================`);
  console.log(`✅ MIGRATION COMPLETED SUCCESSFULLY`);
  console.log(`Matched Documents: ${result.matchedCount}`);
  console.log(`Modified Documents: ${result.modifiedCount}`);
  console.log(`============================================================\n`);

  // Verification checks
  const countIsOpen = await mongoose.connection.collection('universities').countDocuments({ "admissionStatus.isOpen": { $exists: true } });
  const countDesc = await mongoose.connection.collection('universities').countDocuments({ "description": { $exists: true } });
  const countHEC = await mongoose.connection.collection('universities').countDocuments({ "HECNationalUniversityRanking": { $exists: true } });

  console.log(`VERIFICATION STATUS:`);
  console.log(`- admissionStatus.isOpen remaining count: ${countIsOpen} (Expected 0)`);
  console.log(`- description remaining count: ${countDesc} (Expected 0)`);
  console.log(`- HECNationalUniversityRanking remaining count: ${countHEC} (Expected 0)`);

  if (countIsOpen === 0 && countDesc === 0 && countHEC === 0) {
    console.log(`\n🎉 VERIFICATION PASSED: All 3 fields completely removed from database!`);
  } else {
    console.warn(`\n⚠️ VERIFICATION WARNING: Some documents still contain obsolete fields.`);
  }

  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
