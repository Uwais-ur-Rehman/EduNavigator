const University = require('../models/University');
const { computeAdmissionStatus } = require('./admission.controller');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/universities/provinces
 * Returns distinct provinces present in MongoDB universities collection
 */
exports.getProvinces = async (req, res, next) => {
  try {
    const rawProvinces = await University.distinct('province');
    const cleanProvinces = Array.from(
      new Set(rawProvinces.filter(Boolean).map(p => p.trim()))
    ).sort();
    res.json({ success: true, provinces: cleanProvinces });
  } catch (e) { next(e); }
};

/**
 * GET /api/universities/cities
 * Query params: ?province=...
 * Uses Mongoose University.distinct("city", { province: selectedProvince })
 */
exports.getCities = async (req, res, next) => {
  try {
    const { province } = req.query;
    const filter = {};

    if (province && province.trim()) {
      filter.province = { $regex: new RegExp(`^${escapeRegex(province.trim())}$`, 'i') };
    }

    const rawCities = await University.distinct('city', filter);
    const cleanCities = Array.from(
      new Set(rawCities.filter(Boolean).map(c => c.trim()))
    ).sort();

    res.json({
      success: true,
      count: cleanCities.length,
      cities: cleanCities,
    });
  } catch (e) { next(e); }
};

/**
 * Category Metadata Dictionary
 */
const CATEGORY_META = [
  { name: 'Computer Science & IT', icon: 'bi-cpu', description: 'Explore computer science, software engineering, AI & IT institutes.', pattern: /Computer|Computing|Software|Information Technology|CS|Artificial Intelligence|Data Science/i },
  { name: 'Engineering & Technology', icon: 'bi-gear-fill', description: 'Discover PEC accredited engineering and technology universities.', pattern: /Engineering|Technology/i },
  { name: 'Medicine & Health Sciences', icon: 'bi-heart-pulse-fill', description: 'Explore medical universities, dental colleges and health science institutes.', pattern: /Medical|Medicine|Health|Nursing|Pharmacy|Dental|MBBS|DPT/i },
  { name: 'Business & Management', icon: 'bi-briefcase-fill', description: 'Leading business schools, BBA, MBA and management programs.', pattern: /Business|Management|BBA|MBA|Commerce|Finance|Accounting/i },
  { name: 'Agriculture', icon: 'bi-tree-fill', description: 'Agricultural universities, veterinary, and animal sciences.', pattern: /Agriculture|Veterinary|Animal|Crop/i },
  { name: 'Arts & Humanities', icon: 'bi-palette-fill', description: 'Explore fine arts, architecture, communication, and humanities.', pattern: /Arts|Humanities|Languages|Literature/i },
  { name: 'Social Sciences', icon: 'bi-book-half', description: 'Economics, psychology, international relations, and policy studies.', pattern: /Social|Economics|Psychology|International Relations/i },
  { name: 'Natural Sciences', icon: 'bi-flower1', description: 'Physics, chemistry, mathematics, and biological sciences.', pattern: /Natural|Physics|Chemistry|Math|Biological|Biotech/i },
  { name: 'Law', icon: 'bi-shield-check', description: 'Top law schools and LLB degree programs in Pakistan.', pattern: /Law|LLB/i },
  { name: 'Education', icon: 'bi-mortarboard-fill', description: 'Teacher training, educational leadership and research.', pattern: /Education|Teaching/i },
  { name: 'Islamic Studies', icon: 'bi-moon-stars-fill', description: 'Islamic jurisprudence, theology and religious studies.', pattern: /Islamic|Religious/i },
  { name: 'Fine Arts & Design', icon: 'bi-brush-fill', description: 'Design studios, visual arts and creative media institutes.', pattern: /Design|Fine Arts|Architecture/i }
];

function buildCategoryFilter(categoryName) {
  if (!categoryName) return null;
  const trimmed = categoryName.trim();
  const found = CATEGORY_META.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
  const pattern = found ? found.pattern : new RegExp(escapeRegex(trimmed), 'i');

  return {
    $or: [
      { category: { $regex: pattern } },
      { type: { $regex: pattern } },
      { 'programs.faculty': { $regex: pattern } },
      { 'programs.name': { $regex: pattern } },
      { 'programs.department': { $regex: pattern } }
    ]
  };
}

/**
 * GET /api/universities/categories
 * Dynamically computes university categories and counts from MongoDB
 */
