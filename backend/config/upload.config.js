/**
 * Upload configuration for the AI Podcast Studio
 * Defines paths, allowed formats, and size limits for different types of content
 */

const UPLOAD_PATHS = {
    thumbnails: 'podcast-studio/thumbnails',
    audio: 'podcast-studio/audio',
    videos: 'podcast-studio/videos',
    temp: 'podcast-studio/temp'
};

const ALLOWED_FORMATS = {
    thumbnails: ['jpg', 'jpeg', 'png', 'webp'],
    audio: ['mp3', 'wav', 'm4a', 'aac'],
    videos: ['mp4', 'webm', 'mov']
};

const SIZE_LIMITS = {
    thumbnails: 5 * 1024 * 1024,     // 5MB
    audio: 100 * 1024 * 1024,        // 100MB
    videos: 500 * 1024 * 1024        // 500MB
};

const TRANSCODE_SETTINGS = {
    audio: {
        format: 'mp3',
        bitrate: '192k',
        channels: 2,
        frequency: 44100
    },
    video: {
        format: 'mp4',
        codec: 'h264',
        resolution: '1080p',
        bitrate: '2000k'
    }
};

const THUMBNAIL_SETTINGS = {
    formats: ['jpg', 'webp'],
    sizes: [
        { width: 200, height: 200, suffix: 'thumb' },
        { width: 600, height: 400, suffix: 'preview' },
        { width: 1280, height: 720, suffix: 'large' }
    ],
    quality: 80,
    crop: 'fill'
};

module.exports = {
    UPLOAD_PATHS,
    ALLOWED_FORMATS,
    SIZE_LIMITS,
    TRANSCODE_SETTINGS,
    THUMBNAIL_SETTINGS
};
