const Admission = require('../models/Admission');
const University = require('../models/University');

/**
 * Dynamic calculation helper for admission status & remaining days
 * logic:
 * - If Current Date > Last Date => Status = "Closed", Days Left = "Deadline Passed"
 * - If Current Date == Last Date => Status = "Open", Days Left = "Last Day to Apply", isLastDay = true
 * - If Current Date < Last Date => Status = "Open", Days Left = "X days left" / "1 day left"
 */
function computeAdmissionStatus(deadlineInput) {
  if (!deadlineInput) {
    return {
      status: 'Closed',
      remainingDays: 'Deadline Passed',
      diffDays: -1,
      isOpen: false,
      isLastDay: false,
    };
  }

  const deadline = new Date(deadlineInput);
  if (isNaN(deadline.getTime())) {
    return {
      status: 'Closed',
      remainingDays: 'Deadline Passed',
      diffDays: -1,
      isOpen: false,
      isLastDay: false,
    };
  }

  const now = new Date();
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineReset = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  const diffTime = deadlineReset.getTime() - todayReset.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Closed',
      remainingDays: 'Deadline Passed',
      diffDays,
      isOpen: false,
      isLastDay: false,
    };
  } else if (diffDays === 0) {
    return {
      status: 'Open',
      remainingDays: 'Last Day to Apply',
      diffDays: 0,
      isOpen: true,
      isLastDay: true,
    };
  } else {
    return {
      status: 'Open',
      remainingDays: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      diffDays,
      isOpen: true,
      isLastDay: false,
    };
  }
}

exports.computeAdmissionStatus = computeAdmissionStatus;

exports.list = async (req, res, next) => {
  try {
    const { university, search } = req.query;
    const admissionQuery = {};
    if (university) admissionQuery.university = university;

    const [allUniversities, rawAdmissions] = await Promise.all([
      University.find(university ? { _id: university } : {}).sort({ name: 1 }),
      Admission.find(admissionQuery)
        .populate('university', 'name shortName city province logo admissionStatus admissionCriteria website programs')
        .sort({ applyDeadline: 1 }),
    ]);

    const explicitMap = new Map();
    for (const ad of rawAdmissions) {
      if (ad.university && ad.university._id) {
        const uId = ad.university._id.toString();
        if (!explicitMap.has(uId)) {
          explicitMap.set(uId, []);
        }
        explicitMap.get(uId).push(ad);
      }
    }

    const items = [];
    const searchLower = (search || '').trim().toLowerCase();

    for (const uni of allUniversities) {
      if (!uni || !uni.name) continue;

      const uIdStr = uni._id.toString();
      const uName = uni.name || '';
      const uShort = uni.shortName || '';
      const uCity = uni.city || '';
      const uProv = uni.province || '';
      const uWebsite = uni.website || '';
      const defaultProgram = (uni.programs && uni.programs.length > 0 && uni.programs[0].name)
        ? uni.programs[0].name
        : 'Undergraduate Admissions';

      if (explicitMap.has(uIdStr)) {
        for (const ad of explicitMap.get(uIdStr)) {
          const deadline = ad.applyDeadline || uni.admissionStatus?.lastDate;
          const statusInfo = computeAdmissionStatus(deadline);
          const prog = ad.program || defaultProgram;

          if (searchLower) {
            const matchesSearch =
              uName.toLowerCase().includes(searchLower) ||
              uShort.toLowerCase().includes(searchLower) ||
              uCity.toLowerCase().includes(searchLower) ||
              uProv.toLowerCase().includes(searchLower) ||
              prog.toLowerCase().includes(searchLower);

            if (!matchesSearch) continue;
          }

          const itemObj = ad.toObject();
          itemObj.university = uni;
          itemObj.universityName = uName;
          itemObj.shortName = uShort;
          itemObj.city = uCity;
          itemObj.province = uProv;
          itemObj.website = uWebsite || ad.applyLink || '';
          itemObj.lastDate = deadline;
          itemObj.status = statusInfo.status;
          itemObj.remainingDays = statusInfo.remainingDays;
          itemObj.diffDays = statusInfo.diffDays;
          itemObj.isOpen = statusInfo.isOpen;
          itemObj.isLastDay = statusInfo.isLastDay;
          itemObj.canApply = statusInfo.isOpen;

          items.push(itemObj);
        }
      } else {
        const deadline = uni.admissionStatus?.lastDate || uni.admissionStatus?.closeDate || null;
        const statusInfo = computeAdmissionStatus(deadline);
        const prog = defaultProgram;

        if (searchLower) {
          const matchesSearch =
            uName.toLowerCase().includes(searchLower) ||
            uShort.toLowerCase().includes(searchLower) ||
            uCity.toLowerCase().includes(searchLower) ||
            uProv.toLowerCase().includes(searchLower) ||
            prog.toLowerCase().includes(searchLower);

          if (!matchesSearch) continue;
        }

        items.push({
          _id: uni._id,
          university: uni,
          universityName: uName,
          shortName: uShort,
          city: uCity,
          province: uProv,
          program: prog,
          session: uni.admissionStatus?.schedule || 'Fall 2026',
          applyStart: uni.admissionStatus?.openDate ? new Date(uni.admissionStatus.openDate) : null,
          applyDeadline: deadline ? new Date(deadline) : null,
          lastDate: deadline,
          website: uWebsite,
          applyLink: uni.admissionStatus?.applyOnlineLink || uWebsite,
          status: statusInfo.status,
          remainingDays: statusInfo.remainingDays,
          diffDays: statusInfo.diffDays,
          isOpen: statusInfo.isOpen,
          isLastDay: statusInfo.isLastDay,
          canApply: statusInfo.isOpen,
        });
      }
    }

    res.json({ success: true, count: items.length, items });
  } catch (e) { next(e); }
};

exports.upcoming = async (req, res, next) => {
  try {
    const rawItems = await Admission.find()
      .populate('university', 'name shortName city province logo admissionStatus admissionCriteria website')
      .sort({ applyDeadline: 1 });

    const items = [];
    for (const ad of rawItems) {
      if (!ad.university || !ad.university.name) continue;

      const uni = ad.university;
      const deadline = ad.applyDeadline || uni.admissionStatus?.lastDate;
      const statusInfo = computeAdmissionStatus(deadline);

      if (statusInfo.isOpen) {
        const itemObj = ad.toObject();
        itemObj.universityName = uni.name || '';
        itemObj.shortName = uni.shortName || '';
        itemObj.city = uni.city || '';
        itemObj.province = uni.province || '';
        itemObj.website = uni.website || ad.applyLink || '';
        itemObj.lastDate = deadline;
        itemObj.status = statusInfo.status;
        itemObj.remainingDays = statusInfo.remainingDays;
        itemObj.diffDays = statusInfo.diffDays;
        itemObj.isOpen = statusInfo.isOpen;
        itemObj.isLastDay = statusInfo.isLastDay;
        itemObj.canApply = statusInfo.isOpen;
        items.push(itemObj);
      }

      if (items.length >= 10) break;
    }

    res.json({ success: true, count: items.length, items });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, admission: await Admission.create(req.body) }); }
  catch (e) { next(e); }
};


