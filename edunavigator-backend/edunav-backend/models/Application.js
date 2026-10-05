const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  program:    String,
  fullName:   String,
  email:      String,
  phone:      String,
  cnic:       String,
  intermediatePercentage: Number,
  matricPercentage: Number,
  documentsUrl: [String],
  status: { type: String, enum: ['Pending', 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Cancelled'], default: 'Pending' },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
