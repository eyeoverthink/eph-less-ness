const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  podcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }]
});

module.exports = mongoose.model('User', userSchema);
