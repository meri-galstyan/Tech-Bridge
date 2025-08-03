const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  communityServiceHours: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
