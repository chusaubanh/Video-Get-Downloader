const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let currentProcess = null

// Get yt-dlp executable path
function getYtDlpPath() {
    const { app } = require('electron')
    const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    const isPackaged = app ? app.isPackaged : false

    // List of possible paths to check
    const possiblePaths = []

    // 1. Check in extraResources (for packaged app - new location)
    if (process.resourcesPath) {
        possiblePaths.push(path.join(process.resourcesPath, binName))
    }

    // 2. Check in same directory as electron files (development)
    possiblePaths.push(path.join(__dirname, binName))

    // 3. Check in resources/app/electron folder (alternative packaged structure)
    if (process.resourcesPath) {
        possiblePaths.push(path.join(process.resourcesPath, 'app', 'electron', binName))
    }

    // 4. Check in app.asar.unpacked (if asar unpacking is used)
    if (process.resourcesPath) {
        possiblePaths.push(path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', binName))
    }

    // Try each path
    for (const checkPath of possiblePaths) {
        if (fs.existsSync(checkPath)) {
            console.log('Found yt-dlp at:', checkPath)
            return checkPath
        }
    }

    // Fallback: use system yt-dlp
    console.log('Using system yt-dlp:', binName)
    return binName
}


// Detect platform from URL
function detectPlatform(url) {
    if (url.includes('tiktok.com')) return 'tiktok'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    return 'unknown'
}

// Get video information
async function getVideoInfo(url) {
    return new Promise((resolve, reject) => {
        const ytdlp = getYtDlpPath()

        const args = [
            '--dump-json',
            '--no-download',
            '--no-playlist',
            url
        ]

        const process = spawn(ytdlp, args)
        let stdout = ''
        let stderr = ''

        process.stdout.on('data', (data) => {
            stdout += data.toString()
        })

        process.stderr.on('data', (data) => {
            stderr += data.toString()
        })

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr || 'Không thể lấy thông tin video'))
                return
            }

            try {
                const info = JSON.parse(stdout)
                const platform = detectPlatform(url)

                // Extract formats
                const formats = (info.formats || [])
                    .filter(f => f.vcodec && f.vcodec !== 'none' && f.ext === 'mp4')
                    .map(f => ({
                        formatId: f.format_id,
                        quality: f.height ? `${f.height}p` : f.format_note || 'Unknown',
                        ext: f.ext,
                        filesize: f.filesize || f.filesize_approx
                    }))
                    .sort((a, b) => {
                        const getHeight = (q) => parseInt(q.quality) || 0
                        return getHeight(b) - getHeight(a)
                    })
                    .slice(0, 5) // Limit to 5 formats

                // If no mp4 formats, get best format
                if (formats.length === 0) {
                    formats.push({
                        formatId: 'best',
                        quality: 'Best',
                        ext: 'mp4',
                        filesize: null
                    })
                }

                resolve({
                    id: info.id,
                    title: info.title || 'Untitled',
                    thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
                    duration: formatDuration(info.duration),
                    author: info.uploader || info.channel || 'Unknown',
                    platform: platform,
                    formats: formats,
                    originalUrl: url
                })
            } catch (error) {
                reject(new Error('Không thể phân tích thông tin video'))
            }
        })

        process.on('error', (error) => {
            reject(new Error(`Không tìm thấy yt-dlp: ${error.message}`))
        })
    })
}

// Format duration from seconds to mm:ss or hh:mm:ss
function formatDuration(seconds) {
    if (!seconds) return '0:00'

    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Download video
async function downloadVideo(videoId, formatId, savePath, onProgress) {
    return new Promise((resolve, reject) => {
        const ytdlp = getYtDlpPath()

        const args = [
            '-f', formatId === 'best' ? 'best[ext=mp4]/best' : formatId,
            '--merge-output-format', 'mp4',
            '--no-playlist',
            '-o', path.join(savePath, '%(title)s.%(ext)s'),
            '--progress',
            '--newline',
            videoId
        ]

        currentProcess = spawn(ytdlp, args)

        currentProcess.stdout.on('data', (data) => {
            const line = data.toString()

            // Parse progress
            const progressMatch = line.match(/(\d+\.?\d*)%/)
            const speedMatch = line.match(/(\d+\.?\d*\s*[KMG]?i?B\/s)/)
            const etaMatch = line.match(/ETA\s+(\d+:\d+)/)
            const sizeMatch = line.match(/(\d+\.?\d*[KMG]?i?B)\s*\/\s*(\d+\.?\d*[KMG]?i?B)/)

            if (progressMatch) {
                onProgress({
                    percent: parseFloat(progressMatch[1]),
                    speed: speedMatch ? speedMatch[1] : 'N/A',
                    eta: etaMatch ? etaMatch[1] : 'N/A',
                    downloaded: sizeMatch ? sizeMatch[1] : 'N/A',
                    total: sizeMatch ? sizeMatch[2] : 'N/A'
                })
            }
        })

        currentProcess.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString())
        })

        currentProcess.on('close', (code) => {
            currentProcess = null
            if (code === 0) {
                onProgress({
                    percent: 100,
                    speed: '0 B/s',
                    eta: '0:00',
                    downloaded: 'Done',
                    total: 'Done'
                })
                resolve()
            } else {
                reject(new Error('Tải video thất bại'))
            }
        })

        currentProcess.on('error', (error) => {
            currentProcess = null
            reject(new Error(`Không thể chạy yt-dlp: ${error.message}`))
        })
    })
}

// Cancel current download
function cancelDownload() {
    if (currentProcess) {
        currentProcess.kill('SIGTERM')
        currentProcess = null
    }
}

// Update yt-dlp binary
function updateBinary() {
    return new Promise((resolve, reject) => {
        const ytdlp = getYtDlpPath()
        console.log('Updating yt-dlp at:', ytdlp)

        const process = spawn(ytdlp, ['-U'])
        let output = ''

        process.stdout.on('data', (data) => {
            output += data.toString()
        })

        process.stderr.on('data', (data) => {
            output += data.toString()
        })

        process.on('close', (code) => {
            if (code === 0) {
                resolve(output)
            } else {
                reject(new Error(`Cập nhật thất bại: ${output}`))
            }
        })

        process.on('error', (err) => {
            reject(new Error(`Lỗi khi chạy updater: ${err.message}`))
        })
    })
}

module.exports = {
    getVideoInfo,
    downloadVideo,
    cancelDownload,
    updateBinary
}
