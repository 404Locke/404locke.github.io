import { M3U8Downloader } from './m3u8-downloader.js';

// 添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'downloadVideo',
        title: '下载视频',
        contexts: ['all']
    });
});

// 处理扩展图标点击
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: 'page.html'
    });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downloadVideo') {
        chrome.tabs.sendMessage(tab.id, { action: 'analyzeVideo' });
    }
});

// 处理下载请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadVideo') {
        const video = request.video;
        const sourceUrl = request.sourceUrl;
        
        if (video.format === 'M3U8') {
            handleM3U8Download(video, sourceUrl);
        } else {
            chrome.downloads.download({
                url: video.url,
                filename: `${video.title}.${video.format.toLowerCase()}`,
                saveAs: true
            });
        }
    }
});

async function handleM3U8Download(video, sourceUrl) {
    try {
        // 创建下载器实例，传入源页面URL
        const downloader = new M3U8Downloader(
            video.url,
            video.title,
            (progress) => {
                chrome.runtime.sendMessage({
                    action: 'downloadProgress',
                    videoUrl: video.url,
                    progress: progress
                });
            },
            sourceUrl
        );
        
        await downloader.download();
        
        chrome.runtime.sendMessage({
            action: 'downloadComplete',
            videoUrl: video.url
        });
    } catch (error) {
        chrome.runtime.sendMessage({
            action: 'downloadError',
            videoUrl: video.url,
            error: error.message
        });
    }
} 