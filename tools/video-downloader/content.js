chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeVideo') {
        const videos = findVideos();
        sendResponse({ videos });
        return true;
    }
    else if (request.action === 'getHeaders') {
        // 获取当前页面的请求头
        const rawHeaders = {
            'User-Agent': window.navigator.userAgent,
            'Referer': document.location.href,
            'Origin': document.location.origin,
            'Cookie': document.cookie,
            'Accept': '*/*',
            'Accept-Language': navigator.language,
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
        };

        // 过滤和清理 headers
        const headers = {};
        for (let [key, value] of Object.entries(rawHeaders)) {
            try {
                // 检查是否包含非 ASCII 字符
                if (/^[\x00-\x7F]*$/.test(value)) {
                    headers[key] = value;
                } else {
                    // 如果包含非 ASCII 字符，尝试编码或移除
                    headers[key] = value.replace(/[^\x00-\x7F]/g, '');
                }
            } catch (e) {
                console.warn(`跳过无效的header: ${key}`);
            }
        }

        // 获取 meta 标签中的信息
        const metaTags = document.getElementsByTagName('meta');
        for (let meta of metaTags) {
            const name = meta.getAttribute('name');
            const content = meta.getAttribute('content');
            if (name && content && /^[\x00-\x7F]*$/.test(content)) {
                headers[name] = content;
            }
        }

        sendResponse({ headers: headers });
        return true;
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