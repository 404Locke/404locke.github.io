async function analyzeUrl() {
    const url = document.getElementById('url').value;
    const loadingDiv = document.getElementById('loading');
    const videoListDiv = document.getElementById('videoList');
    
    if (!url) {
        showError('请输入网页地址');
        return;
    }

    try {
        // 显示加载动画
        loadingDiv.style.display = 'block';
        videoListDiv.style.display = 'none';
        
        // 发送请求到后端API解析视频
        const videos = await fetchVideoInfo(url);
        
        // 显示视频列表
        displayVideos(videos);
        
        showSuccess('解析完成！');
    } catch (error) {
        showError('解析失败: ' + error.message);
    } finally {
        loadingDiv.style.display = 'none';
    }
}

async function fetchVideoInfo(url) {
    try {
        // 尝试使用no-cors模式获取网页内容
        const response = await fetch(url, {
            mode: 'no-cors',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 注意：no-cors模式下无法直接读取响应内容
        // 我们需要改用其他方式，比如创建一个隐藏的iframe来加载页面

        // 创建一个隐藏的iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // 等待iframe加载完成
        await new Promise((resolve, reject) => {
            iframe.onload = resolve;
            iframe.onerror = reject;
            iframe.src = url;
        });

        try {
            // 尝试从iframe中获取内容
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            
            // 查找视频源
            const videos = [];
            
            // 查找video标签
            const videoElements = doc.getElementsByTagName('video');
            for (const video of videoElements) {
                if (video.src) {
                    videos.push(createVideoInfo(video.src, '视频源'));
                }
                
                const sources = video.getElementsByTagName('source');
                for (const source of sources) {
                    if (source.src) {
                        videos.push(createVideoInfo(source.src, source.getAttribute('label') || '视频源'));
                    }
                }
            }

            // 查找页面中的视频链接
            const html = doc.documentElement.outerHTML;
            
            // 查找m3u8链接
            const m3u8Regex = /(https?:\/\/[^"']*?\.m3u8[^"']*)/g;
            const m3u8Matches = html.match(m3u8Regex);
            if (m3u8Matches) {
                m3u8Matches.forEach(url => {
                    videos.push(createVideoInfo(url, 'M3U8视频'));
                });
            }
            
            // 查找mp4链接
            const mp4Regex = /(https?:\/\/[^"']*?\.mp4[^"']*)/g;
            const mp4Matches = html.match(mp4Regex);
            if (mp4Matches) {
                mp4Matches.forEach(url => {
                    videos.push(createVideoInfo(url, 'MP4视频'));
                });
            }

            // 清理iframe
            document.body.removeChild(iframe);

            // 去重
            const uniqueVideos = removeDuplicates(videos);
            
            if (uniqueVideos.length === 0) {
                throw new Error('未找到可下载的视频');
            }
            
            return uniqueVideos;

        } catch (error) {
            // 如果无法访问iframe内容（由于同源策略），则抛出错误
            document.body.removeChild(iframe);
            throw new Error('由于跨域限制，无法直接解析该网页。建议使用代理服务器或浏览器扩展。');
        }
        
    } catch (error) {
        console.error('视频解析失败:', error);
        throw new Error('视频解析失败: ' + error.message);
    }
}

function createVideoInfo(url, label) {
    return {
        id: generateId(),
        title: label,
        duration: '未知',
        size: '未知',
        quality: '自动',
        url: url
    };
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function extractVideoUrls(obj) {
    const urls = [];
    
    function extract(obj) {
        if (!obj) return;
        
        if (typeof obj === 'string') {
            // 检查是否是视频URL
            if (isVideoUrl(obj)) {
                urls.push(obj);
            }
            return;
        }
        
        if (typeof obj === 'object') {
            for (const key in obj) {
                extract(obj[key]);
            }
        }
    }
    
    extract(obj);
    return urls;
}

function isVideoUrl(url) {
    const videoExtensions = ['.mp4', '.m3u8', '.webm', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
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

function displayVideos(videos) {
    const videoListDiv = document.getElementById('videoList');
    videoListDiv.innerHTML = ''; // 清空现有内容
    
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-meta">
                    时长: ${video.duration} | 大小: ${video.size} | 质量: ${video.quality}
                </div>
            </div>
            <button class="download-btn" onclick="downloadVideo('${video.id}', '${video.url}')">
                下载视频
            </button>
        `;
        videoListDiv.appendChild(videoItem);
    });
    
    videoListDiv.style.display = 'block';
}

async function downloadVideo(videoId, videoUrl) {
    try {
        showStatus('正在准备下载...');
        
        // 获取视频格式
        const videoFormat = getVideoFormat(videoUrl);
        
        switch (videoFormat) {
            case 'mp4':
            case 'webm':
            case 'mov':
                await downloadDirectVideo(videoUrl, videoId, videoFormat);
                break;
            case 'm3u8':
                await downloadM3U8Video(videoUrl, videoId);
                break;
            default:
                throw new Error('不支持的视频格式');
        }
        
        showSuccess('下载开始！');
    } catch (error) {
        showError('下载失败: ' + error.message);
    }
}

function getVideoFormat(url) {
    // 从URL或内容类型判断视频格式
    const extension = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'mov', 'm3u8'].includes(extension)) {
        return extension;
    }
    // 如果URL没有明确的扩展名，可能需要通过其他方式判断
    if (url.includes('m3u8')) return 'm3u8';
    return 'mp4'; // 默认假设为mp4
}

async function downloadDirectVideo(videoUrl, videoId, format) {
    try {
        showStatus('正在下载视频...');
        
        // 对于大文件，使用流式下载
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('视频下载失败');
        
        const contentLength = response.headers.get('content-length');
        let receivedLength = 0;
        
        // 创建可读流
        const reader = response.body.getReader();
        const chunks = [];
        
        while (true) {
            const {done, value} = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            // 更新下载进度
            if (contentLength) {
                const progress = ((receivedLength / contentLength) * 100).toFixed(2);
                showStatus(`下载进度: ${progress}%`);
            }
        }
        
        // 合并所有chunks
        const blob = new Blob(chunks, {
            type: `video/${format}`
        });
        
        // 触发下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${videoId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        throw new Error(`视频下载失败: ${error.message}`);
    }
}

async function downloadM3U8Video(m3u8Url, videoId) {
    try {
        showStatus('正在处理M3U8视频...');
        
        // 使用后端服务转换和下载M3U8
        const response = await fetch('/api/download-m3u8', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: m3u8Url,
                videoId: videoId
            })
        });

        if (!response.ok) {
            throw new Error('M3U8处理失败');
        }

        // 获取转换后的MP4文件
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${videoId}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        throw new Error(`M3U8视频处理失败: ${error.message}`);
    }
}

// 动态加载hls.js
function loadHlsScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = resolve;
        script.onerror = () => reject(new Error('无法加载HLS.js'));
        document.head.appendChild(script);
    });
}

function showStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
}

function showSuccess(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status success';
    statusDiv.textContent = message;
}

function showError(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status error';
    statusDiv.textContent = message;
} 