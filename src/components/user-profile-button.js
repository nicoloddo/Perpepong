/**
 * User Profile Button Web Component
 * Displays user authentication status and provides access to auth actions
 * 
 * Usage:
 * <user-profile-button></user-profile-button>
 * 
 * Shows "Login" button when logged out, user avatar/menu when logged in
 */

import { getCurrentUser, signOut, onAuthStateChange } from '../backend/auth.js';

class UserProfileButton extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.menuOpen = false;
    this.authSubscription = null;
  }

  async connectedCallback() {
    // Load initial user state
    await this.loadUser();
    
    // Listen to auth state changes
    this.authSubscription = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await this.loadUser();
      } else if (event === 'SIGNED_OUT') {
        this.user = null;
        this.render();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.menuOpen) {
        this.menuOpen = false;
        this.render();
      }
    });

    this.render();
  }

  disconnectedCallback() {
    // Unsubscribe from auth changes
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loadUser() {
    const { user } = await getCurrentUser();
    this.user = user;
    this.render();
  }

  openAuthPage() {
    window.location.href = window.getPath('/auth/');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.render();
  }

  async handleSignOut() {
    const { error } = await signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    } else {
      this.user = null;
      this.menuOpen = false;
      this.render();
      
      // Reload page to clear any user-specific data
      window.location.reload();
    }
  }

  getUserDisplayName() {
    if (!this.user) return 'Guest';
    
    // Try to get name from user metadata
    if (this.user.user_metadata?.full_name) {
      return this.user.user_metadata.full_name;
    }
    
    // Fall back to email (first part before @)
    if (this.user.email) {
      return this.user.email.split('@')[0];
    }
    
    return 'User';
  }

  getUserAvatar() {
    // Try to get avatar from user metadata (Google provides this)
    if (this.user?.user_metadata?.avatar_url) {
      return this.user.user_metadata.avatar_url;
    }
    
    return null;
  }

  render() {
    if (!this.user) {
      // Logged out state - standard login button
      this.innerHTML = `
        <button
          id="login-btn"
          class="px-4 py-2 bg-perpe-purple text-white rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg font-medium text-sm"
          aria-label="Login"
        >
          Login
        </button>
      `;

      const loginBtn = this.querySelector('#login-btn');
      loginBtn.addEventListener('click', () => this.openAuthPage());
    } else {
      // Logged in state - show user avatar (small size, properly constrained)
      const displayName = this.getUserDisplayName();
      const avatarUrl = this.getUserAvatar();
      
      this.innerHTML = `
        <div class="relative">
          <button
            id="user-menu-btn"
            class="w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition shadow-md block flex-shrink-0"
            style="min-width: 28px; min-height: 28px; max-width: 28px; max-height: 28px;"
            aria-label="User menu"
          >
            ${avatarUrl 
              ? `<img src="${avatarUrl}" alt="${displayName}" class="w-full h-full object-cover" style="width: 32px; height: 32px;" />`
              : `<div class="w-full h-full rounded-full bg-gradient-to-r from-perpe-purple to-perpe-dark flex items-center justify-center text-white font-semibold text-xs">
                  ${displayName.charAt(0).toUpperCase()}
                </div>`
            }
          </button>

          ${this.menuOpen ? `
            <div class="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50">
              <div class="p-3 border-b border-border">
                <p class="text-sm font-medium text-foreground">${displayName}</p>
                <p class="text-xs text-foreground-light truncate">${this.user.email || ''}</p>
              </div>
              
              <div class="p-2">
                <button
                  id="profile-menu-item"
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 transition text-sm text-foreground flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </button>
                
                <button
                  id="settings-menu-item"
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 transition text-sm text-foreground flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m5.196-15.196l-4.242 4.242m0 6.364l-4.242 4.242m15.196-5.196h-6m-6 0H1"></path>
                  </svg>
                  Settings
                </button>
              </div>

              <div class="p-2 border-t border-border">
                <button
                  id="signout-btn"
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 transition text-sm text-red-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      `;

      // Attach event listeners
      const menuBtn = this.querySelector('#user-menu-btn');
      menuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      const signoutBtn = this.querySelector('#signout-btn');
      signoutBtn?.addEventListener('click', () => this.handleSignOut());

      const profileBtn = this.querySelector('#profile-menu-item');
      profileBtn?.addEventListener('click', () => {
        // Navigate to profile page (to be implemented)
        alert('Profile page coming soon!');
        this.menuOpen = false;
        this.render();
      });

      const settingsBtn = this.querySelector('#settings-menu-item');
      settingsBtn?.addEventListener('click', () => {
        // Navigate to settings page (to be implemented)
        alert('Settings page coming soon!');
        this.menuOpen = false;
        this.render();
      });
    }
  }
}

customElements.define('user-profile-button', UserProfileButton);
