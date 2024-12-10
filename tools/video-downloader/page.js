document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const videoList = document.getElementById('videoList');

    // 自动填入当前标签页URL并分析
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            const currentTab = tabs[0];
            urlInput.value = currentTab.url;
            
            // 获取当前页面的headers并分析
            chrome.tabs.sendMessage(currentTab.id, { 
                action: 'getHeaders'
            }, async response => {
                if (response && response.headers) {
                    // 保存headers到storage
                    await chrome.storage.local.set({
                        [`headers_${currentTab.url}`]: response.headers
                    });
                    analyzeUrl(currentTab.url);
                } else {
                    analyzeUrl(currentTab.url);  // 即使获取headers失败也尝试分析
                }
            });
        }
    });

    // 点击分析按钮
    analyzeBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('请输入视频页面URL');
            return;
        }

        try {
            // 创建一个新标签页来获取headers
            const tab = await chrome.tabs.create({ 
                url: url, 
                active: false  // 在后台打开
            });

            // 等待页面加载完成
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 获取headers
            chrome.tabs.sendMessage(tab.id, { 
                action: 'getHeaders'
            }, async response => {
                if (response && response.headers) {
                    // 保存headers到storage
                    await chrome.storage.local.set({
                        [`headers_${url}`]: response.headers
                    });

                    // 关闭临时标签页
                    chrome.tabs.remove(tab.id);

                    // 分析URL
                    analyzeUrl(url);
                }
            });
        } catch (error) {
            console.error('获取headers失败:', error);
            analyzeUrl(url);  // 即使获取headers失败也尝试分析
        }
    });
});

// 分析URL
async function analyzeUrl(url) {
    try {
        // 显示加载状态
        const videoList = document.getElementById('videoList');
        videoList.innerHTML = '<div style="text-align: center; padding: 20px;">正在分析视频，请稍候...</div>';

        // 发送请求获取页面内容
        const response = await fetch(url);
        const html = await response.text();

        // 分析视频信息
        const videos = extractVideoInfo(html, url);
        
        // 更新视频列表
        updateVideoList(videos);
    } catch (error) {
        console.error('分析失败:', error);
        const videoList = document.getElementById('videoList');
        videoList.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">分析失败，请检查URL是否正确</div>';
    }
}

// 从HTML中提取视频信息
function extractVideoInfo(html, pageUrl) {
    const videos = [];
    
    // 查找视频元素
    const videoRegex = /<video[^>]*src="([^"]*)"[^>]*>/g;
    const sourceRegex = /<source[^>]*src="([^"]*)"[^>]*>/g;
    const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>/g;

    // 提取video标签中的视频
    let match;
    while ((match = videoRegex.exec(html)) !== null) {
        if (match[1]) {
            const videoUrl = new URL(match[1], pageUrl).href;
            videos.push({
                title: '视频',
                url: videoUrl,
                format: getVideoFormat(videoUrl)
            });
        }
    }

    // 提取source标签中的视频
    while ((match = sourceRegex.exec(html)) !== null) {
        if (match[1]) {
            const videoUrl = new URL(match[1], pageUrl).href;
            videos.push({
                title: '视频源',
                url: videoUrl,
                format: getVideoFormat(videoUrl)
            });
        }
    }

    // 检查iframe中的视频（例如YouTube嵌入）
    while ((match = iframeRegex.exec(html)) !== null) {
        if (match[1]) {
            const iframeUrl = new URL(match[1], pageUrl).href;
            if (isVideoPlatform(iframeUrl)) {
                videos.push({
                    title: '嵌入视频',
                    url: iframeUrl,
                    format: 'iframe'
                });
            }
        }
    }

    return videos;
}

// 更新视频列表显示
function updateVideoList(videos) {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = '';
    
    if (videos.length > 0) {
        videos.forEach(video => {
            const videoItem = createVideoItem(video);
            videoList.appendChild(videoItem);
        });
    } else {
        videoList.innerHTML = '<div style="text-align: center; padding: 20px;">未找到可下载的视频</div>';
    }
}

// 获取视频格式
function getVideoFormat(url) {
    const extension = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg'].includes(extension)) {
        return extension.toUpperCase();
    }
    if (url.includes('.m3u8')) {
        return 'M3U8';
    }
    return 'Unknown';
}

// 检查是否是视频平台
function isVideoPlatform(url) {
    const videoPlatforms = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'dailymotion.com',
        'bilibili.com'
    ];
    return videoPlatforms.some(platform => url.includes(platform));
}

function createVideoItem(video) {
    const div = document.createElement('div');
    div.className = 'video-item';
    
    const info = document.createElement('div');
    info.textContent = `${video.title} (${video.format})`;
    
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    progressDiv.style.display = 'none';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressDiv.appendChild(progressBar);
    
    const button = document.createElement('button');
    button.className = 'download-btn';
    button.textContent = '下载';
    button.onclick = () => {
        if (video.format === 'M3U8') {
            progressDiv.style.display = 'block';
            button.disabled = true;
        }
        chrome.runtime.sendMessage({
            action: 'downloadVideo',
            video: video,
            sourceUrl: document.getElementById('videoUrl').value
        });
    };
    
    div.appendChild(info);
    div.appendChild(progressDiv);
    div.appendChild(button);
    
    // 处理下载进度更新
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'downloadProgress' && message.videoUrl === video.url) {
            progressBar.style.width = `${message.progress}%`;
        } else if (message.action === 'downloadComplete' && message.videoUrl === video.url) {
            progressDiv.style.display = 'none';
            button.disabled = false;
            button.textContent = '下载完成';
        } else if (message.action === 'downloadError' && message.videoUrl === video.url) {
            progressDiv.style.display = 'none';
            button.disabled = false;
            button.textContent = '下载失败';
            alert(`下载失败: ${message.error}`);
        }
    });
    
    return div;
} 