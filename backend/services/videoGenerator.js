const OpenAI = require('openai');
const cloudinary = require('./cloudinary');
const { io } = require('./socket');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class VideoGenerator {
    constructor() {
        this.openai = openai;
    }

    async generateScript(topic, style, length) {
        try {
            const prompt = `Create a video script about ${topic}. Style: ${style}. Length: ${length} minutes.
                           Include sections for introduction, main points, and conclusion.
                           Format: Clear, engaging, and suitable for video presentation.`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: length * 200
            });

            return completion.choices[0].message.content;
        } catch (error) {
            throw new Error(`Script generation failed: ${error.message}`);
        }
    }

    async generateStoryboard(script, numScenes = 5) {
        try {
            const scenes = script.split('\n\n').slice(0, numScenes);
            const storyboard = [];

            for (let scene of scenes) {
                const imagePrompt = `Create a high-quality video scene visualization for: ${scene}
                                   Style: Professional, cinematic, suitable for video content.`;
                
                const response = await this.openai.images.generate({
                    prompt: imagePrompt,
                    n: 1,
                    size: "1024x1024",
                    response_format: "b64_json"
                });

                storyboard.push({
                    scene,
                    imageData: response.data[0].b64_json
                });
            }

            return storyboard;
        } catch (error) {
            throw new Error(`Storyboard generation failed: ${error.message}`);
        }
    }

    async generateVideo(userId, topic, style = 'educational', length = 5) {
        const socketRoom = `user-${userId}`;
        
        try {
            // 1. Generate Script
            io.to(socketRoom).emit('processingProgress', {
                stage: 'script',
                progress: 0,
                message: 'Generating video script...'
            });
            
            const script = await this.generateScript(topic, style, length);
            
            io.to(socketRoom).emit('processingProgress', {
                stage: 'script',
                progress: 100,
                message: 'Script generation complete'
            });

            // 2. Generate Storyboard
            io.to(socketRoom).emit('processingProgress', {
                stage: 'storyboard',
                progress: 0,
                message: 'Generating storyboard scenes...'
            });

            const storyboard = await this.generateStoryboard(script);
            const sceneUrls = [];

            // 3. Upload Scenes to Cloudinary
            for (let i = 0; i < storyboard.length; i++) {
                const scene = storyboard[i];
                const upload = await cloudinary.uploadMedia(
                    `data:image/png;base64,${scene.imageData}`,
                    'videos/scenes'
                );
                sceneUrls.push(upload.secure_url);

                io.to(socketRoom).emit('processingProgress', {
                    stage: 'storyboard',
                    progress: ((i + 1) / storyboard.length) * 100,
                    message: `Uploaded scene ${i + 1} of ${storyboard.length}`
                });
            }

            // 4. Generate Thumbnail
            io.to(socketRoom).emit('processingProgress', {
                stage: 'thumbnail',
                progress: 0,
                message: 'Generating thumbnail...'
            });

            const thumbnailPrompt = `Create a compelling thumbnail for a video about ${topic}.
                                   Style: Eye-catching, professional, suitable for YouTube.`;
            
            const thumbnailResponse = await this.openai.images.generate({
                prompt: thumbnailPrompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            });

            const thumbnailUpload = await cloudinary.uploadMedia(
                `data:image/png;base64,${thumbnailResponse.data[0].b64_json}`,
                'videos/thumbnails'
            );

            io.to(socketRoom).emit('processingProgress', {
                stage: 'thumbnail',
                progress: 100,
                message: 'Thumbnail generation complete'
            });

            // Return generated assets
            return {
                script,
                sceneUrls,
                thumbnailUrl: thumbnailUpload.secure_url,
                duration: length * 60 // Estimated duration in seconds
            };

        } catch (error) {
            io.to(socketRoom).emit('processingError', {
                message: error.message
            });
            throw error;
        }
    }
}

module.exports = new VideoGenerator();
