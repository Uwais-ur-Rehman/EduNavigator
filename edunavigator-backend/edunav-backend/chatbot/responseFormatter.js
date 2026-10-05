/**
 * EduNavigator Chatbot - Response Formatter
 * Generates natural, human-like, targeted responses answering ONLY what the user asked.
 * Dynamic Deadline Evaluation: Compares stored admission deadlines against server date (new Date()).
 */

const FALLBACK_MESSAGE = "I couldn't find this information in the EduNavigator database.";
const UNI_NOT_FOUND_MESSAGE = "I couldn't find this university in the EduNavigator database.";

/**
 * Dynamically evaluates admission status by comparing stored database deadline with current server date.
 * If Current Date > Admission Deadline -> Admission Status = 🔴 Closed
 * If Current Date <= Admission Deadline -> Admission Status = 🟢 Open
 */
function getDynamicAdmissionStatus(admissionStatus) {
  if (!admissionStatus) {
    return {
      statusText: 'Information not available.',
      isOpen: false,
      deadlineStr: null,
      daysRemaining: null,
      note: null,
      isValid: false
    };
  }

  const rawDeadline = admissionStatus.lastDate || admissionStatus.closeDate || admissionStatus.applicationDeadline;

  if (!rawDeadline || typeof rawDeadline !== 'string' || !rawDeadline.trim() || rawDeadline.trim().toLowerCase() === 'n/a') {
    return {
      statusText: 'Information not available.',
      isOpen: false,
      deadlineStr: null,
      daysRemaining: null,
      note: null,
      isValid: false
    };
  }

  const deadlineStr = rawDeadline.trim();
  let deadlineDate = new Date(deadlineStr);

  // Fallback parsing for various formats (e.g. 25 July 2026, 25-07-2026)
  if (isNaN(deadlineDate.getTime())) {
    const dmY = deadlineStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (dmY) {
      deadlineDate = new Date(`${dmY[2]} ${dmY[1]}, ${dmY[3]}`);
    } else {
      const dmyNum = deadlineStr.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
      if (dmyNum) {
        deadlineDate = new Date(`${dmyNum[3]}-${dmyNum[2]}-${dmyNum[1]}`);
      }
    }
  }

  if (isNaN(deadlineDate.getTime())) {
    return {
      statusText: 'Information not available.',
      isOpen: false,
      deadlineStr: deadlineStr,
      daysRemaining: null,
      note: null,
      isValid: false
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());

  const diffTime = deadlineDay - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      statusText: '🔴 Closed',
      isOpen: false,
      deadlineStr: deadlineStr,
      daysRemaining: 0,
      note: 'The admission deadline has already passed.',
      isValid: true
    };
  } else {
    return {
      statusText: '🟢 Open',
      isOpen: true,
      deadlineStr: deadlineStr,
      daysRemaining: diffDays,
      note: diffDays === 0 ? 'Today is the last date to apply!' : `${diffDays} days remaining.`,
      isValid: true
    };
  }
}

function formatResponse(intent, dbData, entities = {}) {
  if (intent === 'Greetings' || (dbData && dbData.type === 'greeting')) {
    return `👋 Hello! I am **EduBot**, your AI Admissions Assistant for EduNavigator.\n\nI can help you answer specific questions about university details, degree availability, semester fees, admission status, deadlines, scholarships, and campus facilities in Pakistan!\n\nHow can I help you today?`;
  }

  if (!dbData) {
    return FALLBACK_MESSAGE;
  }

  if (dbData.type === 'not_found') {
    return UNI_NOT_FOUND_MESSAGE;
  }

  if (dbData.type === 'campus_disambiguation') {
    const campusesBullet = dbData.campuses.map(c => `• ${c}`).join('\n');
    return `${dbData.universityName} has multiple campuses. Please specify one of these:\n\n${campusesBullet}`;
  }

  switch (dbData.type) {
    case 'university_info':
      return formatUniversityInfo(dbData, entities);

    case 'program_availability':
      return formatProgramAvailability(dbData, entities);

    case 'program_fee_detail':
    case 'university_fee_list':
      return formatFeeResponse(dbData, entities);

    case 'admission_detail':
    case 'open_admissions_list':
      return formatAdmissionResponse(dbData, entities);

    case 'scholarship_detail':
    case 'scholarships_list':
      return formatScholarshipResponse(dbData, entities);

    case 'hostel_detail':
      return formatHostelResponse(dbData, entities);

    case 'facilities_detail':
      return formatFacilitiesResponse(dbData, entities);

    case 'recommendation_list':
      return formatRecommendationResponse(dbData, entities);

    case 'recommendation_empty':
      return formatRecommendationEmptyResponse(dbData, entities);

    case 'comparison_detail':
      return formatComparisonResponse(dbData, entities);

    case 'campus_list':
      return formatCampusListResponse(dbData, entities);

    case 'contact_detail':
      return formatContactResponse(dbData, entities);

    default:
      return FALLBACK_MESSAGE;
  }
}

