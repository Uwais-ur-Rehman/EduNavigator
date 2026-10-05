/**
 * recommendation.controller.js — EduNavigator
 *
 * Proxies all recommendation requests to the Python ML microservice
 * running on http://localhost:5001.
 *
 * Falls back to the lightweight built-in scorer if the Python service
 * is unavailable, so the feature never hard-crashes.
 */
const http    = require('http');
const University = require('../models/University');

const ML_HOST = process.env.ML_HOST || 'localhost';
const ML_PORT = parseInt(process.env.ML_PORT || '5001', 10);

/* ─── Helper: POST JSON to the Python microservice ─────────────────────── */
function callPythonML(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const opts = {
      hostname: ML_HOST,
      port    : ML_PORT,
      path,
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 8_000,
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON from ML service')); }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('ML service timeout')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ─── Lightweight fallback scorer (used if Python ML is unavailable) ───── */
async function fallbackScore(body) {
  const {
    field      = '',
    program    = '',
    sector     = '',
    city       = '',
    budget     = 0,
    province   = '',
    facilities = [],
  } = body;

  const reqProv  = (province || '').trim().toLowerCase();
  const reqCity  = (city || '').trim().toLowerCase();
  const reqSect  = (sector || '').trim().toLowerCase();
  const reqProg  = (program || '').trim().toLowerCase();
  const reqField = (field || '').trim().toLowerCase();
  const userBudget = parseFloat(budget) || 0;

  const reqFacs = Array.isArray(facilities)
    ? facilities.map(f => String(f).trim().toLowerCase()).filter(Boolean)
    : (typeof facilities === 'string' ? facilities.split(',').map(f => f.trim().toLowerCase()).filter(Boolean) : []);

  const allUnis = await University.find({});

  // 1. Location Pre-filtering (Highest Priority)
  const candidateUnis = allUnis.filter(u => {
    const uProv = (u.province || '').trim().toLowerCase();
    const uCity = (u.city || '').trim().toLowerCase();

    const provMatches = !reqProv || (reqProv && (uProv.includes(reqProv) || reqProv.includes(uProv)));
    const cityMatches = !reqCity || (reqCity && (uCity.includes(reqCity) || reqCity.includes(uCity)));

    if (reqProv && reqCity) {
      return provMatches && cityMatches;
    } else if (reqProv) {
      return provMatches;
    }
    return true;
  });

  if (candidateUnis.length === 0) {
    return [];
  }

  // Determine max budget difference for normalization
  const allFees = [];
  candidateUnis.forEach(u => {
    (u.programs || []).forEach(p => {
      if (p.feePerSemester) allFees.push(p.feePerSemester);
    });
  });
  const maxDiff = userBudget > 0 && allFees.length > 0
    ? Math.max(...allFees.map(f => Math.abs(userBudget - f)), 100000)
    : 100000;

  const scored = candidateUnis.map(u => {
    const uProv = (u.province || '').trim().toLowerCase();
    const uCity = (u.city || '').trim().toLowerCase();
    const uSect = (u.sector || '').trim().toLowerCase();

    // Matched program search
    let progMatched = null;
    if (u.programs && u.programs.length > 0) {
      if (reqProg) {
        progMatched = u.programs.find(p => p.name?.toLowerCase().includes(reqProg) || reqProg.includes(p.name?.toLowerCase()));
      }
      if (!progMatched && reqField) {
        progMatched = u.programs.find(p => p.name?.toLowerCase().includes(reqField) || reqField.includes(p.name?.toLowerCase()));
      }
    }

    const fees = (u.programs || []).map(p => p.feePerSemester).filter(Boolean);
    const minFee = fees.length ? Math.min(...fees) : null;
    const matchedFee = progMatched?.feePerSemester || minFee;

    // 1. TF-IDF / Program Sim Score (40%)
    let tfidfSim = 0.5;
    if (progMatched) {
      tfidfSim = 1.0;
    } else if (reqField || reqProg) {
      const matchInDesc = (u.description || '').toLowerCase().includes(reqField || reqProg);
      tfidfSim = matchInDesc ? 0.7 : 0.3;
    } else {
      tfidfSim = 1.0;
    }

    // 2. Continuous Budget Score (30%)
    let budgetS = 1.0;
    if (userBudget > 0 && matchedFee) {
      const feeDiff = Math.abs(userBudget - matchedFee);
      budgetS = Math.max(0, Math.min(1, 1 - (feeDiff / maxDiff)));
    }

    // 3. Location Score (10%)
    let locS = 1.0;
    if (reqProv && reqCity) {
      locS = (uProv.includes(reqProv) && uCity.includes(reqCity)) ? 1.0 : 0.8;
    } else if (reqProv) {
      locS = uProv.includes(reqProv) ? 1.0 : 0.8;
    }

    // 4. Sector Score (10%)
    let sectorS = 1.0;
    if (reqSect) {
      sectorS = (uSect.includes(reqSect) || reqSect.includes(uSect)) ? 1.0 : 0.0;
    }

    // 5. Facilities Score (10%)
    let uFacs = [];
    if (Array.isArray(u.facilities)) {
      uFacs = u.facilities.map(f => String(f).toLowerCase());
    } else if (u.facilities && typeof u.facilities === 'object') {
      uFacs = Object.keys(u.facilities).filter(k => Boolean(u.facilities[k])).map(k => k.toLowerCase());
    }

    let matchedFacsCount = 0;
    const matchedFacsNames = [];
    if (reqFacs.length > 0) {
      reqFacs.forEach(rf => {
        const match = uFacs.some(uf => uf.includes(rf) || rf.includes(uf));
        if (match) {
          matchedFacsCount++;
          matchedFacsNames.push(rf.charAt(0).toUpperCase() + rf.slice(1));
        }
      });
    }
    const facilityS = reqFacs.length > 0 ? (matchedFacsCount / reqFacs.length) : 1.0;

    // Final Weighted Score = (0.40 * tfidfSim) + (0.30 * budgetS) + (0.10 * locS) + (0.10 * sectorS) + (0.10 * facilityS)
    const finalScore = (0.40 * tfidfSim) + (0.30 * budgetS) + (0.10 * locS) + (0.10 * sectorS) + (0.10 * facilityS);

    // Build checkmark reasons
    const reasons = [];
    if (progMatched) {
      reasons.push(`✓ ${progMatched.name} matches your desired field/program`);
    } else if (reqField) {
      reasons.push(`✓ Relevant programs in ${field}`);
    }

    if (userBudget > 0 && matchedFee) {
      const feeVal = Math.round(matchedFee);
      if (Math.abs(userBudget - feeVal) <= 15000) {
        reasons.push(`✓ Budget is close to your selected budget (Rs. ${feeVal.toLocaleString()}/sem)`);
      } else if (userBudget >= feeVal) {
        reasons.push(`✓ Within your budget (Rs. ${feeVal.toLocaleString()}/sem)`);
      } else {
        reasons.push(`⚡ Semester fee is Rs. ${feeVal.toLocaleString()}`);
      }
    }

    if (u.city && u.province) {
      reasons.push(`✓ Located in ${u.city}, ${u.province}`);
    } else if (u.city) {
      reasons.push(`✓ Located in ${u.city}`);
    }

    if (u.sector) {
      reasons.push(`✓ ${u.sector} University`);
    }

    if (reqFacs.length > 0) {
      if (matchedFacsCount === reqFacs.length) {
        reasons.push(`✓ All ${reqFacs.length} requested facilities available (${matchedFacsNames.join(', ')})`);
      } else if (matchedFacsCount > 0) {
        reasons.push(`✓ Offers ${matchedFacsCount}/${reqFacs.length} requested facilities (${matchedFacsNames.join(', ')})`);
      } else {
        reasons.push(`⚡ Does not list requested facilities`);
      }
    }

    const rank = u.ranking;
    if (rank && rank <= 10) {
      reasons.push(`✓ Top-10 ranked institution (#${rank})`);
    }

    return {
      score: Math.round(finalScore * 100 * 10) / 10,
      matchPercent: Math.min(100, Math.max(1, Math.round(finalScore * 100))),
      scoreBreakdown: {
        fieldMatch      : Math.round(tfidfSim * 10000) / 10000,
        budgetMatch     : Math.round(budgetS * 10000) / 10000,
        locationMatch   : Math.round(locS * 10000) / 10000,
        sectorMatch     : Math.round(sectorS * 10000) / 10000,
        facilitiesMatch : Math.round(facilityS * 10000) / 10000,
      },
      reasons,
      cosineSimilarity: Math.round(tfidfSim * 1000) / 1000,
      university: u,
      matchedProgram: progMatched?.name || (u.programs?.[0]?.name) || null,
      semesterFee: matchedFee,
      minFee,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/* ─── POST /api/recommendation ──────────────────────────────────────────── */
exports.recommend = async (req, res, next) => {
  try {
    const {
      field      = '',
      program    = '',
      sector     = '',
      city       = '',
      budget     = 0,
      province   = '',
      facilities = [],
      interest   = '',   // legacy field alias
      topN       = 10,
    } = req.body;

    const payload = {
      field   : field || interest,
      program,
      sector,
      city,
      province,
      facilities,
      budget  : parseFloat(budget) || 0,
      topN    : parseInt(topN, 10) || 10,
    };

    try {
      // ── Call Python ML microservice ──────────────────────────────────
      const mlResult = await callPythonML('/recommend', payload);

      if (mlResult.success) {
        return res.json({
          success        : true,
          count          : mlResult.count,
          recommendations: mlResult.recommendations,
          source         : 'ml',
        });
      }

      // ML returned an error body — fall through to fallback
      console.warn('⚠️  ML service returned error:', mlResult.error);
    } catch (mlErr) {
      // ML service not running — use fallback silently
      console.warn('⚠️  ML microservice unavailable, using fallback scorer:', mlErr.message);
    }

    // ── Fallback ─────────────────────────────────────────────────────
    const fallback = await fallbackScore(req.body);
    return res.json({
      success        : true,
      count          : fallback.length,
      recommendations: fallback,
      source         : 'fallback',
    });
  } catch (e) {
    next(e);
  }
};

/* ─── POST /api/recommendation/retrain ─────────────────────────────────── */
exports.retrain = async (req, res, next) => {
  try {
    const result = await callPythonML('/retrain', {});
    return res.json(result);
  } catch (e) {
    return res.status(503).json({
      success: false,
      message: 'ML microservice not available. Is it running on port 5001?',
    });
  }
};
