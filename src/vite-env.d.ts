/// <reference types="vite/client" />

interface DownloadProgress {
    percent: number
    speed: string
    eta: string
    downloaded: string
    total: string
}

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
}



interface ElectronAPI {
    // Window controls
    minimizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>

    // Video operations
    getVideoInfo: (url: string) => Promise<VideoInfo>
    downloadVideo: (videoId: string, formatId: string, savePath: string, mergeAudio?: boolean) => Promise<void>
    cancelDownload: () => Promise<void>

    // File operations
    selectFolder: () => Promise<string | null>
    openFolder: (path: string) => Promise<void>
    showItemInFolder: (path: string) => Promise<void>
    getSettings: () => Promise<SettingsData>
    saveSettings: (settings: SettingsData) => Promise<boolean>

    // Events
    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void
    removeDownloadProgressListener: () => void

    // Update operations
    checkForUpdates: () => Promise<void>
    downloadUpdate: () => Promise<void>
    quitAndInstall: () => Promise<void>
    getAppVersion: () => Promise<string>
    updateCore: () => Promise<{ success: boolean; message: string }>

    // Update listeners
    onUpdateStatus: (callback: (status: string, info?: any) => void) => void
    onUpdateDownloadProgress: (callback: (progress: any) => void) => void
    removeUpdateListeners: () => void
}

declare global {
    interface SettingsData {
        defaultDownloadPath: string
        autoSelectBestQuality: boolean
        showNotifications: boolean
        darkMode: boolean
        language: 'vi' | 'en'
    }

    interface Window {
        electronAPI?: ElectronAPI
    }
}

export { }