/**
 * Targeted formatting for University Info
 */
function formatUniversityInfo({ university }, entities) {
  const uniName = `${university.name}${university.shortName ? ' (' + university.shortName + ')' : ''}`;

  if (entities.sector || (entities.userQuery && /\b(public|private|sector)\b/i.test(entities.userQuery))) {
    const sectorStr = university.sector ? `${university.sector} sector` : 'public/private sector';
    return `${university.name || university.shortName}, ${university.city} is a ${sectorStr} university.`;
  }

  if (entities.ranking || (entities.userQuery && /\b(ranking|ranked|rank)\b/i.test(entities.userQuery))) {
    const rank = university.ranking ? `#${university.ranking}` : 'Unranked';
    return `${university.shortName || university.name} is ranked ${rank} according to the EduNavigator database.`;
  }

  const sector = university.sector || 'Public';
  const rankStr = university.ranking ? ` (Rank #${university.ranking})` : '';
  return `${uniName} is a ${sector} sector university located in ${university.city}${rankStr}.`;
}

/**
 * Targeted formatting for Program Availability with Dynamic Admission Deadline
 */
function formatProgramAvailability({ university, available, program, programName }, entities) {
  const uniTitle = `${university.shortName || university.name}${university.campus ? ' ' + university.campus : ''}`;
  const pTitle = program ? program.name : (programName || 'this program');

  if (!available || !program) {
    return `No. ${uniTitle} does not offer ${pTitle}.`;
  }

  let response = `Yes. ${uniTitle} offers ${program.name}.`;

  const ds = getDynamicAdmissionStatus(university.admissionStatus);
  if (ds.isValid) {
    if (ds.isOpen) {
      response += `\n\nThe program is currently open for admission until ${ds.deadlineStr}.`;
    } else {
      response += `\n\nAdmission for this program is currently closed. The deadline was ${ds.deadlineStr}.`;
    }
  }

  return response;
}

/**
 * Targeted formatting for Fee Queries
 */
function formatFeeResponse(dbData, entities) {
  if (dbData.type === 'program_fee_detail') {
    const u = dbData.university;
    const p = dbData.program;
    const uniTitle = `${u.shortName || u.name}${u.campus ? ' ' + u.campus : ''}`;
    const feeStr = p.feePerSemester ? `Rs. ${p.feePerSemester.toLocaleString()}` : (p.annualFee ? `Rs. ${p.annualFee.toLocaleString()} / year` : 'N/A');

    return `The semester fee for ${p.name} at ${uniTitle} is ${feeStr}.`;
  }

  const u = dbData.university;
  const uniTitle = `${u.shortName || u.name}${u.campus ? ' ' + u.campus : ''}`;
  const progs = dbData.programs.slice(0, 8);

  if (progs.length === 0) return FALLBACK_MESSAGE;

  const list = progs.map(p => {
    const fee = p.feePerSemester ? `Rs. ${p.feePerSemester.toLocaleString()}` : 'N/A';
    return `• **${p.name}**: ${fee}/semester`;
  }).join('\n');

  return `Semester fee structure for ${uniTitle}:\n\n${list}`;
}

/**
 * Targeted formatting for Admission Queries with Dynamic Server Date Validation
 */
