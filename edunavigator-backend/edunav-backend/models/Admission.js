const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  program: String,
  session: String,                 // e.g. Fall 2026
  applyStart: Date,
  applyDeadline: { type: Date, required: true },
  testDate: Date,
  resultDate: Date,
  eligibility: String,
  applyLink: String,
  status: { type: String, enum: ['Open', 'Closed', 'Upcoming'], default: 'Upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
