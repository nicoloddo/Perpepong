/**
 * Stats Grid Web Component
 * Displays global statistics in a grid layout
 * 
 * Attributes:
 * - players-count: Number of total players
 * - matches-count: Number of total matches
 * - average-elo: Average ELO rating
 * - max-elo: Maximum ELO rating
 * 
 * Usage:
 * <stats-grid 
 *   players-count="8" 
 *   matches-count="26" 
 *   average-elo="1502"
 *   max-elo="1650">
 * </stats-grid>
 */
class StatsGrid extends HTMLElement {
  connectedCallback() {
    const playersCount = this.getAttribute('players-count') || '0';
    const matchesCount = this.getAttribute('matches-count') || '0';
    const averageElo = this.getAttribute('average-elo') || '1500';
    const maxElo = this.getAttribute('max-elo') || '1500';
    
    this.innerHTML = `
      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${playersCount}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Giocatori</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${matchesCount}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Partite Totali</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${averageElo}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">ELO Medio</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${maxElo}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">ELO Massimo</div>
        </div>
      </div>
    `;
  }
}

customElements.define('stats-grid', StatsGrid);

