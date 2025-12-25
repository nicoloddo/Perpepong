/**
 * Match Card Web Component
 * Displays a match card with player names, scores, and match number
 * 
 * Attributes:
 * - match-number: Display number of the match (e.g., "1", "2", "3")
 * - match-index: Zero-based index for navigation (e.g., "0", "1", "2")
 * - player1: Name of player 1
 * - player2: Name of player 2
 * - score1: Score of player 1
 * - score2: Score of player 2
 * - clickable: Whether the card should be clickable (default: "true")
 * 
 * Usage:
 * <match-card 
 *   match-number="1" 
 *   match-index="0"
 *   player1="London" 
 *   player2="Sergej" 
 *   score1="21" 
 *   score2="18">
 * </match-card>
 */
class MatchCard extends HTMLElement {
  connectedCallback() {
    const matchNumber = this.getAttribute('match-number');
    const player1 = this.getAttribute('player1');
    const player2 = this.getAttribute('player2');
    const score1 = parseInt(this.getAttribute('score1'));
    const score2 = parseInt(this.getAttribute('score2'));
    const matchIndex = this.getAttribute('match-index');
    const clickable = this.getAttribute('clickable') !== 'false';
    
    const winner = score1 > score2 ? 'player1' : 'player2';
    const cursorClass = clickable ? 'cursor-pointer' : '';
    const clickHandler = clickable ? `onclick="window.location.href=window.getPath('/match-detail/?match=${matchIndex}')"` : '';
    
    this.innerHTML = `
      <div class="flex items-center p-4 border-b border-border hover:bg-accent/50 transition-colors ${cursorClass}" 
           ${clickHandler}>
        <div class="text-base font-bold text-muted-foreground min-w-[44px] text-center">
          #${matchNumber}
        </div>
        <div class="flex-1 ml-3 min-w-0">
          <div class="text-base font-semibold leading-tight">
            <span class="${winner === 'player1' ? 'text-primary font-bold' : ''}">${player1}</span>
            <span class="text-muted-foreground"> vs </span>
            <span class="${winner === 'player2' ? 'text-primary font-bold' : ''}">${player2}</span>
          </div>
        </div>
        <div class="text-2xl font-bold text-primary min-w-[70px] text-center flex-shrink-0">
          ${score1} - ${score2}
        </div>
      </div>
    `;
  }
}

customElements.define('match-card', MatchCard);

