const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  subject:    { type: String, required: true },
  department: { type: String, required: true },
  semester:   { type: String },
  description:{ type: String },
  requestedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  fulfilled:  { type: Boolean, default: false },
  fulfilledBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
