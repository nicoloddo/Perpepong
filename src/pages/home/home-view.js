/**
 * Home View Web Component
 * Main view component for the home page
 * Displays stats grid and players ranking
 * 
 * Usage:
 * <home-view></home-view>
 */

import { getCurrentUser } from '../../backend/auth.js';

class HomeView extends HTMLElement {
  constructor() {
    super();
    this.isExpanded = false;
  }

  async handleAddMatch() {
    // Check if user is logged in
    const { user } = await getCurrentUser();
    
    if (!user) {
      // Not logged in - redirect to auth page
      window.location.href = window.getPath('/auth/');
    } else {
      // Logged in - go to add match page
      window.location.href = window.getPath('/add-match/');
    }
  }

  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento dati...</div>';
    
    try {
      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = '<div class="p-10 text-center text-destructive">Nessuna partita trovata nel file matches.txt</div>';
        return;
      }
      
      const classifica = calcolaClassifica(partite);
      this.classifica = classifica;
      this.partite = partite;
      this.render();
      
    } catch (error) {
      this.innerHTML = `<div class="p-10 text-center text-destructive">Errore: ${error.message}</div>`;
    }
  }

  render() {
    const classifica = this.classifica;
    const partite = this.partite;
    
    // Calculate statistics
    const mediaElo = Math.round(classifica.reduce((sum, g) => sum + g.elo, 0) / classifica.length);
    const maxElo = Math.max(...classifica.map(g => g.elo));
    const minElo = Math.min(...classifica.map(g => g.elo));
    const totalePartite = partite.length;
    const numeroGiocatori = classifica.length;
    const mediaPartitePerGiocatore = Math.round(classifica.reduce((sum, g) => sum + g.partiteGiocate, 0) / classifica.length);
    const totalePuntiSegnati = classifica.reduce((sum, g) => sum + g.puntiSegnati, 0);
    const mediaPuntiPerPartita = Math.round(totalePuntiSegnati / (totalePartite * 2));
    
    // Top players
    const topElo = [...classifica].sort((a, b) => b.elo - a.elo).slice(0, 5);
    const topMatches = [...classifica].sort((a, b) => b.partiteGiocate - a.partiteGiocate).slice(0, 5);
    const topWinRate = [...classifica]
      .filter(g => g.partiteGiocate >= 3)
      .sort((a, b) => (b.vittorie / b.partiteGiocate) - (a.vittorie / a.partiteGiocate))
      .slice(0, 5);

    this.innerHTML = `
      <!-- Add Match Button - First Thing on Page -->
      <div class="mb-5">
        <button 
          id="add-match-btn-classifica"
          class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          style="padding: 0.75rem 1.5rem; font-size: 1.125rem;">
          + Aggiungi Partita
        </button>
      </div>

      <!-- Stats Section -->
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          Statistiche
        </div>
        
        <!-- Always visible stats -->
        <div class="p-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-muted/30 p-4 rounded-xl text-center">
              <div class="text-3xl font-bold text-primary mb-1">${numeroGiocatori}</div>
              <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Giocatori Totali</div>
            </div>
            <div class="bg-muted/30 p-4 rounded-xl text-center">
              <div class="text-3xl font-bold text-primary mb-1">${totalePartite}</div>
              <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Partite Giocate</div>
            </div>
          </div>
          
          <!-- Expandable stats -->
          <div id="expandable-stats" class="mt-3" style="display: ${this.isExpanded ? 'block' : 'none'}">
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${mediaElo}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Medio</div>
              </div>
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${maxElo}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Massimo</div>
              </div>
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${minElo}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Minimo</div>
              </div>
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${mediaPartitePerGiocatore}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Media Partite/Giocatore</div>
              </div>
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${mediaPuntiPerPartita}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Media Punti/Partita</div>
              </div>
              <div class="bg-muted/30 p-4 rounded-xl text-center">
                <div class="text-3xl font-bold text-primary mb-1">${totalePuntiSegnati}</div>
                <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Punti Totali Segnati</div>
              </div>
            </div>

            <!-- Top Players Sections -->
            <div class="mt-4 space-y-4">
              <div class="bg-muted/30 rounded-xl overflow-hidden">
                <div class="bg-primary/10 p-3 font-bold text-primary">
                  🏆 Miglior ELO Raggiunto
                </div>
                <div class="divide-y divide-border/50">
                  ${topElo.map((player, index) => `
                    <div class="flex items-center p-3">
                      <div class="text-lg font-bold text-primary min-w-[36px] text-center">${index + 1}°</div>
                      <div class="flex-1 ml-2">
                        <div class="text-base font-semibold">${player.nome}</div>
                      </div>
                      <div class="text-xl font-bold text-primary">${player.elo}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="bg-muted/30 rounded-xl overflow-hidden">
                <div class="bg-primary/10 p-3 font-bold text-primary">
                  🎯 Più Partite Giocate
                </div>
                <div class="divide-y divide-border/50">
                  ${topMatches.map((player, index) => `
                    <div class="flex items-center p-3">
                      <div class="text-lg font-bold text-primary min-w-[36px] text-center">${index + 1}°</div>
                      <div class="flex-1 ml-2">
                        <div class="text-base font-semibold">${player.nome}</div>
                      </div>
                      <div class="text-xl font-bold text-primary">${player.partiteGiocate}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="bg-muted/30 rounded-xl overflow-hidden">
                <div class="bg-primary/10 p-3 font-bold text-primary">
                  ⚡ Percentuale Vittorie
                </div>
                <div class="divide-y divide-border/50">
                  ${topWinRate.map((player, index) => {
                    const winRate = ((player.vittorie / player.partiteGiocate) * 100).toFixed(1);
                    return `
                      <div class="flex items-center p-3">
                        <div class="text-lg font-bold text-primary min-w-[36px] text-center">${index + 1}°</div>
                        <div class="flex-1 ml-2">
                          <div class="text-base font-semibold">${player.nome}</div>
                        </div>
                        <div class="text-xl font-bold text-primary">${winRate}%</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Expand/Collapse Button -->
          <button id="toggle-stats-btn" class="mt-3 py-2 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto">
            <span id="toggle-text">${this.isExpanded ? '▲ Nascondi statistiche' : '▼ Mostra tutte le statistiche'}</span>
          </button>
        </div>
      </div>

      <!-- Players Section -->
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          Classifica Giocatori
        </div>
        <players-ranking class="divide-y divide-border"></players-ranking>
      </div>
    `;
    
    // Add event listener for toggle button
    const toggleBtn = this.querySelector('#toggle-stats-btn');
    const expandableStats = this.querySelector('#expandable-stats');
    const toggleText = this.querySelector('#toggle-text');
    
    if (toggleBtn && expandableStats) {
      toggleBtn.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        
        // Toggle visibility
        if (this.isExpanded) {
          expandableStats.style.display = 'block';
          toggleText.textContent = '▲ Nascondi statistiche';
        } else {
          expandableStats.style.display = 'none';
          toggleText.textContent = '▼ Mostra tutte le statistiche';
        }
      });
    }

    // Add event listener for add match button
    const addMatchBtn = this.querySelector('#add-match-btn-classifica');
    if (addMatchBtn) {
      addMatchBtn.addEventListener('click', () => this.handleAddMatch());
    }
  }
}

customElements.define('home-view', HomeView);
