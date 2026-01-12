import { useState, useEffect } from 'react'
import { translations } from '../i18n/translations'



// Language configuration


const Settings = ({
    isOpen,
    onClose,
    embedded = false,
    onSettingsChange,
    settings
}: {
    isOpen: boolean;
    onClose: () => void;
    embedded?: boolean;
    onSettingsChange?: (settings: SettingsData) => void;
    settings?: SettingsData;
}) => {
    const [localSettings, setLocalSettings] = useState<SettingsData>(settings || {
        defaultDownloadPath: '',
        autoSelectBestQuality: true,
        showNotifications: true,
        darkMode: false,
        language: 'vi'
    })
    const [saved, setSaved] = useState(false)

    // Update State
    const [updateStatus, setUpdateStatus] = useState<string>('idle')
    const [updateInfo, setUpdateInfo] = useState<any>(null)
    const [updateProgress, setUpdateProgress] = useState<any>(null)
    const [appVersion, setAppVersion] = useState('1.2.4')

    // Core update state
    const [updatingCore, setUpdatingCore] = useState(false)
    const [coreUpdated, setCoreUpdated] = useState(false)

    // Derived translations
    const t = localSettings.language === 'vi' ? translations.vi : translations.en

    // Load initial settings and app version
    useEffect(() => {
        const loadData = async () => {
            if (window.electronAPI) {
                try {
                    // Update settings ONLY if not provided via props (standalone mode)
                    if (!settings) {
                        const loadedSettings = await window.electronAPI.getSettings()
                        setLocalSettings(loadedSettings)
                        if (loadedSettings.darkMode) {
                            document.documentElement.classList.add('dark')
                        } else {
                            document.documentElement.classList.remove('dark')
                        }
                    }

                    const ver = await window.electronAPI.getAppVersion()
                    setAppVersion(ver)
                } catch (error) {
                    console.error('Failed to load settings:', error)
                }
            }
        }

        if (isOpen || embedded) {
            loadData()
        }
    }, [isOpen, embedded, settings])

    // Update listeners
    useEffect(() => {
        if (!window.electronAPI) return

        const handleUpdateStatus = (status: string, info: any) => {
            console.log('Update Status:', status, info)
            setUpdateStatus(status)
            if (info) setUpdateInfo(info)
        }

        const handleDownloadProgress = (progress: any) => {
            setUpdateProgress(progress)
        }

        window.electronAPI.onUpdateStatus(handleUpdateStatus)
        window.electronAPI.onUpdateDownloadProgress(handleDownloadProgress)

        return () => {
            window.electronAPI?.removeUpdateListeners()
        }
    }, [])

    // Real-time theme application
    useEffect(() => {
        if (localSettings.darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [localSettings.darkMode])

    const handleSelectFolder = async () => {
        if (window.electronAPI) {
            const path = await window.electronAPI.selectFolder()
            if (path) {
                setLocalSettings(prev => ({ ...prev, defaultDownloadPath: path }))
            }
        }
    }

    const handleSave = async () => {
        if (window.electronAPI) {
            await window.electronAPI.saveSettings(localSettings)
            onSettingsChange?.(localSettings)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
            if (!embedded) onClose()
        }
    }

    const handleCheckForUpdates = () => {
        if (window.electronAPI) {
            setUpdateStatus('checking')
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
        if (window.electronAPI) {
            setUpdatingCore(true)
            try {
                const result = await window.electronAPI.updateCore()
                if (result.success) {
                    setCoreUpdated(true)
                    setTimeout(() => setCoreUpdated(false), 5000)
                } else {
                    alert('Update failed: ' + result.message)
                }
            } catch (error) {
                console.error('Core update error:', error)
                alert('Update failed')
            } finally {
                setUpdatingCore(false)
            }
        }
    }

    const handleLanguageChange = (lang: 'vi' | 'en') => {
        const newSettings = { ...localSettings, language: lang }
        setLocalSettings(newSettings)
        onSettingsChange?.(newSettings)
    }

    const handleThemeChange = (isDark: boolean) => {
        const newSettings = { ...localSettings, darkMode: isDark }
        setLocalSettings(newSettings)
        onSettingsChange?.(newSettings)
    }

    if (!isOpen && !embedded) return null

    const content = (
        <div className="space-y-6">
            {/* Language Selection */}
            {/* Language Selection */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">{t.language}</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">
                                {localSettings.language === 'vi' ? t.vietnamese : t.english}
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <select
                            value={localSettings.language}
                            onChange={(e) => handleLanguageChange(e.target.value as 'vi' | 'en')}
                            className="appearance-none bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
                        >
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-white/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            {/* Appearance */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 dark:bg-yellow-500/20 flex items-center justify-center">
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
                            <p className="font-medium text-gray-800 dark:text-white">
                                {localSettings.darkMode ? t.darkMode : t.lightMode}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-white/50">
                                {localSettings.darkMode ? 'Background: BG.png' : 'Light gradient'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleThemeChange(!localSettings.darkMode)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.darkMode ? 'bg-gradient-primary' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${localSettings.darkMode ? 'left-8' : 'left-1'
                            }`}>
                            {/* Icon inside toggle */}
                            <div className="w-full h-full flex items-center justify-center">
                                {localSettings.darkMode ? (
                                    <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Default download path */}
            <div className="glass-card p-5">
                <label className="block text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-white">
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {t.defaultDownloadPath}
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={localSettings.defaultDownloadPath}
                        placeholder={t.selectFolderPlaceholder}
                        readOnly
                        className="w-full h-12 px-4 pr-10 rounded-xl border focus:outline-none focus:border-primary-400 pl-10 bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
                    />
                    {localSettings.defaultDownloadPath && (
                        <button
                            onClick={() => setLocalSettings(prev => ({ ...prev, defaultDownloadPath: '' }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white"
                            title="Clear path"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSelectFolder}
                        className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        {t.select}
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-white/40">
                    {t.leaveEmptyToAsk}
                </p>
            </div>

            {/* Auto select best quality */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">{t.preferHighQuality}</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">{t.preferHighQualityDesc}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, autoSelectBestQuality: !prev.autoSelectBestQuality }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.autoSelectBestQuality ? 'bg-gradient-primary' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${localSettings.autoSelectBestQuality ? 'left-8' : 'left-1'
                            }`}></div>
                    </button>
                </div>
            </div>

            {/* Show notifications */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">{t.notifyWhenDone}</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">{t.notifyWhenDoneDesc}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLocalSettings(prev => ({ ...prev, showNotifications: !prev.showNotifications }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${localSettings.showNotifications ? 'bg-gradient-primary' : 'bg-gray-200 dark:bg-gray-700'
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
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">Software Update</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">
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
                            className="w-full py-2.5 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
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
                        <div className="w-full max-w-xs text-center mx-auto">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.downloadingUpdate}</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 relative"
                                    style={{ width: `${updateProgress?.percent || 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <p className="text-xs text-center mt-1 text-gray-500 dark:text-white/60">
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
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">{t.updateCoreTitle}</p>
                            <p className="text-sm text-gray-500 dark:text-white/50">
                                {t.updateCoreDesc}
                            </p>
                        </div>
                    </div>
                </div>

                {updatingCore ? (
                    // Core Updating UI
                    <div className="w-full max-w-xs text-center mx-auto">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.updatingCore}...</h3>
                        <p className="text-sm text-gray-500 dark:text-white/60">{t.appWillRestart}</p>
                    </div>
                ) : (
                    <button
                        onClick={handleUpdateCore}
                        disabled={updatingCore}
                        className={`w-full py-2.5 rounded-xl font-medium transition-all mt-2 flex items-center justify-center gap-2 ${coreUpdated
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                            }`}
                    >
                        {coreUpdated ? (
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
                )}
            </div>

            {/* Disclaimer */}
            <div className="glass-card p-5 border-l-4 border-amber-400 bg-amber-50 dark:!bg-white/10">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-1 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-semibold mb-1 text-amber-600 dark:text-amber-400">
                            {t.disclaimerTitle}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-white/80">
                            {t.disclaimerText}
                        </p>
                    </div>
                </div>
            </div>

            {/* App info */}
            <div className="glass-card p-6 h-full flex flex-col justify-center items-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">Video-Get-Downloader</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-white/50">{t.version} {appVersion}</p>
                <p className="text-xs mt-1 text-gray-400 dark:text-white/40">{t.poweredBy} <span className="gradient-text font-medium">ChuSauBanh</span></p>
            </div>
        </div>
    )

    if (embedded) {
        return content
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative glass-card p-6 w-full max-w-lg mx-4 slide-in max-h-[90vh] overflow-y-auto dark:bg-slate-900/95">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.settings}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                        <svg className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

