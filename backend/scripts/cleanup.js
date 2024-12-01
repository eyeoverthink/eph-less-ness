require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function cleanupUnusedResources() {
    console.log('🧹 Starting Cleanup Process\n');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all Cloudinary resources
        const cloudinaryResources = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'podcast-studio',
            max_results: 500
        });

        // Get all MongoDB documents that reference media
        const Podcast = mongoose.model('Podcast', new mongoose.Schema({
            audioUrl: String,
            thumbnailUrl: String
        }));

        const Content = mongoose.model('Content', new mongoose.Schema({
            mediaUrl: String,
            thumbnailUrl: String
        }));

        const podcasts = await Podcast.find({}, { audioUrl: 1, thumbnailUrl: 1 });
        const contents = await Content.find({}, { mediaUrl: 1, thumbnailUrl: 1 });

        // Collect all valid media URLs from MongoDB
        const validUrls = new Set([
            ...podcasts.map(p => p.audioUrl),
            ...podcasts.map(p => p.thumbnailUrl),
            ...contents.map(c => c.mediaUrl),
            ...contents.map(c => c.thumbnailUrl)
        ].filter(Boolean));

        // Find unused Cloudinary resources
        const unusedResources = cloudinaryResources.resources.filter(resource => {
            const url = cloudinary.url(resource.public_id);
            return !validUrls.has(url);
        });

        if (unusedResources.length > 0) {
            console.log(`Found ${unusedResources.length} unused resources:`);
            for (const resource of unusedResources) {
                console.log(`- ${resource.public_id} (${(resource.bytes / 1024 / 1024).toFixed(2)} MB)`);
            }

            // Ask for confirmation before deletion
            console.log('\n⚠️ These resources will be deleted from Cloudinary.');
            console.log('To proceed, run this script with --confirm flag');
            
            if (process.argv.includes('--confirm')) {
                console.log('\nDeleting unused resources...');
                for (const resource of unusedResources) {
                    await cloudinary.uploader.destroy(resource.public_id);
                    console.log(`✅ Deleted ${resource.public_id}`);
                }
            }
        } else {
            console.log('No unused resources found.');
        }

        // Check for invalid MongoDB references
        console.log('\nChecking for invalid MongoDB references...');
        const invalidPodcasts = podcasts.filter(p => 
            (p.audioUrl && !p.audioUrl.includes(process.env.CLOUDINARY_CLOUD_NAME)) ||
            (p.thumbnailUrl && !p.thumbnailUrl.includes(process.env.CLOUDINARY_CLOUD_NAME))
        );

        const invalidContents = contents.filter(c =>
            (c.mediaUrl && !c.mediaUrl.includes(process.env.CLOUDINARY_CLOUD_NAME)) ||
            (c.thumbnailUrl && !c.thumbnailUrl.includes(process.env.CLOUDINARY_CLOUD_NAME))
        );

        if (invalidPodcasts.length > 0) {
            console.log(`Found ${invalidPodcasts.length} podcasts with invalid media references:`);
            invalidPodcasts.forEach(p => console.log(`- Podcast ID: ${p._id}`));
        }

        if (invalidContents.length > 0) {
            console.log(`Found ${invalidContents.length} contents with invalid media references:`);
            invalidContents.forEach(c => console.log(`- Content ID: ${c._id}`));
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
    }
}

cleanupUnusedResources().catch(console.error);
