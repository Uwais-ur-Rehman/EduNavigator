const University = require('../models/University');
const Admission = require('../models/Admission');
const Scholarship = require('../models/Scholarship');

/**
 * EduBot AI Assistant Controller
 * Smart query handler for university admissions, fees, rankings, and scholarships.
 */
exports.handleChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, reply: "Please type a valid message." });
    }

    const query = message.toLowerCase().trim();
    let reply = "";

    // 1. Check for City Inquiries (e.g. "universities in Islamabad", "Lahore")
    const cities = ["islamabad", "lahore", "karachi", "peshawar", "faisalabad", "swabi", "taxila", "multan", "bahawalpur", "sialkot", "quetta", "wah cantt"];
    const matchedCity = cities.find(c => query.includes(c));

    if (matchedCity) {
      const cityUnis = await University.find({ city: new RegExp(matchedCity, 'i') }).limit(6);
      if (cityUnis.length > 0) {
        const uniList = cityUnis.map(u => `• **${u.name}** (${u.shortName || u.city}) - Sector: ${u.sector}`).join('\n');
        reply = `📍 Here are top universities in **${matchedCity.toUpperCase()}**:\n\n${uniList}\n\nNeed specific program details or fee structures for any of these?`;
      } else {
        reply = `I couldn't find universities specifically listed under **${matchedCity}** right now, but you can explore all cities on our Universities page!`;
      }
      return res.json({ success: true, reply });
    }

    // 2. Check for Top Rankings / Best Universities
    if (query.includes('top') || query.includes('best') || query.includes('ranking') || query.includes('hec')) {
      const topUnis = await University.find({ ranking: { $exists: true, $ne: null } })
        .sort({ ranking: 1 })
        .limit(5);

      if (topUnis.length > 0) {
        const uniList = topUnis.map(u => `🏆 **#${u.ranking} ${u.name}** (${u.shortName}) - ${u.city}`).join('\n');
        reply = `⭐ **Top Ranked Universities in Pakistan**:\n\n${uniList}\n\nYou can use our AI Recommendation form on the left to find your best personal match!`;
      } else {
        reply = `Our platform lists Pakistan's top recognized universities including NUST, QAU, LUMS, FAST-NUCES, and GIKI!`;
      }
      return res.json({ success: true, reply });
    }

    // 3. Check for Fee / Budget Inquiries
    if (query.includes('fee') || query.includes('cost') || query.includes('budget') || query.includes('price') || query.includes('expensive') || query.includes('cheap')) {
      reply = `💡 **Fee Structure Overview**:\n\n` +
        `• **Public Sector Universities** (e.g. QAU, UET, NUST): ~PKR 50,000 - 195,000 per semester.\n` +
        `• **Private Sector Universities** (e.g. FAST, LUMS, GIKI): ~PKR 180,000 - 450,000 per semester.\n\n` +
        `Enter your semester budget in the form on the left to get instant personalized university recommendations!`;
      return res.json({ success: true, reply });
    }

    // 4. Check for Scholarships / Financial Aid
    if (query.includes('scholarship') || query.includes('aid') || query.includes('fund') || query.includes('free') || query.includes('stipend')) {
      const scholList = await Scholarship.find({}).limit(4);
      if (scholList.length > 0) {
        const items = scholList.map(s => `💰 **${s.title || s.name}** - ${s.type || 'Merit / Need Based'}`).join('\n');
        reply = `🎓 **Available Scholarships & Financial Aid**:\n\n${items}\n\nVisit our **Scholarships** page for eligibility requirements and application steps!`;
      } else {
        reply = `Pakistan's top universities offer HEC Need-Based Scholarships, Ehsaas Undergraduate Scholarships, and University Merit Awards covering up to 100% tuition fees.`;
      }
      return res.json({ success: true, reply });
    }

    // 5. Check for Admission Deadlines / Status
    if (query.includes('admission') || query.includes('deadline') || query.includes('date') || query.includes('open') || query.includes('apply')) {
      const openAdmissions = await Admission.find({}).populate('universityId', 'name shortName city').limit(4);
      if (openAdmissions.length > 0) {
        const admList = openAdmissions.map(a => `📅 **${a.universityId?.shortName || a.universityName || 'University'}**: Admission Open (Last Date: ${a.lastDateToApply ? new Date(a.lastDateToApply).toLocaleDateString('en-GB') : 'Upcoming'})`).join('\n');
        reply = `🔔 **Latest University Admissions Status**:\n\n${admList}\n\nCheck out the **Admissions** tab for complete dates and merit list schedules!`;
      } else {
        reply = `Admissions for Fall & Spring semesters are actively tracked on EduNavigator. Check our **Admissions** page for real-time deadline alerts!`;
      }
      return res.json({ success: true, reply });
    }

    // 6. Check for Program / Field Specific Questions (e.g. "computer science", "engineering", "mbbs", "bba", "law")
    const programKeywords = ["computer science", "software engineering", "artificial intelligence", "cyber security", "data science", "engineering", "mbbs", "bds", "bba", "law", "pharmacy"];
    const matchedProg = programKeywords.find(p => query.includes(p));

    if (matchedProg) {
      const progUnis = await University.find({ "programs.name": new RegExp(matchedProg, 'i') }).limit(5);
      if (progUnis.length > 0) {
        const uniList = progUnis.map(u => `• **${u.name}** (${u.city})`).join('\n');
        reply = `💻 Top universities offering **${matchedProg.toUpperCase()}**:\n\n${uniList}\n\nSelect **${matchedProg.toUpperCase()}** in the form on the left to get a detailed score match!`;
      } else {
        reply = `We have extensive program listings for **${matchedProg.toUpperCase()}** across top public and private universities in Pakistan. Select your desired program in the AI form on the left!`;
      }
      return res.json({ success: true, reply });
    }

    // Default Friendly Bot Response
    reply = `🤖 **EduBot Assistance**:\n\n` +
      `I can help you with:\n` +
      `1. Finding top universities by city (e.g. *"universities in Islamabad"*)\n` +
      `2. Fee structures & budget advice (e.g. *"BS CS fee structure"*)\n` +
      `3. HEC rankings & top institutes (e.g. *"top engineering universities"*)\n` +
      `4. Available scholarships (e.g. *"scholarships for undergraduate"*)\n` +
      `5. Admission open status & deadlines\n\n` +
      `What would you like to know today?`;

    res.json({ success: true, reply });

  } catch (err) {
    next(err);
  }
};
