const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const { downloadVideo, getVideoInfo, cancelDownload, updateBinary } = require('./ytdlp.cjs')

let mainWindow = null
let isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Disable auto download for manual control or better UX
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        transparent: false,
        backgroundColor: '#0a0a0f',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        icon: path.join(__dirname, '../public/icon.png'),
        show: false
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        // Check for updates after window is shown (only in production)
        if (!isDev) {
            autoUpdater.checkForUpdatesAndNotify()
        }
    })

    mainWindow.on('closed', () => {
        cancelDownload()
        mainWindow = null
    })
}

// Auto Updater Events
autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update-status', { status: 'checking' })
})

autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-status', {
        status: 'available',
        info: {
            version: info.version,
            releaseDate: info.releaseDate
        }
    })
})

autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update-status', { status: 'not-available' })
})

autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update-status', { status: 'error', error: err.message })
})

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('update-download-progress', progressObj)
})

autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-status', { status: 'downloaded' })
})

// App lifecycle
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    cancelDownload()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    cancelDownload()
})

// IPC Handlers

// Update controls
ipcMain.handle('check-for-updates', () => {
    if (!isDev) {
        autoUpdater.checkForUpdates()
    } else {
        // Mock update in dev
        setTimeout(() => {
            mainWindow?.webContents.send('update-status', { status: 'not-available' })
        }, 1000)
    }
})

ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate()
})

ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall()
})

ipcMain.handle('get-app-version', () => {
    return app.getVersion()
})

// Window controls
ipcMain.handle('minimize-window', () => {
    mainWindow?.minimize()
})

ipcMain.handle('close-window', () => {
    mainWindow?.close()
})

// Get video info
ipcMain.handle('get-video-info', async (event, url) => {
    try {
        const info = await getVideoInfo(url)
        return info
    } catch (error) {
        throw new Error(error.message || 'Không thể lấy thông tin video')
    }
})

// Download video
ipcMain.handle('download-video', async (event, videoId, formatId, savePath) => {
    try {
        await downloadVideo(videoId, formatId, savePath, (progress) => {
            mainWindow?.webContents.send('download-progress', progress)
        })
        return { success: true }
    } catch (error) {
        throw new Error(error.message || 'Không thể tải video')
    }
})

// Cancel download
ipcMain.handle('cancel-download', () => {
    cancelDownload()
})

// Update yt-dlp core
ipcMain.handle('update-core-ytdlp', async () => {
    try {
        const result = await updateBinary()
        return { success: true, message: result }
    } catch (error) {
        throw new Error(error.message || 'Cập nhật Core thất bại')
    }
})

// Select folder
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Chọn thư mục lưu video'
    })

    if (result.canceled) {
        return null
    }
    return result.filePaths[0]
})

// Open folder in file explorer
ipcMain.handle('open-folder', async (event, folderPath) => {
    await shell.openPath(folderPath)
})

// Open file location
ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    shell.showItemInFolder(filePath)
})

