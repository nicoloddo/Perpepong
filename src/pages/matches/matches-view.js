/**
 * Matches View Web Component
 * Main view component for the matches page
 * Displays all matches with most recent first
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
      
      const matchesHTML = [...partite].reverse().map((partita, index) => {
        const originalIndex = partite.length - 1 - index;
        return `
          <match-card 
            match-number="${originalIndex + 1}"
            match-index="${originalIndex}"
            player1="${partita.giocatore1}"
            player2="${partita.giocatore2}"
            score1="${partita.punteggio1}"
            score2="${partita.punteggio2}">
          </match-card>
        `;
      }).join('');
      
      this.innerHTML = `
        <div class="mb-4">
          <button 
            onclick="window.location.href=window.getPath('/add-match/')"
            class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            + Aggiungi Partita
          </button>
        </div>
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
