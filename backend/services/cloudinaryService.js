const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  static async uploadAudio(filePath) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        folder: 'podcasts/audio',
      });
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading audio to Cloudinary:', error);
      // Clean up the temporary file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  static async uploadImage(filePath) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'podcasts/thumbnails',
      });
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      // Clean up the temporary file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  static async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }
}

module.exports = { CloudinaryService };
