/**
 * Auth View Web Component
 * Dedicated page for user authentication with email/password and Google
 * 
 * Usage:
 * <auth-view></auth-view>
 */

import { signUp, signInWithPassword, signInWithGoogle } from '../../backend/auth.js';

class AuthView extends HTMLElement {
  constructor() {
    super();
    this.mode = 'login'; // 'login' or 'signup'
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  switchMode(newMode) {
    this.mode = newMode;
    this.render();
    this.attachEventListeners();
  }

  async handleEmailAuth(e) {
    e.preventDefault();
    
    const email = this.querySelector('#auth-email').value.trim();
    const password = this.querySelector('#auth-password').value;
    const errorEl = this.querySelector('#auth-error');
    const submitBtn = this.querySelector('#auth-submit-btn');

    // Basic validation
    if (!email || !password) {
      errorEl.textContent = 'Please fill in all fields';
      errorEl.classList.remove('hidden');
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      errorEl.classList.remove('hidden');
      return;
    }

    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';
    errorEl.classList.add('hidden');

    try {
      let result;
      if (this.mode === 'signup') {
        result = await signUp(email, password);
      } else {
        result = await signInWithPassword(email, password);
      }

      if (result.error) {
        errorEl.textContent = result.error.message || 'Authentication failed';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = this.mode === 'signup' ? 'Sign Up' : 'Log In';
      } else {
        // Success - redirect to home
        if (this.mode === 'signup') {
          alert('Account created! Please check your email to verify your account.');
        }
        window.location.href = window.getPath('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      errorEl.textContent = 'An unexpected error occurred';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = this.mode === 'signup' ? 'Sign Up' : 'Log In';
    }
  }

  async handleGoogleAuth() {
    const errorEl = this.querySelector('#auth-error');
    errorEl.classList.add('hidden');

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        errorEl.textContent = error.message || 'Google sign in failed';
        errorEl.classList.remove('hidden');
      }
      // If successful, user will be redirected to Google
    } catch (error) {
      console.error('Google auth error:', error);
      errorEl.textContent = 'An unexpected error occurred';
      errorEl.classList.remove('hidden');
    }
  }

  attachEventListeners() {
    // Tab switching
    const loginTab = this.querySelector('#tab-login');
    const signupTab = this.querySelector('#tab-signup');
    
    if (loginTab) {
      loginTab.addEventListener('click', () => this.switchMode('login'));
    }
    
    if (signupTab) {
      signupTab.addEventListener('click', () => this.switchMode('signup'));
    }

    // Form submission
    const form = this.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleEmailAuth(e));
    }

    // Google sign in
    const googleBtn = this.querySelector('#google-signin-btn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleAuth());
    }

    // Back button
    const backBtn = this.querySelector('#back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = window.getPath('/');
      });
    }
  }

  render() {
    const isLogin = this.mode === 'login';
    
    this.innerHTML = `
      <div class="max-w-md mx-auto">
        <!-- Back button -->
        <button 
          id="back-btn"
          class="inline-flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-lg font-semibold mb-6 transition-all active:scale-95 active:bg-white/30"
        >
          ← Back to Home
        </button>

        <!-- Auth Card -->
        <div class="bg-card rounded-2xl shadow-2xl p-6 md:p-8">
          <!-- Header -->
          <div class="mb-6 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome to Perpepong
            </h2>
            <p class="text-foreground-light text-sm">
              ${isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mb-6 border-b border-border">
            <button 
              id="tab-login"
              class="flex-1 pb-3 text-sm font-medium transition ${
                isLogin 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-foreground-light hover:text-foreground'
              }"
            >
              Log In
            </button>
            <button 
              id="tab-signup"
              class="flex-1 pb-3 text-sm font-medium transition ${
                !isLogin 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-foreground-light hover:text-foreground'
              }"
            >
              Sign Up
            </button>
          </div>

          <!-- Google Sign In -->
          <button
            id="google-signin-btn"
            type="button"
            class="w-full mb-4 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm hover:shadow"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 h-px bg-border"></div>
            <span class="text-xs text-foreground-light">OR</span>
            <div class="flex-1 h-px bg-border"></div>
          </div>

          <!-- Email/Password Form -->
          <form id="auth-form" class="space-y-4">
            <!-- Error message -->
            <div id="auth-error" class="hidden bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"></div>

            <!-- Email -->
            <div>
              <label for="auth-email" class="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                id="auth-email"
                required
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="auth-password" class="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                id="auth-password"
                required
                placeholder="••••••••"
                minlength="6"
                class="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <p class="text-xs text-foreground-light mt-1">
                ${!isLogin ? 'At least 6 characters' : ''}
              </p>
            </div>

            <!-- Submit button -->
            <button
              id="auth-submit-btn"
              type="submit"
              class="w-full bg-gradient-to-r from-perpe-purple to-perpe-dark text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition shadow-lg hover:shadow-xl"
            >
              ${isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <!-- Footer -->
          <p class="text-center text-xs text-foreground-light mt-6">
            ${isLogin 
              ? 'By signing in, you agree to our Terms of Service' 
              : 'By signing up, you agree to our Terms of Service'
            }
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('auth-view', AuthView);
