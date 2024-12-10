document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
        showLoading(true);
        // 向内容脚本发送消息，请求分析视频
        chrome.tabs.sendMessage(tab.id, { action: 'analyzeVideo' }, handleVideoResponse);
    }
});

function handleVideoResponse(response) {
    showLoading(false);
    
    if (!response) {
        showError('无法获取视频信息');
        return;
    }
    
    if (response.error) {
        showError(response.error);
        return;
    }
    
    if (response.videos && response.videos.length > 0) {
        displayVideos(response.videos);
    } else {
        showError('未找到可下载的视频');
    }
}

function displayVideos(videos) {
    const videoListDiv = document.getElementById('videoList');
    videoListDiv.innerHTML = '';
    
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <div class="video-title">${video.title || '未命名视频'}</div>
            <div class="video-meta">
                质量: ${video.quality || '未知'} | 
                格式: ${video.format || '未知'}
            </div>
            <button class="download-btn" data-url="${video.url}">
                下载视频
            </button>
        `;
        
        const downloadBtn = videoItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => downloadVideo(video));
        
        videoListDiv.appendChild(videoItem);
    });
}

async function downloadVideo(video) {
    try {
        showStatus('开始下载...');
        
        // 发送下载请求到background script
        chrome.runtime.sendMessage({
            action: 'downloadVideo',
            video: video
        });
        
        showSuccess('下载已开始！');
    } catch (error) {
        showError('下载失败: ' + error.message);
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
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