const express = require('express');
const router = express.Router();
const {
  createVideo,
  getUserVideos,
  getVideo,
  deleteVideo,
} = require('../controllers/videoController');

// Create a new video
router.post('/', createVideo);

// Get all videos for the authenticated user
router.get('/user', getUserVideos);

// Get a specific video
router.get('/:id', getVideo);

// Delete a video
router.delete('/:id', deleteVideo);

module.exports = router;