function formatAdmissionResponse(dbData, entities) {
  if (dbData.type === 'admission_detail') {
    const u = dbData.university;
    const uniTitle = `${u.shortName || u.name}${u.campus ? ' ' + u.campus : ''}`;
    const dynamicStatus = getDynamicAdmissionStatus(u.admissionStatus);

    if (!dynamicStatus.isValid && !dynamicStatus.deadlineStr) {
      return `Admission Status: Information not available.`;
    }

    let output = `Admission Status: ${dynamicStatus.statusText}\n\nLast Date to Apply:\n${dynamicStatus.deadlineStr || 'N/A'}`;
    if (dynamicStatus.note) {
      output += `\n\n${dynamicStatus.note}`;
    }
    return output;
  }

  if (!dbData.universities || dbData.universities.length === 0) return FALLBACK_MESSAGE;

  // Filter universities dynamically for active open admission status
  const openUnis = dbData.universities.filter(u => getDynamicAdmissionStatus(u.admissionStatus).isOpen);
  if (openUnis.length === 0) {
    return `Currently, there are no universities in the EduNavigator database with active open admissions.`;
  }

  const list = openUnis.map(u => {
    const name = `${u.shortName || u.name} (${u.city})`;
    const ds = getDynamicAdmissionStatus(u.admissionStatus);
    return `• **${name}** — Last Date: ${ds.deadlineStr}`;
  }).join('\n');

  return `Universities currently open for admission:\n\n${list}`;
}

/**
 * Targeted formatting for Scholarship Queries
 */
function formatScholarshipResponse(dbData, entities) {
  if (dbData.type === 'scholarship_detail') {
    const u = dbData.university;
    const uniTitle = `${u.shortName || u.name}${u.campus ? ' ' + u.campus : ''}`;
    const sch = u.scholarships || [];

    if (sch.length === 0) {
      return `No specific scholarship records are listed for ${uniTitle} in the EduNavigator database.`;
    }

    const list = sch.map(s => `• **${s.name}**: ${s.amount || s.eligibility || 'Financial assistance'}`).join('\n');
    return `Scholarships available at **${uniTitle}**:\n\n${list}`;
  }

  if (!dbData.universities || dbData.universities.length === 0) return FALLBACK_MESSAGE;
  const list = dbData.universities.slice(0, 5).map(u => `• **${u.shortName || u.name}** (${u.city})`).join('\n');
  return `Universities offering scholarships:\n\n${list}`;
}

/**
 * Targeted formatting for Hostel Queries
 */
function formatHostelResponse({ university }) {
  const uniTitle = `${university.shortName || university.name}${university.campus ? ' ' + university.campus : ''}`;
  const hasHostel = (university.facilities && university.facilities.hostel) ||
    (university.programs && university.programs.some(p => p.hostelFee));

  if (hasHostel) {
    return `Yes. ${uniTitle} provides hostel facilities for students.`;
  }
  return `According to the EduNavigator database, hostel facilities are not available at ${uniTitle}.`;
}

/**
 * Targeted formatting for Facilities Queries
 */
function formatFacilitiesResponse({ university }) {
  const uniTitle = `${university.shortName || university.name}${university.campus ? ' ' + university.campus : ''}`;
  return `${uniTitle} offers campus facilities including computer labs, library, transport, and student accommodation.`;
}

/**
 * Targeted formatting for Recommendations
 */
function formatRecommendationResponse({ filter, universities }, entities = {}) {
  if (!universities || universities.length === 0) {
    return formatRecommendationEmptyResponse({ filter }, entities);
  }

  const prog = filter.program || entities.program;
  const loc = filter.city || entities.city || filter.province || entities.province;

  let header = 'The following universities match your criteria:';
  if (prog && loc) {
    header = `The following universities in ${loc} offer ${prog}:`;
  } else if (prog) {
    header = `The following universities offer ${prog}:`;
  } else if (loc && (filter.sector || entities.sector)) {
    header = `The following ${filter.sector || entities.sector} universities in ${loc}:`;
  } else if (loc) {
    header = `The following universities in ${loc}:`;
  } else if (filter.budget || entities.budget) {
    header = `The following universities offer programs under Rs. ${(filter.budget || entities.budget).toLocaleString()}:`;
  } else if (filter.admissionStatus || (entities.userQuery && /\b(open|admissions?\s+open)\b/i.test(entities.userQuery))) {
    header = `The following universities currently have admissions open:`;
  }

  const list = universities.map((u, index) => {
    let nameStr = u.name;
    if (u.shortName && u.shortName.toLowerCase() !== u.name.toLowerCase() && !u.name.includes(`(${u.shortName})`)) {
      nameStr = `${u.name} (${u.shortName})`;
    }
    return `${index + 1}. ${nameStr}`;
  }).join('\n\n');

  return `${header}\n\n${list}`;
}

