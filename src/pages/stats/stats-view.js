/**
 * Stats View Web Component
 * Displays global statistics and top players leaderboards
 * Loads and calculates all data internally
 * 
 * Usage:
 * <stats-view></stats-view>
 */
class StatsView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-white text-xl">Caricamento statistiche...</div>';
    
    try {
      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = '<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Nessuna partita trovata nel file matches.txt</div>';
        return;
      }
      
      const classifica = calcolaClassifica(partite);
      this.render(classifica, partite);
      
    } catch (error) {
      this.innerHTML = `<div class="p-4 bg-destructive text-destructive-foreground rounded-xl text-center">Errore: ${error.message}</div>`;
    }
  }
  
  render(classifica, partite) {
    const mediaElo = Math.round(classifica.reduce((sum, g) => sum + g.elo, 0) / classifica.length);
    const maxElo = Math.max(...classifica.map(g => g.elo));
    const minElo = Math.min(...classifica.map(g => g.elo));
    const totalePartite = partite.length;
    const numeroGiocatori = classifica.length;
    const mediaPartitePerGiocatore = Math.round(classifica.reduce((sum, g) => sum + g.partiteGiocate, 0) / classifica.length);
    const totalePuntiSegnati = classifica.reduce((sum, g) => sum + g.puntiSegnati, 0);
    const mediaPuntiPerPartita = Math.round(totalePuntiSegnati / (totalePartite * 2));
    
    const topElo = [...classifica].sort((a, b) => b.elo - a.elo).slice(0, 5);
    const topMatches = [...classifica].sort((a, b) => b.partiteGiocate - a.partiteGiocate).slice(0, 5);
    const topWinRate = [...classifica]
      .filter(g => g.partiteGiocate >= 3)
      .sort((a, b) => (b.vittorie / b.partiteGiocate) - (a.vittorie / a.partiteGiocate))
      .slice(0, 5);

    this.innerHTML = `
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${numeroGiocatori}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Giocatori Totali</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${totalePartite}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Partite Giocate</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${mediaElo}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Medio</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${maxElo}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Massimo</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${minElo}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">ELO Minimo</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${mediaPartitePerGiocatore}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Media Partite/Giocatore</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${mediaPuntiPerPartita}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Media Punti/Partita</div>
        </div>
        <div class="bg-card p-4 rounded-xl shadow-md text-center">
          <div class="text-3xl font-bold text-primary mb-1">${totalePuntiSegnati}</div>
          <div class="text-muted-foreground text-xs uppercase font-semibold tracking-wide leading-tight">Punti Totali Segnati</div>
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-4">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          🏆 Miglior ELO Raggiunto
        </div>
        <div class="divide-y divide-border">
          ${topElo.map((player, index) => `
            <div class="flex items-center p-4">
              <div class="text-xl font-bold text-primary min-w-[44px] text-center">${index + 1}°</div>
              <div class="flex-1 ml-3">
                <div class="text-lg font-semibold">${player.nome}</div>
              </div>
              <div class="text-2xl font-bold text-primary">${player.elo}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-4">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          🎯 Più Partite Giocate
        </div>
        <div class="divide-y divide-border">
          ${topMatches.map((player, index) => `
            <div class="flex items-center p-4">
              <div class="text-xl font-bold text-primary min-w-[44px] text-center">${index + 1}°</div>
              <div class="flex-1 ml-3">
                <div class="text-lg font-semibold">${player.nome}</div>
              </div>
              <div class="text-2xl font-bold text-primary">${player.partiteGiocate}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-4">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
          ⚡ Percentuale Vittorie
        </div>
        <div class="divide-y divide-border">
          ${topWinRate.map((player, index) => {
            const winRate = ((player.vittorie / player.partiteGiocate) * 100).toFixed(1);
            return `
              <div class="flex items-center p-4">
                <div class="text-xl font-bold text-primary min-w-[44px] text-center">${index + 1}°</div>
                <div class="flex-1 ml-3">
                  <div class="text-lg font-semibold">${player.nome}</div>
                </div>
                <div class="text-2xl font-bold text-primary">${winRate}%</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}

customElements.define('stats-view', StatsView);

