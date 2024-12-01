import axios from 'axios';

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

export const getVoices = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY
      }
    });
    return response.data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw new Error('Failed to fetch voices. Please check your API key and try again.');
  }
};

export const generateSpeech = async (text, voiceId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );
    
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(response.data);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech. Please try again.');
  }
};
