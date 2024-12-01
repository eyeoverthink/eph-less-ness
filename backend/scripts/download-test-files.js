const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Function to download a file
function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filePath);
                reject(err);
            });
        }).on('error', reject);
    });
}

async function downloadTestFiles() {
    const testDir = path.join(__dirname, 'test-files');
    await fs.mkdir(testDir, { recursive: true });

    const files = {
        image: {
            url: 'https://picsum.photos/200',
            path: path.join(testDir, 'test-image.jpg')
        },
        audio: {
            url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
            path: path.join(testDir, 'test-audio.wav')
        },
        video: {
            url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
            path: path.join(testDir, 'test-video.mp4')
        }
    };

    console.log('Downloading test files...');
    for (const [type, file] of Object.entries(files)) {
        try {
            console.log(`Downloading ${type}...`);
            await downloadFile(file.url, file.path);
            console.log(`✅ ${type} downloaded successfully`);
        } catch (error) {
            console.error(`❌ Failed to download ${type}:`, error.message);
        }
    }
}

downloadTestFiles().catch(console.error);
