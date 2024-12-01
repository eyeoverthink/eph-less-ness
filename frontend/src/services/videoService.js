import axios from 'axios';
import openaiService from './openaiService';

const RICK_ROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

class VideoService {
  constructor() {
    this.rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  }

  getDefaultVideo() {
    return {
      title: "Never Gonna Give You Up",
      url: RICK_ROLL_URL,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      artist: "Rick Astley"
    };
  }

  async generateThumbnail(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: `Create a podcast thumbnail image: ${prompt}. Style: Professional, modern, engaging podcast cover art.`,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  async generateBackgroundMusic(description) {
    try {
      // In a real implementation, this would connect to a music generation API
      // For now, we'll return a placeholder lofi track
      return {
        title: "Generated Background Music",
        url: "https://example.com/lofi-background.mp3",
        genre: "Lofi",
        duration: "3:00"
      };
    } catch (error) {
      console.error('Error generating background music:', error);
      throw new Error('Failed to generate background music');
    }
  }
}

export default new VideoService();
