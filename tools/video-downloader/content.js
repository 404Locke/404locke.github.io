chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeVideo') {
        const videos = findVideos();
        sendResponse({ videos });
    }
});

function findVideos() {
    const videos = [];
    
    // 查找video标签
    document.querySelectorAll('video').forEach(video => {
        if (video.src) {
            videos.push(createVideoInfo(video.src));
        }
        
        video.querySelectorAll('source').forEach(source => {
            if (source.src) {
                videos.push(createVideoInfo(source.src));
            }
        });
    });
    
    // 查找m3u8链接
    const html = document.documentElement.innerHTML;
    const m3u8Regex = /(https?:\/\/[^"']*?\.m3u8[^"']*)/g;
    const m3u8Matches = html.match(m3u8Regex);
    if (m3u8Matches) {
        m3u8Matches.forEach(url => {
            videos.push(createVideoInfo(url, 'M3U8'));
        });
    }
    
    // 查找mp4链接
    const mp4Regex = /(https?:\/\/[^"']*?\.mp4[^"']*)/g;
    const mp4Matches = html.match(mp4Regex);
    if (mp4Matches) {
        mp4Matches.forEach(url => {
            videos.push(createVideoInfo(url, 'MP4'));
        });
    }
    
    return removeDuplicates(videos);
}

function createVideoInfo(url, format) {
    return {
        url: url,
        title: getVideoTitle(),
        format: format || getVideoFormat(url),
        quality: 'Auto'
    };
}

function getVideoTitle() {
    return document.title || '未命名视频';
}

function getVideoFormat(url) {
    if (url.includes('.m3u8')) return 'M3U8';
    if (url.includes('.mp4')) return 'MP4';
    if (url.includes('.webm')) return 'WebM';
    return '未知';
}

function removeDuplicates(videos) {
    const seen = new Set();
    return videos.filter(video => {
        if (seen.has(video.url)) {
            return false;
        }
        seen.add(video.url);
        return true;
    });
} 