exports.getCategories = async (req, res, next) => {
  try {
    const allUnis = await University.find({});

    // Dynamic distinct categories from DB
    const dbCategories = new Set();
    allUnis.forEach(u => {
      if (u.category) dbCategories.add(u.category.trim());
      if (u.type) dbCategories.add(u.type.trim());
      (u.programs || []).forEach(p => {
        if (p.faculty) dbCategories.add(p.faculty.trim());
      });
    });

    const categoryList = [];

    // First process predefined standard categories
    for (const meta of CATEGORY_META) {
      const matchingCount = allUnis.filter(u => {
        const catMatch = u.category && meta.pattern.test(u.category);
        const typeMatch = u.type && meta.pattern.test(u.type);
        const progMatch = (u.programs || []).some(p => 
          (p.faculty && meta.pattern.test(p.faculty)) ||
          (p.name && meta.pattern.test(p.name)) ||
          (p.department && meta.pattern.test(p.department))
        );
        return catMatch || typeMatch || progMatch || u.type === 'General';
      }).length;

      categoryList.push({
        name: meta.name,
        icon: meta.icon,
        description: meta.description,
        count: matchingCount > 0 ? matchingCount : allUnis.length
      });
    }

    // Include any custom categories in DB not covered by preset list
    dbCategories.forEach(dbCat => {
      if (!dbCat || dbCat === 'General') return;
      const exists = categoryList.some(c => c.name.toLowerCase() === dbCat.toLowerCase());
      if (!exists) {
        const pattern = new RegExp(escapeRegex(dbCat), 'i');
        const count = allUnis.filter(u => 
          (u.category && pattern.test(u.category)) ||
          (u.type && pattern.test(u.type)) ||
          (u.programs || []).some(p => p.faculty && pattern.test(p.faculty))
        ).length;

        categoryList.push({
          name: dbCat,
          icon: 'bi-mortarboard-fill',
          description: `Explore universities specializing in ${dbCat}.`,
          count: count > 0 ? count : 1
        });
      }
    });

    res.json({ success: true, count: categoryList.length, categories: categoryList });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { search, city, province, sector, type, category, sort = '-rating', page = 1, limit = 50 } = req.query;
    const q = {};

    if (search) {
      const sRegex = new RegExp(escapeRegex(search.trim()), 'i');
      q.$or = [
        { name: sRegex },
        { shortName: sRegex },
        { city: sRegex },
        { province: sRegex },
        { description: sRegex }
      ];
    }

    if (city && city !== 'All Cities') {
      q.city = { $regex: new RegExp(`^${escapeRegex(city.trim())}$`, 'i') };
    }

    if (province && province !== 'All Provinces') {
      q.province = { $regex: new RegExp(`^${escapeRegex(province.trim())}$`, 'i') };
    }

    if (sector && sector !== 'All Sectors') {
      q.sector = { $regex: new RegExp(`^${escapeRegex(sector.trim())}$`, 'i') };
    }

    if (type && type !== 'All Fields') {
      q.type = { $regex: new RegExp(`^${escapeRegex(type.trim())}$`, 'i') };
    }

    if (category && category.trim()) {
      const catFilter = buildCategoryFilter(category);
      if (catFilter) {
        if (q.$or) {
          // Combine search $or and category $or using $and
          const searchOr = q.$or;
          delete q.$or;
          q.$and = [{ $or: searchOr }, catFilter];
        } else {
          Object.assign(q, catFilter);
        }
      }
    }

    const skip = (page - 1) * limit;
    const [rawItems, total] = await Promise.all([
      University.find(q).sort(sort).skip(+skip).limit(+limit),
      University.countDocuments(q),
    ]);

    const items = rawItems.map(u => {
      const uObj = u.toObject();
      if (uObj.admissionStatus) {
        const statusInfo = computeAdmissionStatus(uObj.admissionStatus.lastDate);
        uObj.admissionStatus.status = statusInfo.status;
        uObj.admissionStatus.remainingDays = statusInfo.remainingDays;
        uObj.admissionStatus.isLastDay = statusInfo.isLastDay;
        uObj.admissionStatus.diffDays = statusInfo.diffDays;
      }
      return uObj;
    });

    res.json({ success: true, total, page: +page, items });
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const u = await University.findById(req.params.id);
    if (!u) return res.status(404).json({ success: false, message: 'University not found' });
    
    const uObj = u.toObject();
    if (uObj.admissionStatus) {
      const statusInfo = computeAdmissionStatus(uObj.admissionStatus.lastDate);
      uObj.admissionStatus.status = statusInfo.status;
      uObj.admissionStatus.remainingDays = statusInfo.remainingDays;
      uObj.admissionStatus.isLastDay = statusInfo.isLastDay;
      uObj.admissionStatus.diffDays = statusInfo.diffDays;
    }
    
    res.json({ success: true, university: uObj });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, university: await University.create(req.body) }); }
  catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const u = await University.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, university: u });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try { await University.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { next(e); }
};
