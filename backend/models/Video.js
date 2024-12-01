const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  imageUrl: String,
  description: String
});

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  sourceText: {
    type: String,
  },
  scenes: [sceneSchema],
  tags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  }
});

module.exports = mongoose.model('Video', videoSchema);
