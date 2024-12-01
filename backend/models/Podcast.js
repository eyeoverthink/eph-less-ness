const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  script: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: false,
  },
  backgroundMusicUrl: {
    type: String,
    required: false,
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  isAIGenerated: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'published'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
podcastSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PodcastModel = mongoose.model('Podcast', podcastSchema);

module.exports = { PodcastModel };
