import requests
from bs4 import BeautifulSoup
import re
import m3u8
import subprocess

def download_video(url):
    # 设置请求头，模拟浏览器
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    # 获取页面内容
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 查找视频源
    videos = []
    
    # 查找video标签
    for video in soup.find_all('video'):
        if video.get('src'):
            videos.append(video['src'])
        for source in video.find_all('source'):
            if source.get('src'):
                videos.append(source['src'])
    
    # 查找m3u8链接
    m3u8_pattern = r'https?://[^"\']*?\.m3u8[^"\']'
    m3u8_urls = re.findall(m3u8_pattern, response.text)
    videos.extend(m3u8_urls)
    
    # 查找mp4链接
    mp4_pattern = r'https?://[^"\']*?\.mp4[^"\']'
    mp4_urls = re.findall(mp4_pattern, response.text)
    videos.extend(mp4_urls)
    
    return videos

def download_m3u8(url, output_file):
    # 使用ffmpeg下载并转换m3u8
    command = [
        'ffmpeg',
        '-i', url,
        '-c', 'copy',
        '-bsf:a', 'aac_adtstoasc',
        output_file
    ]
    subprocess.run(command)

if __name__ == '__main__':
    url = input('https://hsex.men/video-681816.htm')
    videos = download_video(url)
    
    if not videos:
        print('未找到视频')
        exit()
    
    print('\n找到以下视频源：')
    for i, video in enumerate(videos):
        print(f'{i+1}. {video}')
    
    choice = int(input('\n请选择要下载的视频序号：')) - 1
    video_url = videos[choice]
    
    if '.m3u8' in video_url:
        output_file = 'video.mp4'
        print('正在下载m3u8视频...')
        download_m3u8(video_url, output_file)
    else:
        output_file = 'video.mp4'
        print('正在下载视频...')
        response = requests.get(video_url, stream=True)
        with open(output_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    
    print(f'下载完成：{output_file}')