/**
 * Router and route protection for the Movie Streaming App.
 * Handles redirection based on authentication state.
 */

const SESSION_KEY = 'movie_stream_session';

/**
 * Middleware-like function to protect pages.
 * Redirects to index.html if no session exists.
 */
export function requireAuth() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    window.location.href = './index.html';
  }
}

/**
 * Redirects to home.html if a session already exists.
 * Used on the login/register page.
 */
export function redirectIfLoggedIn() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    window.location.href = './home.html';
  }
}

/**
 * Handles the logout flow: clears session and redirects to index.html.
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = './index.html';
}
