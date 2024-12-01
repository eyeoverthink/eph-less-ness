import axios from 'axios';
import openaiService from './openaiService';

class ContentSuggestionService {
  async generateTopicSuggestions(mainTopic) {
    try {
      const prompt = `Generate 5 engaging podcast episode topics related to: ${mainTopic}. 
        Include potential guest suggestions and key talking points.`;
      
      const response = await openaiService.generateContent(prompt);
      return this.parseTopicSuggestions(response);
    } catch (error) {
      console.error('Error generating topic suggestions:', error);
      throw error;
    }
  }

  async getKeywordOptimization(content) {
    try {
      const prompt = `Analyze this podcast content and suggest SEO-optimized keywords:
        ${content}
        Provide:
        1. Primary keywords (3-5)
        2. Secondary keywords (5-7)
        3. Long-tail phrases (3-4)`;
      
      const response = await openaiService.generateContent(prompt);
      return this.parseKeywords(response);
    } catch (error) {
      console.error('Error generating keywords:', error);
      throw error;
    }
  }

  async analyzeAudienceTarget(content) {
    try {
      const prompt = `Analyze this podcast content and provide:
        1. Primary audience demographics
        2. Interest categories
        3. Engagement suggestions
        4. Platform recommendations
        Content: ${content}`;
      
      const response = await openaiService.generateContent(prompt);
      return this.parseAudienceAnalysis(response);
    } catch (error) {
      console.error('Error analyzing audience:', error);
      throw error;
    }
  }

  // Helper methods to parse AI responses
  parseTopicSuggestions(response) {
    try {
      const topics = response.split('\n')
        .filter(line => line.trim().length > 0)
        .map(topic => {
          const [title, ...details] = topic.split(':');
          return {
            title: title.trim().replace(/^\d+\.\s*/, ''),
            details: details.join(':').trim()
          };
        });
      return topics;
    } catch (error) {
      console.error('Error parsing topic suggestions:', error);
      return [];
    }
  }

  parseKeywords(response) {
    try {
      const sections = response.split('\n\n');
      return {
        primary: this.extractListItems(sections[0]),
        secondary: this.extractListItems(sections[1]),
        longTail: this.extractListItems(sections[2])
      };
    } catch (error) {
      console.error('Error parsing keywords:', error);
      return { primary: [], secondary: [], longTail: [] };
    }
  }

  parseAudienceAnalysis(response) {
    try {
      const sections = response.split('\n\n');
      return {
        demographics: this.extractListItems(sections[0]),
        interests: this.extractListItems(sections[1]),
        engagement: this.extractListItems(sections[2]),
        platforms: this.extractListItems(sections[3])
      };
    } catch (error) {
      console.error('Error parsing audience analysis:', error);
      return {
        demographics: [],
        interests: [],
        engagement: [],
        platforms: []
      };
    }
  }

  extractListItems(text) {
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '').trim());
  }
}

export default new ContentSuggestionService();
