/**
 * Match Detail View Web Component
 * Handles loading and displaying detailed match information
 * Self-contained component that loads its own data based on URL parameter
 * 
 * Usage:
 * <match-detail-view></match-detail-view>
 */
class MatchDetailView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-white text-xl">Caricamento dettagli partita...</div>';
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const matchIndex = parseInt(urlParams.get('match'));
      
      if (isNaN(matchIndex)) {
        throw new Error('Partita non specificata');
      }
      
      const partite = await caricaPartite();
      
      if (matchIndex < 0 || matchIndex >= partite.length) {
        throw new Error('Partita non trovata');
      }
      
      const classifica = calcolaClassificaFinoA(partite, matchIndex);
      const partita = partite[matchIndex];
      
      const player1Elo = classifica[partita.giocatore1].elo;
      const player2Elo = classifica[partita.giocatore2].elo;
      
      const dettagli1 = calcolaDettagliElo(player1Elo, player2Elo, partita.punteggio1, partita.punteggio2);
      const dettagli2 = calcolaDettagliElo(player2Elo, player1Elo, partita.punteggio2, partita.punteggio1);
      
      // Create the detail card
      this.innerHTML = '';
      const matchCard = document.createElement('match-detail-card');
      matchCard.setMatchData({
        matchNumber: matchIndex + 1,
        player1: partita.giocatore1,
        player2: partita.giocatore2,
        score1: partita.punteggio1,
        score2: partita.punteggio2,
        elo1Before: player1Elo,
        elo2Before: player2Elo,
        details1: dettagli1,
        details2: dettagli2,
        timestamp: partita.timestamp || null
      });
      
      this.appendChild(matchCard);
      
    } catch (error) {
      this.innerHTML = `<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">${error.message}</div>`;
    }
  }
}

customElements.define('match-detail-view', MatchDetailView);

