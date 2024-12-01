require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload(resourceType, folder) {
    try {
        console.log(`\nTesting ${resourceType} upload to ${folder}...`);
        
        // Use Cloudinary's upload API with a URL instead of local files
        const result = await cloudinary.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
            {
                resource_type: resourceType,
                folder: `podcast-studio/${folder}`,
                use_filename: true,
                unique_filename: true
            }
        );

        console.log('✅ Upload successful:');
        console.log({
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
            bytes: `${(result.bytes / 1024).toFixed(2)} KB`
        });

        return result;
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        return null;
    }
}

async function verifyUpload(uploadResult) {
    if (!uploadResult) return false;

    try {
        console.log(`\nVerifying upload ${uploadResult.public_id}...`);
        const result = await cloudinary.api.resource(uploadResult.public_id);
        console.log('✅ Resource verified on Cloudinary');
        return true;
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        return false;
    }
}

async function cleanupUpload(uploadResult) {
    if (!uploadResult) return;

    try {
        console.log(`\nCleaning up upload ${uploadResult.public_id}...`);
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('✅ Resource deleted from Cloudinary');
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Cloudinary upload tests\n');
    let uploadResult = null;

    try {
        // Test image upload (we'll use this to verify our upload paths)
        uploadResult = await testUpload('image', 'thumbnails');
        if (uploadResult) {
            await verifyUpload(uploadResult);
        }
    } catch (error) {
        console.error('\n❌ Test error:', error);
    } finally {
        // Cleanup
        if (uploadResult) {
            console.log('\n🧹 Cleaning up...');
            await cleanupUpload(uploadResult);
        }

        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`Upload test: ${uploadResult ? '✅ Success' : '❌ Failed'}`);
    }
}

runTests().catch(console.error);
