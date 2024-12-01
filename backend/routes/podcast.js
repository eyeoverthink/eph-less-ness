const express = require('express');
const router = express.Router();
const {
  createPodcast,
  getUserPodcasts,
  getPodcast,
  updateThumbnail,
  deletePodcast,
} = require('../controllers/podcastController');

// Create a new podcast
router.post('/', createPodcast);

// Get all podcasts for the authenticated user
router.get('/user', getUserPodcasts);

// Get a specific podcast
router.get('/:id', getPodcast);

// Update podcast thumbnail
router.patch('/:id/thumbnail', updateThumbnail);

// Delete a podcast
router.delete('/:id', deletePodcast);

module.exports = router;
