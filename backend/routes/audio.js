const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { processAudioWaveform } = require('../services/audioProcessor');

// Get waveform data for an audio file
router.post('/waveform-data', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const waveformData = await processAudioWaveform(req.file.path);
    res.json({ waveformData });
  } catch (error) {
    console.error('Error processing waveform:', error);
    res.status(500).json({ error: 'Error processing audio waveform' });
  }
});

// Get waveform data from URL
router.get('/waveform-data', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'No audio URL provided' });
    }

    const waveformData = await processAudioWaveform(url);
    res.json({ waveformData });
  } catch (error) {
    console.error('Error processing waveform:', error);
    res.status(500).json({ error: 'Error processing audio waveform' });
  }
});

module.exports = router;
