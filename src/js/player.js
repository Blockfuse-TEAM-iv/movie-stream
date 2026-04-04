/**
 * Custom Video Player logic for MovieStream.
 * Includes watch progress save (Issue #13) and restore logic.
 */

import { getCurrentUser } from './auth.js';

// --- Storage Helpers ---

/**
 * Saves watch progress for the current user and movie to localStorage.
 * @param {number} movieId
 * @param {number} currentTime
 * @param {number} duration
 */
function saveWatchProgress(movieId, currentTime, duration) {
    const session = JSON.parse(localStorage.getItem('movie_stream_session'));
    if (!session) return;

    const users = JSON.parse(localStorage.getItem('movie_stream_users') || '[]');
    const userIdx = users.findIndex(u => u.id === session.userId);
    if (userIdx === -1) return;

    const user = users[userIdx];
    if (!user.watchProgress) user.watchProgress = {};

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    user.watchProgress[movieId] = {
        currentTime,
        duration,
        percentage,
        lastWatched: Date.now()
    };

    users[userIdx] = user;
    localStorage.setItem('movie_stream_users', JSON.stringify(users));
}

/**
 * Gets saved watch progress for the current user and movie.
 * @param {number} movieId
 * @returns {{ currentTime: number, duration: number, percentage: number, lastWatched: number } | null}
 */
function getWatchProgress(movieId) {
    const user = getCurrentUser();
    if (!user || !user.watchProgress) return null;
    return user.watchProgress[movieId] || null;
}

// --- Main Player Init ---

/**
 * Initializes the player logic.
 * @param {number} movieId - The current movie's ID (used to save/restore progress)
 */
export function initPlayer(movieId) {
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
    const resumeOverlay = document.getElementById('resume-overlay');
    const resumeBtn = document.getElementById('resume-btn');
    const dismissResumeBtn = document.getElementById('dismiss-resume-btn');

    if (!video || !container) return;

    // 1. Animate player in
    setTimeout(() => {
        container.classList.remove('opacity-0', 'translate-y-4');
    }, 500);

    // 2. Restore progress on metadata load
    video.addEventListener('loadedmetadata', () => {
        if (durationText && video.duration) {
            durationText.textContent = formatTime(video.duration);
        }

        if (movieId) {
            const progress = getWatchProgress(movieId);
            if (progress && progress.percentage > 5 && progress.percentage < 95) {
                // Show resume overlay
                if (resumeOverlay) {
                    const timeLabel = resumeOverlay.querySelector('#resume-time-label');
                    if (timeLabel) timeLabel.textContent = formatTime(progress.currentTime);
                    resumeOverlay.classList.remove('hidden');
                }
            }
        }
    });

    // Fallback in case metadata is already loaded
    if (video.readyState >= 1 && durationText && video.duration) {
        durationText.textContent = formatTime(video.duration);
    }

    // 3. Resume button: seek to saved time and play
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            const progress = getWatchProgress(movieId);
            if (progress) video.currentTime = progress.currentTime;
            if (resumeOverlay) resumeOverlay.classList.add('hidden');
            video.play();
            if (playOverlay) playOverlay.classList.add('opacity-0', 'pointer-events-none');
            updatePlayIcons(true);
        });
    }

    // 4. Dismiss resume: just hide the overlay, start from beginning
    if (dismissResumeBtn) {
        dismissResumeBtn.addEventListener('click', () => {
            if (resumeOverlay) resumeOverlay.classList.add('hidden');
        });
    }

    // 5. Play/Pause Logic
    const togglePlay = () => {
        if (video.paused) {
            video.play();
            if (resumeOverlay) resumeOverlay.classList.add('hidden');
            if (playOverlay) playOverlay.classList.add('opacity-0', 'pointer-events-none');
            updatePlayIcons(true);
        } else {
            video.pause();
            if (playOverlay) playOverlay.classList.remove('opacity-0', 'pointer-events-none');
            updatePlayIcons(false);
        }
    };

    if (playOverlay) playOverlay.addEventListener('click', togglePlay);
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    // 6. Seek & Progress Tracking (throttled to every 5 seconds)
    let lastSaveTime = 0;

    video.addEventListener('timeupdate', () => {
        if (!video.duration) return;

        const progress = (video.currentTime / video.duration) * 100;
        if (seekBar) seekBar.value = progress;
        if (currentTimeText) currentTimeText.textContent = formatTime(video.currentTime);

        // Throttle: save progress every 5 seconds
        const now = Date.now();
        if (movieId && now - lastSaveTime >= 5000) {
            saveWatchProgress(movieId, video.currentTime, video.duration);
            lastSaveTime = now;
        }
    });

    if (seekBar) {
        seekBar.addEventListener('input', () => {
            const time = (seekBar.value / 100) * video.duration;
            video.currentTime = time;
        });
    }

    // 7. Volume Logic
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

    // 8. Playback Speed
    if (speedSelector) {
        speedSelector.addEventListener('change', () => {
            video.playbackRate = parseFloat(speedSelector.value);
        });
    }

    // 9. Fullscreen
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
}

// --- Helpers ---

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
