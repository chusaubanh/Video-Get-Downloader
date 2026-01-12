import { useState, useEffect } from 'react'
import { translations, Language } from '../i18n/translations'

interface SettingsData {
    defaultDownloadPath: string
    autoSelectBestQuality: boolean
    showNotifications: boolean
    language: Language
    darkMode: boolean
}

interface SettingsProps {
    isOpen: boolean
    onClose: () => void
    onSettingsChange: (settings: SettingsData) => void
    embedded?: boolean
    settings: SettingsData
}

function Settings({ isOpen, onClose, onSettingsChange, embedded = false, settings }: SettingsProps) {
    const [localSettings, setLocalSettings] = useState<SettingsData>(settings)
    const [saved, setSaved] = useState(false)

    // Update state
    const [updateStatus, setUpdateStatus] = useState<string>('idle')
    const [updateInfo, setUpdateInfo] = useState<any>(null)
    const [updateProgress, setUpdateProgress] = useState<any>(null)
    const [appVersion, setAppVersion] = useState('1.2.0')

    // Core update state
    const [updatingCore, setUpdatingCore] = useState(false)
    const [coreUpdated, setCoreUpdated] = useState(false)

    const t = translations[localSettings.language]

    useEffect(() => {
        setLocalSettings(settings)
    }, [settings])

    const handleSave = () => {
        localStorage.setItem('appSettings', JSON.stringify(localSettings))
        onSettingsChange(localSettings)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        if (!embedded) {
            onClose()
        }
    }

    // Update logic
    useEffect(() => {
        if (!window.electronAPI) return

        const statusHandler = (status: any) => {
            console.log('Update status:', status)
            if (status.status === 'available') {
                setUpdateInfo(status.info)
            }
            setUpdateStatus(status.status)
        }

        const progressHandler = (progress: any) => {
            setUpdateProgress(progress)
        }

        window.electronAPI.onUpdateStatus(statusHandler)
        window.electronAPI.onUpdateDownloadProgress(progressHandler)

        // Get app version
        window.electronAPI.getAppVersion().then(ver => setAppVersion(ver))

        // Check for updates on mount (optional, or rely on manual check)
        // window.electronAPI.checkForUpdates()

        return () => {
            window.electronAPI?.removeUpdateListeners()
        }
    }, [])

    const handleCheckForUpdates = () => {
        if (window.electronAPI) {
            window.electronAPI.checkForUpdates()
        }
    }

    const handleDownloadUpdate = () => {
        if (window.electronAPI) {
            window.electronAPI.downloadUpdate()
        }
    }

    const handleRestartToUpdate = () => {
        if (window.electronAPI) {
            window.electronAPI.quitAndInstall()
        }
    }

    const handleUpdateCore = async () => {
        if (!window.electronAPI) return
        setUpdatingCore(true)
        try {
            await window.electronAPI.updateCore()
            setCoreUpdated(true)
            setTimeout(() => setCoreUpdated(false), 3000)
        } catch (error) {
            console.error(error)
            alert(t.coreUpdateError)
        } finally {
            setUpdatingCore(false)
        }
    }

    const handleSelectFolder = async () => {
        if (window.electronAPI) {
            const folder = await window.electronAPI.selectFolder()
            if (folder) {
                setLocalSettings(prev => ({ ...prev, defaultDownloadPath: folder }))
            }
        } else {
            setLocalSettings(prev => ({
                ...prev,
                defaultDownloadPath: 'C:\\Users\\Downloads\\Videos'
            }))
        }
    }

    const handleClearPath = () => {
        setLocalSettings(prev => ({ ...prev, defaultDownloadPath: '' }))
    }

    if (!isOpen && !embedded) return null

    const content = (
        <div className="space-y-6">
            {/* Language Toggle */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t.language}</p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                {localSettings.language === 'vi' ? t.vietnamese : t.english}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLocalSettings(prev => ({ ...prev, language: 'vi' }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${localSettings.language === 'vi'
                                ? 'bg-gradient-primary text-white'
                                : localSettings.darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            🇻🇳 VI
                        </button>
                        <button
                            onClick={() => setLocalSettings(prev => ({ ...prev, language: 'en' }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${localSettings.language === 'en'
                                ? 'bg-gradient-primary text-white'
                                : localSettings.darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            🇺🇸 EN
                        </button>
                    </div>
                </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${localSettings.darkMode ? 'bg-yellow-500/20' : 'bg-indigo-500/20'}`}>
                            {localSettings.darkMode ? (
                                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {localSettings.darkMode ? t.darkMode : t.lightMode}
                            </p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                {localSettings.darkMode ? 'Background: BG.png' : 'Light gradient'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.darkMode ? 'bg-gradient-primary' : 'bg-gray-200'
                            }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${localSettings.darkMode ? 'left-8' : 'left-1'
                            }`}></div>
                    </button>
                </div>
            </div>

            {/* Default download path */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <label className={`block text-sm font-medium mb-3 flex items-center gap-2 ${localSettings.darkMode ? 'text-white' : 'text-gray-700'}`}>
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {t.defaultDownloadPath}
                </label>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={localSettings.defaultDownloadPath}
                            placeholder={t.selectFolderPlaceholder}
                            readOnly
                            className={`w-full h-12 px-4 pr-10 rounded-xl border focus:outline-none focus:border-primary-400 ${localSettings.darkMode
                                ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                                }`}
                        />
                        {localSettings.defaultDownloadPath && (
                            <button
                                onClick={handleClearPath}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${localSettings.darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Clear path"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSelectFolder}
                        className="px-4 h-12 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {t.select}
                    </button>
                </div>
                <p className={`mt-2 text-xs ${localSettings.darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    {t.leaveEmptyToAsk}
                </p>
            </div>

            {/* Auto select best quality */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t.preferHighQuality}</p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.preferHighQualityDesc}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, autoSelectBestQuality: !prev.autoSelectBestQuality }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.autoSelectBestQuality ? 'bg-gradient-primary' : 'bg-gray-200'
                            }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${localSettings.autoSelectBestQuality ? 'left-8' : 'left-1'
                            }`}></div>
                    </button>
                </div>
            </div>

            {/* Show notifications */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t.notifyWhenDone}</p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.notifyWhenDoneDesc}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, showNotifications: !prev.showNotifications }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.showNotifications ? 'bg-gradient-primary' : 'bg-gray-200'
                            }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${localSettings.showNotifications ? 'left-8' : 'left-1'
                            }`}></div>
                    </button>
                </div>
            </div>

            {/* Save button */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${saved
                        ? 'bg-mint-400 text-white'
                        : 'bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary-500/20'
                        }`}
                >
                    {saved ? (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t.saved}
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            {t.saveSettings}
                        </>
                    )}
                </button>
            </div>

            {/* Software Update */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Software Update</p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                {updateStatus === 'idle' && t.version + ' ' + appVersion}
                                {updateStatus === 'checking' && t.checkingForUpdates}
                                {updateStatus === 'not-available' && t.updateNotAvailable}
                                {updateStatus === 'available' && t.updateAvailable + ' ' + (updateInfo?.version || '')}
                                {updateStatus === 'downloading' && t.downloadingUpdate}
                                {updateStatus === 'downloaded' && t.updateDownloaded}
                                {updateStatus === 'error' && t.updateError}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {updateStatus === 'idle' || updateStatus === 'not-available' || updateStatus === 'error' ? (
                        <button
                            onClick={handleCheckForUpdates}
                            className={`w-full py-2.5 rounded-xl font-medium transition-all ${localSettings.darkMode
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {t.checkForUpdates}
                        </button>
                    ) : null}

                    {updateStatus === 'available' && (
                        <button
                            onClick={handleDownloadUpdate}
                            className="w-full py-2.5 rounded-xl font-medium bg-gradient-brand text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #34d399)' }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.downloadUpdate}
                        </button>
                    )}

                    {updateStatus === 'downloading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 relative"
                                style={{ width: `${updateProgress?.percent || 0}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                            <p className={`text-xs text-center mt-1 ${localSettings.darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                                {Math.round(updateProgress?.percent || 0)}%
                            </p>
                        </div>
                    )}

                    {updateStatus === 'downloaded' && (
                        <button
                            onClick={handleRestartToUpdate}
                            className="w-full py-2.5 rounded-xl font-medium bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {t.restartToUpdate}
                        </button>
                    )}
                </div>
            </div>

            {/* Core Update */}
            <div className={`glass-card p-5 ${localSettings.darkMode ? '!bg-white/10 !border-white/10' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`font-medium ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>{t.updateCoreTitle}</p>
                            <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                {t.updateCoreDesc}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleUpdateCore}
                    disabled={updatingCore}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all mt-2 flex items-center justify-center gap-2 ${coreUpdated
                        ? 'bg-green-500 text-white'
                        : updatingCore
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : localSettings.darkMode
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {updatingCore ? (
                        <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            {t.updatingCore}
                        </>
                    ) : coreUpdated ? (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t.coreUpdated}
                        </>
                    ) : (
                        t.updateCoreBtn
                    )}
                </button>
            </div>

            {/* Disclaimer */}
            <div className={`glass-card p-5 border-l-4 ${localSettings.darkMode ? '!bg-white/10 !border-amber-400' : 'border-amber-400 bg-amber-50'}`}>
                <div className="flex items-start gap-3">
                    <svg className={`w-6 h-6 flex-shrink-0 mt-1 ${localSettings.darkMode ? 'text-amber-400' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className={`font-semibold mb-1 ${localSettings.darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                            {t.disclaimerTitle}
                        </h3>
                        <p className={`text-sm leading-relaxed ${localSettings.darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                            {t.disclaimerText}
                        </p>
                    </div>
                </div>
            </div>

            {/* App info */}
            <div className={`glass-card p-5 text-center ${localSettings.darkMode ? '!bg-white/10' : ''}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <span className={`font-semibold ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>Video-Get-Downloader</span>
                </div>
                <p className={`text-sm ${localSettings.darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.version} {appVersion}</p>
                <p className={`text-xs mt-1 ${localSettings.darkMode ? 'text-white/40' : 'text-gray-400'}`}>{t.poweredBy} <span className="gradient-text font-medium">ChuSauBanh</span></p>
            </div>
        </div>
    )

    if (embedded) {
        return content
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`relative glass-card p-6 w-full max-w-lg mx-4 slide-in max-h-[90vh] overflow-y-auto ${localSettings.darkMode ? 'bg-dark-800/90' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${localSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.settings}
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${localSettings.darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <svg className={`w-5 h-5 ${localSettings.darkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {content}
            </div>
        </div>
    )
}

export default Settings
export type { SettingsData }
