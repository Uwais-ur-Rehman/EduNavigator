const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  provider:     String,
  type:         { type: String, enum: ['Merit', 'Need', 'Sports', 'International', 'Other'], default: 'Merit' },
  amount:       String,
  eligibility:  String,
  deadline:     Date,
  applyLink:    String,
  description:  String,
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
