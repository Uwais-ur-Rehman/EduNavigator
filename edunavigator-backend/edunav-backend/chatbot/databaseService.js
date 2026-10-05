/**
 * EduNavigator Chatbot - Database Service
 * Single Source of Truth: Queries MongoDB University collection strictly.
 * Implements Campus Disambiguation when multiple campuses exist and user hasn't specified one.
 */
const University = require('../models/University');
const { semanticMatchProgram, semanticMatchUniversity } = require('./semanticSearch');

/**
 * Main query executor.
 */
async function queryDatabase(intent, entities) {
  try {
    switch (intent) {
      case 'Greetings':
        return { type: 'greeting' };

      case 'University Information':
        return await handleUniversityInfoQuery(entities);

      case 'Program Availability':
        return await handleProgramAvailabilityQuery(entities);

      case 'Fee Queries':
        return await handleFeeQuery(entities);

      case 'Admission Queries':
        return await handleAdmissionQuery(entities);

      case 'Scholarships':
        return await handleScholarshipQuery(entities);

      case 'Hostel':
        return await handleHostelQuery(entities);

      case 'Facilities':
        return await handleFacilitiesQuery(entities);

      case 'Recommendations':
        return await handleRecommendationQuery(entities);

      case 'Comparison':
        return await handleComparisonQuery(entities);

      case 'Campus Information':
        return await handleCampusInfoQuery(entities);

      case 'Contact Information':
        return await handleContactInfoQuery(entities);

      default:
        return await handleUniversityInfoQuery(entities);
    }
  } catch (err) {
    console.error('❌ [DatabaseService] MongoDB query error:', err.message);
    return null;
  }
}

/**
 * Checks for multi-campus disambiguation if university name is given without campus/city.
 */
async function checkCampusDisambiguation(uniName, specifiedCampus) {
  if (!uniName || specifiedCampus) return null;

  const matches = await University.find({
    $or: [
      { name: new RegExp(`^${escapeRegex(uniName)}`, 'i') },
      { shortName: new RegExp(`^${escapeRegex(uniName)}`, 'i') },
      { name: new RegExp(escapeRegex(uniName), 'i') },
      { shortName: new RegExp(escapeRegex(uniName), 'i') }
    ]
  }).lean();

  if (matches.length > 1) {
    const campusList = matches.map(u => u.campus || u.city).filter(Boolean);
    const uniqueCampuses = Array.from(new Set(campusList));
    if (uniqueCampuses.length > 1) {
      return {
        type: 'campus_disambiguation',
        universityName: uniName,
        campuses: uniqueCampuses
      };
    }
  }
  return null;
}

/**
 * 1. University Information Query
 */
async function handleUniversityInfoQuery(entities) {
  if (!entities.university) return null;

  const unis = await findUniversitiesByEntity(entities);
  if (!unis || unis.length === 0) return { type: 'not_found', entity: entities.university };

  return {
    type: 'university_info',
    university: unis[0],
    entities
  };
}

/**
 * 2. Program Availability Query
 */
async function handleProgramAvailabilityQuery(entities) {
  if (!entities.university) {
    if (entities.program) {
      const unis = await University.find({ 'programs.name': new RegExp(entities.program, 'i') }).lean();
      if (unis.length > 0) return { type: 'program_universities_list', program: entities.program, universities: unis };
    }
    return null;
  }

  // Campus Disambiguation Check
  const disambiguation = await checkCampusDisambiguation(entities.university, entities.campus || entities.city);
  if (disambiguation) return disambiguation;

  const unis = await findUniversitiesByEntity(entities);
  if (!unis || unis.length === 0) return { type: 'not_found', entity: entities.university };

  const targetUni = unis[0];
  if (!targetUni.programs || targetUni.programs.length === 0) {
    return { type: 'program_availability', university: targetUni, available: false, programName: entities.program };
  }

  if (entities.program) {
    const matchedProg = await semanticMatchProgram(entities.program, targetUni.programs);
    return {
      type: 'program_availability',
      university: targetUni,
      available: !!matchedProg,
      program: matchedProg,
      programName: entities.program
    };
  }

  // If query asks if university provides/offers something that is not a known program in MongoDB
  if (entities.userQuery && /\b(does|is|provide|offer|free|laptop|laptops)\b/i.test(entities.userQuery)) {
    return { type: 'not_found' };
  }

  return { type: 'university_programs_list', university: targetUni, programs: targetUni.programs };
}

