const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  hours: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', UserSchema);
