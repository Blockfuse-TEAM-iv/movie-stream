/**
 * Movie details logic for the Movie Streaming App.
 * Includes watch progress rendering for the home page (Issue #13).
 */
import { getCurrentUser } from './auth.js';

/**
 * Renders all movies as a browsable grid on the home page.
 * @param {string} containerId - The ID of the container element to render into.
 */
export async function renderAllMovies(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('../data/movies.json');
    if (!response.ok) throw new Error('Failed to fetch movies');
    const movies = await response.json();

    container.innerHTML = `
      <section class="max-w-6xl mx-auto px-8 mb-12">
        <h2 class="text-xl font-bold text-white mb-6">All Movies</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${movies.map(movie => `
            <a href="movie.html?id=${movie.id}" class="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/30 block">
              <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${movie.poster}" alt="${movie.title}"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onerror="this.src='https://via.placeholder.com/300x450/1e293b/475569?text=${encodeURIComponent(movie.title)}'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <!-- Play icon on hover -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="w-12 h-12 bg-blue-600/90 rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 fill-current text-white ml-0.5" viewBox="0 0 20 20"><path d="M5 4v12l10-6z"/></svg>
                  </div>
                </div>
                <!-- Rating badge -->
                <div class="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                  ${movie.rating}
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-semibold text-white truncate">${movie.title}</h3>
                <p class="text-xs text-slate-400 mt-0.5">${movie.year} · ${movie.duration}</p>
                <div class="flex flex-wrap gap-1 mt-2">
                  ${movie.genre.slice(0, 2).map(g => `<span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${g}</span>`).join('')}
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  } catch (error) {
    console.error('Error rendering movies:', error);
    container.innerHTML = `<p class="text-slate-500 text-center py-12">Failed to load movies.</p>`;
  }
}

/**
 * Renders the "Continue Watching" row for the home page.
 * Reads from the current user's watchProgress and displays movies in progress.
 * @param {string} containerId - The ID of the container element to render into.
 */
export async function renderContinueWatching(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUser();
  if (!user || !user.watchProgress || Object.keys(user.watchProgress).length === 0) {
    container.classList.add('hidden');
    return;
  }

  try {
    const response = await fetch('../data/movies.json');
    if (!response.ok) throw new Error('Failed to fetch movies');
    const allMovies = await response.json();

    // Filter movies that are in progress (5% < progress < 95%), sort by most recent
    const inProgress = Object.entries(user.watchProgress)
      .filter(([, p]) => p.percentage > 5 && p.percentage < 95)
      .sort(([, a], [, b]) => b.lastWatched - a.lastWatched)
      .map(([movieId, progress]) => {
        const movie = allMovies.find(m => m.id === parseInt(movieId));
        return movie ? { movie, progress } : null;
      })
      .filter(Boolean);

    if (inProgress.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    container.innerHTML = `
      <section class="max-w-6xl mx-auto px-8 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <svg class="w-5 h-5 text-blue-400 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
          </svg>
          <h2 class="text-xl font-bold text-white">Continue Watching</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${inProgress.map(({ movie, progress }) => `
            <a href="movie.html?id=${movie.id}" class="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/30 block">
              <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${movie.poster}" alt="${movie.title}"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <!-- Play icon on hover -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="w-12 h-12 bg-blue-600/90 rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 fill-current text-white ml-0.5" viewBox="0 0 20 20"><path d="M5 4v12l10-6z"/></svg>
                  </div>
                </div>
                <!-- Progress bar at bottom of poster -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                  <div class="h-full bg-blue-500 transition-all" style="width: ${progress.percentage.toFixed(1)}%"></div>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-semibold text-white truncate">${movie.title}</h3>
                <p class="text-xs text-slate-400 mt-0.5">${Math.round(progress.percentage)}% watched</p>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  } catch (error) {
    console.error('Error rendering continue watching:', error);
    container.classList.add('hidden');
  }
}

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
    const response = await fetch('../data/movies.json');
    if (!response.ok) throw new Error('Failed to fetch movies');

    const movies = await response.json();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
      window.location.href = './404.html';
      return;
    }

    renderMovieDetails(movie);
    initWatchlist(movieId);
  } catch (error) {
    console.error('Error loading movie details:', error);
    // Optionally show an error message on the page
  }
}

/**
 * Renders movie details into the DOM.
 * @param {object} movie 
 */