/**
 * 3. Fee Query
 */
async function handleFeeQuery(entities) {
  if (!entities.university) {
    // Recommendation by budget if budget specified without uni
    if (entities.budget || entities.program) {
      return await handleRecommendationQuery(entities);
    }
    return null;
  }

  // Campus Disambiguation Check
  const disambiguation = await checkCampusDisambiguation(entities.university, entities.campus || entities.city);
  if (disambiguation) return disambiguation;

  const unis = await findUniversitiesByEntity(entities);
  if (!unis || unis.length === 0) return { type: 'not_found', entity: entities.university };

  const targetUni = unis[0];
  if (entities.program && targetUni.programs) {
    const matchedProg = await semanticMatchProgram(entities.program, targetUni.programs);
    if (matchedProg) {
      return { type: 'program_fee_detail', university: targetUni, program: matchedProg };
    }
  }

  return { type: 'university_fee_list', university: targetUni, programs: targetUni.programs || [] };
}

/**
 * 4. Admission Query
 */
async function handleAdmissionQuery(entities) {
  if (entities.university) {
    const disambiguation = await checkCampusDisambiguation(entities.university, entities.campus || entities.city);
    if (disambiguation) return disambiguation;

    const unis = await findUniversitiesByEntity(entities);
    if (unis && unis.length > 0) return { type: 'admission_detail', university: unis[0] };
    return { type: 'not_found', entity: entities.university };
  }

  const allUnis = await University.find({ admissionStatus: { $exists: true } }).lean();
  return { type: 'open_admissions_list', universities: allUnis };
}

/**
 * 5. Scholarship Query
 */
async function handleScholarshipQuery(entities) {
  if (entities.university) {
    const unis = await findUniversitiesByEntity(entities);
    if (unis && unis.length > 0) return { type: 'scholarship_detail', university: unis[0] };
    return { type: 'not_found', entity: entities.university };
  }

  const unisWithScholarships = await University.find({ 'scholarships.0': { $exists: true } }).lean();
  return { type: 'scholarships_list', universities: unisWithScholarships };
}

/**
 * 6. Hostel Query
 */
async function handleHostelQuery(entities) {
  if (entities.university) {
    const unis = await findUniversitiesByEntity(entities);
    if (unis && unis.length > 0) return { type: 'hostel_detail', university: unis[0] };
    return { type: 'not_found', entity: entities.university };
  }
  return null;
}

/**
 * 7. Facilities Query
 */
async function handleFacilitiesQuery(entities) {
  if (entities.university) {
    const unis = await findUniversitiesByEntity(entities);
    if (unis && unis.length > 0) return { type: 'facilities_detail', university: unis[0] };
    return { type: 'not_found', entity: entities.university };
  }
  return null;
}

/**
 * 8. Recommendation Query
 */
