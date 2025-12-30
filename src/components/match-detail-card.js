/**
 * Match Detail Card Web Component
 * Displays detailed ELO calculation breakdown for a match
 * 
 * This component is initialized with data via JavaScript property
 * 
 * Usage:
 * const card = document.createElement('match-detail-card');
 * card.setMatchData({
 *   matchNumber: 1,
 *   player1: 'London',
 *   player2: 'Sergej',
 *   score1: 21,
 *   score2: 18,
 *   elo1Before: 1500,
 *   elo2Before: 1500,
 *   details1: {...},
 *   details2: {...}
 * });
 * document.getElementById('container').appendChild(card);
 */
class MatchDetailCard extends HTMLElement {
  setMatchData(data) {
    this.matchData = data;
    this.render();
  }
  
  render() {
    if (!this.matchData) return;
    
    const { matchNumber, player1, player2, score1, score2, elo1Before, elo2Before, details1, details2, timestamp } = this.matchData;
    const winner = score1 > score2 ? 1 : 2;
    
    // Format date from timestamp
    let dateDisplay = '';
    if (timestamp) {
      try {
        const date = new Date(timestamp);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
          dateDisplay = date.toLocaleString('it-IT', options);
        } else {
          console.warn('Invalid timestamp:', timestamp);
        }
      } catch (e) {
        console.error('Error parsing date:', e, 'Timestamp:', timestamp);
      }
    }
    
    // Always show matchup link
    const matchupLink = `/quote/?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`;
    
