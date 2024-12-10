document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const videoList = document.getElementById('videoList');

    // 自动填入当前标签页URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            urlInput.value = tabs[0].url;
            analyzeVideo(tabs[0].id);
        }
    });

    // 点击分析按钮
    analyzeBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('请输入视频页面URL');
            return;
        }

        // 创建新标签页并分析
        const tab = await chrome.tabs.create({ url: url, active: false });
        setTimeout(() => {
            analyzeVideo(tab.id);
        }, 2000); // 等待页面加载
    });
});

// 分析视频
function analyzeVideo(tabId) {
    chrome.tabs.sendMessage(tabId, {action: "analyzeVideo"});
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'videoFound') {
        const videoList = document.getElementById('videoList');
        // 清空现有列表
        videoList.innerHTML = '';
        
        if (request.videos && request.videos.length > 0) {
            request.videos.forEach(video => {
                const videoItem = createVideoItem(video);
                videoList.appendChild(videoItem);
            });
        } else {
            videoList.innerHTML = '<div style="text-align: center; padding: 20px;">未找到可下载的视频</div>';
        }
    }
});

function createVideoItem(video) {
    const div = document.createElement('div');
    div.className = 'video-item';
    
    const info = document.createElement('div');
    info.textContent = `${video.title} (${video.format})`;
    
    const button = document.createElement('button');
    button.className = 'download-btn';
    button.textContent = '下载';
    button.onclick = () => {
        chrome.runtime.sendMessage({
            action: 'downloadVideo',
            video: video
        });
    };
    
    div.appendChild(info);
    div.appendChild(button);
    return div;
} 