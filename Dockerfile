# Video-Get-Downloader Docker Build Environment
# This Dockerfile creates a cross-platform build environment for Electron apps

FROM electronuserland/builder:wine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Default command - build for all platforms
CMD ["npm", "run", "electron:build:all"]
