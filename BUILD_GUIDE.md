# Build Guide - Video-Get-Downloader

## Quick Start

### Windows Build (Current Platform)

```bash
npm run electron:build:win
```

### Output Files

After successful build, the following files will be in `release/` directory:

| File | Size | Description |
|------|------|-------------|
| `Video-Get-Downloader-1.0.0-win.exe` | ~174 MB | Full installer (x64 + ia32) |
| `Video-Get-Downloader-1.0.0-win-x64.exe` | ~92 MB | 64-bit installer only |
| `Video-Get-Downloader-1.0.0-win-ia32.exe` | ~83 MB | 32-bit installer only |
| `Video-Get-Downloader-1.0.0-Portable-win.exe` | ~91 MB | Portable version (no install) |

## Platform-Specific Builds

### Windows

```bash
npm run electron:build:win
```

**Requirements:**
- Windows 7+ / Windows Server 2012 R2+
- Node.js 18+
- npm 9+

### macOS

```bash
npm run electron:build:mac
```

**Requirements:**
- macOS 10.13+ (High Sierra or later)
- Xcode Command Line Tools
- For signing: Apple Developer certificate

**Note:** macOS builds must be done on a Mac. Cross-compilation is possible with Docker but signing requires macOS.

### Linux

```bash
npm run electron:build:linux
```

**Requirements:**
- Ubuntu 18.04+ or equivalent
- `fpm` for DEB/RPM packages (optional)

## Docker Build (Cross-Platform)

### Build Docker Image

```bash
docker-compose build
```

### Build for All Platforms

```bash
docker-compose run builder
```

### Build for Specific Platform

```bash
docker-compose run build-win    # Windows
docker-compose run build-mac    # macOS (limited without signing)
docker-compose run build-linux  # Linux
```

## Code Signing

### Windows Code Signing

To sign Windows executables, set these environment variables:

```bash
export CSC_LINK=path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password
```

### macOS Code Signing

Required for distribution through App Store or notarization:

1. Get Apple Developer ID certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your-password
   export APPLE_ID=your@email.com
   export APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

3. Notarize after build:
   ```bash
   npx electron-notarize
   ```

## Troubleshooting

### Error: Cannot find yt-dlp

Download yt-dlp binary:

```bash
# Windows
curl -L -o electron/yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe

# macOS/Linux
curl -L -o electron/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp
chmod +x electron/yt-dlp
```

### Error: Cannot create icon.ico

Run icon generation script:

```bash
node scripts/create-ico.cjs
```

### Error: NSIS not found (Windows)

electron-builder will auto-download NSIS. If it fails:

```bash
npm cache clean --force
npm install
```

### Build is slow

- Ensure you have SSD storage
- Close unnecessary applications
- Use `--dir` flag for testing (creates unpacked app):
  ```bash
  npm run pack
  ```

## Version Management

To update version before release:

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

Then rebuild:

```bash
npm run electron:build:win
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - run: npm ci
      
      - run: npm run electron:build
      
      - uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: release/*.exe
```

## File Size Optimization

To reduce installer size:

1. **Exclude development dependencies:**
   Already configured in `package.json` build config.

2. **Use asar archive:**
   Already enabled by default.

3. **Compress resources:**
   ```bash
   npm run build -- --compression=maximum
   ```
