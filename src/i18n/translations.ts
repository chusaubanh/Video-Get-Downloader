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
        disclaimerText: 'Đây là ứng dụng phi lợi nhuận, hoàn toàn miễn phí và không có quảng cáo. Nếu thấy hay hãy chia sẻ và đóng góp nhé.',

        // Update
        checkForUpdates: 'Kiểm tra cập nhật',
        checkingForUpdates: 'Đang kiểm tra...',
        updateAvailable: 'Có bản cập nhật mới:',
        updateNotAvailable: 'Bạn đang dùng bản mới nhất',
        downloadUpdate: 'Tải và cài đặt',
        downloadingUpdate: 'Đang tải bản cập nhật...',
        updateDownloaded: 'Đã tải xong. Khởi động lại để cài đặt.',
        restartToUpdate: 'Khởi động lại ngay',
        updateError: 'Lỗi cập nhật',

        // Core Update
        updateCoreTitle: 'Cập nhật Core tải xuống',
        updateCoreDesc: 'Cập nhật thành phần tải xuống (yt-dlp) để sửa lỗi',
        updateCoreBtn: 'Cập nhật Core',
        updatingCore: 'Đang cập nhật...',
        coreUpdated: 'Core đã được cập nhật!',
        coreUpdateError: 'Lỗi cập nhật Core'
    },
    en: {
        // ... (existing translations)

        // Disclaimer
        disclaimerTitle: 'Disclaimer',
        disclaimerText: 'This is a non-profit application, free of charge and served with no ads. If you find it useful, please share and contribute.',

        // Update
        checkForUpdates: 'Check for updates',
        checkingForUpdates: 'Checking for updates...',
        updateAvailable: 'Update available:',
        updateNotAvailable: 'You are using the latest version',
        downloadUpdate: 'Download and Install',
        downloadingUpdate: 'Downloading update...',
        updateDownloaded: 'Update downloaded. Restart to install.',
        restartToUpdate: 'Restart Now',
        updateError: 'Update error',

        // Core Update
        updateCoreTitle: 'Update Download Core',
        updateCoreDesc: 'Update downloading component (yt-dlp) to fix errors',
        updateCoreBtn: 'Update Core',
        updatingCore: 'Updating...',
        coreUpdated: 'Core updated!',
        coreUpdateError: 'Core Update Error'
    }
}

export type Language = 'vi' | 'en'
export type TranslationKey = keyof typeof translations.vi
