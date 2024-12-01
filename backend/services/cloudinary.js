const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  constructor() {
    this.defaultOptions = {
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    };
  }

  async uploadMedia(file, options = {}) {
    try {
      const uploadOptions = {
        ...this.defaultOptions,
        ...options,
      };

      if (options.isAudio) {
        uploadOptions.resource_type = 'raw';
        uploadOptions.format = 'mp3';
      }

      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  async uploadStream(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { ...this.defaultOptions, ...options },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  }

  async deleteMedia(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }

  async createImageThumbnail(url, options = {}) {
    try {
      const defaultThumbOptions = {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'jpg',
      };

      const thumbOptions = { ...defaultThumbOptions, ...options };
      return cloudinary.url(url, thumbOptions);
    } catch (error) {
      console.error('Cloudinary thumbnail creation error:', error);
      throw new Error(`Failed to create thumbnail: ${error.message}`);
    }
  }

  async optimizeAudio(publicId, options = {}) {
    try {
      const defaultAudioOptions = {
        bit_rate: '128k',
        sample_rate: '44100',
      };

      const audioOptions = { ...defaultAudioOptions, ...options };
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'raw',
        raw_transformation: [
          { bit_rate: audioOptions.bit_rate },
          { sample_rate: audioOptions.sample_rate },
        ],
      });

      return result;
    } catch (error) {
      console.error('Cloudinary audio optimization error:', error);
      throw new Error(`Failed to optimize audio: ${error.message}`);
    }
  }

  generateSignature(params) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, ...params },
        process.env.CLOUDINARY_API_SECRET
      );

      return {
        timestamp,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
      };
    } catch (error) {
      console.error('Cloudinary signature generation error:', error);
      throw new Error(`Failed to generate signature: ${error.message}`);
    }
  }

  getAssetInfo(publicId, options = {}) {
    return cloudinary.api.resource(publicId, options);
  }

  async createArchive(publicIds, options = {}) {
    try {
      const defaultArchiveOptions = {
        resource_type: 'auto',
        target_format: 'zip',
      };

      const archiveOptions = { ...defaultArchiveOptions, ...options };
      return await cloudinary.utils.download_zip_url({
        public_ids: publicIds,
        ...archiveOptions,
      });
    } catch (error) {
      console.error('Cloudinary archive creation error:', error);
      throw new Error(`Failed to create archive: ${error.message}`);
    }
  }
}

module.exports = new CloudinaryService();
