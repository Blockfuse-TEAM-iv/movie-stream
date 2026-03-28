/**
 * Authentication system for the Movie Streaming App.
 * Uses localStorage for persistence and crypto.subtle for secure hashing.
 */

const STORAGE_KEYS = {
  USERS: 'movie_stream_users',
  SESSION: 'movie_stream_session'
};

/**
 * Hashes a string using SHA-256.
 * @param {string} string 
 * @returns {Promise<string>} Hex representation of the hash.
 */
async function hashPassword(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Registers a new user.
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function registerUser(name, email, password) {
  // 1. Validate inputs
  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // 2. Check if email already exists
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already registered.' };
  }

  // 3. Hash password
  const passwordHash = await hashPassword(password);

  // 4. Build user object
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    watchlist: [],
    watchProgress: {},
    createdAt: new Date().toISOString()
  };

  // 5. Save to localStorage
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  return { success: true, message: 'Registration successful!' };
}

/**
 * Logs in a user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function loginUser(email, password) {
  // 1. Find user by email
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // 2. Hash submitted password and compare
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // 3. Create session
  const session = {
    token: Math.random().toString(36).substring(2),
    userId: user.id,
    name: user.name
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

  return { success: true, message: 'Login successful!' };
}

/**
 * Logs out the current user.
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  window.location.href = './index.html';
}

/**
 * Returns the current user object from the session.
 * @returns {object|null}
 */
export function getCurrentUser() {
  const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
  if (!session) return null;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  return users.find(u => u.id === session.userId) || null;
}

/**
 * Middleware-like function to protect pages.
 * Redirects to index.html if no session exists.
 */
export function requireAuth() {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!session) {
    window.location.href = './index.html';
  }
}
