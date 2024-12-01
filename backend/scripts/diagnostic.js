require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { OpenAI } = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function runDiagnostics() {
    console.log('🔍 Starting System Diagnostics\n');
    const results = {
        mongodb: false,
        cloudinary: false,
        openai: false,
        clerk: false
    };

    try {
        // Test MongoDB Connection
        console.log('Testing MongoDB Connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('✅ MongoDB Connected');
        console.log('Collections found:', collections.map(c => c.name).join(', '));
        results.mongodb = true;

        // Get MongoDB Stats
        const dbStats = await mongoose.connection.db.stats();
        console.log('Database Stats:', {
            collections: dbStats.collections,
            documents: dbStats.objects,
            storageSize: `${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`
        });

        // Test Cloudinary Connection
        console.log('\nTesting Cloudinary Connection...');
        const cloudinaryResult = await cloudinary.api.ping();
        if (cloudinaryResult.status === 'ok') {
            console.log('✅ Cloudinary Connected');
            results.cloudinary = true;

            // Get Cloudinary Resources
            const resources = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'podcast-studio',
                max_results: 10
            });
            console.log('Recent Cloudinary Resources:', resources.resources.map(r => ({
                public_id: r.public_id,
                type: r.resource_type,
                format: r.format,
                size: `${(r.bytes / 1024 / 1024).toFixed(2)} MB`
            })));
        }

        // Test OpenAI Connection
        console.log('\nTesting OpenAI Connection...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, are you working?" }],
            model: "gpt-3.5-turbo",
        });
        if (completion.choices[0].message.content) {
            console.log('✅ OpenAI Connected');
            results.openai = true;
        }

        // Test Clerk (if configured)
        if (process.env.CLERK_SECRET_KEY) {
            console.log('\nTesting Clerk Connection...');
            const clerkResponse = await axios.get('https://api.clerk.dev/v1/users', {
                headers: {
                    'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            if (clerkResponse.status === 200) {
                console.log('✅ Clerk Connected');
                console.log('Total Users:', clerkResponse.data.total_count);
                results.clerk = true;
            }
        }

    } catch (error) {
        console.error('\n❌ Error during diagnostics:', error);
    } finally {
        await mongoose.connection.close();
        
        // Print Summary
        console.log('\n📊 Diagnostic Summary:');
        Object.entries(results).forEach(([service, status]) => {
            console.log(`${service}: ${status ? '✅ Working' : '❌ Failed'}`);
        });
        
        // Exit with appropriate code
        const success = Object.values(results).every(Boolean);
        process.exit(success ? 0 : 1);
    }
}

runDiagnostics().catch(console.error);
