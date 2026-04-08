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
    <nav class="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
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
        <button id="logout-btn" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition">Logout</button>
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
    <footer class="bg-black border-t border-white/5 py-4 px-6 mt-auto">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 class="text-xl font-black text-red-600 tracking-tighter uppercase mb-2">MovieStream</h2>
          <p class="text-slate-500 text-sm">© ${year} MovieStream. All rights reserved.</p>
        </div>
        <div class="flex gap-8 text-sm font-medium text-slate-400">
          <a href="home.html" class="hover:text-white transition">Browse</a>
          <a href="watchlist.html" class="hover:text-white transition">My List</a>
          <a href="profile.html" class="hover:text-white transition">Profile</a>
        </div>
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
