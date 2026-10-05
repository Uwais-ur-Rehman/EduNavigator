const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

const basePrograms = [
  { name: "BS Computer Science", feePerSemester: 160500 },
  { name: "BS Software Engineering", feePerSemester: 160500 },
  { name: "BS Artificial Intelligence", feePerSemester: 160500 },
  { name: "BS Data Science", feePerSemester: 160500 },
  { name: "BS Cyber Security", feePerSemester: 160500 },
  { name: "BS Information Technology", feePerSemester: 160500 },
  { name: "BS Electrical Engineering", feePerSemester: 166500 },
  { name: "BS Civil Engineering", feePerSemester: 166500 },
  { name: "BS Chemical Engineering", feePerSemester: 166500 },
  { name: "BS Architecture", feePerSemester: 183500 },
  { name: "Doctor of Pharmacy (Pharm-D)", feePerSemester: 176500 },
  { name: "BBA", feePerSemester: 148500 },
  { name: "BS Accounting & Finance", feePerSemester: 148500 },
  { name: "BS Business Administration", feePerSemester: 148500 },
  { name: "BS Economics", feePerSemester: 148500 },
  { name: "BS Mathematics", feePerSemester: 148500 },
  { name: "BS Physics", feePerSemester: 148500 },
  { name: "BS Statistics", feePerSemester: 148500 },
  { name: "BS Chemistry", feePerSemester: 148500 },
  { name: "BS Biotechnology", feePerSemester: 148500 },
  { name: "BS Environmental Sciences", feePerSemester: 148500 },
  { name: "BS Psychology", feePerSemester: 148500 },
  { name: "BS Media & Communication Studies", feePerSemester: 148500 },
  { name: "BS English", feePerSemester: 148500 },
  { name: "BS International Relations", feePerSemester: 148500 }
];

const baseFacilities = [
  "Hostel", "Transport", "Central Library", "Computer Labs", "Engineering Labs",
  "Research Centers", "Innovation Center", "Sports Complex", "Medical Center",
  "Wi-Fi Campus", "Mosque", "Cafeteria", "Career Development Center"
];

const baseAdmissionStatus = {
  isOpen: true,
  lastDate: "2026-08-05",
  entryTest: "COMSATS Admission Test / NTS"
};

const baseAdmissionCriteria = {
  matricPercentage: 10,
  fscPercentage: 40,
  entryTestPercentage: 50,
  entryTest: "COMSATS Admission Test / NTS"
};

const baseScholarships = [
  "Merit Scholarship",
  "Need Based Financial Assistance",
  "HEC Need Based Scholarship",
  "Ehsaas Undergraduate Scholarship",
  "Sibling Fee Concession"
];

const campuses = [
  {
    name: "COMSATS University Islamabad",
    shortName: "CUI isb",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    contact: {
      phone: "+92-51-9049100",
      email: "admissions@comsats.edu.pk",
      address: "Park Road, Tarlai Kalan, Islamabad, Pakistan"
    }
  },
  {
    name: "COMSATS University Abbottabad",
    shortName: "CUI atd",
    city: "Abbottabad",
    province: "Khyber Pakhtunkhwa",
    contact: {
      phone: "+92-992-383591",
      email: "admissions@cuiatd.edu.pk",
      address: "University Road, Tobe Camp, Abbottabad, Khyber Pakhtunkhwa, Pakistan"
    }
  },
  {
    name: "COMSATS University Lahore",
    shortName: "CUI lhr",
    city: "Lahore",
    province: "Punjab",
    contact: {
      phone: "+92-42-111-001-007",
      email: "admissions@cuilahore.edu.pk",
      address: "Defence Road, Off Raiwind Road, Lahore, Punjab, Pakistan"
    }
  },
  {
    name: "COMSATS University Wah",
    shortName: "CUI wah",
    city: "Wah Cantt",
    province: "Punjab",
    contact: {
      phone: "+92-51-4514250",
      email: "admissions@cuiwah.edu.pk",
      address: "G.T. Road, Quaid Avenue, Wah Cantt, Punjab, Pakistan"
    }
  },
  {
    name: "COMSATS University Attock",
    shortName: "CUI attock",
    city: "Attock",
    province: "Punjab",
    contact: {
      phone: "+92-57-9316330",
      email: "admissions@cuiattock.edu.pk",
      address: "Kamra Road, Attock, Punjab, Pakistan"
    }
  },
  {
    name: "COMSATS University Sahiwal",
    shortName: "CUI sahiwal",
    city: "Sahiwal",
    province: "Punjab",
    contact: {
      phone: "+92-40-4305001",
      email: "admissions@cuisahiwal.edu.pk",
      address: "COMSATS Road, Off G.T. Road, Sahiwal, Punjab, Pakistan"
    }
  },
  {
    name: "COMSATS University Vehari",
    shortName: "CUI vehari",
    city: "Vehari",
    province: "Punjab",
    contact: {
      phone: "+92-67-3602805",
      email: "admissions@cuivehari.edu.pk",
      address: "Multan Road, Vehari, Punjab, Pakistan"
    }
  }
];

const docs = campuses.map(c => ({
  name: c.name,
  shortName: c.shortName,
  city: c.city,
  province: c.province,
  sector: "Public",
  ranking: 6,
  website: "https://www.comsats.edu.pk",
  logo: "comsats.png",
  image: "comsats.jpg",
  programs: basePrograms,
  facilities: baseFacilities,
  admissionStatus: baseAdmissionStatus,
  admissionCriteria: baseAdmissionCriteria,
  scholarships: baseScholarships,
  rating: 4.8
}));

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  console.log('Connecting to MongoDB ...');
  await mongoose.connect(uri);

  // Remove existing COMSATS documents to prevent duplicate records
  const delRes = await University.deleteMany({
    $or: [
      { name: { $regex: /comsats/i } },
      { shortName: { $regex: /cui/i } }
    ]
  });
  console.log(`Cleaned up ${delRes.deletedCount} existing COMSATS records.`);

  const res = await University.insertMany(docs);
  console.log(`✅ Successfully inserted ${res.length} COMSATS University campuses into MongoDB:`);
  res.forEach(u => console.log(` - [${u._id}] ${u.name} (${u.shortName}) in ${u.city}, ${u.province}`));

  await mongoose.connection.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
