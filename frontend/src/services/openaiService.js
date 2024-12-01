import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1';

class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateContentSuggestions(topic, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const {
        style = 'conversational',
        targetAudience = 'general',
        format = 'bullet-points',
        numberOfSuggestions = 5
      } = options;

      const prompt = `Generate ${numberOfSuggestions} engaging podcast content suggestions about "${topic}".
        Style: ${style}
        Target Audience: ${targetAudience}
        
        For each suggestion, provide:
        1. A catchy title
        2. Brief description (2-3 sentences)
        3. Key talking points (3-5 points)
        4. Potential guest expertise (if applicable)
        
        Format the response in a clear, structured way.`;

      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional podcast content strategist helping to generate engaging content ideas."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('No content received from OpenAI');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(error.message || 'Failed to generate content suggestions');
    }
  }

  async generatePodcastScript(topic, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const {
        style = 'conversational',
        length = 'medium',
        format = 'dialogue',
        tone = 'friendly',
        targetAudience = 'general',
        includeSegments = ['intro', 'main', 'outro'],
        structureType = 'narrative'
      } = options;

      const lengthTokens = {
        short: 300,
        medium: 600,
        long: 1000
      };

      const prompt = `Generate a ${length} podcast script about "${topic}".
        Style: ${style}
        Format: ${format}
        Tone: ${tone}
        Target Audience: ${targetAudience}
        Structure: ${structureType}
        
        Include the following segments: ${includeSegments.join(', ')}
        
        Format the script with clear speaker indicators and timing suggestions.`;

      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional podcast scriptwriter creating engaging and well-structured scripts."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: lengthTokens[length] || 600
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('No script received from OpenAI');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating podcast script:', error);
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(error.message || 'Failed to generate podcast script');
    }
  }

  async generateVideoScript(title, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const {
        style = 'engaging',
        duration = '3-5 minutes',
        format = 'social media',
        tone = 'professional'
      } = options;

      const prompt = `Create a video script for a ${duration} video titled "${title}".
        Style: ${style}
        Format: ${format}
        Tone: ${tone}
        
        Please structure the script with:
        1. Hook/Introduction
        2. Main points/content
        3. Call to action/conclusion
        
        Format the response as a clear, ready-to-use script.`;

      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional video script writer helping to create engaging video content."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating video script:', error);
      throw error;
    }
  }

  async generateThumbnail(title, description, style = 'modern and professional') {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const prompt = `Create a thumbnail image for a video titled "${title}". 
        Description: ${description}
        Style: ${style}
        
        The image should be:
        - Eye-catching and professional
        - Suitable for social media
        - Clear and readable
        - High contrast for text visibility`;

      const response = await axios.post(
        `${OPENAI_API_URL}/images/generations`,
        {
          prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url"
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }
}

export default new OpenAIService();