    this.innerHTML = `
      <div class="bg-card rounded-2xl p-5 mb-4 shadow-lg text-center">
        <div class="text-2xl font-bold mb-2">Partita #${matchNumber}</div>
        ${dateDisplay ? `<div class="text-muted-foreground text-sm mb-4">${dateDisplay}</div>` : ''}
        <div class="flex justify-between items-center gap-3">
          <div class="flex-1">
            <div class="text-lg font-bold mb-2 ${winner === 1 ? 'text-primary' : ''}">${player1}</div>
            <div class="text-5xl font-bold text-primary mb-2">${score1}</div>
            <div class="text-muted-foreground text-sm">ELO Iniziale: ${elo1Before}</div>
          </div>
          <div class="text-xl font-bold text-muted-foreground">VS</div>
          <div class="flex-1">
            <div class="text-lg font-bold mb-2 ${winner === 2 ? 'text-primary' : ''}">${player2}</div>
            <div class="text-5xl font-bold text-primary mb-2">${score2}</div>
            <div class="text-muted-foreground text-sm">ELO Iniziale: ${elo2Before}</div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-border">
          <a href="#" onclick="event.preventDefault(); window.location.href=window.getPath('${matchupLink}');" class="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-md transition-all active:scale-95 hover:shadow-lg">
            📊 Vedi Matchup
          </a>
        </div>
      </div>

      <div class="bg-card rounded-2xl p-4 mb-4 shadow-lg">
        <div class="text-xl text-primary font-bold mb-4 pb-2 border-b-2 border-primary">
          🧮 Calcolo Dettagliato ELO
        </div>
        
        <div class="flex flex-col gap-4 mb-4">
          ${this.renderPlayerCalculation(player1, elo1Before, elo2Before, details1, winner === 1)}
          ${this.renderPlayerCalculation(player2, elo2Before, elo1Before, details2, winner === 2)}
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl p-4 mt-4">
          <div class="font-bold text-yellow-800 dark:text-yellow-200 mb-2">💡 Come Funziona il Calcolo ELO</div>
          <div class="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed space-y-2">
            <p><strong>1. Punteggio Atteso:</strong> Calcolato in base alla differenza di ELO tra i giocatori. Se hai un ELO più alto, ci si aspetta che tu vinca.</p>
            <p><strong>2. Fattore K:</strong> Determina quanto velocemente cambia l'ELO (in questo sistema K=32).</p>
            <p><strong>3. Fattore Differenza:</strong> Maggiore è la differenza di punteggio nella partita, maggiore è l'impatto sull'ELO. Una vittoria schiacciante conta di più!</p>
            <p><strong>4. Cambio ELO:</strong> Formula finale: K × Fattore Differenza × (Risultato - Punteggio Atteso)</p>
          </div>
        </div>
      </div>
    `;
  }
  
  renderPlayerCalculation(nome, eloGiocatore, eloAvversario, dettagli, isWinner) {
    const cambioEloFormatted = dettagli.cambioElo >= 0 ? `+${Math.round(dettagli.cambioElo)}` : Math.round(dettagli.cambioElo);
    const cambioClass = dettagli.cambioElo >= 0 ? 'text-green-500' : 'text-red-500';
    
    return `
      <div class="border-2 ${isWinner ? 'border-primary bg-primary/5' : 'border-border'} rounded-xl p-4 bg-muted/50">
        <div class="text-xl font-bold text-center mb-3">${nome}</div>
        
        <div class="mb-3 p-3 bg-card rounded-lg border-l-4 border-primary">
          <div class="font-semibold text-primary mb-1 text-sm">1️⃣ Risultato della Partita</div>
          <div class="text-lg font-semibold mb-1">${dettagli.risultato === 1 ? 'Vittoria (1)' : 'Sconfitta (0)'}</div>
          <div class="text-muted-foreground text-xs">${dettagli.risultato === 1 ? 'Ha vinto la partita' : 'Ha perso la partita'}</div>
        </div>

        <div class="mb-3 p-3 bg-card rounded-lg border-l-4 border-primary">
          <div class="font-semibold text-primary mb-1 text-sm">2️⃣ Punteggio Atteso</div>
          <div class="text-lg font-semibold mb-1">${(dettagli.punteggioAtteso * 100).toFixed(1)}%</div>
          <div class="text-muted-foreground text-xs leading-relaxed">
            Probabilità di vittoria basata sulla differenza di ELO:<br>
            Differenza ELO: ${eloGiocatore - eloAvversario} punti
            <div class="bg-muted p-2 rounded mt-1 font-mono text-[10px] overflow-x-auto">
              1 / (1 + 10^((${eloAvversario} - ${eloGiocatore}) / 400))
            </div>
            ${dettagli.punteggioAtteso > 0.5 
              ? 'Favorito per vincere questa partita' 
              : dettagli.punteggioAtteso < 0.5 
                ? 'Sfavorito in questa partita' 
                : 'Partita equilibrata'}
          </div>
        </div>

        <div class="mb-3 p-3 bg-card rounded-lg border-l-4 border-primary">
          <div class="font-semibold text-primary mb-1 text-sm">3️⃣ Fattore Differenza Punteggio</div>
          <div class="text-lg font-semibold mb-1">×${dettagli.fattoreDifferenza.toFixed(2)}</div>
          <div class="text-muted-foreground text-xs leading-relaxed">
            Differenza di punti nella partita: ${dettagli.differenzaPunti}<br>
            <div class="bg-muted p-2 rounded mt-1 font-mono text-[10px]">
              1 + (${dettagli.differenzaPunti} / 20) = ${dettagli.fattoreDifferenza.toFixed(2)}
            </div>
            ${dettagli.differenzaPunti > 10 
              ? 'Vittoria/sconfitta schiacciante - grande impatto!' 
              : dettagli.differenzaPunti > 5 
                ? 'Vittoria/sconfitta netta' 
                : 'Partita combattuta'}
          </div>
        </div>

        <div class="mb-3 p-3 bg-card rounded-lg border-l-4 border-primary">
          <div class="font-semibold text-primary mb-1 text-sm">4️⃣ Calcolo Cambio ELO</div>
          <div class="text-base font-semibold mb-1">
            32 × ${dettagli.fattoreDifferenza.toFixed(2)} × (${dettagli.risultato} - ${dettagli.punteggioAtteso.toFixed(3)})
          </div>
          <div class="text-muted-foreground text-xs">
            <div class="bg-muted p-2 rounded mt-1 font-mono text-[10px]">
              K-Factor × Fattore Differenza × (Risultato - Punteggio Atteso)
            </div>
            = ${cambioEloFormatted} punti ELO
          </div>
        </div>

        <div class="text-center p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl mt-3">
          <div class="text-sm mb-2 opacity-90">Cambio ELO</div>
          <div class="text-4xl font-bold ${cambioClass}">${cambioEloFormatted}</div>
          <div class="mt-4 text-xl">
            ${eloGiocatore} → ${dettagli.nuovoElo}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('match-detail-card', MatchDetailCard);

