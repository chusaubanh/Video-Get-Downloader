import PlatformBadge from './PlatformBadge'
import appIcon from '/icon.png'

interface HeaderProps {
    darkMode: boolean
    t: any
}

function Header({ darkMode, t }: HeaderProps) {
    const handleMinimize = () => {
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow()
        }
    }

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow()
        }
    }

    return (
        <header className="relative z-10 flex-shrink-0">
            {/* Custom titlebar */}
            <div className={`flex items-center justify-between px-4 py-2 backdrop-blur-sm border-b drag-region ${darkMode ? 'bg-black/40 border-white/10' : 'bg-white/70 border-gray-200/50'
                }`}>
                <div className="flex items-center gap-3 no-drag">
                    {/* Logo with icon */}
                    <div className="relative">
                        <img
                            src={appIcon}
                            alt="Videos-Get-Downloader Logo"
                            className="w-9 h-9 object-contain rounded-full shadow-lg"
                        />
                    </div>

                    <div>
                        <h1 className="text-base font-bold gradient-text">{t.appName}</h1>
                        <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.appDesc}</p>
                    </div>
                </div>

                {/* Supported platforms */}
                <div className="hidden md:flex items-center gap-2 no-drag">
                    <span className={`text-xs mr-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{t.supports}</span>
                    <PlatformBadge platform="tiktok" size="sm" />
                    <PlatformBadge platform="instagram" size="sm" />
                    <PlatformBadge platform="facebook" size="sm" />
                    <PlatformBadge platform="youtube" size="sm" />
                    <PlatformBadge platform="twitter" size="sm" />
                </div>

                {/* Window controls */}
                <div className="flex items-center gap-1 no-drag">
                    <button
                        onClick={handleMinimize}
                        className={`p-2 rounded-lg transition-colors group ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        title="Minimize"
                    >
                        <svg className={`w-4 h-4 ${darkMode ? 'text-white/50 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <button
                        onClick={handleClose}
                        className={`p-2 rounded-lg transition-colors group ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
                        title="Close"
                    >
                        <svg className={`w-4 h-4 ${darkMode ? 'text-white/50 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
