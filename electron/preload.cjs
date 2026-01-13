const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),

    // Video operations
    getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
    downloadVideo: (videoId, formatId, savePath, mergeAudio) =>
        ipcRenderer.invoke('download-video', videoId, formatId, savePath, mergeAudio),
    cancelDownload: () => ipcRenderer.invoke('cancel-download'),
    updateCore: () => ipcRenderer.invoke('update-core-ytdlp'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // File operations
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    openFolder: (path) => ipcRenderer.invoke('open-folder', path),
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),

    // Event listeners
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, progress) => callback(progress))
    },

    removeDownloadProgressListener: () => {
        ipcRenderer.removeAllListeners('download-progress')
    },

    // Update operations
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Update listeners
    onUpdateStatus: (callback) => {
        ipcRenderer.on('update-status', (event, status, info) => callback(status, info))
    },
    onUpdateDownloadProgress: (callback) => {
        ipcRenderer.on('update-download-progress', (event, progress) => callback(progress))
    },
    removeUpdateListeners: () => {
        ipcRenderer.removeAllListeners('update-status')
        ipcRenderer.removeAllListeners('update-download-progress')
    }
})
