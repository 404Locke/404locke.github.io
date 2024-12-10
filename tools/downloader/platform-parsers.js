// 使用第三方解析服务的API地址
const API_BASE_URL = 'https://api.example.com/v1'; // 这里替换为实际的API地址

// YouTube解析器
class YouTubeParser {
    static async parse(url) {
        try {
            // 使用第三方API解析YouTube视频
            const response = await fetch(`${API_BASE_URL}/youtube/parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY' // 替换为你的API密钥
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'YouTube视频解析失败');
            }
            
            return data.formats.map(format => ({
                id: generateId(),
                title: data.title,
                duration: format.duration || '未知',
                size: format.filesize ? formatFileSize(format.filesize) : '未知',
                quality: format.quality || '自动',
                url: format.url,
                format: format.ext || 'mp4',
                platform: 'youtube'
            }));
        } catch (error) {
            throw new Error(`YouTube解析失败: ${error.message}`);
        }
    }
}

// Bilibili解析器
class BilibiliParser {
    static async parse(url) {
        try {
            // 使用第三方API解析Bilibili视频
            const response = await fetch(`${API_BASE_URL}/bilibili/parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_API_KEY' // 替换为你的API密钥
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Bilibili视频解析失败');
            }

            return data.formats.map(format => ({
                id: generateId(),
                title: data.title,
                duration: formatDuration(data.duration),
                size: format.filesize ? formatFileSize(format.filesize) : '未知',
                quality: format.quality,
                url: format.url,
                format: format.ext || 'flv',
                platform: 'bilibili'
            }));
        } catch (error) {
            throw new Error(`Bilibili解析失败: ${error.message}`);
        }
    }
}

// 工具函数
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatDuration(seconds) {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes) return '未知';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    
    while (size >= 1024 && i < sizes.length - 1) {
        size /= 1024;
        i++;
    }
    
    return `${size.toFixed(2)} ${sizes[i]}`;
}

export { YouTubeParser, BilibiliParser }; 