function renderMovieDetails(movie) {
  const container = document.getElementById('movie-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <!-- Left: Poster -->
      <div class="md:col-span-1">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full rounded-xl shadow-2xl border border-slate-800 sticky top-8">
      </div>

      <!-- Right: Details -->
      <div class="md:col-span-2 space-y-8">
        <div>
          <h1 class="text-5xl font-extrabold text-white mb-2">${movie.title}</h1>
          <div class="flex items-center gap-4 text-slate-400 text-sm">
            <span>${movie.year}</span>
            <span>•</span>
            <span>${movie.duration}</span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
              ${movie.rating}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          ${movie.genre.map(g => `<span class="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">${g}</span>`).join('')}
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-bold text-blue-400">Description</h2>
          <p class="text-slate-300 leading-relaxed text-lg">${movie.description}</p>
        </div>

        <div class="grid grid-cols-2 gap-8 py-6 border-y border-slate-800">
          <div>
            <h3 class="text-slate-500 text-sm uppercase tracking-wider mb-1">Director</h3>
            <p class="text-white font-medium">${movie.director}</p>
          </div>
          <div>
            <h3 class="text-slate-500 text-sm uppercase tracking-wider mb-1">Cast</h3>
            <p class="text-white font-medium">${movie.cast.join(', ')}</p>
          </div>
        </div>

        <div class="mt-8">
          <h2 class="text-xl font-bold text-blue-400 mb-4">Streaming info</h2>
          <p class="text-slate-400">Video player controls and playback are available below.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initializes the watchlist button state and event listener.
 * @param {number} movieId 
 */
function initWatchlist(movieId) {
  const btn = document.getElementById('watchlist-btn');
  if (!btn) return;

  const user = getCurrentUser();
  if (!user) return;

  // Check initial state
  const isSaved = user.watchlist?.includes(movieId) || false;
  updateWatchlistUI(isSaved);

  btn.addEventListener('click', () => toggleWatchlist(movieId));
}

/**
 * Logic to save or remove movie from local storage.
 * @param {number} movieId 
 */
async function toggleWatchlist(movieId) {
  const session = JSON.parse(localStorage.getItem('movie_stream_session'));
  if (!session) return;

  const users = JSON.parse(localStorage.getItem('movie_stream_users') || '[]');
  const userIdx = users.findIndex(u => u.id === session.userId);

  if (userIdx === -1) return;

  const user = users[userIdx];

  // Safety check: ensure watchlist array exists
  if (!user.watchlist) user.watchlist = [];

  const isCurrentlySaved = user.watchlist.includes(movieId);
  let isNowSaved = false;

  if (isCurrentlySaved) {
    // Remove from list
    user.watchlist = user.watchlist.filter(id => id !== movieId);
    showNotification('Removed from watchlist');
  } else {
    // Add to list (duplicate prevention)
    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      isNowSaved = true;
      showNotification('Added to watchlist');
    }
  }

  // Persist to local storage
  users[userIdx] = user;
  localStorage.setItem('movie_stream_users', JSON.stringify(users));

  // Update UI
  updateWatchlistUI(isCurrentlySaved ? false : true);
}

/**
 * Visual updates for the heart button.
 * @param {boolean} isSaved 
 */
function updateWatchlistUI(isSaved) {
  const btn = document.getElementById('watchlist-btn');
  const icon = document.getElementById('watchlist-icon');
  const text = document.getElementById('watchlist-text');
  if (!btn || !icon || !text) return;

  if (isSaved) {
    btn.classList.add('border-pink-500/50', 'bg-pink-500/10');
    icon.classList.remove('stroke-slate-400', 'fill-none');
    icon.classList.add('stroke-pink-500', 'fill-pink-500');
    text.textContent = 'In Watchlist';
    text.classList.add('text-pink-100');
  } else {
    btn.classList.remove('border-pink-500/50', 'bg-pink-500/10');
    icon.classList.remove('stroke-pink-500', 'fill-pink-500');
    icon.classList.add('stroke-slate-400', 'fill-none');
    text.textContent = 'Add to Watchlist';
    text.classList.remove('text-pink-100');
  }
}

/**
 * Decoupled notification wrapper (Safe fallback for #5).
 * @param {string} message 
 */
function showNotification(message) {
  // Check if teammate has implemented showToast in ui.js
  if (typeof showToast === 'function') {
    showToast(message);
  } else {
    console.info(`[Watchlist]: ${message}`);
  }
}
