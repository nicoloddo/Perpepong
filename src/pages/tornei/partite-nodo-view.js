/**
 * Partite Nodo View Web Component
 * Displays all matches for a tournament node (group or knockout stage)
 * Shows played matches with scores and unplayed matchups with add button
 * 
 * URL Parameters:
 * - tournament: Tournament UUID
 * - node: Node UUID
 * 
 * Usage:
 * <partite-nodo-view></partite-nodo-view>
 */

import { fetchTournamentById, fetchNodeById, fetchNodeMatches } from '../../backend/tournaments.js';

class PartiteNodoView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento partite...</div>';
    
    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const tournamentId = urlParams.get('tournament');
      const nodeId = urlParams.get('node');
      
      if (!tournamentId || !nodeId) {
        throw new Error('Parametri tournament o node mancanti');
      }
      
      // Fetch data
      const tournament = await fetchTournamentById(tournamentId);
      const node = await fetchNodeById(nodeId);
      const matches = await fetchNodeMatches(nodeId);
      
      this.render(tournament, node, matches);
      
    } catch (error) {
      console.error('Error loading node matches:', error);
      this.innerHTML = `
        <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
          <div class="text-center">
            <button 
              class="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg"
              onclick="window.history.back()">
              Indietro
            </button>
          </div>
        </div>
      `;
    }
  }
  
  generateMatchups(players, gamesPerPair) {
    const matchups = [];
    
    // Generate all unique pairs
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        // For each game per pair
        for (let game = 1; game <= gamesPerPair; game++) {
          matchups.push({
            player1: players[i],
            player2: players[j],
            gameNumber: game
          });
        }
      }
    }
    
    return matchups;
  }
  
  markPlayedMatchups(allMatchups, matches) {
    // Track which matches have been used to avoid marking multiple matchups with the same match
    const usedMatchIds = new Set();
    
    return allMatchups.map(matchup => {
      // Find a match for this specific game number that hasn't been used yet
      const playedMatch = matches.find(m => {
        if (usedMatchIds.has(m.id)) return false;
        return (m.player1 === matchup.player1 && m.player2 === matchup.player2) ||
               (m.player1 === matchup.player2 && m.player2 === matchup.player1);
      });
      
      if (playedMatch) {
        usedMatchIds.add(playedMatch.id);
        // Determine correct order
        const isNormalOrder = playedMatch.player1 === matchup.player1;
        return {
          ...matchup,
          played: true,
          score1: isNormalOrder ? playedMatch.score1 : playedMatch.score2,
          score2: isNormalOrder ? playedMatch.score2 : playedMatch.score1,
          matchId: playedMatch.id
        };
      }
      
      return {
        ...matchup,
        played: false
      };
    });
  }
  
  render(tournament, node, matches) {
    // Get node settings
    const nodeSettings = tournament.settings[node.type] || {};
    const gamesPerPair = nodeSettings.games_per_pair || 1;
    
    // Generate all matchups
    const allMatchups = this.generateMatchups(node.players, gamesPerPair);
    const matchupsWithStatus = this.markPlayedMatchups(allMatchups, matches);
    
    // Calculate progress
    const totalMatches = allMatchups.length;
    const playedMatches = matchupsWithStatus.filter(m => m.played).length;
    const progressPercent = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;
    
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <div class="flex items-center gap-3 mb-3">
            <button 
              class="text-primary-foreground/80 hover:text-primary-foreground"
              onclick="window.location.href = window.getPath('/tornei/dettaglio/?id=${tournament.id}')">
              ← Indietro
            </button>
          </div>
          <h1 class="text-2xl font-bold">${node.name}</h1>
          <p class="text-sm opacity-90 mt-1">${tournament.name}</p>
          
          <div class="mt-4">
            <div class="flex items-center justify-between text-sm mb-1">
              <span>Progresso</span>
              <span class="font-bold">${playedMatches}/${totalMatches} partite</span>
            </div>
            <div class="w-full bg-primary-foreground/20 rounded-full h-2">
              <div class="bg-primary-foreground rounded-full h-2 transition-all" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
        
        <div class="p-5">
          <div class="space-y-3">
            ${matchupsWithStatus.map(matchup => this.renderMatchupCard(matchup, tournament.id, node.id, gamesPerPair)).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  renderMatchupCard(matchup, tournamentId, nodeId, gamesPerPair) {
    if (matchup.played) {
      // Show completed match
      const winner = matchup.score1 > matchup.score2 ? matchup.player1 : matchup.player2;
      
      return `
        <div class="bg-muted/30 rounded-lg p-4 border-2 border-border">
          <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div class="text-center ${matchup.player1 === winner ? 'font-bold text-primary' : 'text-muted-foreground'}">
              ${matchup.player1}
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">
                ${matchup.score1} - ${matchup.score2}
              </div>
              ${gamesPerPair > 1 ? `<div class="text-xs text-muted-foreground mt-1">Partita ${matchup.gameNumber}</div>` : ''}
            </div>
            <div class="text-center ${matchup.player2 === winner ? 'font-bold text-primary' : 'text-muted-foreground'}">
              ${matchup.player2}
            </div>
          </div>
        </div>
      `;
    } else {
      // Show unplayed matchup with add button
      return `
        <div class="bg-card border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
          <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div class="text-center font-semibold">
              ${matchup.player1}
            </div>
            <div class="text-center">
              <button 
                class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-all"
                onclick="window.location.href = window.getPath('/add-match/?tournament=${encodeURIComponent(tournamentId)}&node=${encodeURIComponent(nodeId)}&p1=${encodeURIComponent(matchup.player1)}&p2=${encodeURIComponent(matchup.player2)}')">
                + Aggiungi
              </button>
              ${gamesPerPair > 1 ? `<div class="text-xs text-muted-foreground mt-1">Partita ${matchup.gameNumber}</div>` : ''}
            </div>
            <div class="text-center font-semibold">
              ${matchup.player2}
            </div>
          </div>
        </div>
      `;
    }
  }
}

customElements.define('partite-nodo-view', PartiteNodoView);
