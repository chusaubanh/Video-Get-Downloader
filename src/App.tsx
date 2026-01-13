import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import URLInput from './components/URLInput'
import VideoPreview from './components/VideoPreview'
import DownloadProgress from './components/DownloadProgress'
import DownloadHistory from './components/DownloadHistory'
import Settings from './components/Settings'
import { getVideoInfo, VideoInfo, VideoFormat } from './services/videoService'
import { translations, Language } from './i18n/translations'

interface DownloadProgressData {
    percent: number
    speed: string
    eta: string
    downloaded: string
    total: string
}

interface HistoryItem {
    id: string
    title: string
    thumbnail: string
    platform: string
    downloadedAt: string
    filePath: string
}

const defaultSettings: SettingsData = {
    defaultDownloadPath: '',
    autoSelectBestQuality: true,
    showNotifications: true,
    language: 'vi' as Language,
    darkMode: false
}

function App() {
    const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home')
    const [isLoading, setIsLoading] = useState(false)
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgressData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState<SettingsData>(() => {
        const saved = localStorage.getItem('appSettings')
        return saved ? JSON.parse(saved) : defaultSettings
    })
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        const saved = localStorage.getItem('downloadHistory')
        return saved ? JSON.parse(saved) : []
    })
    const [appVersion, setAppVersion] = useState('1.0.0')

    const isElectron = !!window.electronAPI
    const t = translations[settings.language]

    useEffect(() => {
        const getVersion = async () => {
            if (window.electronAPI) {
                const ver = await window.electronAPI.getAppVersion()
                setAppVersion(ver)
            }
        }
        getVersion()
    }, [])
    const handleURLSubmit = async (url: string) => {
        setIsLoading(true)
        setError(null)
        setVideoInfo(null)

        try {
            const info = await getVideoInfo(url)
            setVideoInfo(info)
        } catch (err) {
            setError(err instanceof Error ? err.message : t.cannotGetInfo)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = async (format: VideoFormat) => {
        if (!videoInfo) return

        setIsDownloading(true)
        setDownloadProgress({ percent: 0, speed: '0 MB/s', eta: t.calculating, downloaded: '0 MB', total: '0 MB' })
        setError(null)

        try {
            if (isElectron) {
                const savePath = settings.defaultDownloadPath || await window.electronAPI!.selectFolder()

                if (savePath) {
                    window.electronAPI!.onDownloadProgress((progress) => {
                        setDownloadProgress(progress)
                    })

                    await window.electronAPI!.downloadVideo(
                        videoInfo.originalUrl || videoInfo.id,
                        format.formatId,
                        savePath,
                        format.hasAudio === false && format.formatId !== 'best'
                    )
                    addToHistory(videoInfo, savePath)

                    if (settings.showNotifications && 'Notification' in window) {
                        new Notification('Video-Get-Downloader', {
                            body: `${t.downloadComplete} ${videoInfo.title}`,
                            icon: '/icon.png'
                        })
                    }
                }
            } else {
                if (format.downloadUrl) {
                    for (let i = 0; i <= 100; i += 20) {
                        await new Promise(resolve => setTimeout(resolve, 300))
                        setDownloadProgress({
                            percent: i,
                            speed: 'Browser download',
                            eta: i < 100 ? t.downloading : t.saved,
                            downloaded: '-',
                            total: '-'
                        })
                    }

                    const link = document.createElement('a')
                    link.href = format.downloadUrl
                    link.download = `${videoInfo.title}.mp4`
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    addToHistory(videoInfo, 'Browser Download')
                } else {
                    throw new Error(t.urlNotAvailable)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t.downloadError)
        } finally {
            setIsDownloading(false)
            setDownloadProgress(null)
        }
    }

    const addToHistory = (video: VideoInfo, path: string) => {
        const newItem: HistoryItem = {
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            platform: video.platform,
            downloadedAt: new Date().toISOString(),
            filePath: path
        }
        const newHistory = [newItem, ...history.slice(0, 19)]
        setHistory(newHistory)
        localStorage.setItem('downloadHistory', JSON.stringify(newHistory))
    }

    const handleCancelDownload = async () => {
        if (window.electronAPI) {
            await window.electronAPI.cancelDownload()
        }
        setIsDownloading(false)
        setDownloadProgress(null)
    }

    const handleOpenFolder = async (path: string) => {
        if (window.electronAPI) {
            await window.electronAPI.openFolder(path)
        }
    }

    const handleClearHistory = () => {
        setHistory([])
        localStorage.removeItem('downloadHistory')
    }

    const handleSettingsChange = (newSettings: SettingsData) => {
        setSettings(newSettings)
        localStorage.setItem('appSettings', JSON.stringify(newSettings))
    }

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <>
                        {/* Mode indicator */}
                        <div className="mb-4 flex justify-center">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isElectron
                                ? settings.darkMode ? 'bg-mint-500/20 text-mint-400' : 'bg-mint-100 text-mint-600'
                                : settings.darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {isElectron ? t.electronMode : t.browserMode}
                            </div>
                        </div>

                        {/* URL Input Section */}
                        <section className="mb-8 fade-in">
                            <URLInput
                                onSubmit={handleURLSubmit}
                                isLoading={isLoading}
                                disabled={isDownloading}
                                darkMode={settings.darkMode}
                                t={t}
                            />

                            {error && (
                                <div className={`mt-4 p-4 rounded-xl slide-in ${settings.darkMode ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                                    <p className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Video Preview Section */}
                        {videoInfo && !isDownloading && (
                            <section className="mb-8 fade-in">
                                <VideoPreview
                                    videoInfo={videoInfo}
                                    onDownload={handleDownload}
                                    darkMode={settings.darkMode}
                                    t={t}
                                />
                            </section>
                        )}

                        {/* Download Progress Section */}
                        {isDownloading && downloadProgress && (
                            <section className="mb-8 fade-in">
                                <DownloadProgress
                                    progress={downloadProgress}
                                    videoTitle={videoInfo?.title || ''}
                                    onCancel={handleCancelDownload}
                                    darkMode={settings.darkMode}
                                    t={t}
                                />
                            </section>
                        )}
                    </>
                )

            case 'history':
                return (
                    <div className="fade-in">
                        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t.downloadHistory}
                        </h2>

                        {history.length > 0 ? (
                            <DownloadHistory
                                items={history}
                                onOpenFolder={handleOpenFolder}
                                onClear={handleClearHistory}
                                darkMode={settings.darkMode}
                                t={t}
                            />
                        ) : (
                            <div className={`glass-card p-12 text-center ${settings.darkMode ? 'bg-white/5' : ''}`}>
                                <svg className={`w-16 h-16 mx-auto mb-4 ${settings.darkMode ? 'text-white/20' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className={`text-lg font-medium mb-2 ${settings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.noHistory}</h3>
                                <p className={`text-sm ${settings.darkMode ? 'text-white/30' : 'text-gray-400'}`}>{t.videosWillAppear}</p>
                            </div>
                        )}
                    </div>
                )

            case 'settings':
                return (
                    <div className="fade-in">
                        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t.settings}
                        </h2>
                        <Settings
                            isOpen={true}
                            onClose={() => setActiveTab('home')}
                            onSettingsChange={handleSettingsChange}
                            embedded={true}
                            settings={settings}
                        />
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Background */}
            {settings.darkMode ? (
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/bg-dark.png)' }}
                >
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
            ) : (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mint-200/30 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/20 rounded-full filter blur-3xl"></div>
                </div>
            )}

            {/* Main layout */}
            <div className="relative z-10 flex flex-col h-screen">
                <Header darkMode={settings.darkMode} t={t} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        historyCount={history.length}
                        defaultPath={settings.defaultDownloadPath}
                        darkMode={settings.darkMode}
                        version={appVersion}
                        t={t}
                    />

                    {/* Main content */}
                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default App
