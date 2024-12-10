// 全局变量
let selectedSongs = new Set();
let currentPage = 1;
const pageSize = 30;
let allSongs = new Map(); // 存储所有加载过的歌曲信息

async function searchMusic(page = 1) {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('请输入搜索关键词');
        return;
    }

    try {
        const offset = (page - 1) * pageSize;
        const response = await fetch(
            `https://netease-cloud-music-api-five-roan-88.vercel.app/search?keywords=${encodeURIComponent(query)}&limit=${pageSize}&offset=${offset}`
        );
        const data = await response.json();
        
        if (data.result && data.result.songs) {
            currentPage = page;
            // 存储当前页的歌曲信息
            data.result.songs.forEach(song => {
                allSongs.set(song.id, song);
            });
            // 确保传递正确的总数
            const totalCount = data.result.songCount || 0;
            console.log('Total songs:', totalCount); // 调试用
            displayResults(data.result.songs, totalCount);
        } else {
            alert('未找到相关歌曲');
        }
    } catch (error) {
        console.error('搜索失败:', error);
        alert('搜索失败，请稍后重试');
    }
}

function displayResults(songs, totalCount) {
    const resultsDiv = document.getElementById('results');
    
    // 如果没有结果，显示提示信息
    if (!songs || songs.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">没有找到相关歌曲</div>';
        return;
    }

    resultsDiv.innerHTML = `
        <div class="results-header">
            <label class="select-all-container">
                <input type="checkbox" id="selectAll" onchange="toggleSelectAll(this.checked)">
                <span>全选当前页(已选${selectedSongs.size}首)</span>
            </label>
            <div class="header-buttons">
                <button class="clear-btn" onclick="clearSelection()">
                    <i class="fas fa-times"></i> 清空选择
                </button>
                <button class="batch-download-btn" onclick="batchDownload()">
                    <i class="fas fa-download"></i> 批量下载
                </button>
            </div>
        </div>
        <div class="songs-container"></div>
        <div class="pagination"></div>
    `;

    const songsContainer = resultsDiv.querySelector('.songs-container');
    
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        songElement.innerHTML = `
            <div class="song-checkbox">
                <input type="checkbox" 
                    data-song-id="${song.id}" 
                    ${selectedSongs.has(song.id) ? 'checked' : ''}>
            </div>
            <div class="song-info">
                <div class="song-title">${song.name}</div>
                <div class="song-artist">${song.artists.map(a => a.name).join(', ')}</div>
            </div>
            <div class="action-buttons">
                <button class="action-btn play-btn" onclick="event.stopPropagation(); playSong(${song.id})">
                    <i class="fas fa-play"></i> 试听
                </button>
                <button class="action-btn download-btn" onclick="event.stopPropagation(); downloadSong(${song.id})">
                    <i class="fas fa-download"></i> 下载
                </button>
            </div>
        `;

        // 为整个歌曲行添加点击事件
        songElement.addEventListener('click', (e) => {
            const checkbox = songElement.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            toggleSongSelection(song.id, checkbox.checked);
        });

        // 防止点击复选框时触发两次
        songElement.querySelector('.song-checkbox input').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSongSelection(song.id, e.target.checked);
        });

        songsContainer.appendChild(songElement);
    });

    // 更新全选框状态
    updateSelectAllCheckbox();
    
    // 添加分页控件
    console.log('Displaying pagination with total:', totalCount);
    if (totalCount > pageSize) {
        displayPagination(totalCount);
    }
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    if (!selectAllCheckbox) return;

    const currentPageCheckboxes = document.querySelectorAll('.song-checkbox input[type="checkbox"]');
    const allChecked = Array.from(currentPageCheckboxes).every(cb => cb.checked);
    selectAllCheckbox.checked = allChecked;
}

function updateSelectedCount() {
    const selectAllLabel = document.querySelector('.select-all-container span');
    if (selectAllLabel) {
        selectAllLabel.textContent = `全选当前页(已选${selectedSongs.size}首)`;
    }
}

function toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.song-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const songId = parseInt(checkbox.dataset.songId);
        checkbox.checked = checked;
        if (checked) {
            selectedSongs.add(songId);
        } else {
            selectedSongs.delete(songId);
        }
    });
    updateBatchDownloadButton();
    updateSelectedCount();
}

