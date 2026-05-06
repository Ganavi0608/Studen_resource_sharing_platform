const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  String,
  subject:      { type: String, required: true },
  department:   { type: String, required: true },
  semester:     { type: String },
  category:     { type: String, enum: ['Notes', 'Assignment', 'Question Paper', 'Reference'], required: true },
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings:      [{ user: mongoose.Schema.Types.ObjectId, value: Number }],
  comments:     [{ user: mongoose.Schema.Types.ObjectId, name: String, text: String, createdAt: { type: Date, default: Date.now } }],
  downloads:    { type: Number, default: 0 },
  views:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
