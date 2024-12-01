const Video = require('../models/Video');
const cloudinary = require('../services/cloudinary');
const OpenAI = require('openai');
const { io } = require('../services/socket');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Create a new video
const createVideo = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      sourceContent, 
      avatarSettings,
      backgroundMusic,
      tags,
      generateContent 
    } = req.body;
    
    const userId = req.user.userId;

    // Create initial video document
    const video = new Video({
      title,
      description,
      creator: userId,
      avatarSettings,
      backgroundMusic,
      tags,
      status: 'processing'
    });

    await video.save();

    // Send initial response
    res.status(201).json({
      message: 'Video creation started',
      videoId: video._id
    });

    try {
      let finalContent = sourceContent;
      let scenes = [];

      // If generateContent is true, generate script and scenes using OpenAI
      if (generateContent) {
        io.to(`user-${userId}`).emit('processingProgress', {
          stage: 'script',
          progress: 0,
          message: 'Generating video script...'
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { 
              role: "user", 
              content: `Create a video script about ${description}. 
                       Make it engaging and educational.
                       Break it into clear scenes with visual descriptions.
                       Include introduction, main points, and conclusion.` 
            }
          ],
          temperature: 0.7,
        });

        finalContent = completion.choices[0].message.content;

        io.to(`user-${userId}`).emit('processingProgress', {
          stage: 'script',
          progress: 100,
          message: 'Script generation complete'
        });

        // Generate scenes
        io.to(`user-${userId}`).emit('processingProgress', {
          stage: 'scenes',
          progress: 0,
          message: 'Generating scene visuals...'
        });

        const scriptSections = finalContent.split('\n\n').slice(0, 5); // Limit to 5 scenes
        
        for (let i = 0; i < scriptSections.length; i++) {
          const section = scriptSections[i];
          const imagePrompt = `Create a high-quality video scene for: ${section}
                             Style: Professional, modern, suitable for educational content.`;
          
          const imageResponse = await openai.images.generate({
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
          });

          const sceneUpload = await cloudinary.uploadMedia(
            `data:image/png;base64,${imageResponse.data[0].b64_json}`,
            'videos/scenes'
          );

          scenes.push(sceneUpload.secure_url);

          io.to(`user-${userId}`).emit('processingProgress', {
            stage: 'scenes',
            progress: ((i + 1) / scriptSections.length) * 100,
            message: `Generated scene ${i + 1} of ${scriptSections.length}`
          });
        }
      }

      // Generate thumbnail if needed
      if (!video.thumbnailUrl) {
        io.to(`user-${userId}`).emit('processingProgress', {
          stage: 'thumbnail',
          progress: 0,
          message: 'Generating thumbnail...'
        });

        const thumbnailPrompt = `Create a compelling thumbnail for: ${title}. 
                               Style: Eye-catching, professional, suitable for video platforms.`;
        
        const imageResponse = await openai.images.generate({
          prompt: thumbnailPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        });

        const thumbnailUpload = await cloudinary.uploadMedia(
          `data:image/png;base64,${imageResponse.data[0].b64_json}`,
          'videos/thumbnails'
        );

        video.thumbnailUrl = thumbnailUpload.secure_url;

        io.to(`user-${userId}`).emit('processingProgress', {
          stage: 'thumbnail',
          progress: 100,
          message: 'Thumbnail generation complete'
        });
      }

      // Update video with generated content
      video.sourceContent = finalContent;
      video.videoUrl = scenes[0] || ''; // Temporarily use first scene as video
      video.status = 'completed';
      
      await video.save();

      io.to(`user-${userId}`).emit('processingComplete', {
        videoId: video._id,
        message: 'Video generation complete',
        video: {
          ...video.toObject(),
          scenes
        }
      });

    } catch (error) {
      console.error('Processing error:', error);
      video.status = 'failed';
      await video.save();
      
      io.to(`user-${userId}`).emit('processingError', {
        videoId: video._id,
        message: error.message
      });
    }

  } catch (error) {
    console.error('Video creation error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
};

// Get all videos for a user
const getUserVideos = async (req, res) => {
  try {
    const userId = req.user.userId;
    const videos = await Video.find({ creator: userId })
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// Get a single video
const getVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      creator: req.user.userId
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

// Delete a video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      creator: req.user.userId
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary if exists
    if (video.videoUrl) {
      // Extract public_id from URL
      const publicId = video.videoUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.deleteMedia(publicId);
    }

    if (video.thumbnailUrl) {
      const publicId = video.thumbnailUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.deleteMedia(publicId);
    }

    await video.remove();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {
  createVideo,
  getUserVideos,
  getVideo,
  deleteVideo
};
