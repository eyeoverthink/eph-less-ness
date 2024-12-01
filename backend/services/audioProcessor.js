const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

/**
 * Process audio file to generate waveform data
 * @param {string} audioPath - Path or URL to audio file
 * @returns {Promise<number[]>} Array of audio amplitude values
 */
async function processAudioWaveform(audioPath) {
  let localPath = audioPath;
  let needsCleanup = false;

  try {
    // If audioPath is a URL, download it first
    if (audioPath.startsWith('http')) {
      const response = await axios.get(audioPath, { responseType: 'arraybuffer' });
      localPath = path.join('uploads', `temp-${Date.now()}.mp3`);
      await writeFile(localPath, response.data);
      needsCleanup = true;
    }

    // Process audio file using ffmpeg
    const waveformData = await new Promise((resolve, reject) => {
      const samples = [];
      ffmpeg(localPath)
        .toFormat('wav')
        .audioFrequency(44100)
        .audioChannels(1)
        .on('error', reject)
        .on('progress', (progress) => {
          // Calculate amplitude from raw audio data
          const amplitude = Math.abs(progress.frames / 100);
          samples.push(amplitude);
        })
        .on('end', () => {
          // Normalize waveform data
          const max = Math.max(...samples);
          const normalizedSamples = samples.map(s => s / max);
          resolve(normalizedSamples);
        })
        .pipe(); // Output to pipe instead of file
    });

    // Clean up temporary file if needed
    if (needsCleanup) {
      await unlink(localPath);
    }

    return waveformData;
  } catch (error) {
    console.error('Error processing audio:', error);
    if (needsCleanup && fs.existsSync(localPath)) {
      await unlink(localPath);
    }
    throw error;
  }
}

module.exports = {
  processAudioWaveform
};
