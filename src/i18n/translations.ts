// Language translations
export const translations = {
    vi: {
        // Header
        appName: 'Video-Get-Downloader',
        appDesc: 'Tải video không watermark',
        supports: 'Hỗ trợ:',

        // Sidebar
        home: 'Trang chủ',
        history: 'Lịch sử tải',
        settings: 'Cài đặt',
        downloadFolder: 'Thư mục tải:',
        askEachTime: 'Hỏi mỗi lần tải',

        // URL Input
        downloadFromSocial: 'Tải video từ mạng xã hội',
        pasteLink: 'Dán link video để tải về không watermark',
        pasteLinkPlaceholder: 'Dán link video ở đây...',
        getVideo: 'Lấy video',
        loading: 'Đang tải...',
        invalidLink: 'Link không hợp lệ. Hỗ trợ: TikTok, Instagram, Facebook, YouTube, Twitter/X',

        // Video Preview
        selectQuality: 'Chọn chất lượng để tải (MP4):',
        clickToDownload: 'Nhấp vào chất lượng bất kỳ để tải video về máy',

        // Download Progress
        downloading: 'Đang tải xuống...',
        progress: 'Tiến độ',
        speed: 'Tốc độ',
        downloaded: 'Đã tải',
        remaining: 'Còn lại',
        calculating: 'Đang tính...',

        // History
        downloadHistory: 'Lịch sử tải xuống',
        clearHistory: 'Xóa lịch sử',
        noHistory: 'Chưa có lịch sử tải',
        videosWillAppear: 'Các video bạn tải sẽ được hiển thị ở đây',
        justNow: 'Vừa xong',
        minutesAgo: 'phút trước',
        hoursAgo: 'giờ trước',
        daysAgo: 'ngày trước',

        // Settings
        defaultDownloadPath: 'Thư mục tải mặc định',
        selectFolderPlaceholder: 'Chọn thư mục hoặc hỏi mỗi lần tải...',
        select: 'Chọn',
        leaveEmptyToAsk: 'Để trống nếu muốn chọn thư mục mỗi lần tải',
        preferHighQuality: 'Ưu tiên chất lượng cao',
        preferHighQualityDesc: 'Hiển thị 1080p hoặc cao hơn đầu tiên',
        notifyWhenDone: 'Thông báo khi tải xong',
        notifyWhenDoneDesc: 'Hiển thị thông báo desktop',
        saveSettings: 'Lưu cài đặt',
        saved: 'Đã lưu!',
        version: 'Phiên bản',
        poweredBy: 'Powered by',

        // Theme
        darkMode: 'Chế độ tối',
        lightMode: 'Chế độ sáng',

        // Language
        language: 'Ngôn ngữ',
        vietnamese: 'Tiếng Việt',
        english: 'English',

        // Mode indicator
        electronMode: '⚡ Electron Mode (yt-dlp)',
        browserMode: '🌐 Browser Mode (Web API)',

        // Errors
        cannotGetInfo: 'Không thể lấy thông tin video',
        downloadError: 'Lỗi khi tải video',
        urlNotAvailable: 'Download URL không khả dụng cho chất lượng này',
        downloadComplete: 'Đã tải xong:',

        // Disclaimer
        disclaimerTitle: 'Tuyên bố miễn trừ',
        disclaimerText: 'Đây là ứng dụng phi lợi nhuận, hoàn toàn miễn phí và không có quảng cáo. Nếu thấy hay hãy chia sẻ và đóng góp nhé.'
    },
    en: {
        // Header
        appName: 'Video-Get-Downloader',
        appDesc: 'Download videos without watermark',
        supports: 'Supports:',

        // Sidebar
        home: 'Home',
        history: 'Download History',
        settings: 'Settings',
        downloadFolder: 'Download folder:',
        askEachTime: 'Ask each time',

        // URL Input
        downloadFromSocial: 'Download video from social media',
        pasteLink: 'Paste video link to download without watermark',
        pasteLinkPlaceholder: 'Paste video link here...',
        getVideo: 'Get Video',
        loading: 'Loading...',
        invalidLink: 'Invalid link. Supported: TikTok, Instagram, Facebook, YouTube, Twitter/X',

        // Video Preview
        selectQuality: 'Select quality to download (MP4):',
        clickToDownload: 'Click any quality to download the video',

        // Download Progress
        downloading: 'Downloading...',
        progress: 'Progress',
        speed: 'Speed',
        downloaded: 'Downloaded',
        remaining: 'Remaining',
        calculating: 'Calculating...',

        // History
        downloadHistory: 'Download History',
        clearHistory: 'Clear History',
        noHistory: 'No download history',
        videosWillAppear: 'Downloaded videos will appear here',
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',

        // Settings
        defaultDownloadPath: 'Default download folder',
        selectFolderPlaceholder: 'Select folder or ask each time...',
        select: 'Select',
        leaveEmptyToAsk: 'Leave empty to ask for folder each time',
        preferHighQuality: 'Prefer high quality',
        preferHighQualityDesc: 'Show 1080p or higher first',
        notifyWhenDone: 'Notify when done',
        notifyWhenDoneDesc: 'Show desktop notification',
        saveSettings: 'Save Settings',
        saved: 'Saved!',
        version: 'Version',
        poweredBy: 'Powered by',

        // Theme
        darkMode: 'Dark mode',
        lightMode: 'Light mode',

        // Language
        language: 'Language',
        vietnamese: 'Tiếng Việt',
        english: 'English',

        // Mode indicator
        electronMode: '⚡ Electron Mode (yt-dlp)',
        browserMode: '🌐 Browser Mode (Web API)',

        // Errors
        cannotGetInfo: 'Cannot get video info',
        downloadError: 'Download error',
        urlNotAvailable: 'Download URL not available for this quality',
        downloadComplete: 'Download complete:',

        // Disclaimer
        disclaimerTitle: 'Disclaimer',
        disclaimerText: 'This is a non-profit application, free of charge and served with no ads. If you find it useful, please share and contribute.'
    }
}

export type Language = 'vi' | 'en'
export type TranslationKey = keyof typeof translations.vi
