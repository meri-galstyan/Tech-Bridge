// backend/models/HelpRequest.js

const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String }, // optional
  contactMethod: { type: String, enum: ['Phone', 'Email', 'Either'], required: true },
  helpTypes: [{ type: String }], // array of selected help types
  description: { type: String, required: true },
  urgency: { type: String, enum: ['Not urgent', 'Sometime this week', 'Within 2 days', 'Urgent – today'], required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);
