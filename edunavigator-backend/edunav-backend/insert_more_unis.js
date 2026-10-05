const mongoose = require('./node_modules/mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uniSchema = new mongoose.Schema({}, { strict: false });
const University = mongoose.model('University', uniSchema, 'universities');

const fastPrograms = [
  { name: "BS Computer Science", feePerSemester: 206500 },
  { name: "BS Software Engineering", feePerSemester: 206500 },
  { name: "BS Artificial Intelligence", feePerSemester: 206500 },
  { name: "BS Data Science", feePerSemester: 206500 },
  { name: "BS Cyber Security", feePerSemester: 206500 },
  { name: "BS Computer Engineering", feePerSemester: 206500 },
  { name: "BS Electrical Engineering", feePerSemester: 206500 },
  { name: "BS Civil Engineering", feePerSemester: 206500 },
  { name: "BBA", feePerSemester: 206500 },
  { name: "BS Accounting & Finance", feePerSemester: 206500 },
  { name: "BS Business Analytics", feePerSemester: 206500 },
  { name: "BS Financial Technology", feePerSemester: 206500 }
];

const fastFacilities = [
  "Hostel", "Transport", "Digital Library", "Computer Labs", "Engineering Labs",
  "AI Research Labs", "Innovation Center", "Sports Complex", "Medical Room",
  "Wi-Fi Campus", "Mosque", "Cafeteria", "Career Services Office"
];

const fastAdmissionStatus = {
  isOpen: true,
  lastDate: "2026-07-25",
  entryTest: "FAST Admission Test / SAT / NTS"
};

const fastAdmissionCriteria = {
  matricPercentage: 10,
  fscPercentage: 50,
  entryTestPercentage: 50,
  entryTest: "FAST Admission Test"
};

const fastScholarships = [
  "Merit Scholarship", "Need Based Financial Assistance", "Interest-Free Student Loan", "Sibling Fee Concession"
];

const newDocs = [
  // ── FAST Campuses ──────────────────────────────────────────
  {
    name: "National University of Computer and Emerging Sciences Lahore",
    shortName: "FAST-NUCES LOH",
    city: "Lahore",
    province: "Punjab",
    sector: "Private",
    ranking: 5,
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    description: "National University of Computer and Emerging Sciences (FAST-NUCES) is one of Pakistan's leading private universities, renowned for excellence in Computer Science, Artificial Intelligence, Software Engineering, Cyber Security, Data Science, Engineering and Business education.",
    programs: fastPrograms,
    facilities: fastFacilities,
    admissionStatus: fastAdmissionStatus,
    admissionCriteria: fastAdmissionCriteria,
    scholarships: fastScholarships,
    contact: {
      phone: "+92-42-111-128-128",
      email: "admissions@nu.edu.pk",
      address: "Block B, Faisal Town, Lahore, Punjab, Pakistan"
    },
    rating: 4.9
  },
  {
    name: "National University of Computer and Emerging Sciences Faisalabad",
    shortName: "FAST-NUCES FSD",
    city: "Faisalabad",
    province: "Punjab",
    sector: "Private",
    ranking: 5,
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    description: "National University of Computer and Emerging Sciences (FAST-NUCES) is one of Pakistan's leading private universities, renowned for excellence in Computer Science, Artificial Intelligence, Software Engineering, Cyber Security, Data Science, Engineering and Business education.",
    programs: fastPrograms,
    facilities: fastFacilities,
    admissionStatus: fastAdmissionStatus,
    admissionCriteria: fastAdmissionCriteria,
    scholarships: fastScholarships,
    contact: {
      phone: "+92-41-111-128-128",
      email: "admissions@nu.edu.pk",
      address: "Chiniot-Faisalabad Road, Faisalabad, Punjab, Pakistan"
    },
    rating: 4.9
  },
  {
    name: "National University of Computer and Emerging Sciences Multan",
    shortName: "FAST-NUCES MUX",
    city: "Multan",
    province: "Punjab",
    sector: "Private",
    ranking: 5,
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    description: "National University of Computer and Emerging Sciences (FAST-NUCES) is one of Pakistan's leading private universities, renowned for excellence in Computer Science, Artificial Intelligence, Software Engineering, Cyber Security, Data Science, Engineering and Business education.",
    programs: fastPrograms,
    facilities: fastFacilities,
    admissionStatus: fastAdmissionStatus,
    admissionCriteria: fastAdmissionCriteria,
    scholarships: fastScholarships,
    contact: {
      phone: "+92-61-111-128-128",
      email: "admissions@nu.edu.pk",
      address: "Bosan Road, Multan, Punjab, Pakistan"
    },
    rating: 4.9
  },
  {
    name: "National University of Computer and Emerging Sciences Karachi",
    shortName: "FAST-NUCES KHI",
    city: "Karachi",
    province: "Sindh",
    sector: "Private",
    ranking: 5,
    website: "https://www.nu.edu.pk",
    logo: "fast.png",
    image: "fast.jpg",
    description: "National University of Computer and Emerging Sciences (FAST-NUCES) is one of Pakistan's leading private universities, renowned for excellence in Computer Science, Artificial Intelligence, Software Engineering, Cyber Security, Data Science, Engineering and Business education.",
    programs: fastPrograms,
    facilities: fastFacilities,
    admissionStatus: fastAdmissionStatus,
    admissionCriteria: fastAdmissionCriteria,
    scholarships: fastScholarships,
    contact: {
      phone: "+92-21-111-128-128",
      email: "admissions@nu.edu.pk",
      address: "ST-4, Sector 17-D, Shah Latif Town, National Highway, Karachi, Sindh, Pakistan"
    },
    rating: 4.9
  },

  // ── Aga Khan University ────────────────────────────────────
  {
    name: "Aga Khan University",
    shortName: "AKU",
    sector: "Private",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1983,
    website: "https://www.aku.edu",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/6d/Aga_Khan_University_logo.svg",
    image: "https://www.aku.edu/about/PublishingImages/Pages/default/aku-karachi-campus.jpg",
    description: "Aga Khan University (AKU) is one of Pakistan's leading private research universities. Established by the Aga Khan Development Network, AKU is internationally recognized for excellence in medical education, nursing, health sciences, education, and research.",
    admissionStatus: { isOpen: true, lastDate: "2027-03-15", entryTest: "AKU Entry Test / MDCAT" },
    programs: [
      { name: "Bachelor of Studies in Arts and Sciences (BS)", feePerSemester: 1062000 },
      { name: "Associate of Science in Dental Hygiene (ASDH)", feePerSemester: 1062000 },
      { name: "Post-RN Bachelor of Science in Nursing (BScN)", feePerSemester: 1062000 },
      { name: "Bachelor of Science in Nursing (BScN)", feePerSemester: 1062000 },
      { name: "Post-RM Bachelor of Science in Midwifery (BScM)", feePerSemester: 1062000 },
      { name: "Bachelor of Education (BEd)", feePerSemester: 1062000 }
    ],
    facilities: [
      "University Hospital", "Medical Simulation Center", "Central Library", "Digital Library",
      "Research Laboratories", "Clinical Skills Center", "Computer Labs", "Hostels (Boys & Girls)",
      "Sports Facilities", "Medical Center", "Transport Service", "Cafeteria", "Prayer Area", "Wi-Fi Enabled Campus"
    ],
    scholarships: [
      "Need-Based Financial Assistance", "Merit Scholarships", "AKU Financial Aid", "International Scholarships", "Research Grants"
    ],
    contact: {
      phone: "+92-21-34861000",
      email: "admissions@aku.edu",
      address: "Stadium Road, Karachi, Sindh, Pakistan"
    },
    rating: 4.9
  },

  // ── University of Karachi ──────────────────────────────────
  {
    name: "University of Karachi",
    shortName: "UoK",
    sector: "Public",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1951,
    website: "https://uok.edu.pk",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/8c/University_of_Karachi_logo.png",
    image: "https://uok.edu.pk/images/slider/slider1.jpg",
    description: "The University of Karachi (UoK) is one of Pakistan's largest and oldest public research universities. Established in 1951, it offers undergraduate, graduate, and postgraduate programs in computing, engineering, management sciences, natural sciences, social sciences, arts, education, law, pharmacy, and Islamic studies.",
    admissionStatus: { isOpen: true, lastDate: "2026-07-10", entryTest: "UoK Entrance Test" },
    programs: [
      { name: "BS Computer Science", feePerSemester: 94500 },
      { name: "BS Software Engineering", feePerSemester: 94500 },
      { name: "BS Artificial Intelligence", feePerSemester: 99000 },
      { name: "BS Applied Physics", feePerSemester: 42000 },
      { name: "BS Physics", feePerSemester: 42000 },
      { name: "BS Mathematics", feePerSemester: 42000 },
      { name: "BS Statistics", feePerSemester: 42000 },
      { name: "BS Botany", feePerSemester: 42000 },
      { name: "BS Zoology", feePerSemester: 42000 },
      { name: "BS Genetics", feePerSemester: 42000 },
      { name: "BS Environmental Studies", feePerSemester: 76000 },
      { name: "BS Agriculture & Agribusiness Management", feePerSemester: 86000 },
      { name: "Doctor of Physical Therapy (DPT)", feePerSemester: 223000 }
    ],
    facilities: [
      "Central Library", "Digital Library", "Computer Labs", "Science Laboratories", "Research Centers",
      "Hostels (Boys & Girls)", "Sports Complex", "Medical Center", "Transport Service", "Cafeterias", "Mosque", "Wi-Fi Enabled Campus"
    ],
    scholarships: [
      "HEC Need-Based Scholarship", "Sindh Educational Endowment Fund", "Merit Scholarships", "PEEF Scholarship"
    ],
    contact: {
      phone: "+92-21-99261300",
      email: "registrar@uok.edu.pk",
      address: "University Road, Karachi, Sindh, Pakistan"
    },
    rating: 4.6
  },

  // ── NED University ──────────────────────────────────────────
  {
    name: "NED University of Engineering and Technology",
    shortName: "NEDUET",
    sector: "Public",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1921,
    website: "https://www.neduet.edu.pk",
    logo: "https://www.neduet.edu.pk/sites/default/files/NED-logo.png",
    image: "https://www.neduet.edu.pk/sites/default/files/styles/slider/public/2024-01/main-building.jpg",
    description: "NED University of Engineering and Technology is one of Pakistan's oldest and most prestigious public engineering universities. Established in 1921, the university offers undergraduate and postgraduate programs in engineering, computing, architecture, natural sciences, and applied technologies.",
    admissionStatus: { isOpen: true, lastDate: "2026-07-03", entryTest: "NED Entry Test" },
    programs: [
      { name: "BE Civil Engineering", feePerSemester: 38000 },
      { name: "BE Electrical Engineering", feePerSemester: 38000 },
      { name: "BE Mechanical Engineering", feePerSemester: 38000 },
      { name: "BE Chemical Engineering", feePerSemester: 38000 },
      { name: "BS Computer Science", feePerSemester: 38000 },
      { name: "BS Software Engineering", feePerSemester: 38000 },
      { name: "BS Artificial Intelligence", feePerSemester: 46000 },
      { name: "BS Data Science", feePerSemester: 46000 },
      { name: "BS Cyber Security", feePerSemester: 46000 }
    ],
    facilities: [
      "Central Library", "Digital Library", "Computer Laboratories", "Engineering Laboratories", "Research Centers",
      "Hostels (Boys & Girls)", "Sports Complex", "Medical Center", "Transport Service", "Mosque", "Cafeterias", "Wi-Fi Enabled Campus"
    ],
    scholarships: [
      "HEC Need-Based Scholarship", "Merit Scholarships", "PEEF Scholarship", "Financial Assistance Program"
    ],
    contact: {
      phone: "+92-21-99261261",
      email: "registrar@neduet.edu.pk",
      address: "University Road, Karachi-75270, Sindh, Pakistan"
    },
    rating: 4.8
  },

  // ── IBA Karachi ─────────────────────────────────────────────
  {
    name: "Institute of Business Administration",
    shortName: "IBA Karachi",
    sector: "Public",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1955,
    website: "https://www.iba.edu.pk",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/84/Institute_of_Business_Administration%2C_Karachi_logo.png",
    image: "https://www.iba.edu.pk/assets/images/main-campus.jpg",
    description: "The Institute of Business Administration (IBA) Karachi is Pakistan's oldest business school and one of the country's leading public universities. It offers undergraduate, graduate, and doctoral programs in business administration, accounting, economics, computer science, artificial intelligence, and social sciences.",
    admissionStatus: { isOpen: true, lastDate: "2026-06-17", entryTest: "IBA Admission Test" },
    programs: [
      { name: "BBA", feePerSemester: 574000 },
      { name: "BS Accounting & Finance", feePerSemester: 574000 },
      { name: "BS Business Analytics", feePerSemester: 574000 },
      { name: "BS Computer Science", feePerSemester: 542500 },
      { name: "BS Economics", feePerSemester: 448000 },
      { name: "BS Mathematics", feePerSemester: 448000 },
      { name: "BS Social Sciences & Liberal Arts", feePerSemester: 448000 }
    ],
    facilities: [
      "Main Campus", "City Campus", "Digital Library", "Computer Laboratories", "Innovation Center",
      "Hostels", "Sports Complex", "Medical Centre", "Transport Service", "Auditorium", "Mosque", "Cafeterias", "Wi-Fi Campus"
    ],
    scholarships: [
      "IBA Financial Assistance", "Need-Based Scholarship", "Merit Scholarship", "HEC Need-Based Scholarship", "PEEF Scholarship"
    ],
    contact: {
      phone: "+92-21-38104700",
      email: "admissions@iba.edu.pk",
      address: "University Road, Karachi, Sindh, Pakistan"
    },
    rating: 4.9
  },

  // ── Dow University of Health Sciences ───────────────────────
  {
    name: "Dow University of Health Sciences",
    shortName: "DUHS",
    sector: "Public",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 2003,
    website: "https://www.duhs.edu.pk",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/72/Dow_University_of_Health_Sciences_logo.png",
    image: "https://www.duhs.edu.pk/new/images/slider/ojha-campus.jpg",
    description: "Dow University of Health Sciences (DUHS) is one of Pakistan's leading public medical universities. Located in Karachi, it offers undergraduate and postgraduate programs in medicine, dentistry, pharmacy, nursing, allied health sciences, biomedical engineering, and public health.",
    admissionStatus: { isOpen: true, lastDate: "2026-08-18", entryTest: "DUHS Entry Test / MDCAT" },
    programs: [
      { name: "Bachelor of Medicine, Bachelor of Surgery (MBBS)", feePerSemester: 24000 },
      { name: "Bachelor of Dental Surgery (BDS)", feePerSemester: 24000 },
      { name: "Doctor of Pharmacy (Pharm-D)", feePerSemester: 175000 },
      { name: "Bachelor of Science in Nursing (BSN)", feePerSemester: 86477 },
      { name: "Doctor of Physical Therapy (DPT)", feePerSemester: 75000 },
      { name: "BS Medical Laboratory Technology", feePerSemester: 75000 },
      { name: "BS Biotechnology", feePerSemester: 75000 },
      { name: "BS Biomedical Engineering", feePerSemester: 75000 }
    ],
    facilities: [
      "Central Library", "Digital Library", "Medical Laboratories", "Clinical Skills Lab", "Simulation Center",
      "Teaching Hospitals", "Sports Complex", "Student Cafeterias", "Hostels (Boys & Girls)", "Transport Service", "Wi-Fi Enabled Campus"
    ],
    scholarships: [
      "HEC Need-Based Scholarship", "Merit Scholarship", "Sindh Educational Endowment Fund (SEEF)", "Ehsaas Undergraduate Scholarship"
    ],
    contact: {
      phone: "+92-21-99215754",
      email: "admissions@duhs.edu.pk",
      address: "Baba-e-Urdu Road, Karachi, Sindh, Pakistan"
    },
    rating: 4.8
  },

  // ── Habib University ────────────────────────────────────────
  {
    name: "Habib University",
    shortName: "HU",
    sector: "Private",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 2014,
    website: "https://habib.edu.pk",
    logo: "https://habib.edu.pk/wp-content/uploads/2022/09/Habib-University-Logo.png",
    image: "https://habib.edu.pk/wp-content/uploads/2023/04/Habib-University-Campus.jpg",
    description: "Habib University is a leading private liberal arts and sciences university located in Karachi, Pakistan. It is known for its interdisciplinary curriculum, project-based learning, undergraduate research, and emphasis on critical thinking.",
    admissionStatus: { isOpen: true, lastDate: "2026-07-17", entryTest: "Habib Entrance Test" },
    programs: [
      { name: "BS Computer Science", feePerSemester: 995000 },
      { name: "BS Electrical Engineering", feePerSemester: 995000 },
      { name: "BS Computer Engineering", feePerSemester: 995000 },
      { name: "BA (Honors) Communication & Design", feePerSemester: 940000 },
      { name: "BA (Honors) Comparative Humanities", feePerSemester: 940000 },
      { name: "BSc (Honors) Social Development & Policy", feePerSemester: 940000 }
    ],
    facilities: [
      "Digital Library", "Learning Commons", "Computer Laboratories", "Engineering Laboratories", "Maker Space",
      "Fabrication Lab", "Auditorium", "Sports Complex", "Student Lounges", "Medical Center", "Cafeteria", "Wi-Fi Enabled Campus"
    ],
    scholarships: [
      "Habib University Talent Scholarship", "Need-Based Financial Assistance", "Merit Scholarship", "Sindh Talent Scholarship"
    ],
    contact: {
      phone: "+92-21-111-042-242",
      email: "admissions@habib.edu.pk",
      address: "Block 18, Gulistan-e-Jauhar, University Road, Karachi, Sindh, Pakistan"
    },
    rating: 4.8
  },

  // ── Iqra University ─────────────────────────────────────────
  {
    name: "Iqra University",
    shortName: "IU",
    sector: "Private",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1998,
    website: "https://iqra.edu.pk",
    logo: "https://iqra.edu.pk/wp-content/uploads/2023/08/Iqra-University-Logo.png",
    image: "https://iqra.edu.pk/wp-content/uploads/2023/09/Main-Campus-Karachi.jpg",
    description: "Iqra University is one of Pakistan's leading private universities with its main campus in Karachi. It offers undergraduate and postgraduate programs in computing, engineering, business administration, media sciences, education, social sciences, and health sciences.",
    admissionStatus: { isOpen: true, lastDate: "2026-07-15", entryTest: "IU Entrance Test" },
    programs: [
      { name: "BS Computer Science", feePerSemester: 93600 },
      { name: "BS Software Engineering", feePerSemester: 93600 },
      { name: "BS Artificial Intelligence", feePerSemester: 93600 },
      { name: "BBA (Hons.)", feePerSemester: 77000 },
      { name: "BS Accounting & Finance", feePerSemester: 66892 },
      { name: "Doctor of Physical Therapy (DPT)", feePerSemester: 123660 },
      { name: "Doctor of Pharmacy (Pharm-D)", feePerSemester: 135000 }
    ],
    facilities: [
      "Central Library", "Digital Library", "Modern Computer Labs", "Engineering Laboratories", "AI & Robotics Lab",
      "Media Production Studios", "Smart Classrooms", "Wi-Fi Enabled Campus", "Sports Complex", "Medical Centre", "Cafeteria"
    ],
    scholarships: [
      "Merit Scholarship", "Need-Based Financial Assistance", "HEC Need-Based Scholarship", "Sibling Fee Concession"
    ],
    contact: {
      phone: "+92-21-111-264-264",
      email: "admissions@iqra.edu.pk",
      address: "Defense View, Shaheed-e-Millat Road Extension, Karachi, Sindh, Pakistan"
    },
    rating: 4.6
  },

  // ── SZABIST ─────────────────────────────────────────────────
  {
    name: "Shaheed Zulfikar Ali Bhutto Institute of Science and Technology",
    shortName: "SZABIST",
    sector: "Private",
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
    established: 1995,
    website: "https://www.szabist.edu.pk",
    logo: "https://www.szabist.edu.pk/wp-content/uploads/2022/09/SZABIST-Logo.png",
    image: "https://www.szabist.edu.pk/wp-content/uploads/2023/06/SZABIST-Karachi-Campus.jpg",
    description: "Shaheed Zulfikar Ali Bhutto Institute of Science and Technology (SZABIST) is one of Pakistan's leading private universities. The Karachi campus offers undergraduate, graduate and doctoral programs in computing, engineering, business administration, media sciences, and biosciences.",
    admissionStatus: { isOpen: true, lastDate: "2026-07-22", entryTest: "SZABIST Admission Test" },
    programs: [
      { name: "BS Computer Science", feePerSemester: 193000 },
      { name: "BS Software Engineering", feePerSemester: 193000 },
      { name: "BS Artificial Intelligence", feePerSemester: 193000 },
      { name: "BS Accounting & Finance", feePerSemester: 180000 },
      { name: "BS Entrepreneurship", feePerSemester: 180000 },
      { name: "BS Business Analytics", feePerSemester: 180000 },
      { name: "BS Food Science & Technology", feePerSemester: 180000 },
      { name: "BS Biotechnology", feePerSemester: 180000 }
    ],
    facilities: [
      "Digital Library", "Central Library", "Modern Computer Labs", "Engineering Laboratories", "AI & Robotics Lab",
      "Business Incubation Center", "Research Centers", "Media Production Studio", "Smart Classrooms", "Wi-Fi Enabled Campus", "Cafeteria"
    ],
    scholarships: [
      "Merit Scholarship", "Need-Based Financial Assistance", "HEC Need-Based Scholarship", "SZABIST Alumni Scholarship"
    ],
    contact: {
      phone: "+92-21-35824411",
      email: "admissions@szabist.edu.pk",
      address: "Block 5, Clifton, Karachi, Sindh, Pakistan"
    },
    rating: 4.7
  }
];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edunavigator';
  console.log('Connecting to MongoDB ...');
  await mongoose.connect(uri);

  let insertedCount = 0;
  for (const doc of newDocs) {
    // Delete pre-existing record with same shortName or name to prevent duplicates
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

  console.log(`\n✅ Successfully inserted/updated ${insertedCount} university documents in MongoDB!`);

  await mongoose.connection.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
