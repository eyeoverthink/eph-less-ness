const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PodcastModel } = require('../models/Podcast');
const { CloudinaryService } = require('../services/cloudinaryService');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Save podcast
router.post('/save', 
  ClerkExpressRequireAuth(),
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'backgroundMusic', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { title, script, description } = req.body;
      const userId = req.auth.userId;

      // Upload files to Cloudinary if present
      let audioUrl = null;
      let backgroundMusicUrl = null;
      let thumbnailUrl = null;

      if (req.files) {
        if (req.files['audio']) {
          audioUrl = await CloudinaryService.uploadAudio(req.files['audio'][0].path);
        }
        if (req.files['backgroundMusic']) {
          backgroundMusicUrl = await CloudinaryService.uploadAudio(req.files['backgroundMusic'][0].path);
        }
        if (req.files['thumbnail']) {
          thumbnailUrl = await CloudinaryService.uploadImage(req.files['thumbnail'][0].path);
        }
      }

      // Create podcast document
      const podcast = new PodcastModel({
        userId,
        title,
        script,
        description,
        audioUrl,
        backgroundMusicUrl,
        thumbnailUrl,
        status: audioUrl ? 'published' : 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await podcast.save();

      res.status(200).json({
        message: 'Podcast saved successfully',
        podcast: {
          id: podcast._id,
          title: podcast.title,
          audioUrl: podcast.audioUrl,
          thumbnailUrl: podcast.thumbnailUrl,
          status: podcast.status
        }
      });
    } catch (error) {
      console.error('Error saving podcast:', error);
      res.status(500).json({
        error: 'Failed to save podcast',
        details: error.message
      });
    }
});

// Get user's podcasts
router.get('/user', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const podcasts = await PodcastModel.find({ userId })
      .sort({ createdAt: -1 })
      .select('title audioUrl thumbnailUrl status createdAt');

    res.status(200).json({ podcasts });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({
      error: 'Failed to fetch podcasts',
      details: error.message
    });
  }
});

// Get single podcast
router.get('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const podcast = await PodcastModel.findOne({
      _id: req.params.id,
      userId: req.auth.userId
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.status(200).json({ podcast });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({
      error: 'Failed to fetch podcast',
      details: error.message
    });
  }
});

module.exports = router;
