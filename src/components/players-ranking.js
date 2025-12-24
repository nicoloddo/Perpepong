/**
 * Players Ranking Web Component
 * Displays a list of players with their rankings
 * 
 * This component handles its own data loading and rendering
 * Can be reused anywhere that needs to display player rankings
 * 
 * Usage:
 * <players-ranking></players-ranking>
 */
class PlayersRanking extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento dati...</div>';
    
    try {
      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = '<div class="p-10 text-center text-destructive">Nessuna partita trovata nel file matches.txt</div>';
        return;
      }
      
      const classifica = calcolaClassifica(partite);
      this.renderPlayers(classifica);
      
    } catch (error) {
      this.innerHTML = `<div class="p-10 text-center text-destructive">Errore: ${error.message}</div>`;
    }
  }
  
  renderPlayers(classifica) {
    if (classifica.length === 0) {
      this.innerHTML = '<div class="p-10 text-center text-destructive">Nessun giocatore trovato</div>';
      return;
    }
    
    this.innerHTML = classifica.map((giocatore, index) => {
      const percentualeVittorie = giocatore.partiteGiocate > 0
        ? ((giocatore.vittorie / giocatore.partiteGiocate) * 100).toFixed(1)
        : 0;
      
      return `
        <player-card 
          rank="${index + 1}"
          name="${giocatore.nome}"
          elo="${giocatore.elo}"
          matches="${giocatore.partiteGiocate}"
          wins="${giocatore.vittorie}"
          losses="${giocatore.sconfitte}"
          win-rate="${percentualeVittorie}"
          points="${giocatore.puntiSegnati}">
        </player-card>
      `;
    }).join('');
  }
}

customElements.define('players-ranking', PlayersRanking);
