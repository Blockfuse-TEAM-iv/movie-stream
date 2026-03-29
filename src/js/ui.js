function renderNavbar() {
    const portal = document.getElementById('navbar-portal');
    if (!portal) return;

    const session = JSON.parse(sessionStorage.getItem('user')) || { username: 'Guest' };

    portal.innerHTML = `
        <nav class="fixed top-0 w-full z-50 bg-black/95 border-b border-gray-900 px-[4%] py-4 flex items-center justify-between">
            <div class="flex items-center gap-8">
                <h1 class="text-red-600 text-2xl font-black tracking-tighter uppercase cursor-pointer" onclick="window.location.href='home.html'">STREAM</h1>
                <div class="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                    <a href="home.html" class="text-white">Home</a>
                    <a href="#" class="hover:text-white transition">Movies</a>
                    <a href="#" class="hover:text-white transition">My List</a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-xs text-gray-500 uppercase tracking-widest">${session.username}</span>
                <button onclick="handleLogout()" class="text-xs bg-gray-900 border border-gray-800 hover:bg-red-600 px-3 py-1 rounded transition-colors">Logout</button>
            </div>
        </nav>
    `;
}
// --- 2. THE FOOTER (New Addition) ---
function renderFooter() {
    const portal = document.getElementById('footer-portal');
    if (!portal) return;

    portal.innerHTML = `
    <footer class="bg-gray-950 border-t border-gray-900 py-12 px-[4%] mt-20">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                    <h3 class="text-xl font-bold text-red-600 uppercase tracking-tighter mb-4">STREAM</h3>
                    <p class="text-gray-500 text-sm leading-relaxed">Your premium movie streaming platform with the latest releases and timeless classics.</p>
                </div>
                
                <div>
                    <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Browse</h4>
                    <ul class="space-y-2 text-sm text-gray-500">
                        <li><a href="#" class="hover:text-white transition-colors">Movies</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">TV Shows</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">New Releases</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">My List</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Help</h4>
                    <ul class="space-y-2 text-sm text-gray-500">
                        <li><a href="#" class="hover:text-white transition-colors">Account</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Connect</h4>
                    <div class="flex space-x-5">
                        <a href="#" class="text-gray-500 hover:text-white transition-all transform hover:scale-110">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v8.385C8.5 17.958 12.138 21 12 21c-2.761 0-5.5-2.35-6.632-6.369l6.632-3.376zm-17.865 6.369C1.138 18.65 0 14.99 0 12.073c0-6.627 5.373-12 12-12s12 5.373 12 12c0 1.46-.323 2.842-.846 4.105l-3.694 1.89c.627.966 1.036 2.102 1.036 3.322 0 3.498-2.842 6.332-6.332 6.332z"/></svg>
                        </a>
                        <a href="#" class="text-gray-500 hover:text-white transition-all transform hover:scale-110">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 00-7.858 5.99 12.044 12.044 0 006.842 2.042 1.658 1.658 0 00.464 1.909 5.75 5.75 0 01-1.688 4.196 10.316 10.316 0 00-2.4.667 6.66 6.66 0 011.887 4.615A10.051 10.051 0 0023.953 13z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-gray-500 text-xs">© 2026 STREAM. All rights reserved.</p>
                <div class="flex space-x-8">
                    <a href="#" class="text-gray-500 hover:text-white text-xs transition-colors">Privacy Policy</a>
                    <a href="#" class="text-gray-500 hover:text-white text-xs transition-colors">Terms of Service</a>
                    <a href="#" class="text-gray-500 hover:text-white text-xs transition-colors">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>`;
}

function showToast(message, type = 'success') {
    const portal = document.getElementById('toast-portal');
    if (!portal) return;

    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    toast.className = `fixed bottom-8 right-8 ${color} text-white px-6 py-3 rounded-md shadow-2xl z-[100] transition-all duration-500 transform translate-y-20`;
    toast.innerText = message;

    portal.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-20'), 100);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
