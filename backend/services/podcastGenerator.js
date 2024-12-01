const OpenAI = require('openai');
const elevenLabs = require('./elevenLabs');
const cloudinary = require('./cloudinary');
const { io } = require('./socket');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class PodcastGenerator {
    constructor() {
        this.openai = openai;
    }

    async generateScript(topic, style, length) {
        try {
            const prompt = `Create a podcast script about ${topic}. Style: ${style}. Length: ${length} minutes.
                           Include sections for introduction, main content, and conclusion.
                           Format: Natural conversational style with clear section breaks.`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: length * 200 // Approximate tokens for desired length
            });

            return completion.choices[0].message.content;
        } catch (error) {
            throw new Error(`Script generation failed: ${error.message}`);
        }
    }

    async generatePodcast(userId, topic, style = 'conversational', length = 5) {
        const socketRoom = `user-${userId}`;
        
        try {
            // 1. Generate Script
            io.to(socketRoom).emit('processingProgress', {
                stage: 'script',
                progress: 0,
                message: 'Generating podcast script...'
            });
            
            const script = await this.generateScript(topic, style, length);
            
            io.to(socketRoom).emit('processingProgress', {
                stage: 'script',
                progress: 100,
                message: 'Script generation complete'
            });

            // 2. Generate Audio
            io.to(socketRoom).emit('processingProgress', {
                stage: 'audio',
                progress: 0,
                message: 'Converting script to audio...'
            });

            const audioBuffer = await elevenLabs.generateSpeech(script);
            
            io.to(socketRoom).emit('processingProgress', {
                stage: 'audio',
                progress: 50,
                message: 'Audio generated, uploading...'
            });

            // 3. Upload to Cloudinary
            const audioUpload = await cloudinary.uploadMedia(
                `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`,
                'podcasts/audio'
            );

            io.to(socketRoom).emit('processingProgress', {
                stage: 'audio',
                progress: 100,
                message: 'Audio processing complete'
            });

            // 4. Generate Thumbnail
            io.to(socketRoom).emit('processingProgress', {
                stage: 'thumbnail',
                progress: 0,
                message: 'Generating thumbnail...'
            });

            const thumbnailPrompt = `Create a vibrant, professional podcast cover image for a podcast about ${topic}. 
                                   Style: Modern, eye-catching, suitable for social media.`;
            
            const imageResponse = await this.openai.images.generate({
                prompt: thumbnailPrompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            });

            const thumbnailUpload = await cloudinary.uploadMedia(
                `data:image/png;base64,${imageResponse.data[0].b64_json}`,
                'podcasts/thumbnails'
            );

            io.to(socketRoom).emit('processingProgress', {
                stage: 'thumbnail',
                progress: 100,
                message: 'Thumbnail generation complete'
            });

            // Return all generated assets
            return {
                script,
                audioUrl: audioUpload.secure_url,
                thumbnailUrl: thumbnailUpload.secure_url,
                duration: Math.ceil(audioUpload.duration || length * 60)
            };

        } catch (error) {
            io.to(socketRoom).emit('processingError', {
                message: error.message
            });
            throw error;
        }
    }
}

module.exports = new PodcastGenerator();
