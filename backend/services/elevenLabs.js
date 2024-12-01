const axios = require('axios');

const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.ELEVEN_LABS_API_KEY;
    this.defaultVoiceId = '21m00Tcm4TlvDq8ikWAM';
  }

  async generateSpeech(text, voiceId = this.defaultVoiceId, options = {}) {
    try {
      const {
        stability = 0.5,
        similarityBoost = 0.5,
        style = 1.0,
        speakerBoost = true,
        modelId = 'eleven_multilingual_v2'
      } = options;

      const response = await axios.post(
        `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            speaker_boost: speakerBoost
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw new Error(this._formatError(error));
    }
  }

  async getVoices() {
    try {
      const response = await axios.get(
        `${ELEVEN_LABS_API_URL}/voices`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data.voices;
    } catch (error) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw new Error(this._formatError(error));
    }
  }

  async getVoiceSettings(voiceId) {
    try {
      const response = await axios.get(
        `${ELEVEN_LABS_API_URL}/voices/${voiceId}/settings`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw new Error(this._formatError(error));
    }
  }

  async getModels() {
    try {
      const response = await axios.get(
        `${ELEVEN_LABS_API_URL}/models`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw new Error(this._formatError(error));
    }
  }

  async getVoiceSamples(voiceId) {
    try {
      const response = await axios.get(
        `${ELEVEN_LABS_API_URL}/voices/${voiceId}`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data.samples;
    } catch (error) {
      console.error('ElevenLabs API error:', error.response?.data || error.message);
      throw new Error(this._formatError(error));
    }
  }

  _formatError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return 'Invalid API key. Please check your ElevenLabs API key.';
        case 429:
          return 'Rate limit exceeded. Please try again later.';
        case 400:
          return `Bad request: ${data.detail || 'Please check your input parameters.'}`;
        default:
          return `API error: ${data.detail || error.message}`;
      }
    }
    return error.message;
  }
}

module.exports = new ElevenLabsService();
