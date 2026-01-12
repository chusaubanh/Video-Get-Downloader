/**
 * Simple Icon Converter
 * Creates ICO file for Windows from PNG icons
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createIco() {
    const buildDir = path.join(__dirname, '..', 'build');
    const iconsDir = path.join(buildDir, 'icons');

    // ICO file structure
    // Header: 6 bytes
    // Directory entries: 16 bytes each
    // Image data: BMP or PNG format

    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const images = [];

    // Load all PNG images
    for (const size of sizes) {
        const pngPath = path.join(iconsDir, `${size}x${size}.png`);
        if (fs.existsSync(pngPath)) {
            const data = fs.readFileSync(pngPath);
            images.push({
                size,
                data
            });
        }
    }

    if (images.length === 0) {
        console.log('No images found!');
        return;
    }

    // Calculate total size
    const headerSize = 6;
    const dirEntrySize = 16;
    const dirSize = dirEntrySize * images.length;

    let offset = headerSize + dirSize;
    const iconData = [];

    // ICO Header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);     // Reserved
    header.writeUInt16LE(1, 2);     // Type: 1 = ICO
    header.writeUInt16LE(images.length, 4); // Number of images
    iconData.push(header);

    // Calculate offsets for each image
    const imageOffsets = [];
    let currentOffset = headerSize + dirSize;
    for (const img of images) {
        imageOffsets.push(currentOffset);
        currentOffset += img.data.length;
    }

    // Directory entries
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const entry = Buffer.alloc(16);

        // Width (0 means 256)
        entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
        // Height (0 means 256)
        entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
        // Color palette (0 = no palette)
        entry.writeUInt8(0, 2);
        // Reserved
        entry.writeUInt8(0, 3);
        // Color planes
        entry.writeUInt16LE(1, 4);
        // Bits per pixel
        entry.writeUInt16LE(32, 6);
        // Size of image data
        entry.writeUInt32LE(img.data.length, 8);
        // Offset to image data
        entry.writeUInt32LE(imageOffsets[i], 12);

        iconData.push(entry);
    }

    // Image data (PNG format)
    for (const img of images) {
        iconData.push(img.data);
    }

    // Combine all buffers
    const icoBuffer = Buffer.concat(iconData);

    // Write ICO file
    const icoPath = path.join(buildDir, 'icon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✅ Created icon.ico at:', icoPath);

    return icoPath;
}

createIco().catch(console.error);
