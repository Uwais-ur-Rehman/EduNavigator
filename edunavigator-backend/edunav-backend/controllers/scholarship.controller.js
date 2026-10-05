const Scholarship = require('../models/Scholarship');

exports.list = async (req, res, next) => {
  try {
    const { type } = req.query;
    const q = type ? { type } : {};
    const items = await Scholarship.find(q).sort({ deadline: 1 });
    res.json({ success: true, items });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, scholarship: await Scholarship.create(req.body) }); }
  catch (e) { next(e); }
};
