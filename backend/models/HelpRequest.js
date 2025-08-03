// backend/models/HelpRequest.js

const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  contactMethod: { type: String, enum: ['Phone', 'Email', 'Either'], required: true },
  helpTypes: [{ type: String }],
  description: { type: String, required: true },
  urgency: { type: String, enum: ['Not urgent', 'Sometime this week', 'Within 2 days', 'Urgent – today'], required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Completed'], default: 'Pending' },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', default: null },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('HelpRequest', HelpRequestSchema);
