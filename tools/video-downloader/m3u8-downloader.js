export class M3U8Downloader {
    constructor(m3u8Url, title, onProgress, sourceUrl) {
        this.m3u8Url = m3u8Url;
        this.title = title;
        this.onProgress = onProgress;
        this.sourceUrl = sourceUrl;
        this.tsUrls = [];
        this.chunks = [];
    }

    async download() {
        try {
            // 1. 从源页面获取headers
            const sourceHeaders = await this.getSourcePageHeaders();
            
            // 2. 获取M3U8文件内容
            const m3u8Content = await this.fetchWithHeaders(this.m3u8Url, sourceHeaders);
            
            // 3. 解析M3U8获取所有ts文件URL
            this.tsUrls = this.parseM3U8(m3u8Content);
            
            // 4. 下载所有ts文件
            await this.downloadTsFiles(sourceHeaders);
            
            // 5. 合并ts文件
            const blob = this.mergeTsFiles();
            
            // 6. 创建下载链接
            const url = URL.createObjectURL(blob);
            
            // 7. 触发下载
            chrome.downloads.download({
                url: url,
                filename: `${this.title}.mp4`,
                saveAs: true
            });

            // 清理
            this.chunks = [];
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('M3U8下载失败:', error);
            throw error;
        }
    }

    async getSourcePageHeaders() {
        return new Promise((resolve, reject) => {
            // 从storage中获取源页面的headers
            chrome.storage.local.get([`headers_${this.sourceUrl}`], result => {
                const headers = result[`headers_${this.sourceUrl}`];
                if (headers) {
                    resolve(headers);
                } else {
                    reject(new Error('No headers found for source page'));
                }
            });
        });
    }

    async fetchWithHeaders(url, headers) {
        const response = await fetch(url, { 
            headers: {
                ...headers,
                // 确保有正确的 Referer
                'Referer': headers.referer || headers.Referer || new URL(this.m3u8Url).origin
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }

    parseM3U8(content) {
        const urls = [];
        const lines = content.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            // 检查是否是另一个m3u8文件
            if (line.endsWith('.m3u8') && !line.startsWith('#')) {
                throw new Error('需要处理嵌套的m3u8文件');
            }
            // 检查ts文件
            if (line.endsWith('.ts') && !line.startsWith('#')) {
                // 处理相对路径和绝对路径
                const url = line.startsWith('http') ? line : new URL(line, this.m3u8Url).href;
                urls.push(url);
            }
        });
        
        if (urls.length === 0) {
            throw new Error('未找到任何ts文件');
        }
        
        return urls;
    }

    async downloadTsFiles(headers) {
        const total = this.tsUrls.length;
        let completed = 0;

        // 并发下载，但限制并发数
        const concurrency = 5;
        const chunks = [];

        for (let i = 0; i < this.tsUrls.length; i += concurrency) {
            const batch = this.tsUrls.slice(i, i + concurrency);
            const promises = batch.map(async (url, index) => {
                try {
                    const response = await fetch(url, { headers });
                    if (!response.ok) {
                        throw new Error(`下载ts文件失败: ${response.status}`);
                    }
                    const buffer = await response.arrayBuffer();
                    chunks[i + index] = buffer;
                    completed++;
                    
                    // 更新进度
                    if (this.onProgress) {
                        this.onProgress((completed / total) * 100);
                    }
                } catch (error) {
                    console.error(`下载ts文件失败: ${url}`, error);
                    throw error;
                }
            });

            await Promise.all(promises);
        }

        this.chunks = chunks;
    }

    mergeTsFiles() {
        // 合并所有ts文件
        const blob = new Blob(this.chunks, { type: 'video/mp4' });
        return blob;
    }
} 