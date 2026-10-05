const Notification = require('../models/Notification');

exports.mine = async (req, res, next) => {
  try {
    const items = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    }).sort('-createdAt').limit(50);
    res.json({ success: true, items });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, notification: await Notification.create(req.body) }); }
  catch (e) { next(e); }
};
