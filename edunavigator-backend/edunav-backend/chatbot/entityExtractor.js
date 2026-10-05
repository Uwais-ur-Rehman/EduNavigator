/**
 * EduNavigator Chatbot - Entity Extractor
 * Extracts 13 domain entities (University, Campus, Program, Province, City, Budget, Sector, Scholarship, Hostel, Ranking, Deadline, Admission Status, Fee)
 */
const University = require('../models/University');
const cache = require('./cache');

const UNIVERSITY_ALIASES = {
  'fast': 'FAST',
  'fast-nuces': 'FAST',
  'nuces': 'FAST',
  'nust': 'NUST',
  'comsats': 'COMSATS',
  'cui': 'COMSATS',
  'imsciences': 'IMSciences',
  'ims': 'IMSciences',
  'uet': 'UET',
  'lums': 'LUMS',
  'iba': 'IBA',
  'pu': 'University of the Punjab',
  'punjab university': 'University of the Punjab',
  'giki': 'GIKI',
  'pieas': 'PIEAS',
  'nutech': 'NUTECH',
  'quaid-i-azam': 'Quaid-i-Azam University',
  'qau': 'Quaid-i-Azam University',
  'ned': 'NED University'
};

const PROGRAM_ALIASES = {
  'bs cs': 'BS Computer Science',
  'bscs': 'BS Computer Science',
  'computer science': 'BS Computer Science',
  'cs': 'BS Computer Science',
  'bs se': 'BS Software Engineering',
  'bsse': 'BS Software Engineering',
  'software engineering': 'BS Software Engineering',
  'se': 'BS Software Engineering',
  'bs ai': 'BS Artificial Intelligence',
  'bsai': 'BS Artificial Intelligence',
  'artificial intelligence': 'BS Artificial Intelligence',
  'ai': 'BS Artificial Intelligence',
  'bs ds': 'BS Data Science',
  'bsds': 'BS Data Science',
  'data science': 'BS Data Science',
  'bs cy': 'BS Cyber Security',
  'cyber security': 'BS Cyber Security',
  'bba': 'BBA',
  'business administration': 'BBA',
  'mba': 'MBA',
  'bs ee': 'BS Electrical Engineering',
  'electrical engineering': 'BS Electrical Engineering',
  'ee': 'BS Electrical Engineering',
  'bs me': 'BS Mechanical Engineering',
  'mechanical engineering': 'BS Mechanical Engineering',
  'bs ce': 'BS Civil Engineering',
  'civil engineering': 'BS Civil Engineering'
};

const PROVINCES = ['punjab', 'sindh', 'kpk', 'khyber pakhtunkhwa', 'kp', 'balochistan', 'islamabad'];
const CITIES = ['islamabad', 'lahore', 'karachi', 'peshawar', 'rawalpindi', 'faisalabad', 'multan', 'quetta', 'hyderabad', 'sukkur', 'taxila', 'abbottabad', 'swabi', 'chiniot', 'sahiwal', 'vehari', 'wah cantt'];

async function getEntityIndex() {
  let index = cache.getEntitiesIndex();
  if (index) return index;

  try {
    const unis = await University.find({}, 'name shortName campus city province sector programs.name').lean();
    const uniNames = new Set();
    const campuses = new Set();
    const programs = new Set();
    const cities = new Set();

    unis.forEach(u => {
      if (u.name) uniNames.add(u.name);
      if (u.shortName) uniNames.add(u.shortName);
      if (u.campus) campuses.add(u.campus);
      if (u.city) cities.add(u.city);
      if (u.programs && Array.isArray(u.programs)) {
        u.programs.forEach(p => {
          if (p.name) programs.add(p.name);
        });
      }
    });

    index = {
      unis: Array.from(uniNames),
      campuses: Array.from(campuses),
      programs: Array.from(programs),
      cities: Array.from(cities)
    };

    cache.setEntitiesIndex(index);
    return index;
  } catch (err) {
    console.error('⚠️ [EntityExtractor] DB index build error:', err.message);
    return { unis: [], campuses: [], programs: [], cities: [] };
  }
}

async function extractEntities(query) {
  if (!query) return {};
  const lower = query.toLowerCase();

  const entities = {
    university: null,
    campus: null,
    program: null,
    province: null,
    city: null,
    budget: null,
    sector: null,
    scholarship: false,
    hostel: false,
    ranking: false,
    deadline: false,
    admissionStatus: false,
    fee: false
  };

  // 1. Extract University (alias check first)
  for (const [alias, fullName] of Object.entries(UNIVERSITY_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(lower)) {
      entities.university = fullName;
      break;
    }
  }

  const index = await getEntityIndex();

  if (!entities.university) {
    for (const name of index.unis) {
      const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower)) {
        entities.university = name;
        break;
      }
    }
  }

  // 2. Extract Program
  for (const [alias, fullName] of Object.entries(PROGRAM_ALIASES)) {
    const regex = new RegExp(`\\b${alias.replace(/\s+/g, '\\s*')}\\b`, 'i');
    if (regex.test(lower)) {
      entities.program = fullName;
      break;
    }
  }

  if (!entities.program) {
    for (const pName of index.programs) {
      if (lower.includes(pName.toLowerCase())) {
        entities.program = pName;
        break;
      }
    }
  }

  // 3. Extract City & Campus
  for (const city of CITIES) {
    if (lower.includes(city)) {
      entities.city = city.charAt(0).toUpperCase() + city.slice(1);
      entities.campus = entities.city;
      break;
    }
  }

  // 4. Extract Province
  for (const prov of PROVINCES) {
    if (lower.includes(prov)) {
      entities.province = (prov === 'kpk' || prov === 'kp') ? 'KPK' : prov.charAt(0).toUpperCase() + prov.slice(1);
      break;
    }
  }

  // 5. Extract Sector
  if (/\bpublic\b/i.test(lower)) entities.sector = 'Public';
  if (/\bprivate\b/i.test(lower)) entities.sector = 'Private';

  // 6. Extract Budget (e.g. under 80000, 100000, 1.5 lac)
  const budgetMatch = lower.match(/(?:under|below|max|budget|within|less than)?\s*(\d{5,7})/i);
  if (budgetMatch) {
    entities.budget = parseInt(budgetMatch[1], 10);
  } else {
    const lacMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lac|lakh|k)/i);
    if (lacMatch) {
      const num = parseFloat(lacMatch[1]);
      entities.budget = lower.includes('k') ? num * 1000 : num * 100000;
    }
  }

  // 7. Flags
  if (/\b(scholarship|scholarships|financial aid)\b/i.test(lower)) entities.scholarship = true;
  if (/\b(hostel|accommodation|boarding)\b/i.test(lower)) entities.hostel = true;
  if (/\b(ranking|ranked|rank|hec)\b/i.test(lower)) entities.ranking = true;
  if (/\b(deadline|last date|closing date)\b/i.test(lower)) entities.deadline = true;
  if (/\b(open|admission status|is admission open)\b/i.test(lower)) entities.admissionStatus = true;
  if (/\b(fee|fees|cost|tuition|charges)\b/i.test(lower)) entities.fee = true;

  return entities;
}

module.exports = {
  extractEntities,
  getEntityIndex
};
