/**
 * Player Card Web Component
 * Displays a player row in the rankings with their stats
 * 
 * Attributes:
 * - rank: Player's rank position (1, 2, 3, etc.)
 * - name: Player's name
 * - elo: Player's ELO rating
 * - matches: Number of matches played
 * - wins: Number of wins
 * - losses: Number of losses
 * - win-rate: Win percentage (e.g., "65.5")
 * - points: Total points scored
 * - clickable: Whether the card should be clickable (default: "true")
 * 
 * Usage:
 * <player-card 
 *   rank="1" 
 *   name="London" 
 *   elo="1650" 
 *   matches="15"
 *   wins="10"
 *   losses="5"
 *   win-rate="66.7"
 *   points="315">
 * </player-card>
 */
class PlayerCard extends HTMLElement {
  connectedCallback() {
    const rank = parseInt(this.getAttribute('rank'));
    const name = this.getAttribute('name');
    const elo = this.getAttribute('elo');
    const matches = this.getAttribute('matches');
    const wins = this.getAttribute('wins');
    const losses = this.getAttribute('losses');
    const winRate = this.getAttribute('win-rate');
    const points = this.getAttribute('points');
    const clickable = this.getAttribute('clickable') !== 'false';
    
    let rankClass = 'text-muted-foreground';
    let rankSize = 'text-2xl';
    
    if (rank === 1) {
      rankClass = 'text-yellow-500';
      rankSize = 'text-3xl';
    } else if (rank === 2) {
      rankClass = 'text-gray-400';
      rankSize = 'text-2xl';
    } else if (rank === 3) {
      rankClass = 'text-amber-600';
      rankSize = 'text-2xl';
    }
    
    const cursorClass = clickable ? 'cursor-pointer' : '';
    const clickHandler = clickable ? `onclick="window.location.href='/player-profile/?player=${encodeURIComponent(name)}'"` : '';
    
    this.innerHTML = `
      <div class="flex items-center p-4 border-b border-border hover:bg-accent/50 transition-colors min-h-[70px] ${cursorClass}" ${clickHandler}>
        <div class="${rankSize} font-bold ${rankClass} min-w-[44px] text-center">${rank}°</div>
        <div class="flex-1 ml-3 min-w-0">
          <div class="text-lg font-semibold mb-1 truncate">${name}</div>
          <div class="text-muted-foreground text-sm leading-tight truncate">
            ${matches} partite • 
            ${wins}V-${losses}S • 
            ${winRate}% vittorie • 
            ${points} punti
          </div>
        </div>
        <div class="text-2xl font-bold text-white bg-gradient-to-br from-primary to-primary/80 px-5 py-2 rounded-full min-w-[90px] text-center shadow-md flex-shrink-0">
          ${elo}
        </div>
      </div>
    `;
  }
}

customElements.define('player-card', PlayerCard);

