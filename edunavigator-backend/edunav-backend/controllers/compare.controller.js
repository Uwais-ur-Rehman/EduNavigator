const University = require('../models/University');

/** POST or GET /api/compare */
exports.compare = async (req, res, next) => {
  try {
    let ids = req.body?.ids || req.query?.ids || [];
    if (typeof ids === 'string') {
      ids = ids.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 4) {
      return res.status(400).json({ success: false, message: 'Select 1 to 4 universities to compare' });
    }

    const items = await University.find({ _id: { $in: ids } });

    // Build side-by-side comparison matrix using direct MongoDB document fields
    const matrix = items.map(u => ({
      id:          u._id,
      _id:         u._id,
      name:        u.name,
      shortName:   u.shortName || '',
      campusImage: u.campusImage || '',
      city:        u.city || '',
      sector:      u.sector || '',
      programs:    u.programs || [],
      facilities:  u.facilities || null,
      website:     u.website || '',
    }));

    res.json({ success: true, matrix });
  } catch (e) { next(e); }
};
