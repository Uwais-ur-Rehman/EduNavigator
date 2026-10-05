const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = broadcast
  title: { type: String, required: true },
  message: String,
  type:  { type: String, enum: ['admission', 'scholarship', 'deadline', 'general'], default: 'general' },
  link:  String,
  read:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
