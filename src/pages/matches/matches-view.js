/**
 * Matches View Web Component
 * Main view component for the matches page
 * Displays all matches in chronological order
 * 
 * Usage:
 * <matches-view></matches-view>
 */
class MatchesView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          Tutte le Partite
        </div>
        <div class="divide-y divide-border">
          <div class="p-10 text-center text-muted-foreground">Caricamento partite...</div>
        </div>
      </div>
    `;
    
    try {
      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = `
          <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
            <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
              Tutte le Partite
            </div>
            <div class="p-10 text-center text-destructive">Nessuna partita trovata nel file matches.txt</div>
          </div>
        `;
        return;
      }
      
      const matchesHTML = partite.map((partita, index) => `
        <match-card 
          match-number="${index + 1}"
          match-index="${index}"
          player1="${partita.giocatore1}"
          player2="${partita.giocatore2}"
          score1="${partita.punteggio1}"
          score2="${partita.punteggio2}">
        </match-card>
      `).join('');
      
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            Tutte le Partite
          </div>
          <div class="divide-y divide-border">
            ${matchesHTML}
          </div>
        </div>
      `;
      
    } catch (error) {
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            Tutte le Partite
          </div>
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
        </div>
      `;
    }
  }
}

customElements.define('matches-view', MatchesView);
