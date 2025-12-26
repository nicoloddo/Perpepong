/**
 * Quote View Web Component
 * Displays betting odds and head-to-head comparison between two players
 * Includes player selectors and handles URL parameters
 * 
 * Usage:
 * <quote-view></quote-view>
 */
class QuoteView extends HTMLElement {
  async connectedCallback() {
    try {
      this.allMatches = await caricaPartite();
      this.currentRankings = calcolaClassifica(this.allMatches);
      
      this.render();
      this.setupEventListeners();
      this.checkURLParameters();
      
    } catch (error) {
      this.innerHTML = `<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Errore nel caricamento: ${error.message}</div>`;
    }
  }
  
  render() {
    this.innerHTML = `
      <!-- Player Selector -->
      <div class="bg-card rounded-2xl shadow-lg p-5 mb-5">
        <div class="text-xl font-bold text-primary mb-4 text-center">Seleziona Giocatori</div>
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div class="flex flex-col gap-2">
            <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giocatore 1</div>
            <select id="player1Select" class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors">
              <option value="">Seleziona...</option>
              ${this.currentRankings.sort((a, b) => a.nome.localeCompare(b.nome)).map(player => 
                `<option value="${player.nome}">${player.nome} (${player.elo})</option>`
              ).join('')}
            </select>
          </div>
          <div class="text-xl font-bold text-muted-foreground text-center">VS</div>
          <div class="flex flex-col gap-2">
            <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giocatore 2</div>
            <select id="player2Select" class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors">
              <option value="">Seleziona...</option>
              ${this.currentRankings.sort((a, b) => a.nome.localeCompare(b.nome)).map(player => 
                `<option value="${player.nome}">${player.nome} (${player.elo})</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Comparison Content -->
      <div id="comparisonContent" style="display: none;"></div>

      <!-- Matchup Statistics -->
      <div id="matchupStats"></div>
    `;
    
    // Render matchup statistics
    this.renderMatchupStats();
  }
  
  setupEventListeners() {
    this.querySelector('#player1Select').addEventListener('change', () => this.updateComparison());
    this.querySelector('#player2Select').addEventListener('change', () => this.updateComparison());
  }
  
  checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const player1 = urlParams.get('player1');
    const player2 = urlParams.get('player2');
    
    if (player1 && player2) {
      this.querySelector('#player1Select').value = player1;
      this.querySelector('#player2Select').value = player2;
      this.updateComparison();
    }
  }
  
  updateComparison() {
    const player1Name = this.querySelector('#player1Select').value;
    const player2Name = this.querySelector('#player2Select').value;
    const comparisonContent = this.querySelector('#comparisonContent');
    const matchupStats = this.querySelector('#matchupStats');
    
    if (!player1Name || !player2Name || player1Name === player2Name) {
      comparisonContent.style.display = 'none';
      matchupStats.style.display = 'block';
      return;
    }
    
    matchupStats.style.display = 'none';
    comparisonContent.style.display = 'block';
    
    const player1Data = this.currentRankings.find(p => p.nome === player1Name);
    const player2Data = this.currentRankings.find(p => p.nome === player2Name);
    const h2hStats = this.calculateHeadToHead(player1Name, player2Name);
    
    comparisonContent.innerHTML = this.renderComparison(player1Data, player2Data, h2hStats);
  }
  
  renderMatchupStats() {
    const matchupStats = this.querySelector('#matchupStats');
    const interestingMatchups = trovaMatchupInteressanti(this.allMatches, this.currentRankings);
    
    let html = `
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          📊 Statistiche Matchup Interessanti
        </div>
        <div class="p-5 space-y-4">
    `;
    
    // Most Balanced
    if (interestingMatchups.mostBalanced) {
      const m = interestingMatchups.mostBalanced;
      const leader = m.player1Wins > m.player2Wins ? m.player1 : m.player2;
      const leaderWins = Math.max(m.player1Wins, m.player2Wins);
      const followerWins = Math.min(m.player1Wins, m.player2Wins);
      
      html += `
        <div class="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
             onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(m.player1)}&player2=${encodeURIComponent(m.player2)}')">
          <div class="flex items-start gap-3">
            <div class="text-3xl">⚖️</div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">Matchup Più Equilibrato</div>
              <div class="text-lg font-bold mb-1">${m.player1} vs ${m.player2}</div>
              <div class="text-muted-foreground text-sm">
                ${leaderWins}-${followerWins} in ${m.totalGames} partite 
                (${(m.balanceScore * 100).toFixed(0)}% equilibrio)
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Most Surprising
    if (interestingMatchups.mostSurprising) {
      const m = interestingMatchups.mostSurprising;
      const actualWinner = m.player1Wins > m.player2Wins ? m.player1 : m.player2;
      const actualWinRate = Math.max(m.player1WinRate, m.player2WinRate);
      const expectedWinner = m.player1WinProb > m.player2WinProb ? m.player1 : m.player2;
      const isUpset = actualWinner !== expectedWinner;
      
      html += `
        <div class="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
             onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(m.player1)}&player2=${encodeURIComponent(m.player2)}')">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🤯</div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">Matchup Più Sorprendente</div>
              <div class="text-lg font-bold mb-1">${m.player1} vs ${m.player2}</div>
              <div class="text-muted-foreground text-sm">
                ${actualWinner} domina con ${(actualWinRate * 100).toFixed(0)}% win rate, 
                ma le quote ELO davano ${expectedWinner} favorito!
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Most Played
    if (interestingMatchups.mostPlayed) {
      const m = interestingMatchups.mostPlayed;
      const leader = m.player1Wins > m.player2Wins ? m.player1 : m.player2;
      const leaderWins = Math.max(m.player1Wins, m.player2Wins);
      const followerWins = Math.min(m.player1Wins, m.player2Wins);
      
      html += `
        <div class="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
             onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(m.player1)}&player2=${encodeURIComponent(m.player2)}')">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🔥</div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">Rivalità Più Accesa</div>
              <div class="text-lg font-bold mb-1">${m.player1} vs ${m.player2}</div>
              <div class="text-muted-foreground text-sm">
                ${m.totalGames} partite giocate - ${leader} in vantaggio ${leaderWins}-${followerWins}
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Most Dominant
    if (interestingMatchups.mostDominant) {
      const m = interestingMatchups.mostDominant;
      const dominant = m.player1WinRate > m.player2WinRate ? m.player1 : m.player2;
      const dominated = m.player1WinRate > m.player2WinRate ? m.player2 : m.player1;
      const dominantWinRate = Math.max(m.player1WinRate, m.player2WinRate);
      const dominantWins = Math.max(m.player1Wins, m.player2Wins);
      const dominatedWins = Math.min(m.player1Wins, m.player2Wins);
      
      html += `
        <div class="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors" 
             onclick="window.location.href=window.getPath('/quote/?player1=${encodeURIComponent(m.player1)}&player2=${encodeURIComponent(m.player2)}')">
          <div class="flex items-start gap-3">
            <div class="text-3xl">👑</div>
            <div class="flex-1">
              <div class="text-sm font-bold text-primary uppercase tracking-wide mb-1">Dominio Totale</div>
              <div class="text-lg font-bold mb-1">${m.player1} vs ${m.player2}</div>
              <div class="text-muted-foreground text-sm">
                ${dominant} domina con ${(dominantWinRate * 100).toFixed(0)}% win rate (${dominantWins}-${dominatedWins})
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
    
    matchupStats.innerHTML = html;
  }
  
  calculateHeadToHead(player1, player2) {
    const matches = [];
    let player1Wins = 0, player2Wins = 0, player1Points = 0, player2Points = 0;
    
    this.allMatches.forEach((match, index) => {
      const isP1vsP2 = (match.giocatore1 === player1 && match.giocatore2 === player2);
      const isP2vsP1 = (match.giocatore1 === player2 && match.giocatore2 === player1);
      
      if (isP1vsP2 || isP2vsP1) {
        if (isP1vsP2) {
          player1Points += match.punteggio1;
          player2Points += match.punteggio2;
          if (match.punteggio1 > match.punteggio2) player1Wins++; else player2Wins++;
        } else {
          player1Points += match.punteggio2;
          player2Points += match.punteggio1;
          if (match.punteggio2 > match.punteggio1) player1Wins++; else player2Wins++;
        }
        matches.push({ ...match, matchNumber: index + 1, matchIndex: index });
      }
    });
    
    return { matches, totalMatches: matches.length, player1Wins, player2Wins, player1Points, player2Points };
  }
  
  renderComparison(player1Data, player2Data, h2hStats) {
    const player1WinProb = 1 / (1 + Math.pow(10, (player2Data.elo - player1Data.elo) / 400));
    const player2WinProb = 1 - player1WinProb;
    const isFavorite1 = player1WinProb > player2WinProb;
    
    return `
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">💰 Quote Scommesse</div>
        <div class="grid grid-cols-2 gap-4 p-5">
          <div class="text-center p-5 bg-muted/50 rounded-xl border-2 ${isFavorite1 ? 'border-primary bg-primary/5' : 'border-border'}">
            <div class="text-lg font-bold mb-3">${player1Data.nome}</div>
            <div class="text-4xl font-bold text-primary mb-2">${(1 / player1WinProb).toFixed(2)}</div>
            <div class="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Quota</div>
            <div class="text-lg text-green-500 font-semibold">${(player1WinProb * 100).toFixed(1)}% probabilità</div>
          </div>
          <div class="text-center p-5 bg-muted/50 rounded-xl border-2 ${!isFavorite1 ? 'border-primary bg-primary/5' : 'border-border'}">
            <div class="text-lg font-bold mb-3">${player2Data.nome}</div>
            <div class="text-4xl font-bold text-primary mb-2">${(1 / player2WinProb).toFixed(2)}</div>
            <div class="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Quota</div>
            <div class="text-lg text-green-500 font-semibold">${(player2WinProb * 100).toFixed(1)}% probabilità</div>
          </div>
        </div>
        <div class="p-4 text-center bg-muted border-t border-border">
          <div class="text-sm text-muted-foreground mb-2 font-semibold">Rating ELO Attuale</div>
          <div class="flex justify-center items-center gap-4 text-xl font-bold text-primary">
            <span>${player1Data.nome}: ${player1Data.elo}</span>
            <span class="text-muted-foreground">vs</span>
            <span>${player2Data.nome}: ${player2Data.elo}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${h2hStats.totalMatches}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Partite Giocate</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${h2hStats.player1Wins}-${h2hStats.player2Wins}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">Bilancio</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${h2hStats.player1Points}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">${player1Data.nome} - Punti</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${h2hStats.player2Points}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide">${player2Data.nome} - Punti</div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">🏓 Storico Scontri Diretti</div>
        <div class="divide-y divide-border">
          ${h2hStats.matches.length === 0 ? 
            '<div class="p-10 text-center text-muted-foreground">Nessuna partita giocata tra questi giocatori</div>' :
            [...h2hStats.matches].reverse().map(match => {
              const isPlayer1First = match.giocatore1 === player1Data.nome;
              const player1Score = isPlayer1First ? match.punteggio1 : match.punteggio2;
              const player2Score = isPlayer1First ? match.punteggio2 : match.punteggio1;
              
              return `
                <match-card 
                  match-number="${match.matchNumber}"
                  match-index="${match.matchIndex}"
                  player1="${player1Data.nome}"
                  player2="${player2Data.nome}"
                  score1="${player1Score}"
                  score2="${player2Score}">
                </match-card>
              `;
            }).join('')
          }
        </div>
      </div>
    `;
  }
}

customElements.define('quote-view', QuoteView);

