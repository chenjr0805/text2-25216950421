// ========== DOM 元素引用 ==========
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeBtn = document.getElementById('volume');
const volumeContainer = document.getElementById('volume-container');
const volumeFill = document.getElementById('volume-fill');
const screenBtn = document.getElementById('screen');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const currTime = document.getElementById('currTime');
const durTime = document.getElementById('durTime');
const speedControl = document.querySelector('.speed-control');
const playlistBtn = document.getElementById('playlist-btn');
const closeSidebarBtn = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const songListUl = document.getElementById('song-list');
const musicContainer = document.querySelector('.player-container');

// ========== 音乐数据 ==========
const songs = [
    { 
        name: '多远都要在一起', 
        artist: '邓紫棋-陈建任25216950421最喜欢的女歌手', 
        audioSrc: 'mp3\\G.E.M. 邓紫棋 - 多远都要在一起(1).mp3', 
        coverSrc: 'image/邓紫棋.jpg' 
    },
    { 
        name: '爱错', 
        artist: '王力宏-陈建任25216950421最喜欢的男歌手', 
        audioSrc: 'mp3\\王力宏 - 爱错.mp3', 
        coverSrc: 'image/王力宏.jpg' 
    },
    { 
        name: '晴天', 
        artist: '周杰伦', 
        audioSrc: 'mp3\\周杰伦 - 晴天.mp3', 
        coverSrc: 'image/周杰伦.jpg' 
    }
];

// ========== 状态变量 ==========
let currentSongIndex = 0;      // 当前歌曲索引
let isPlaying = false;         // 是否正在播放
let shouldAutoPlay = false;    // 加载新歌后是否自动播放
let lastVolume = 1.0;          // 静音前保存的音量
let speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]; // 播放速度选项
let speedIndex = 2;            // 当前速度索引

// ========== 初始化播放器 ==========
function initPlayer() {
    loadSong(songs[currentSongIndex]);
    audio.volume = 1.0;
    updateVolumeUI(1.0);
    renderPlaylist();
}

// ========== 歌曲管理函数 ==========
function loadSong(song) {
    // 更新UI显示
    title.innerText = song.name;
    artist.innerText = `作者: ${song.artist}`;
    cover.src = song.coverSrc;
    
    // 设置音频源
    if (isPlaying) shouldAutoPlay = true;
    audio.src = song.audioSrc;
    
    // 重置进度条
    progress.style.width = '0%';
    currTime.textContent = '00:00';
    durTime.textContent = '00:00';
}

function playSong() {
    try {
        isPlaying = true;
        shouldAutoPlay = true;
        musicContainer.classList.add('play');
        updatePlayButton();
        audio.play();
    } catch (error) {
        console.error('播放失败:', error);
        isPlaying = false;
        musicContainer.classList.remove('play');
        updatePlayButton();
    }
}

function pauseSong() {
    isPlaying = false;
    shouldAutoPlay = false;
    musicContainer.classList.remove('play');
    updatePlayButton();
    audio.pause();
}

function togglePlayPause() {
    isPlaying ? pauseSong() : playSong();
}

function changeSong(direction) {
    // 计算下一首或上一首的索引
    if (direction === 'next') {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }
    
    loadSong(songs[currentSongIndex]);
    updatePlaylistActive();
}

// ========== 播放列表函数 ==========
function renderPlaylist() {
    songListUl.innerHTML = '';
    
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('song-item');
        if (index === currentSongIndex) li.classList.add('active');
        
        li.innerHTML = `
            <div class="song-item-name">${song.name}</div>
            <div class="song-item-artist">${song.artist}</div>
        `;
        
        li.addEventListener('click', () => {
            if (currentSongIndex !== index) {
                currentSongIndex = index;
                loadSong(songs[currentSongIndex]);
                playSong();
                updatePlaylistActive();
            }
        });
        
        songListUl.appendChild(li);
    });
}

function updatePlaylistActive() {
    const items = document.querySelectorAll('.song-item');
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// ========== 进度条控制 ==========
function updateProgress() {
    const { duration, currentTime } = audio;
    if (isNaN(duration)) return;
    
    // 更新进度条宽度
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // 更新时间显示
    currTime.textContent = formatTime(currentTime);
    durTime.textContent = formatTime(duration);
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function setProgressPosition(e) {
    const duration = audio.duration;
    if (!isNaN(duration)) {
        const clickPosition = e.offsetX / this.clientWidth;
        audio.currentTime = clickPosition * duration;
    }
}

// ========== 音量控制 ==========
function setVolume(e) {
    const containerWidth = this.clientWidth;
    const clickX = e.offsetX;
    let volume = clickX / containerWidth;
    
    // 限制音量在0-1之间
    volume = Math.max(0, Math.min(1, volume));
    
    audio.volume = volume;
    updateVolumeUI(volume);
}

function toggleMute() {
    if (audio.volume > 0) {
        // 保存当前音量并静音
        lastVolume = audio.volume;
        audio.volume = 0;
        updateVolumeUI(0);
    } else {
        // 恢复音量
        const targetVolume = lastVolume > 0 ? lastVolume : 1;
        audio.volume = targetVolume;
        updateVolumeUI(targetVolume);
    }
}

function updateVolumeUI(volume) {
    // 更新音量条显示
    volumeFill.style.width = `${volume * 100}%`;
    
    // 更新音量图标
    const icon = volumeBtn.querySelector('i.fas');
    icon.className = '';
    
    if (volume === 0) {
        icon.classList.add('fas', 'fa-volume-mute');
    } else if (volume < 0.5) {
        icon.classList.add('fas', 'fa-volume-down');
    } else {
        icon.classList.add('fas', 'fa-volume-up');
    }
}

// ========== 其他功能 ==========
function updatePlayButton() {
    const playIcon = playBtn.querySelector('i.fas');
    playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function togglePlaybackSpeed() {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speedControl.textContent = `${speeds[speedIndex].toFixed(1)}X`;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function togglePlaylist() {
    sidebar.classList.add('active');
}

function closePlaylist() {
    sidebar.classList.remove('active');
}

// ========== 事件监听器 ==========
// 播放控制
playBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', () => changeSong('prev'));
nextBtn.addEventListener('click', () => changeSong('next'));

// 进度控制
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgressPosition);

// 音量控制
volumeBtn.addEventListener('click', toggleMute);
volumeContainer.addEventListener('click', setVolume);

// 其他控制
screenBtn.addEventListener('click', toggleFullscreen);
speedControl.addEventListener('click', togglePlaybackSpeed);

// 播放列表控制
playlistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlaylist();
});
closeSidebarBtn.addEventListener('click', closePlaylist);

// 点击外部关闭播放列表
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !playlistBtn.contains(e.target)) {
        closePlaylist();
    }
});

// 空格键控制播放/暂停
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    }
});

// 歌曲结束时自动播放下一首
audio.addEventListener('ended', () => changeSong('next'));

// 音频可以播放时更新总时长
audio.addEventListener('canplay', () => {
    if (audio.duration) {
        durTime.textContent = formatTime(audio.duration);
    }
    if (shouldAutoPlay) {
        playSong();
    }
});

// ========== 初始化 ==========
initPlayer();