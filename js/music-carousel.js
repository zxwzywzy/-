// 音乐播放列表
const musicList = [
    {
        id: '2650804981',
        name: 'Song 1',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
    },
    {
        id: '2617607417',
        name: 'Song 2',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
    }
];

let currentIndex = 0;

// 更新播放器源
function updatePlayer() {
    const player = document.getElementById('music-player');
    const cover = document.querySelector('.music-cover img');
    player.src = `https://music.163.com/outchain/player?type=2&id=${musicList[currentIndex].id}&auto=1&height=66`;
    cover.src = musicList[currentIndex].cover;
}

// 切换到下一首
function nextSong() {
    currentIndex = (currentIndex + 1) % musicList.length;
    updatePlayer();
}

// 初始化播放器
function initMusicPlayer() {
    // 直接开始播放第一首歌
    updatePlayer();
    
    // 每5分钟切换一首歌
    setInterval(nextSong, 5 * 60 * 1000);
}

// 页面加载完成后立即播放
window.addEventListener('load', initMusicPlayer); 