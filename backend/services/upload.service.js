const cloudinary = require('cloudinary').v2;
const { UPLOAD_PATHS, THUMBNAIL_SETTINGS, TRANSCODE_SETTINGS } = require('../config/upload.config');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const unlinkAsync = promisify(fs.unlink);

class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    /**
     * Upload a file to Cloudinary with appropriate settings
     * @param {string} filePath - Path to the file
     * @param {string} type - Type of upload (thumbnails, audio, videos)
     * @returns {Promise<Object>} Cloudinary upload result
     */
    async uploadFile(filePath, type) {
        try {
            const uploadPath = UPLOAD_PATHS[type];
            const options = {
                folder: uploadPath,
                resource_type: this._getResourceType(type),
                ...this._getUploadOptions(type)
            };

            const result = await cloudinary.uploader.upload(filePath, options);
            return result;
        } finally {
            // Cleanup temporary file
            try {
                await unlinkAsync(filePath);
            } catch (error) {
                console.error('Error cleaning up temp file:', error);
            }
        }
    }

    /**
     * Generate thumbnails for video or audio content
     * @param {string} publicId - Cloudinary public ID of the media
     * @returns {Promise<Object>} Generated thumbnail URLs
     */
    async generateThumbnails(publicId) {
        const thumbnails = {};
        
        for (const size of THUMBNAIL_SETTINGS.sizes) {
            const options = {
                width: size.width,
                height: size.height,
                crop: THUMBNAIL_SETTINGS.crop,
                quality: THUMBNAIL_SETTINGS.quality,
                format: THUMBNAIL_SETTINGS.formats[0]
            };

            const result = await cloudinary.uploader.explicit(publicId, {
                type: 'upload',
                eager: [options],
                eager_async: false
            });

            thumbnails[size.suffix] = result.eager[0].secure_url;
        }

        return thumbnails;
    }

    /**
     * Transcode audio/video to standard format
     * @param {string} inputPath - Path to input file
     * @param {string} type - Type of media (audio/video)
     * @returns {Promise<string>} Path to transcoded file
     */
    async transcodeMedia(inputPath, type) {
        const settings = TRANSCODE_SETTINGS[type];
        const outputPath = path.join(
            path.dirname(inputPath),
            `transcoded_${Date.now()}.${settings.format}`
        );

        return new Promise((resolve, reject) => {
            const command = ffmpeg(inputPath);

            if (type === 'audio') {
                command
                    .audioCodec('libmp3lame')
                    .audioBitrate(settings.bitrate)
                    .audioChannels(settings.channels)
                    .audioFrequency(settings.frequency);
            } else {
                command
                    .videoCodec('libx264')
                    .size(`?x${settings.resolution.replace('p', '')}`)
                    .videoBitrate(settings.bitrate)
                    .autopad();
            }

            command
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .save(outputPath);
        });
    }

    /**
     * Delete a file from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     * @param {string} type - Type of resource
     */
    async deleteFile(publicId, type) {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: this._getResourceType(type)
        });
    }

    /**
     * Get appropriate resource type for Cloudinary
     * @private
     */
    _getResourceType(type) {
        switch (type) {
            case 'audio':
                return 'raw';
            case 'videos':
                return 'video';
            default:
                return 'image';
        }
    }

    /**
     * Get upload options based on content type
     * @private
     */
    _getUploadOptions(type) {
        switch (type) {
            case 'audio':
                return {
                    resource_type: 'raw',
                    use_filename: true,
                    unique_filename: true
                };
            case 'videos':
                return {
                    resource_type: 'video',
                    eager: [
                        { streaming_profile: 'hd', format: 'mp4' }
                    ],
                    eager_async: true
                };
            default:
                return {
                    eager: THUMBNAIL_SETTINGS.sizes.map(size => ({
                        width: size.width,
                        height: size.height,
                        crop: THUMBNAIL_SETTINGS.crop,
                        format: THUMBNAIL_SETTINGS.formats[0]
                    }))
                };
        }
    }
}

module.exports = new UploadService();
