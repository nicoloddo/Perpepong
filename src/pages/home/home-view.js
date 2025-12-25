/**
 * Home View Web Component
 * Main view component for the home page
 * Displays stats grid and players ranking
 * 
 * Usage:
 * <home-view></home-view>
 */
class HomeView extends HTMLElement {
  constructor() {
    super();
    this.isExpanded = false;
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
          <div id="expandable-stats" class="${this.isExpanded ? '' : 'hidden'} mt-3">
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
          <button id="toggle-stats-btn" class="w-full mt-3 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span id="toggle-text">${this.isExpanded ? 'Nascondi statistiche' : 'Mostra tutte le statistiche'}</span>
            <svg id="toggle-icon" class="w-5 h-5 transition-transform ${this.isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
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
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        this.render();
      });
    }
  }
}

customElements.define('home-view', HomeView);
