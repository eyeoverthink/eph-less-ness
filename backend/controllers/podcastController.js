const Podcast = require('../models/Podcast');
const cloudinary = require('../services/cloudinary');
const elevenLabs = require('../services/elevenLabs');
const OpenAI = require('openai');
const { io } = require('../services/socket');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Create a new podcast
const createPodcast = async (req, res) => {
  try {
    const { title, description, sourceText, tags, generateContent } = req.body;
    const userId = req.user.userId;

    // Create initial podcast document
    const podcast = new Podcast({
      title,
      description,
      creator: userId,
      tags,
      status: 'processing'
    });

    await podcast.save();

    // Send initial response
    res.status(201).json({
      message: 'Podcast creation started',
      podcastId: podcast._id
    });

    // Start async processing
    processPodcast(podcast, userId, sourceText, generateContent).catch(error => {
      console.error('Error in podcast processing:', error);
    });

  } catch (error) {
    console.error('Error creating podcast:', error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
};

// Async function to process the podcast
const processPodcast = async (podcast, userId, sourceText, generateContent) => {
  const socketRoom = `user-${userId}`;
  
  try {
    let finalSourceText = sourceText;
    
    // If generateContent is true, generate script using OpenAI
    if (generateContent) {
      io.to(socketRoom).emit('processingProgress', {
        stage: 'script',
        progress: 0,
        message: 'Generating podcast script...'
      });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional podcast script writer. Create engaging, natural-sounding content."
          },
          {
            role: "user",
            content: `Create a podcast script about: ${sourceText}`
          }
        ],
        temperature: 0.7,
      });
      
      finalSourceText = completion.choices[0].message.content;
      
      io.to(socketRoom).emit('processingProgress', {
        stage: 'script',
        progress: 100,
        message: 'Script generation complete'
      });
    }
    
    // Generate audio using ElevenLabs
    io.to(socketRoom).emit('processingProgress', {
      stage: 'audio',
      progress: 0,
      message: 'Generating audio...'
    });
    
    // Get available voices
    const voices = await elevenLabs.getVoices();
    const selectedVoice = voices[0]; // Use first voice or implement voice selection logic
    
    // Generate speech with enhanced options
    const audioBuffer = await elevenLabs.generateSpeech(finalSourceText, selectedVoice.voice_id, {
      stability: 0.7,
      similarityBoost: 0.7,
      style: 1.0,
      speakerBoost: true,
      modelId: 'eleven_multilingual_v2'
    });
    
    io.to(socketRoom).emit('processingProgress', {
      stage: 'audio',
      progress: 50,
      message: 'Audio generated, uploading to cloud storage...'
    });
    
    // Upload to Cloudinary
    const audioResult = await cloudinary.uploader.upload_stream({
      resource_type: 'raw',
      format: 'mp3'
    }, async (error, result) => {
      if (error) {
        throw new Error('Failed to upload audio to Cloudinary');
      }
      
      // Update podcast with audio URL and complete status
      podcast.audioUrl = result.secure_url;
      podcast.status = 'completed';
      podcast.sourceText = finalSourceText;
      await podcast.save();
      
      io.to(socketRoom).emit('processingProgress', {
        stage: 'complete',
        progress: 100,
        message: 'Podcast creation complete!',
        podcast: {
          id: podcast._id,
          title: podcast.title,
          audioUrl: podcast.audioUrl,
          status: podcast.status
        }
      });
    });
    
    // Pipe audio buffer to Cloudinary
    const bufferStream = require('stream').Readable.from(Buffer.from(audioBuffer));
    bufferStream.pipe(audioResult);
    
  } catch (error) {
    console.error('Error in podcast processing:', error);
    
    // Update podcast status to failed
    podcast.status = 'failed';
    await podcast.save();
    
    // Notify client of failure
    io.to(socketRoom).emit('processingProgress', {
      stage: 'error',
      message: error.message
    });
  }
};

// Get all podcasts for a user
const getUserPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ creator: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// Get a single podcast
const getPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({ 
      _id: req.params.id,
      creator: req.user.userId 
    });
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    res.json(podcast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch podcast' });
  }
};

// Update podcast thumbnail
const updateThumbnail = async (req, res) => {
  try {
    const { thumbnailUrl } = req.body;
    const podcast = await Podcast.findOne({ 
      _id: req.params.id,
      creator: req.user.userId 
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    podcast.thumbnailUrl = thumbnailUrl;
    await podcast.save();

    res.json({ message: 'Thumbnail updated successfully', podcast });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update thumbnail' });
  }
};

// Delete a podcast
const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({ 
      _id: req.params.id,
      creator: req.user.userId 
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // Delete from Cloudinary if URLs exist
    if (podcast.audioUrl) {
      const audioPublicId = podcast.audioUrl.split('/').pop().split('.')[0];
      await cloudinary.deleteMedia(audioPublicId);
    }

    if (podcast.thumbnailUrl) {
      const thumbnailPublicId = podcast.thumbnailUrl.split('/').pop().split('.')[0];
      await cloudinary.deleteMedia(thumbnailPublicId);
    }

    await podcast.deleteOne();
    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete podcast' });
  }
};

module.exports = {
  createPodcast,
  getUserPodcasts,
  getPodcast,
  updateThumbnail,
  deletePodcast
};
