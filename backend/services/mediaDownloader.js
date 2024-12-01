const axios = require('axios');

const RAPID_API_HOST = 'all-media-downloader1.p.rapidapi.com';

const downloadMedia = async (url, platform) => {
  try {
    const response = await axios.post(
      'https://all-media-downloader1.p.rapidapi.com/all',
      { url },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': RAPID_API_HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Media download error:', error);
    throw error;
  }
};

const downloadSpotify = async (url) => {
  try {
    const response = await axios.post(
      'https://all-media-downloader1.p.rapidapi.com/spotifydl',
      { url },
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': RAPID_API_HOST,
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Spotify download error:', error);
    throw error;
  }
};

module.exports = {
  downloadMedia,
  downloadSpotify,
};
