/**
 * App Navigation Web Component
 * Displays the bottom navigation bar with active state
 * 
 * Attributes:
 * - active: ID of the active page ('home', 'matches', 'quote', 'stats')
 * 
 * Usage:
 * <app-nav active="home"></app-nav>
 * <app-nav active="matches"></app-nav>
 */
class AppNav extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    const navItems = [
      { id: 'home', label: 'Classifica', href: '../home/home.html' },
      { id: 'matches', label: 'Partite', href: '../matches/matches.html' },
      { id: 'stats', label: 'Statistiche', href: '../stats/stats.html' },
      { id: 'quote', label: 'Quote', href: '../quote/quote.html' },
      { id: 'virtualini', label: 'Virtualini Live', href: '../virtualini/virtualini.html' }
    ];
    
    this.innerHTML = `
      <nav class="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-2 flex justify-around z-50" style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom));">
        ${navItems.map(item => `
          <a href="${item.href}" 
             class="flex-1 p-3 font-semibold rounded-lg text-center text-sm flex flex-col items-center gap-1 min-h-[44px] justify-center transition-all active:scale-95 ${
            item.id === active 
              ? 'bg-primary text-primary-foreground' 
              : 'text-primary hover:bg-accent'
          }">
            ${item.label}
          </a>
        `).join('')}
      </nav>
    `;
  }
}

customElements.define('app-nav', AppNav);

