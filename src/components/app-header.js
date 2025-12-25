/**
 * App Header Web Component
 * Displays the application title and subtitle
 * 
 * Attributes:
 * - title: Main title text (default: '🏓 Perpong')
 * - subtitle: Subtitle text (default: 'Ping, Pong, Perpong')
 * 
 * Usage:
 * <app-header></app-header>
 * <app-header title="Custom Title" subtitle="Custom Subtitle"></app-header>
 */
class AppHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '🏓 Perpong';
    const subtitle = this.getAttribute('subtitle') || 'Ping, Pong, Perpong';
    
    this.innerHTML = `
      <header class="text-center text-white mb-5 py-5">
        <h1 class="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
          ${title}
        </h1>
        <p class="text-base opacity-90">${subtitle}</p>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);

