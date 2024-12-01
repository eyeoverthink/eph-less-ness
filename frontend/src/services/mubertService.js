import axios from 'axios';

const MUBERT_API_URL = 'https://api-b2b.mubert.com/v2';

class MubertService {
  constructor() {
    this.PAT_API_URL = 'https://api-b2b.mubert.com/v2/TTM';
  }

  async getAuthToken() {
    try {
      // Get a new token for each session
      const response = await axios.post(`${this.PAT_API_URL}/pat`, {
        email: "test@test.com",
        license: "ttm"
      });

      if (!response.data?.data?.pat) {
        throw new Error('No PAT received from Mubert');
      }

      return response.data.data.pat;
    } catch (error) {
      console.error('Error getting Mubert auth token:', error);
      throw new Error('Failed to authenticate with Mubert');
    }
  }

  async generateMusicTrack({ mood = 'calm', duration = 60, genre = 'ambient' }) {
    try {
      const pat = await this.getAuthToken();
      
      // Combine mood and genre for better prompt
      const prompt = `${mood} ${genre} background music`;
      
      // First, get the track generation status
      const generateResponse = await axios.post(`${this.PAT_API_URL}/generate`, {
        pat,
        text: prompt,
        duration,
        format: "mp3",
        bitrate: "320k",
        mode: "track"
      });

      if (!generateResponse.data?.data?.tasks?.[0]?.download_link) {
        throw new Error('No music download link received');
      }

      // Return both the download URL and a preview URL if available
      return {
        downloadUrl: generateResponse.data.data.tasks[0].download_link,
        previewUrl: generateResponse.data.data.tasks[0].download_link,
        duration: duration
      };
    } catch (error) {
      console.error('Error generating music track:', error);
      throw new Error(error.message || 'Failed to generate background music');
    }
  }

  async generateTransitionSound({ type = 'smooth', duration = 3 }) {
    try {
      const pat = await this.getAuthToken();
      
      const generateResponse = await axios.post(`${this.PAT_API_URL}/generate`, {
        pat,
        text: `${type} transition sound effect`,
        duration,
        format: "mp3",
        bitrate: "320k",
        mode: "loop"
      });

      if (!generateResponse.data?.data?.tasks?.[0]?.download_link) {
        throw new Error('No sound effect download link received');
      }

      return {
        downloadUrl: generateResponse.data.data.tasks[0].download_link,
        duration: duration
      };
    } catch (error) {
      console.error('Error generating transition sound:', error);
      throw new Error('Failed to generate transition sound');
    }
  }

  async getSoundEffects(category = 'general') {
    try {
      const response = await axios.get(`${MUBERT_API_URL}/library/effects`, {
        params: {
          category,
          apiKey: import.meta.env.VITE_MUBERT_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching sound effects:', error);
      throw error;
    }
  }
}

export default new MubertService();
