const fs = require('fs').promises;
const path = require('path');

// Function to create a valid JPEG file
async function createTestJPEG(filePath) {
    // Minimal valid JPEG
    const jpegData = Buffer.from([
        0xFF, 0xD8,                     // SOI marker
        0xFF, 0xE0,                     // APP0 marker
        0x00, 0x10,                     // Length of APP0 segment
        0x4A, 0x46, 0x49, 0x46, 0x00,  // "JFIF\0"
        0x01, 0x01,                     // Version 1.1
        0x00,                           // Units: none
        0x00, 0x01,                     // X density
        0x00, 0x01,                     // Y density
        0x00, 0x00,                     // No thumbnail
        0xFF, 0xD9                      // EOI marker
    ]);
    await fs.writeFile(filePath, jpegData);
}

// Function to create a valid MP3 file
async function createTestMP3(filePath) {
    // Minimal valid MP3 frame
    const mp3Data = Buffer.from([
        0xFF, 0xFB, 0x90, 0x64,         // MPEG1 Layer 3 header
        0x00, 0x00, 0x00, 0x00,         // Audio data
        0x54, 0x41, 0x47,               // ID3v1 tag
        ...Buffer.alloc(125, 0)          // Rest of ID3v1 tag
    ]);
    await fs.writeFile(filePath, mp3Data);
}

// Function to create a valid MP4 file
async function createTestMP4(filePath) {
    // Minimal valid MP4 container
    const mp4Data = Buffer.from([
        0x00, 0x00, 0x00, 0x20,         // Size of ftyp box
        0x66, 0x74, 0x79, 0x70,         // "ftyp"
        0x69, 0x73, 0x6F, 0x6D,         // "isom"
        0x00, 0x00, 0x00, 0x01,         // Minor version
        0x69, 0x73, 0x6F, 0x6D,         // Compatible brand
        0x61, 0x76, 0x63, 0x31,         // Compatible brand
        0x6D, 0x70, 0x34, 0x31,         // Compatible brand
        0x00, 0x00, 0x00, 0x08,         // Size of mdat box
        0x6D, 0x64, 0x61, 0x74,         // "mdat"
        0x00, 0x00, 0x00, 0x00          // Empty media data
    ]);
    await fs.writeFile(filePath, mp4Data);
}

async function createTestFiles() {
    const testDir = path.join(__dirname, 'test-files');
    await fs.mkdir(testDir, { recursive: true });

    console.log('Creating test files...');
    await Promise.all([
        createTestJPEG(path.join(testDir, 'test-image.jpg')),
        createTestMP3(path.join(testDir, 'test-audio.mp3')),
        createTestMP4(path.join(testDir, 'test-video.mp4'))
    ]);
    console.log('Test files created successfully');
}

createTestFiles().catch(console.error);
