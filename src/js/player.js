/**
 * Custom Video Player logic for MovieStream.
 */

/**
 * Initializes the player logic.
 */
export function initPlayer() {
    const video = document.getElementById('main-video');
    const container = document.getElementById('video-container');
    const playOverlay = document.getElementById('play-overlay');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const seekBar = document.getElementById('seek-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute-btn');
    const speedSelector = document.getElementById('speed-selector');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const currentTimeText = document.getElementById('current-time');
    const durationText = document.getElementById('total-duration');

    if (!video || !container) return;

    // 1. Initial State: Show player after parent content loads
    setTimeout(() => {
        container.classList.remove('opacity-0', 'translate-y-4');
    }, 500);

    // 2. Play/Pause Logic
    const togglePlay = () => {
        if (video.paused) {
            video.play();
            playOverlay.classList.add('opacity-0', 'pointer-events-none');
            updatePlayIcons(true);
        } else {
            video.pause();
            playOverlay.classList.remove('opacity-0', 'pointer-events-none');
            updatePlayIcons(false);
        }
    };

    if (playOverlay) playOverlay.addEventListener('click', togglePlay);
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    // 3. Seek Logic
    video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        const progress = (video.currentTime / video.duration) * 100;
        if (seekBar) seekBar.value = progress;
        if (currentTimeText) currentTimeText.textContent = formatTime(video.currentTime);
    });

    if (seekBar) {
        seekBar.addEventListener('input', () => {
            const time = (seekBar.value / 100) * video.duration;
            video.currentTime = time;
        });
    }

    // 4. Volume Logic
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            video.volume = volumeSlider.value;
            video.muted = video.volume === 0;
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
        });
    }

    // 5. Playback Speed
    if (speedSelector) {
        speedSelector.addEventListener('change', () => {
            video.playbackRate = parseFloat(speedSelector.value);
        });
    }

    // 6. Fullscreen
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        });
    }

    // 7. Metadata (Duration)
    const updateDuration = () => {
        if (durationText && video.duration) {
            durationText.textContent = formatTime(video.duration);
        }
    };

    video.addEventListener('loadedmetadata', updateDuration);
    // Fallback in case metadata is already loaded
    if (video.readyState >= 1) {
        updateDuration();
    }
}

/**
 * Helpers
 */
function updatePlayIcons(isPlaying) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (!playIcon || !pauseIcon) return;

    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
