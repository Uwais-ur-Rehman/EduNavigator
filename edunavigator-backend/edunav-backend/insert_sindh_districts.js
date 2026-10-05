const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

const sindhUniversities = [
  // ── Jamshoro ────────────────────────────────────────────────
  {
    name: "Mehran University of Engineering and Technology",
    shortName: "MUET",
    city: "Jamshoro",
    province: "Sindh",
    sector: "Public",
    ranking: 6,
    website: "https://www.muet.edu.pk",
    logo: "muet.png",
    image: "muet.jpg",
    description: "Mehran University of Engineering and Technology (MUET) is one of Pakistan's top public engineering universities, located in Jamshoro, Sindh.",
    programs: [
      { name: "BE Civil Engineering", feePerSemester: 42000 },
      { name: "BE Electrical Engineering", feePerSemester: 42000 },
      { name: "BE Mechanical Engineering", feePerSemester: 42000 },
      { name: "BE Software Engineering", feePerSemester: 42000 },
      { name: "BS Computer Science", feePerSemester: 42000 },
      { name: "BE Chemical Engineering", feePerSemester: 42000 },
      { name: "BE Mechatronics Engineering", feePerSemester: 42000 },
      { name: "BE Biomedical Engineering", feePerSemester: 42000 }
    ],
    facilities: [
      "Central Library", "Digital Library", "Engineering Labs", "Computer Labs", "Hostels (Boys & Girls)",
      "Sports Complex", "Medical Center", "Transport Service", "Cafeteria", "Mosque", "Wi-Fi Campus"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-07-30", entryTest: "MUET Pre-Admission Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "MUET Entry Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh Endowment Fund", "Merit Scholarship", "PEEF Scholarship"],
    contact: { phone: "+92-22-2772250", email: "admissions@admin.muet.edu.pk", address: "Indus Highway, Jamshoro, Sindh, Pakistan" },
    rating: 4.8
  },
  {
    name: "University of Sindh",
    shortName: "UoS",
    city: "Jamshoro",
    province: "Sindh",
    sector: "Public",
    ranking: 12,
    website: "https://usindh.edu.pk",
    logo: "uos.png",
    image: "uos.jpg",
    description: "The University of Sindh is one of the oldest public research universities in Pakistan, offering diverse undergraduate and postgraduate degree programs.",
    programs: [
      { name: "BS Computer Science", feePerSemester: 35000 },
      { name: "BS Software Engineering", feePerSemester: 35000 },
      { name: "BS Information Technology", feePerSemester: 35000 },
      { name: "BS English", feePerSemester: 28000 },
      { name: "BBA", feePerSemester: 38000 },
      { name: "BS Accounting & Finance", feePerSemester: 38000 },
      { name: "BS Mathematics", feePerSemester: 28000 },
      { name: "BS Physics", feePerSemester: 28000 },
      { name: "BS Chemistry", feePerSemester: 28000 }
    ],
    facilities: [
      "Allama I.I. Kazi Central Library", "Computer Labs", "Hostels", "Sports Ground", "Transport Service", "Medical Center", "Mosque"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-10", entryTest: "UoS Pre-Admission Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "UoS Entry Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh Educational Endowment Fund", "Merit Scholarship"],
    contact: { phone: "+92-22-9213181", email: "info@usindh.edu.pk", address: "Allama I.I. Kazi Campus, Jamshoro, Sindh, Pakistan" },
    rating: 4.5
  },
  {
    name: "Liaquat University of Medical & Health Sciences",
    shortName: "LUMHS",
    city: "Jamshoro",
    province: "Sindh",
    sector: "Public",
    ranking: 8,
    website: "https://www.lumhs.edu.pk",
    logo: "lumhs.png",
    image: "lumhs.jpg",
    description: "Liaquat University of Medical & Health Sciences (LUMHS) is a premier public medical university in Jamshoro, Sindh.",
    programs: [
      { name: "Bachelor of Medicine, Bachelor of Surgery (MBBS)", feePerSemester: 28000 },
      { name: "Bachelor of Dental Surgery (BDS)", feePerSemester: 28000 },
      { name: "Doctor of Pharmacy (Pharm-D)", feePerSemester: 65000 },
      { name: "Doctor of Physical Therapy (DPT)", feePerSemester: 65000 },
      { name: "BS Nursing", feePerSemester: 45000 },
      { name: "BS Biomedical Engineering", feePerSemester: 55000 }
    ],
    facilities: [
      "Teaching Hospital", "Central Library", "Medical Simulation Labs", "Hostels", "Sports Complex", "Transport Service"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-15", entryTest: "MDCAT" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "MDCAT" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh SEEF Scholarship", "Merit Scholarship"],
    contact: { phone: "+92-22-9213305", email: "info@lumhs.edu.pk", address: "Jamshoro, Sindh, Pakistan" },
    rating: 4.7
  },

  // ── Hyderabad ──────────────────────────────────────────────
  {
    name: "Isra University",
    shortName: "Isra Uni",
    city: "Hyderabad",
    province: "Sindh",
    sector: "Private",
    ranking: 15,
    website: "https://isra.edu.pk",
    logo: "isra.png",
    image: "isra.jpg",
    description: "Isra University is a renowned private university in Hyderabad, Sindh, offering programs in medical sciences, computing, engineering, and management.",
    programs: [
      { name: "MBBS", feePerSemester: 950000 },
      { name: "BDS", feePerSemester: 950000 },
      { name: "BS Computer Science", feePerSemester: 110000 },
      { name: "BS Software Engineering", feePerSemester: 110000 },
      { name: "BBA", feePerSemester: 98000 },
      { name: "Doctor of Physical Therapy (DPT)", feePerSemester: 125000 }
    ],
    facilities: [
      "Isra University Hospital", "Library", "Computer Labs", "Hostels", "Sports Facilities", "Transport", "Wi-Fi Campus"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-07-28", entryTest: "Isra Entry Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 50, entryTestPercentage: 40, entryTest: "Isra Admission Test" },
    scholarships: ["Merit Scholarship", "Need-Based Assistance", "Sibling Concession"],
    contact: { phone: "+92-22-2030161", email: "info@isra.edu.pk", address: "Hala Road, Hyderabad, Sindh, Pakistan" },
    rating: 4.6
  },
  {
    name: "Government College University Hyderabad",
    shortName: "GCUH",
    city: "Hyderabad",
    province: "Sindh",
    sector: "Public",
    ranking: 25,
    website: "https://gcuh.edu.pk",
    logo: "gcuh.png",
    image: "gcuh.jpg",
    description: "Government College University Hyderabad (GCUH) is a public university offering undergraduate degree programs in basic sciences, humanities, and IT.",
    programs: [
      { name: "BS Computer Science", feePerSemester: 32000 },
      { name: "BS Information Technology", feePerSemester: 32000 },
      { name: "BS English", feePerSemester: 25000 },
      { name: "BBA", feePerSemester: 35000 },
      { name: "BS Chemistry", feePerSemester: 25000 }
    ],
    facilities: [
      "Library", "Computer Labs", "Science Labs", "Auditorium", "Sports Ground", "Cafeteria"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-12", entryTest: "GCUH Admission Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "GCUH Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh SEEF Scholarship"],
    contact: { phone: "+92-22-9260570", email: "info@gcuh.edu.pk", address: "Kali Mori, Hyderabad, Sindh, Pakistan" },
    rating: 4.3
  },

  // ── Sukkur ──────────────────────────────────────────────────
  {
    name: "Sukkur IBA University",
    shortName: "Sukkur IBA",
    city: "Sukkur",
    province: "Sindh",
    sector: "Public",
    ranking: 4,
    website: "https://www.iba-suk.edu.pk",
    logo: "sukkur_iba.png",
    image: "sukkur_iba.jpg",
    description: "Sukkur IBA University is a premier public university in Sukkur, Sindh, known for excellence in Business, Computer Science, Artificial Intelligence, Software Engineering, and Mathematics.",
    programs: [
      { name: "BBA", feePerSemester: 125000 },
      { name: "BS Computer Science", feePerSemester: 135000 },
      { name: "BS Software Engineering", feePerSemester: 135000 },
      { name: "BS Artificial Intelligence", feePerSemester: 135000 },
      { name: "BS Mathematics", feePerSemester: 95000 },
      { name: "BS Accounting & Finance", feePerSemester: 125000 }
    ],
    facilities: [
      "Digital Library", "Modern Computer Labs", "Robotics Lab", "Incubation Center", "Hostels (Boys & Girls)",
      "Sports Complex", "Gymnasium", "Transport", "Cafeteria", "Mosque", "Wi-Fi Campus"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-07-20", entryTest: "Sukkur IBA Admission Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "Sukkur IBA Test" },
    scholarships: ["National Talent Hunt Program (NTHP)", "HEC Need-Based Scholarship", "Sindh Endowment Fund", "Merit Scholarship"],
    contact: { phone: "+92-71-5644000", email: "info@iba-suk.edu.pk", address: "Airport Road, Sukkur, Sindh, Pakistan" },
    rating: 4.9
  },

  // ── Khairpur ────────────────────────────────────────────────
  {
    name: "Shah Abdul Latif University",
    shortName: "SALU",
    city: "Khairpur",
    province: "Sindh",
    sector: "Public",
    ranking: 18,
    website: "https://salu.edu.pk",
    logo: "salu.png",
    image: "salu.jpg",
    description: "Shah Abdul Latif University (SALU) in Khairpur is a prominent public research university serving northern Sindh.",
    programs: [
      { name: "BS Computer Science", feePerSemester: 30000 },
      { name: "BS Software Engineering", feePerSemester: 30000 },
      { name: "BBA", feePerSemester: 32000 },
      { name: "BS English", feePerSemester: 24000 },
      { name: "BS Physics", feePerSemester: 24000 }
    ],
    facilities: [
      "Central Library", "Computer Labs", "Hostels", "Sports Complex", "Transport", "Cafeteria"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-08", entryTest: "SALU Entry Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "SALU Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh Educational Endowment Fund"],
    contact: { phone: "+92-243-9280051", email: "info@salu.edu.pk", address: "Khairpur Mirs, Sindh, Pakistan" },
    rating: 4.4
  },

  // ── Nawabshah / Shaheed Benazirabad ─────────────────────────
  {
    name: "Quaid-e-Awam University of Engineering, Science and Technology",
    shortName: "QUEST",
    city: "Nawabshah",
    province: "Sindh",
    sector: "Public",
    ranking: 10,
    website: "https://quest.edu.pk",
    logo: "quest.png",
    image: "quest.jpg",
    description: "QUEST Nawabshah is a leading public engineering university in Shaheed Benazirabad, Sindh.",
    programs: [
      { name: "BE Civil Engineering", feePerSemester: 38000 },
      { name: "BE Electrical Engineering", feePerSemester: 38000 },
      { name: "BE Mechanical Engineering", feePerSemester: 38000 },
      { name: "BS Computer Science", feePerSemester: 38000 },
      { name: "BS Software Engineering", feePerSemester: 38000 },
      { name: "BS Information Technology", feePerSemester: 38000 }
    ],
    facilities: [
      "Central Library", "Engineering Laboratories", "Computer Labs", "Hostels", "Sports Complex", "Transport", "Wi-Fi Campus"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-07-27", entryTest: "QUEST Pre-Admission Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "QUEST Entry Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh Endowment Fund", "Merit Scholarship"],
    contact: { phone: "+92-244-9370381", email: "registrar@quest.edu.pk", address: "Sakrand Road, Nawabshah, Sindh, Pakistan" },
    rating: 4.7
  },

  // ── Larkana ─────────────────────────────────────────────────
  {
    name: "Shaheed Mohtarma Benazir Bhutto Medical University",
    shortName: "SMBBMU",
    city: "Larkana",
    province: "Sindh",
    sector: "Public",
    ranking: 14,
    website: "https://smbbmu.edu.pk",
    logo: "smbbmu.png",
    image: "smbbmu.jpg",
    description: "SMBBMU Larkana is a public medical university offering MBBS, BDS, Nursing, and Allied Health Sciences in Larkana, Sindh.",
    programs: [
      { name: "Bachelor of Medicine, Bachelor of Surgery (MBBS)", feePerSemester: 30000 },
      { name: "Bachelor of Dental Surgery (BDS)", feePerSemester: 30000 },
      { name: "Doctor of Pharmacy (Pharm-D)", feePerSemester: 60000 },
      { name: "BS Nursing", feePerSemester: 40000 }
    ],
    facilities: [
      "Chandka Medical College Hospital", "Library", "Labs", "Hostels", "Transport", "Cafeteria"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-14", entryTest: "MDCAT" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "MDCAT" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh SEEF Scholarship"],
    contact: { phone: "+92-74-9410715", email: "info@smbbmu.edu.pk", address: "Mohenjo-Daro Road, Larkana, Sindh, Pakistan" },
    rating: 4.6
  },

  // ── Mirpurkhas ──────────────────────────────────────────────
  {
    name: "University of Sindh Mirpurkhas Campus",
    shortName: "UoS Mirpurkhas",
    city: "Mirpurkhas",
    province: "Sindh",
    sector: "Public",
    ranking: 20,
    website: "https://usindh.edu.pk/mirpurkhas",
    logo: "uos.png",
    image: "uos.jpg",
    description: "University of Sindh Mirpurkhas Campus offers quality undergraduate degree programs in IT, Computer Science, Business, and Commerce.",
    programs: [
      { name: "BS Computer Science", feePerSemester: 32000 },
      { name: "BS Information Technology", feePerSemester: 32000 },
      { name: "BBA", feePerSemester: 35000 },
      { name: "BS Commerce", feePerSemester: 28000 }
    ],
    facilities: [
      "Library", "Computer Labs", "Transport", "Cafeteria", "Sports Ground"
    ],
    admissionStatus: { isOpen: true, lastDate: "2026-08-10", entryTest: "UoS Entrance Test" },
    admissionCriteria: { matricPercentage: 10, fscPercentage: 40, entryTestPercentage: 50, entryTest: "UoS Entry Test" },
    scholarships: ["HEC Need-Based Scholarship", "Sindh Endowment Fund"],
    contact: { phone: "+92-233-9290351", email: "mirpurkhas@usindh.edu.pk", address: "Mirpurkhas, Sindh, Pakistan" },
    rating: 4.3
  }
];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  console.log('Connecting to MongoDB ...');
  await mongoose.connect(uri);

  let insertedCount = 0;
  for (const doc of sindhUniversities) {
    await University.deleteMany({
      $or: [
        { shortName: doc.shortName },
        { name: doc.name }
      ]
    });

    await University.create(doc);
    insertedCount++;
    console.log(` - Saved: ${doc.name} (${doc.shortName}) in ${doc.city}, ${doc.province}`);
  }

  console.log(`\n✅ Successfully inserted/updated ${insertedCount} Sindh university documents across multiple districts!`);

  await mongoose.connection.close();
}

run().catch(console.error);
