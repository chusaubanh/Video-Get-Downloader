/**
 * Icon Generator Script
 * Converts PNG icon to ICO (Windows) and ICNS (MacOS) formats
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Prerequisites:
 * - npm install png-to-ico sharp
 * - For ICNS: requires macOS or png2icns tool
 */

const fs = require('fs');
const path = require('path');

// Check if required packages are installed
async function generateIcons() {
    const sourceIcon = path.join(__dirname, '..', 'public', 'icon.png');
    const buildDir = path.join(__dirname, '..', 'build');
    const iconsDir = path.join(buildDir, 'icons');

    // Ensure directories exist
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    // Check if source icon exists
    if (!fs.existsSync(sourceIcon)) {
        console.error('❌ Source icon not found at:', sourceIcon);
        console.log('Please ensure public/icon.png exists');
        process.exit(1);
    }

    console.log('🎨 Generating icons from:', sourceIcon);

    try {
        // Try to use sharp for resizing
        const sharp = require('sharp');

        // Generate various sizes for different platforms
        const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

        for (const size of sizes) {
            const outputPath = path.join(iconsDir, `${size}x${size}.png`);
            await sharp(sourceIcon)
                .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toFile(outputPath);
            console.log(`✅ Generated ${size}x${size}.png`);
        }

        // Copy original to build directory
        fs.copyFileSync(sourceIcon, path.join(buildDir, 'icon.png'));
        console.log('✅ Copied icon.png to build directory');

        // Generate ICO for Windows
        try {
            const pngToIco = require('png-to-ico');
            const icoSizes = [16, 24, 32, 48, 64, 128, 256].map(s =>
                path.join(iconsDir, `${s}x${s}.png`)
            );

            const icoBuffer = await pngToIco(icoSizes);
            fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
            console.log('✅ Generated icon.ico for Windows');
        } catch (err) {
            console.log('⚠️  Could not generate ICO (png-to-ico not installed)');
            console.log('   Run: npm install png-to-ico');
        }

        console.log('\n🎉 Icon generation complete!');
        console.log('\n📝 Note: For MacOS .icns file:');
        console.log('   - On macOS: Use iconutil to create .icns');
        console.log('   - Or use online converter: https://cloudconvert.com/png-to-icns');
        console.log('   - Place the .icns file in build/icon.icns');

    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log('⚠️  Sharp module not found. Installing...');
            console.log('   Run: npm install sharp png-to-ico --save-dev');

            // Fallback: just copy the original icon
            fs.copyFileSync(sourceIcon, path.join(buildDir, 'icon.png'));
            console.log('✅ Copied original icon to build directory');
        } else {
            throw err;
        }
    }
}

generateIcons().catch(console.error);
