/**
 * Player Profile View Web Component
 * Displays detailed player profile with statistics and match history (most recent first)
 * Loads data based on URL parameter
 * 
 * Usage:
 * <player-profile-view></player-profile-view>
 */
class PlayerProfileView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-white text-xl">Caricamento profilo...</div>';
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const playerName = urlParams.get('player');
      
      if (!playerName) {
        this.innerHTML = '<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Nessun giocatore specificato</div>';
        return;
      }

      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = '<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Nessuna partita trovata</div>';
        return;
      }

      const classifica = calcolaClassifica(partite);
      const playerData = classifica.find(p => p.nome === playerName);

      if (!playerData) {
        this.innerHTML = '<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Giocatore non trovato</div>';
        return;
      }

      const playerRank = classifica.findIndex(p => p.nome === playerName) + 1;
      const matchHistory = calcolaStatisticheGiocatore(partite, playerName);
      const matchupStats = calcolaMatchupGiocatore(partite, playerName, classifica);

      this.render(playerData, playerRank, classifica.length, matchHistory, matchupStats);

    } catch (error) {
      this.innerHTML = `<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Errore: ${error.message}</div>`;
    }
  }
  
  render(playerData, rank, totalPlayers, matchHistory, matchupStats) {
    const winRate = ((playerData.vittorie / playerData.partiteGiocate) * 100).toFixed(1);
    const avgPointsScored = (playerData.puntiSegnati / playerData.partiteGiocate).toFixed(1);
    const avgPointsConceded = (playerData.puntiSubiti / playerData.partiteGiocate).toFixed(1);
    const pointsDiff = playerData.puntiSegnati - playerData.puntiSubiti;
    const maxElo = Math.max(...matchHistory.map(m => m.eloAfter));
    const minElo = Math.min(...matchHistory.map(m => m.eloAfter));
    const eloDiff = playerData.elo - 1500;
    const eloDiffText = eloDiff >= 0 ? `+${eloDiff}` : eloDiff;

    this.innerHTML = `
      <div class="bg-card rounded-2xl shadow-lg p-6 mb-5 text-center">
        <div class="text-3xl font-bold mb-3">${playerData.nome}</div>
        <div class="text-lg text-muted-foreground mb-5">
          <span>Posizione in classifica:</span>
          <span class="inline-block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 rounded-full font-semibold ml-2">${rank}° su ${totalPlayers}</span>
        </div>
        <div class="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-2">Rating ELO Attuale</div>
        <div class="text-6xl font-bold text-primary">${playerData.elo}</div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${playerData.partiteGiocate}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Partite Giocate</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${playerData.vittorie}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Vittorie</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${playerData.sconfitte}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Sconfitte</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${winRate}%</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Win Rate</div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          📊 Statistiche Dettagliate
        </div>
        <div class="divide-y divide-border">
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Punti Segnati</div></div><div class="text-2xl font-bold text-primary">${playerData.puntiSegnati}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Punti Subiti</div></div><div class="text-2xl font-bold text-primary">${playerData.puntiSubiti}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Differenza Punti</div></div><div class="text-2xl font-bold ${pointsDiff >= 0 ? 'text-green-500' : 'text-red-500'}">${pointsDiff >= 0 ? '+' : ''}${pointsDiff}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Media Punti Segnati/Partita</div></div><div class="text-2xl font-bold text-primary">${avgPointsScored}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Media Punti Subiti/Partita</div></div><div class="text-2xl font-bold text-primary">${avgPointsConceded}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">ELO Massimo Raggiunto</div></div><div class="text-2xl font-bold text-primary">${maxElo}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">ELO Minimo Raggiunto</div></div><div class="text-2xl font-bold text-primary">${minElo}</div></div>
          <div class="flex items-center p-4"><div class="flex-1"><div class="text-lg font-semibold">Variazione ELO dall'inizio</div></div><div class="text-2xl font-bold ${eloDiff >= 0 ? 'text-green-500' : 'text-red-500'}">${eloDiffText}</div></div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          🎯 Statistiche Matchup
        </div>
        <div class="p-5 space-y-4">
          ${this.renderMatchupStat('🏆', 'Miglior Matchup', matchupStats.bestMatchup, playerData.nome)}
          ${this.renderMatchupStat('😰', 'Peggior Matchup', matchupStats.worstMatchup, playerData.nome)}
          ${this.renderMatchupStat('💪', 'Maggiore Overperformance', matchupStats.biggestOverperformer, playerData.nome)}
          ${this.renderMatchupStat('📉', 'Maggiore Underperformance', matchupStats.biggestUnderperformer, playerData.nome)}
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          🏓 Storico Partite
        </div>
        <div class="divide-y divide-border">
          ${[...matchHistory].reverse().map(match => {
            const resultClass = match.won ? 'bg-primary/5' : 'bg-destructive/5';
            const resultText = match.won ? 'W' : 'L';
            const resultColor = match.won ? 'text-primary' : 'text-destructive';
            const eloChangeClass = match.eloChange >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
            const eloChangeText = match.eloChange >= 0 ? `+${Math.round(match.eloChange)}` : Math.round(match.eloChange);

            return `
              <div class="flex items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors ${resultClass}" onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(playerData.nome)}&player2=${encodeURIComponent(match.opponent)}')">
                <div class="text-xl font-bold ${resultColor} min-w-[40px] text-center">${resultText}</div>
                <div class="flex-1 ml-3">
                  <div class="text-lg font-semibold">vs ${match.opponent}</div>
                  <div class="text-muted-foreground text-sm">Partita #${match.matchNumber}</div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold">${match.playerScore}-${match.opponentScore}</div>
                  <div class="text-sm font-semibold px-2 py-1 rounded ${eloChangeClass}">${eloChangeText}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  renderMatchupStat(emoji, title, matchup, playerName) {
    if (!matchup) {
      return `
        <div class="bg-muted/30 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="text-3xl">${emoji}</div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">${title}</div>
              <div class="text-muted-foreground text-sm">Dati insufficienti (min. 2 partite)</div>
            </div>
          </div>
        </div>
      `;
    }
    
    const winRatePercent = (matchup.winRate * 100).toFixed(0);
    const winProbPercent = (matchup.winProb * 100).toFixed(0);
    const overperformancePercent = (matchup.overperformance * 100).toFixed(0);
    const overperformanceSign = matchup.overperformance >= 0 ? '+' : '';
    
    return `
      <div class="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
           onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(playerName)}&player2=${encodeURIComponent(matchup.opponent)}')">
        <div class="flex items-start gap-3">
          <div class="text-3xl">${emoji}</div>
          <div class="flex-1">
            <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">${title}</div>
            <div class="text-lg font-bold mb-1">vs ${matchup.opponent}</div>
            <div class="text-muted-foreground text-sm">
              ${matchup.wins}-${matchup.losses} in ${matchup.totalGames} partite (${winRatePercent}% win rate)
            </div>
            <div class="text-muted-foreground text-sm">
              Previsto: ${winProbPercent}% | Performance: ${overperformanceSign}${overperformancePercent}%
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('player-profile-view', PlayerProfileView);

