const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

const docs = [
  {
    name: "National University of Computer and Emerging Sciences Islamabad",
    shortName: "FAST-NUCES isl",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    sector: "Private",
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    programs: [
      { name: "BS Computer Science", feePerSemester: 210000 },
      { name: "BS Software Engineering", feePerSemester: 210000 },
      { name: "BS Artificial Intelligence", feePerSemester: 210000 },
      { name: "BS Data Science", feePerSemester: 210000 },
      { name: "BS Cyber Security", feePerSemester: 210000 },
      { name: "BS Electrical Engineering", feePerSemester: 200000 },
      { name: "BS Civil Engineering", feePerSemester: 200000 },
      { name: "BS Business Analytics", feePerSemester: 190000 },
      { name: "BBA", feePerSemester: 185000 },
      { name: "BS Accounting & Finance", feePerSemester: 185000 }
    ],
    facilities: [
      "Hostel", "Transport", "Digital Library", "Computer Labs", "AI Research Labs",
      "Sports Complex", "Medical Room", "Wi-Fi Campus", "Prayer Area", "Cafeteria",
      "Innovation Center", "Career Services Office"
    ],
    admissionStatus: {
      lastDate: "2026-07-25",
      entryTest: "FAST Admission Test / NTS SAT Basis"
    },
    admissionCriteria: {
      matricPercentage: 10,
      fscPercentage: 40,
      entryTestPercentage: 50,
      entryTest: "FAST Admission Test"
    },
    scholarships: [
      "Merit Scholarship", "Need Based Financial Assistance", "HEC Need-Based Scholarship",
      "Sibling Fee Concession", "Employee Children Scholarship"
    ],
    contact: {
      phone: "+92-51-111-128-128",
      email: "admissions@nu.edu.pk",
      address: "FAST-NUCES Islamabad Campus, A.K. Brohi Road, H-11/4, Islamabad, Pakistan"
    }
  },
  {
    name: "National University of Computer and Emerging Sciences Peshawar",
    shortName: "FAST-NUCES pesh",
    city: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    sector: "Private",
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    programs: [
      { name: "BS Computer Science", feePerSemester: 210000 },
      { name: "BS Software Engineering", feePerSemester: 210000 },
      { name: "BS Artificial Intelligence", feePerSemester: 210000 },
      { name: "BS Data Science", feePerSemester: 210000 },
      { name: "BS Cyber Security", feePerSemester: 210000 },
      { name: "BS Electrical Engineering", feePerSemester: 200000 },
      { name: "BS Civil Engineering", feePerSemester: 200000 },
      { name: "BS Business Analytics", feePerSemester: 190000 },
      { name: "BBA", feePerSemester: 185000 },
      { name: "BS Accounting & Finance", feePerSemester: 185000 }
    ],
    facilities: [
      "Hostel", "Transport", "Digital Library", "Computer Labs", "AI Research Labs",
      "Sports Complex", "Medical Room", "Wi-Fi Campus", "Prayer Area", "Cafeteria",
      "Innovation Center", "Career Services Office"
    ],
    admissionStatus: {
      lastDate: "2026-07-25",
      entryTest: "FAST Admission Test / NTS SAT Basis"
    },
    admissionCriteria: {
      matricPercentage: 10,
      fscPercentage: 40,
      entryTestPercentage: 50,
      entryTest: "FAST Admission Test"
    },
    scholarships: [
      "Merit Scholarship", "Need Based Financial Assistance", "HEC Need-Based Scholarship",
      "Sibling Fee Concession", "Employee Children Scholarship"
    ],
    contact: {
      phone: "+92-91-111-128-128",
      email: "admissions.pwr@nu.edu.pk",
      address: "FAST-NUCES Peshawar Campus, 160 Industrial Estate, Jamrud Road, Peshawar, Pakistan"
    }
  }
];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  console.log('Connecting to MongoDB ...');
  await mongoose.connect(uri);

  const res = await University.insertMany(docs);
  console.log(`✅ Successfully inserted ${res.length} FAST University records into MongoDB:`);
  res.forEach(u => console.log(` - [${u._id}] ${u.name} (${u.shortName}) in ${u.city}, ${u.province}`));

  await mongoose.connection.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