function clearSelection() {
    selectedSongs.clear();
    const checkboxes = document.querySelectorAll('.song-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectAllCheckbox();
    updateBatchDownloadButton();
    updateSelectedCount();
}

function toggleSongSelection(songId, checked = null) {
    if (checked === null) {
        checked = document.querySelector(`input[data-song-id="${songId}"]`).checked;
    }
    
    if (checked) {
        selectedSongs.add(songId);
    } else {
        selectedSongs.delete(songId);
    }
    
    updateSelectAllCheckbox();
    updateBatchDownloadButton();
    updateSelectedCount();
}

function updateBatchDownloadButton() {
    const batchBtn = document.querySelector('.batch-download-btn');
    if (selectedSongs.size > 0) {
        batchBtn.classList.add('active');
        batchBtn.textContent = `下载选中(${selectedSongs.size}首)`;
    } else {
        batchBtn.classList.remove('active');
        batchBtn.textContent = '批量下载';
    }
}

async function playSong(songId) {
    try {
        const response = await fetch(`https://netease-cloud-music-api-five-roan-88.vercel.app/song/url?id=${songId}`);
        const data = await response.json();
        
        if (data.data && data.data[0].url) {
            const audio = new Audio(data.data[0].url);
            audio.play();
        } else {
            alert('暂无版权或VIP专属歌曲');
        }
    } catch (error) {
        console.error('播放失败:', error);
        alert('播放失败，请稍后重试');
    }
}

async function downloadSong(songId) {
    try {
        const response = await fetch(`https://netease-cloud-music-api-five-roan-88.vercel.app/song/url?id=${songId}`);
        const data = await response.json();
        
        if (data.data && data.data[0].url) {
            // 获取歌曲详情以获取正确的文件名
            const detailResponse = await fetch(`https://netease-cloud-music-api-five-roan-88.vercel.app/song/detail?ids=${songId}`);
            const detailData = await detailResponse.json();
            const songName = detailData.songs[0].name;
            const artistName = detailData.songs[0].ar.map(a => a.name).join(',');
            
            const link = document.createElement('a');
            link.href = data.data[0].url;
            link.download = `${artistName} - ${songName}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('暂无版权或VIP专属歌曲');
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请稍后重试');
    }
}

async function batchDownload() {
    if (selectedSongs.size === 0) {
        alert('请先选择要下载的歌曲');
        return;
    }

    try {
        for (const songId of selectedSongs) {
            await downloadSong(songId);
            // 添加延迟避免浏览器限制
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        selectedSongs.clear();
        updateBatchDownloadButton();
    } catch (error) {
        console.error('批量下载失败:', error);
        alert('批量下载失败，请稍后重试');
    }
}

// 监听回车键搜索
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMusic();
    }
});

function displayPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginationDiv = document.querySelector('.pagination');
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // 上一页按钮
    paginationHTML += `
        <button 
            class="page-btn" 
            onclick="searchMusic(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
        >
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 第一页
    if (startPage > 1) {
        paginationHTML += `
            <button class="page-btn" onclick="searchMusic(1)">1</button>
            ${startPage > 2 ? '<span class="page-ellipsis">...</span>' : ''}
        `;
    }

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button 
                class="page-btn ${i === currentPage ? 'active' : ''}" 
                onclick="searchMusic(${i})"
            >
                ${i}
            </button>
        `;
    }

    // 最后一页
    if (endPage < totalPages) {
        paginationHTML += `
            ${endPage < totalPages - 1 ? '<span class="page-ellipsis">...</span>' : ''}
            <button class="page-btn" onclick="searchMusic(${totalPages})">${totalPages}</button>
        `;
    }

    // 下一页按钮
    paginationHTML += `
        <button 
            class="page-btn" 
            onclick="searchMusic(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationHTML += '</div>';
    
    // 显示总数和当前页信息
    paginationHTML += `
        <div class="pagination-info">
            共 ${totalCount} 条结果，当前第 ${currentPage}/${totalPages} 页
        </div>
    `;

    paginationDiv.innerHTML = paginationHTML;
} 