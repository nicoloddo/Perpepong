/**
 * Auth View Web Component
 * Dedicated page for user authentication with Google
 * 
 * Usage:
 * <auth-view></auth-view>
 */

import { signInWithGoogle } from '../../backend/auth.js';

class AuthView extends HTMLElement {
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  async handleGoogleAuth() {
    const googleBtn = this.querySelector('#google-signin-btn');
    
    googleBtn.disabled = true;
    googleBtn.textContent = 'Accesso in corso...';

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign in failed:', error);
        alert(error.message || 'Errore durante l\'accesso con Google');
        googleBtn.disabled = false;
        googleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Accedi con Google
        `;
      }
      // If successful, user will be redirected to Google
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Si è verificato un errore imprevisto');
      googleBtn.disabled = false;
      googleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Accedi con Google
      `;
    }
  }

  attachEventListeners() {
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
    this.innerHTML = `
      <!-- Back button -->
      <button 
        id="back-btn"
        class="inline-flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-lg font-semibold mb-6 transition-all active:scale-95 active:bg-white/30 hover:bg-white/30"
      >
        ← Torna alla Classifica
      </button>

      <!-- Google Sign In Button -->
      <button
        id="google-signin-btn"
        type="button"
        class="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl border border-gray-300 flex items-center justify-center gap-3 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Accedi con Google
      </button>
    `;
  }
}

customElements.define('auth-view', AuthView);