function formatRecommendationEmptyResponse({ filter }, entities = {}) {
  const prog = filter?.program || entities.program;
  const loc = filter?.city || entities.city || filter?.province || entities.province;

  if (loc && prog) {
    return `I couldn't find any university in ${loc} offering ${prog} in the EduNavigator database.`;
  } else if (prog) {
    return `I couldn't find any university offering ${prog} in the EduNavigator database.`;
  } else if (loc) {
    return `I couldn't find any university in ${loc} in the EduNavigator database.`;
  }
  return `I couldn't find any university matching your criteria in the EduNavigator database.`;
}

/**
 * Targeted formatting for Comparison Queries with Dynamic Admission Status
 */
function formatComparisonResponse({ university1, university2, program }) {
  const name1 = `${university1.shortName || university1.name} (${university1.city})`;
  const name2 = `${university2.shortName || university2.name} (${university2.city})`;

  const rank1 = university1.ranking ? `#${university1.ranking}` : 'N/A';
  const rank2 = university2.ranking ? `#${university2.ranking}` : 'N/A';

  const ds1 = getDynamicAdmissionStatus(university1.admissionStatus);
  const ds2 = getDynamicAdmissionStatus(university2.admissionStatus);

  const status1 = ds1.isValid ? (ds1.isOpen ? 'Open' : 'Closed') : 'N/A';
  const status2 = ds2.isValid ? (ds2.isOpen ? 'Open' : 'Closed') : 'N/A';

  let fee1 = 'N/A';
  let fee2 = 'N/A';
  if (university1.programs && university1.programs.length > 0) fee1 = `Rs. ${university1.programs[0].feePerSemester ? university1.programs[0].feePerSemester.toLocaleString() : 'N/A'}`;
  if (university2.programs && university2.programs.length > 0) fee2 = `Rs. ${university2.programs[0].feePerSemester ? university2.programs[0].feePerSemester.toLocaleString() : 'N/A'}`;

  return `University Comparison:

| Feature | ${name1} | ${name2} |
| --- | --- | --- |
| Sector | ${university1.sector || 'Public'} | ${university2.sector || 'Public'} |
| Ranking | ${rank1} | ${rank2} |
| Semester Fee | ${fee1} | ${fee2} |
| Admission Status | ${status1} | ${status2} |
| City | ${university1.city} | ${university2.city} |`;
}

/**
 * Targeted formatting for Campus Information
 */
function formatCampusListResponse({ universityName, campuses }) {
  const campusNames = campuses.map(c => c.campus || c.city).filter(Boolean);
  const uniqueCampuses = Array.from(new Set(campusNames));

  if (uniqueCampuses.length === 1) {
    return `${universityName} has its primary campus located in ${uniqueCampuses[0]}.`;
  }

  const list = uniqueCampuses.map(c => `• ${c}`).join('\n');
  return `${universityName} has ${uniqueCampuses.length} campuses:\n\n${list}`;
}

/**
 * Targeted formatting for Contact Information / Website
 */
function formatContactResponse({ university }, entities) {
  const uniTitle = `${university.shortName || university.name}${university.campus ? ' ' + university.campus : ''}`;

  if (entities.userQuery && /\b(website|url|site|portal|link)\b/i.test(entities.userQuery)) {
    const site = university.website || 'https://edunavigator.pk';
    return `The official website of ${uniTitle} is:\n\n${site}`;
  }

  const contact = university.contact || {};
  return `Contact details for **${uniTitle}**:\n• Address: ${contact.address || university.city || 'N/A'}\n• Phone: ${contact.phone || 'N/A'}\n• Email: ${contact.email || 'N/A'}\n• Website: ${university.website || 'N/A'}`;
}

module.exports = {
  formatResponse,
  getDynamicAdmissionStatus,
  FALLBACK_MESSAGE,
  UNI_NOT_FOUND_MESSAGE
};
