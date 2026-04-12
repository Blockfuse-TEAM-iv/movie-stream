/**
 * Shared UI components for the Movie Streaming App.
 * Handles Navbar, Footer, Toast Notifications, and Theme Management.
 */

import { logout } from './router.js';

const STORAGE_KEYS = {
  SESSION: 'movie_stream_session',
  THEME: 'theme'
};

/**
 * Renders the shared navbar into <div id="navbar">.
 */
export function renderNavbar() {
  const container = document.getElementById('navbar');
  if (!container) return;

  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
  const username = session ? session.name : 'Guest';

  container.innerHTML = `
    <nav class="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center gap-8">
        <a href="home.html" class="text-2xl font-black text-red-600 tracking-tighter uppercase">MovieStream</a>
        <div class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="home.html" class="hover:text-white transition">Browse</a>
          <a href="watchlist.html" class="hover:text-white transition">My List</a>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a href="profile.html" class="text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-2">
          <span class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">${username.charAt(0).toUpperCase()}</span>
          <span class="hidden sm:inline">${username}</span>
        </a>
        <button id="logout-btn" class="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-transparent border border-red-600/50 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-red-600/5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  `;

  // Attach logout event
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }
}

/**
 * Renders the shared footer into <div id="footer">.
 */
export function renderFooter() {
  const container = document.getElementById('footer');
  if (!container) return;

  const year = new Date().getFullYear();

  container.innerHTML = `
    <footer class="bg-black border-t border-white/5 py-6 px-6 mt-auto">
      <div class="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
        <p class="text-slate-500 text-xs">© ${year} MovieStream. All rights reserved.</p>
      </div>
    </footer>
  `;
}

/**
 * Shows a temporary toast notification.
 * @param {string} message 
 * @param {string} type 'success' or 'error'
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  
  toast.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transform transition-all duration-300 translate-x-10 opacity-0`;
  toast.innerText = message;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-10', 'opacity-0');
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.add('translate-x-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Applies the stored theme.
 */
export function applyTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
