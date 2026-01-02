/**
 * Tournament Card Web Component
 * Displays a tournament card with status and winner information
 * 
 * Attributes:
 * - id: Tournament UUID
 * - name: Tournament name
 * - status: Tournament status (setup, active, completed)
 * - winner: Winner name (optional, only for completed tournaments)
 * 
 * Usage:
 * <tournament-card id="uuid" name="Summer Cup" status="active"></tournament-card>
 * <tournament-card id="uuid" name="Winter Cup" status="completed" winner="PlayerName"></tournament-card>
 */
class TournamentCard extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute('id');
    const name = this.getAttribute('name');
    const status = this.getAttribute('status') || 'setup';
    const winner = this.getAttribute('winner');
    
    // Status badge styling
    const statusConfig = {
      'setup': {
        label: 'Setup',
        class: 'bg-muted text-muted-foreground'
      },
      'active': {
        label: 'Live',
        class: 'bg-destructive/10 text-destructive',
        animated: true
      },
      'completed': {
        label: 'Completato',
        class: 'bg-green-500/10 text-green-500'
      }
    };
    
    const statusInfo = statusConfig[status] || statusConfig['setup'];
    
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
           onclick="window.location.href = window.getPath('/tornei/dettaglio/?id=${encodeURIComponent(id)}')">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg font-bold text-primary">${name}</h3>
          <span class="inline-flex items-center gap-2 px-3 py-1 ${statusInfo.class} rounded-full text-xs font-medium">
            ${statusInfo.animated ? '<span class="animate-pulse">●</span>' : ''}
            ${statusInfo.label}
          </span>
        </div>
        
        ${winner ? `
          <div class="text-sm text-muted-foreground">
            🏆 Vincitore: <span class="font-semibold text-foreground">${winner}</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('tournament-card', TournamentCard);
