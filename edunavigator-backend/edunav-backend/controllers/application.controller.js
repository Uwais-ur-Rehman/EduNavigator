const Application = require('../models/Application');

exports.apply = async (req, res, next) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, application: app });
  } catch (e) { next(e); }
};

exports.myApplications = async (req, res, next) => {
  try {
    const items = await Application.find({ user: req.user._id })
      .populate('university', 'name city logo')
      .sort('-createdAt');
    res.json({ success: true, items });
  } catch (e) { next(e); }
};

exports.all = async (req, res, next) => {
  try {
    const items = await Application.find()
      .populate('user', 'name email')
      .populate('university', 'name city');
    res.json({ success: true, items });
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await Application.findById(req.params.id)
      .populate('university', 'name city logo feeRange deadline website')
      .populate('user', 'name email phone');

    if (!item) return res.status(404).json({ success: false, message: 'Application not found' });

    // Ensure the application belongs to the logged-in user or admin
    if (item.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this application' });
    }

    res.json({ success: true, item });
  } catch (e) { next(e); }
};

exports.cancelApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this application' });
    }

    if (['Accepted', 'Rejected', 'Cancelled'].includes(app.status)) {
      return res.status(400).json({ success: false, message: `Application cannot be cancelled because its status is '${app.status}'` });
    }

    app.status = 'Cancelled';
    await app.save();

    res.json({ success: true, message: 'Application cancelled successfully', application: app });
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status, notes }, { new: true });
    res.json({ success: true, application: app });
  } catch (e) { next(e); }
};