async function handleRecommendationQuery(entities) {
  const query = {};

  if (entities.city) {
    query.$or = [
      { city: new RegExp(escapeRegex(entities.city), 'i') },
      { campus: new RegExp(escapeRegex(entities.city), 'i') }
    ];
  }

  if (entities.province) {
    let provPattern = escapeRegex(entities.province);
    if (/kp|kpk|khyber/i.test(entities.province)) {
      provPattern = '(kpk|kp|khyber pakhtunkhwa)';
    }
    query.province = new RegExp(provPattern, 'i');
  }

  if (entities.sector) {
    query.sector = new RegExp(escapeRegex(entities.sector), 'i');
  }

  if (entities.program) {
    let progPattern = escapeRegex(entities.program);
    if (/computer science|cs/i.test(entities.program)) {
      progPattern = '(computer science|bs\\s*cs|bscs)';
    } else if (/software engineering|se/i.test(entities.program)) {
      progPattern = '(software engineering|bs\\s*se|bsse)';
    } else if (/artificial intelligence|ai/i.test(entities.program)) {
      progPattern = '(artificial intelligence|bs\\s*ai|bsai)';
    } else if (/data science|ds/i.test(entities.program)) {
      progPattern = '(data science|bs\\s*ds|bsds)';
    }
    query['programs.name'] = new RegExp(progPattern, 'i');
  }

  let results = await University.find(query).lean();

  // Filter by budget if requested
  if (entities.budget && results.length > 0) {
    results = results.filter(u => {
      if (!u.programs || !Array.isArray(u.programs)) return false;
      return u.programs.some(p => {
        const matchesProg = entities.program
          ? new RegExp(escapeRegex(entities.program), 'i').test(p.name)
          : true;
        return matchesProg && p.feePerSemester && p.feePerSemester <= entities.budget;
      });
    });
  }

  // Filter by active open admissions if requested
  const isAdmissionReq = entities.admissionStatus ||
    (entities.userQuery && /\b(open|admissions?\s+open|open today)\b/i.test(entities.userQuery));

  if (isAdmissionReq && results.length > 0) {
    const openResults = results.filter(u => {
      if (!u.admissionStatus) return false;
      const rawDeadline = u.admissionStatus.lastDate || u.admissionStatus.closeDate || u.admissionStatus.applicationDeadline;
      if (!rawDeadline || typeof rawDeadline !== 'string' || rawDeadline.trim().toLowerCase() === 'n/a') return false;
      const d = new Date(rawDeadline.trim());
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const deadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return (deadlineDay - today) >= 0;
    });
    if (openResults.length > 0) {
      results = openResults;
    }
  }

  if (results && results.length > 0) {
    return {
      type: 'recommendation_list',
      filter: entities,
      universities: results.slice(0, 10)
    };
  }

  return {
    type: 'recommendation_empty',
    filter: entities
  };
}

/**
 * 9. Comparison Query
 */
async function handleComparisonQuery(entities) {
  let unis = [];
  if (entities.university) {
    unis = await findUniversitiesByEntity(entities);
  }

  if (unis.length < 2) {
    const topUnis = await University.find().limit(2).lean();
    unis = topUnis;
  }

  if (unis.length >= 2) {
    return { type: 'comparison_detail', university1: unis[0], university2: unis[1], program: entities.program };
  }
  return null;
}

/**
 * 10. Campus Information Query
 */
async function handleCampusInfoQuery(entities) {
  if (entities.university) {
    const uniName = entities.university;
    const allCampuses = await University.find({
      $or: [
        { name: new RegExp(uniName, 'i') },
        { shortName: new RegExp(uniName, 'i') }
      ]
    }).lean();

    if (allCampuses && allCampuses.length > 0) {
      return { type: 'campus_list', universityName: uniName, campuses: allCampuses };
    }
  }
  return null;
}

/**
 * 11. Contact Information Query
 */
async function handleContactInfoQuery(entities) {
  if (entities.university) {
    const unis = await findUniversitiesByEntity(entities);
    if (unis && unis.length > 0) return { type: 'contact_detail', university: unis[0] };
    return { type: 'not_found', entity: entities.university };
  }
  return null;
}

/**
 * Helper: Finds universities in MongoDB by name/shortName and optional city/campus.
 */
async function findUniversitiesByEntity(entities) {
  if (!entities.university) return [];

  const uniTerm = entities.university;
  const filter = {
    $or: [
      { name: new RegExp(`^${escapeRegex(uniTerm)}`, 'i') },
      { shortName: new RegExp(`^${escapeRegex(uniTerm)}`, 'i') },
      { name: new RegExp(escapeRegex(uniTerm), 'i') },
      { shortName: new RegExp(escapeRegex(uniTerm), 'i') }
    ]
  };

  if (entities.city || entities.campus) {
    const loc = entities.city || entities.campus;
    filter.$and = [
      {
        $or: [
          { city: new RegExp(escapeRegex(loc), 'i') },
          { campus: new RegExp(escapeRegex(loc), 'i') }
        ]
      }
    ];
  }

  const results = await University.find(filter).lean();
  if (results.length > 0) return results;

  const allUnis = await University.find().lean();
  const matched = await semanticMatchUniversity(uniTerm, allUnis);
  return matched ? [matched] : [];
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = {
  queryDatabase
};
