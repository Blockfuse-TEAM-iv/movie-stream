/**
 * Movie details logic for the Movie Streaming App (Premium Redesign).
 */
import { getCurrentUser } from './auth.js';

// ── SAMPLE PREVIEW VIDEO (fallback for hover preview) ──────────────────────
const PREVIEW_FALLBACK = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
// How many seconds into the video the hover preview starts
const PREVIEW_OFFSET_SECONDS = 120; // 2 minutes in

/**
 * Entry point for the movie details page.
 */
export async function initMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = parseInt(urlParams.get('id'));

  if (!movieId) {
    window.location.href = './404.html';
    return;
  }

  try {
    const response = await fetch(`../data/movies.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch movies');

    const movies = await response.json();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
      window.location.href = './404.html';
      return;
    }

    renderMovieDetails(movie);
    initWatchlist(movieId);
    initPlayerModal(movie);
  } catch (error) {
    console.error('Error loading movie details:', error);
  }
}

/**
 * Returns the user's current watch progress (%) for a given movieId.
 */
function getWatchProgress(movieId) {
  const user = getCurrentUser();
  if (!user || !user.watchProgress) return 0;
  const entry = user.watchProgress[movieId];
  if (!entry) return 0;
  // Support both old (number) and new ({pct, time}) formats
  return typeof entry === 'object' ? (entry.pct || 0) : entry;
}

/**
 * Renders the premium TMDB-style movie details into the DOM.
 */
function renderMovieDetails(movie) {
  const container = document.getElementById('movie-content');
  if (!container) return;

  const progress = getWatchProgress(movie.id);
  const backdropUrl = movie.backdrop || movie.poster;
  const videoUrl = movie.videoUrl || PREVIEW_FALLBACK;

  // Circumference of the SVG progress ring (r=26 → 2πr ≈ 163.4)
  const circumference = 163.4;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  // Genre pills
  const genrePills = movie.genre
    .map(g => `<span class="text-xs uppercase tracking-widest font-bold text-red-400 border border-red-600/30 bg-red-600/10 px-3 py-1 rounded-full">${g}</span>`)
    .join('');

  container.innerHTML = `
    <!-- ═══ HERO BACKDROP ═══════════════════════════════════════════════ -->
    <div class="relative w-full" style="height: 560px;">
      <!-- Background Image -->
      <div class="absolute inset-0 overflow-hidden">
        <img src="${backdropUrl.replace('media.themoviedb.org', 'image.tmdb.org')}" alt="${movie.title} backdrop"
             class="w-full h-full object-cover object-top"
             onerror="this.style.display='none'">
        <!-- Gradient overlays — left side darker for text legibility, rest subtle -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12 flex flex-col md:flex-row gap-10 items-start">

        <!-- Poster + Hover Preview -->
        <div class="shrink-0 group/poster relative cursor-pointer" id="poster-card">
          <!-- Outer wrapper: clips everything -->
          <div class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">

            <!-- Poster Image Wrapper -->
            <div class="poster-img-wrapper absolute inset-0 z-10 transition-opacity duration-500">
              <img src="${movie.poster.replace('media.themoviedb.org', 'image.tmdb.org')}" alt="${movie.title}"
                   id="poster-img"
                   class="w-full h-full object-cover">
              
              <!-- Dark gradient at bottom (always visible) -->
              <div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 to-transparent z-20"></div>

              <!-- Play button overlay — always visible at bottom -->
              <div class="absolute bottom-6 left-0 right-0 flex justify-center z-30">
                <button id="poster-play-btn"
                        class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-red-600/40 transition-all group-hover/poster:scale-110">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5 4v12l10-6z"/></svg>
                  Play
                </button>
              </div>
            </div>

            <!-- YouTube Mount point -->
            <div id="yt-player-container" class="absolute inset-0 w-full h-full pointer-events-none"></div>
          </div>
        </div>

        <!-- Movie Info -->
        <div class="flex-1 space-y-5 pt-2">
          <!-- Title -->
          <div>
            <h1 class="text-4xl md:text-5xl font-black text-white leading-tight">${movie.title}</h1>
            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-2">
              <span class="border border-slate-600 px-2 py-0.5 rounded text-xs">HD</span>
              <span>${movie.year}</span>
              <span class="text-white/30">•</span>
              <span>${movie.duration}</span>
              <span class="text-white/30">•</span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                ${movie.rating}
              </span>
            </div>
          </div>

          <!-- Watch Progress Ring + Genres -->
          <div class="flex flex-wrap items-center gap-5">
            <!-- Progress Ring (replaces "User Score") -->
            <div class="flex items-center gap-3">
              <div class="relative w-16 h-16">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
                  <circle cx="30" cy="30" r="26" fill="none"
                          stroke="${progress > 0 ? '#ef4444' : '#ffffff20'}" 
                          stroke-width="4"
                          stroke-linecap="round"
                          stroke-dasharray="${circumference}"
                          stroke-dashoffset="${progress > 0 ? strokeDashoffset : circumference}"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-black text-white">${progress > 0 ? progress + '%' : '—'}</span>
                </div>
              </div>
              <span class="text-xs text-slate-400 leading-tight max-w-[60px]">${progress > 0 ? 'Watched' : 'Not<br>Started'}</span>
            </div>

            <!-- Genre Pills -->
            <div class="flex flex-wrap gap-2">
              ${genrePills}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 pt-1">
            <!-- Watchlist -->
            <button id="watchlist-btn"
                    class="flex items-center gap-2 border border-white/20 hover:border-red-600/50 bg-white/5 hover:bg-red-600/10 text-white font-semibold px-5 py-3 rounded-xl transition-all">
              <svg id="watchlist-icon" class="w-5 h-5 fill-none stroke-slate-400" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span id="watchlist-text">Add to Watchlist</span>
            </button>
          </div>

          <!-- Overview -->
          <div class="border-t border-white/10 pt-5 space-y-1">
            <h2 class="text-xs uppercase tracking-widest text-slate-500 font-bold">Overview</h2>
            <p class="text-slate-300 leading-relaxed text-base max-w-2xl">${movie.description}</p>
          </div>

          <!-- Director / Cast -->
          <div class="grid grid-cols-2 gap-6 border-t border-white/10 pt-5">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Director</p>
              <p class="text-white font-semibold">${movie.director}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Cast</p>
              <p class="text-slate-300 text-sm leading-relaxed">${movie.cast.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom Spacer to prevent Footer overlap -->
    <div class="h-32"></div>
  `;

  // Initialise hover preview after DOM update
  initHoverPreview(movie);
}

/**
 * Hover-preview logic — transitions to a landscape YouTube trailer.
 */
function initHoverPreview(movie) {
  const posterCard = document.getElementById('poster-card');
  const ytMount = document.getElementById('yt-player-container');
  if (!posterCard || !ytMount || !movie.trailerUrl) return;

  let player = null;
  let previewTimeout = null;

  // Extract video ID from embed URL
  const getYTid = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  const videoId = getYTid(movie.trailerUrl);

  posterCard.addEventListener('mouseenter', () => {
    // 1. Immediately start CSS transition to landscape
    posterCard.classList.add('is-landscape');

    // 2. Wait 600ms before initialising YouTube
    previewTimeout = setTimeout(() => {
      // Create black overlay to suppress title flash
      const overlay = document.createElement('div');
      overlay.className = 'trailer-overlay';
      ytMount.appendChild(overlay);

      // Mount div for the iframe
      const mountPoint = document.createElement('div');
      mountPoint.id = 'yt-frame';
      ytMount.appendChild(mountPoint);

      player = new YT.Player('yt-frame', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin,
          disablekb: 1
        },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              // Fade out and remove overlay
              overlay.style.opacity = '0';
              setTimeout(() => overlay.remove(), 300);
            }
          }
        }
      });
    }, 600);
  });

  posterCard.addEventListener('mouseleave', () => {
    // 1. Shrink back to portrait
    posterCard.classList.remove('is-landscape');

    // 2. Clear timeout and destroy player
    clearTimeout(previewTimeout);

    if (player) {
      // Add a solid black overlay instantly before destroying to avoid visual glitches
      const quickOverlay = document.createElement('div');
      quickOverlay.className = 'trailer-overlay';
      ytMount.appendChild(quickOverlay);

      try {
        player.destroy();
      } catch (e) {}
      player = null;
    }

    // Clear mount point but keep the structure
    ytMount.innerHTML = '';
  });
}

/**
 * Opens the modal player and initialises controls.
 */
function initPlayerModal(movie) {
  const modal = document.getElementById('player-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const video = document.getElementById('main-video');
  if (!modal || !video) return;

  const videoUrl = movie.videoUrl || PREVIEW_FALLBACK;
  video.src = videoUrl;

  const openModal = () => {
    // Pause preview so it doesn't play in the background
    const previewVideo = document.getElementById('preview-video');
    if (previewVideo) previewVideo.pause();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Hide the big play overlay immediately so the video is visible
    const overlay = document.getElementById('play-overlay');
    if (overlay) overlay.classList.add('opacity-0', 'pointer-events-none');

    const titleEl = document.getElementById('modal-movie-title');
    if (titleEl) titleEl.textContent = `Watching: ${movie.title}`;

    video.play().catch(() => {});
    updatePlayIcons(true);

    // Restore saved watch position
    const savedTime = getSavedTime(movie.id);
    if (savedTime && savedTime > 5) {
      const seekToSaved = () => {
        video.currentTime = savedTime;
        video.removeEventListener('loadedmetadata', seekToSaved);
      };
      if (video.readyState >= 1) {
        video.currentTime = savedTime;
      } else {
        video.addEventListener('loadedmetadata', seekToSaved);
      }
    }

    initPlayerControls(movie.id);
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Save final position before pausing
    if (video.duration && video.currentTime > 0) {
      const finalPct = (video.currentTime / video.duration) * 100;
      saveProgress(movie.id, finalPct, video.currentTime);
      // Live-update the progress ring without a page reload
      updateProgressRing(Math.round(finalPct));
    }

    video.pause();
  };

  // Wire up both play buttons
  ['play-btn', 'poster-play-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', openModal);
  });

  closeBtn?.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Initialises all player controls (seek, volume, speed, fullscreen, progress saving).
 */
function initPlayerControls(movieId) {
  const video = document.getElementById('main-video');
  const playOverlay = document.getElementById('play-overlay');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const seekBar = document.getElementById('seek-bar');
  const volumeSlider = document.getElementById('volume-slider');
  const muteBtn = document.getElementById('mute-btn');
  const speedSelector = document.getElementById('speed-selector');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('total-duration');
  const videoContainer = document.getElementById('video-container');

  if (!video) return;

  const togglePlay = () => {
    if (video.paused) {
      video.play();
      if (playOverlay) {
        playOverlay.classList.remove('opacity-100');
        playOverlay.classList.add('opacity-0', 'pointer-events-none');
      }
      updatePlayIcons(true);
    } else {
      video.pause();
      if (playOverlay) {
        playOverlay.classList.remove('opacity-0', 'pointer-events-none');
        playOverlay.classList.add('opacity-100');
      }
      updatePlayIcons(false);
    }
  };

  // Auto-hide overlay when video actually starts playing (handles autoplay)
  video.addEventListener('playing', () => {
    if (playOverlay) {
      playOverlay.classList.remove('opacity-100');
      playOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
    updatePlayIcons(true);
  });
  video.addEventListener('pause', () => {
    if (playOverlay) {
      playOverlay.classList.remove('opacity-0', 'pointer-events-none');
      playOverlay.classList.add('opacity-100');
    }
    updatePlayIcons(false);
  });

  // Avoid double-binding — clone buttons to strip old listeners
  [playOverlay, playPauseBtn].forEach(el => {
    if (!el) return;
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });

  document.getElementById('play-overlay')?.addEventListener('click', togglePlay);
  document.getElementById('play-pause-btn')?.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  // Seek + progress save
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (seekBar) seekBar.value = pct;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
    if (Math.floor(video.currentTime) % 5 === 0) {
      saveProgress(movieId, pct, video.currentTime);
    }
  });

  if (seekBar) {
    seekBar.addEventListener('input', () => {
      video.currentTime = (seekBar.value / 100) * video.duration;
    });
  }

  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      video.volume = parseFloat(volumeSlider.value);
      video.muted = (video.volume === 0);
      updateVolumeIcon(video.muted || video.volume === 0);
    });
  }

  // Mute toggle
  const freshMute = document.getElementById('mute-btn');
  if (freshMute) {
    freshMute.addEventListener('click', () => {
      video.muted = !video.muted;
      if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
      updateVolumeIcon(video.muted);
    });
  }

  // Set initial volume icon state
  updateVolumeIcon(video.muted);

  // Speed
  if (speedSelector) {
    speedSelector.addEventListener('change', () => {
      video.playbackRate = parseFloat(speedSelector.value);
    });
  }

  // Fullscreen
  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn && videoContainer) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
        else if (videoContainer.webkitRequestFullscreen) videoContainer.webkitRequestFullscreen();
        else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    });
  }

  // Duration
  const updateDuration = () => {
    if (durationEl && video.duration) durationEl.textContent = formatTime(video.duration);
  };
  video.addEventListener('loadedmetadata', updateDuration);
  if (video.readyState >= 1) updateDuration();
}

// ── Watchlist ─────────────────────────────────────────────────────────────

function initWatchlist(movieId) {
  const btn = document.getElementById('watchlist-btn');
  if (!btn) return;
  const user = getCurrentUser();
  if (!user) return;

  const isSaved = user.watchlist?.includes(movieId) || false;
  updateWatchlistUI(isSaved);
  btn.addEventListener('click', () => toggleWatchlist(movieId));
}

async function toggleWatchlist(movieId) {
  const session = JSON.parse(localStorage.getItem('movie_stream_session'));
  if (!session) return;

  const users = JSON.parse(localStorage.getItem('movie_stream_users') || '[]');
  const userIdx = users.findIndex(u => u.id === session.userId);
  if (userIdx === -1) return;

  const user = users[userIdx];
  if (!user.watchlist) user.watchlist = [];

  const isSaved = user.watchlist.includes(movieId);
  if (isSaved) {
    user.watchlist = user.watchlist.filter(id => id !== movieId);
  } else {
    user.watchlist.push(movieId);
  }

  users[userIdx] = user;
  localStorage.setItem('movie_stream_users', JSON.stringify(users));
  updateWatchlistUI(!isSaved);
}

function updateWatchlistUI(isSaved) {
  const btn = document.getElementById('watchlist-btn');
  const icon = document.getElementById('watchlist-icon');
  const text = document.getElementById('watchlist-text');
  if (!btn || !icon || !text) return;

  if (isSaved) {
    icon.classList.add('fill-red-500', 'stroke-red-500');
    icon.classList.remove('fill-none', 'stroke-slate-400');
    text.textContent = 'In Watchlist';
  } else {
    icon.classList.remove('fill-red-500', 'stroke-red-500');
    icon.classList.add('fill-none', 'stroke-slate-400');
    text.textContent = 'Add to Watchlist';
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function updatePlayIcons(isPlaying) {
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  if (!playIcon || !pauseIcon) return;
  playIcon.classList.toggle('hidden', isPlaying);
  pauseIcon.classList.toggle('hidden', !isPlaying);
}

function updateVolumeIcon(isMuted) {
  const btn = document.getElementById('mute-btn');
  if (!btn) return;
  btn.innerHTML = isMuted
    ? `<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>`
    : `<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657a8 8 0 000-9.314M15.536 14.536a5 5 0 000-5.072" />
      </svg>`;
}

function updateProgressRing(pct) {
  const circumference = 163.4;
  const offset = circumference - (circumference * pct) / 100;
  
  // Target the ring elements inside the movie-content area
  const mainContent = document.getElementById('movie-content');
  if (!mainContent) return;

  const circles = mainContent.querySelectorAll('circle');
  if (circles.length >= 2) {
    const arc = circles[1];
    arc.setAttribute('stroke-dashoffset', offset);
    arc.setAttribute('stroke', pct > 0 ? '#ef4444' : '#ffffff20');
  }
  
  const label = mainContent.querySelector('.absolute.inset-0.flex span');
  if (label) label.textContent = pct > 0 ? `${pct}%` : '—';
  
  const statusEl = mainContent.querySelector('.text-xs.text-slate-400');
  if (statusEl) statusEl.innerHTML = pct > 0 ? 'Watched' : 'Not<br>Started';
}

function saveProgress(movieId, progress, currentTime) {
  if (!movieId) return;
  const session = JSON.parse(localStorage.getItem('movie_stream_session'));
  if (!session) return;
  const users = JSON.parse(localStorage.getItem('movie_stream_users') || '[]');
  const userIdx = users.findIndex(u => u.id === session.userId);
  if (userIdx === -1) return;
  const user = users[userIdx];
  if (!user.watchProgress) user.watchProgress = {};
  user.watchProgress[movieId] = {
    pct: Math.round(progress),
    time: Math.floor(currentTime || 0),
    lastWatched: Date.now()
  };
  users[userIdx] = user;
  localStorage.setItem('movie_stream_users', JSON.stringify(users));
}

function getSavedTime(movieId) {
  const session = JSON.parse(localStorage.getItem('movie_stream_session'));
  if (!session) return 0;
  const users = JSON.parse(localStorage.getItem('movie_stream_users') || '[]');
  const user = users.find(u => u.id === session.userId);
  if (!user?.watchProgress?.[movieId]) return 0;
  const entry = user.watchProgress[movieId];
  // Support both old (number) and new (object) formats
  return typeof entry === 'object' ? (entry.time || 0) : 0;
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
