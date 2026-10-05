const Contact = require('../models/Contact');

exports.submit = async (req, res, next) => {
  try {
    const c = await Contact.create(req.body);
    res.status(201).json({ success: true, message: 'Message received. We will reply soon.', id: c._id });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try { res.json({ success: true, items: await Contact.find().sort('-createdAt') }); }
  catch (e) { next(e); }
};
