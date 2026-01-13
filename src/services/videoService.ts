// Video Service - Works in both Browser and Electron modes
// Browser mode: Uses cobalt.tools API (free, open-source)
// Electron mode: Uses yt-dlp locally

interface VideoInfo {
    id: string
    title: string
    thumbnail: string
    duration: string
    author: string
    platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'twitter'
    formats: VideoFormat[]
    originalUrl: string
}

interface VideoFormat {
    formatId: string
    quality: string
    ext: string
    filesize?: number
    downloadUrl?: string
    hasAudio?: boolean
}

// Detect platform from URL
function detectPlatform(url: string): 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'twitter' {
    if (url.includes('tiktok.com')) return 'tiktok'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    return 'youtube'
}

// Get video info using cobalt.tools API (for browser mode)
async function getVideoInfoFromAPI(url: string): Promise<VideoInfo> {
    try {
        // Try cobalt.tools API first
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                vQuality: 'max',
                filenamePattern: 'basic',
                isAudioOnly: false,
                disableMetadata: false
            })
        })

        if (!response.ok) {
            throw new Error('API request failed')
        }

        const data = await response.json()
        const platform = detectPlatform(url)

        // Handle different response types
        if (data.status === 'picker' && data.picker) {
            // Multiple formats available
            const formats: VideoFormat[] = data.picker
                .filter((item: any) => item.type === 'video')
                .map((item: any, index: number) => ({
                    formatId: `format_${index}`,
                    quality: item.quality || `Option ${index + 1}`,
                    ext: 'mp4',
                    downloadUrl: item.url
                }))

            return {
                id: Date.now().toString(),
                title: data.title || 'Video',
                thumbnail: data.thumb || '',
                duration: formatDuration(data.duration),
                author: data.author || 'Unknown',
                platform: platform,
                formats: formats.length > 0 ? formats : [{
                    formatId: 'best',
                    quality: 'Best',
                    ext: 'mp4',
                    downloadUrl: data.url
                }],
                originalUrl: url
            }
        } else if (data.status === 'stream' || data.url) {
            // Direct download URL
            return {
                id: Date.now().toString(),
                title: data.title || 'Video',
                thumbnail: data.thumb || '',
                duration: formatDuration(data.duration),
                author: data.author || 'Unknown',
                platform: platform,
                formats: [{
                    formatId: 'best',
                    quality: 'Best Quality',
                    ext: 'mp4',
                    downloadUrl: data.url
                }],
                originalUrl: url
            }
        } else {
            throw new Error('Unsupported response format')
        }
    } catch (error) {
        console.error('Cobalt API error:', error)
        // Fallback: try alternative method or throw error
        throw new Error('Không thể lấy thông tin video. Vui lòng thử lại hoặc sử dụng Electron app.')
    }
}

// Format duration from seconds
function formatDuration(seconds?: number): string {
    if (!seconds) return '0:00'

    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Main function to get video info - works in both modes
export async function getVideoInfo(url: string): Promise<VideoInfo> {
    // If running in Electron, use yt-dlp
    if (window.electronAPI) {
        return await window.electronAPI.getVideoInfo(url)
    }

    // Browser mode: use web API
    return await getVideoInfoFromAPI(url)
}

// Download video
export async function downloadVideo(
    videoInfo: VideoInfo,
    format: VideoFormat,
    savePath?: string,
    onProgress?: (progress: any) => void
): Promise<void> {
    if (window.electronAPI) {
        // Electron mode: use yt-dlp
        if (onProgress) {
            window.electronAPI.onDownloadProgress(onProgress)
        }

        const path = savePath || await window.electronAPI.selectFolder()
        if (path) {
            await window.electronAPI.downloadVideo(videoInfo.id, format.formatId, path)
        }
    } else {
        // Browser mode: open download URL in new tab
        if (format.downloadUrl) {
            // Create a temporary link and trigger download
            const link = document.createElement('a')
            link.href = format.downloadUrl
            link.download = `${videoInfo.title}.mp4`
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            throw new Error('Download URL không khả dụng')
        }
    }
}

export type { VideoInfo, VideoFormat }
