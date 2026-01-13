import { useState } from 'react'

interface SidebarProps {
    activeTab: 'home' | 'history' | 'settings'
    onTabChange: (tab: 'home' | 'history' | 'settings') => void
    historyCount: number
    defaultPath: string
    darkMode: boolean
    version: string
    t: any
}

function Sidebar({ activeTab, onTabChange, historyCount, defaultPath, darkMode, version, t }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const menuItems = [
        {
            id: 'home' as const,
            label: t.home,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: 'history' as const,
            label: t.history,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            badge: historyCount > 0 ? historyCount : undefined
        },
        {
            id: 'settings' as const,
            label: t.settings,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ]

    return (
        <aside className={`
            flex-shrink-0 h-full border-r backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-16' : 'w-64'}
            ${darkMode ? 'border-white/10 bg-black/20' : 'border-gray-200/50 bg-white/50'}
        `}>
            <div className="flex flex-col h-full p-3">
                {/* Toggle button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`self-end p-2 rounded-lg transition-colors mb-4 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''} ${darkMode ? 'text-white/50' : 'text-gray-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>

                {/* Menu items */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                ${activeTab === item.id
                                    ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20'
                                    : darkMode
                                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }
                            `}
                        >
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1 text-left text-sm font-medium">
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === item.id
                                            ? 'bg-white/20'
                                            : darkMode ? 'bg-white/10 text-white/60' : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Download path indicator */}
                {!isCollapsed && (
                    <div className={`mt-auto pt-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200/50'}`}>
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className={`text-xs mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{t.downloadFolder}</p>
                            <p className={`text-xs truncate ${darkMode ? 'text-white/70' : 'text-gray-600'}`} title={defaultPath || t.askEachTime}>
                                {defaultPath ? (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-mint-400 mr-1"></span>
                                        {defaultPath.split('\\').pop() || defaultPath}
                                    </>
                                ) : (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>
                                        {t.askEachTime}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* App info */}
                {!isCollapsed && (
                    <div className="pt-3 text-center">
                        <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>v{version}</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{t.poweredBy} <span className="gradient-text font-medium">ChuSauBanh</span></p>
                    </div>
                )}
            </div>
        </aside>
    )
}

export default Sidebar
