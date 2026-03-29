/**
 * Movie details logic for the Movie Streaming App.
 */
import { getCurrentUser } from './auth.js';

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

        <!-- Video Player Placeholder (Person D) -->
        <div class="mt-8 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-blue-400">Watch Now</h2>
            <!-- Watchlist Toggle Button (#10) -->
            <button id="watchlist-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-all duration-300 group">
              <svg id="watchlist-icon" class="w-5 h-5 transition-colors stroke-slate-400 fill-none group-hover:stroke-white" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span id="watchlist-text" class="text-sm font-medium text-slate-300 group-hover:text-white">Add to Watchlist</span>
            </button>
          </div>
          <div id="video-player-root" class="bg-black aspect-video rounded-xl border border-slate-800 flex items-center justify-center group overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div class="z-10 text-center">
              <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 20 20"><path d="M5 4v12l10-6z"/></svg>
              </div>
              <p class="text-slate-400 text-sm italic">[ Video Player Placeholder - Person D ]</p>
            </div>
          </div>
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
