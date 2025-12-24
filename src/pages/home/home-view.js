/**
 * Home View Web Component
 * Main view component for the home page
 * Displays stats grid and players ranking
 * 
 * Usage:
 * <home-view></home-view>
 */
class HomeView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento dati...</div>';
    
    try {
      const partite = await caricaPartite();
      
      if (partite.length === 0) {
        this.innerHTML = '<div class="p-10 text-center text-destructive">Nessuna partita trovata nel file matches.txt</div>';
        return;
      }
      
      const classifica = calcolaClassifica(partite);
      const stats = calcolaStatisticheGlobali(classifica, partite.length);
      
      this.innerHTML = `
        <!-- Stats Grid -->
        <stats-grid 
          players-count="${stats.numeroGiocatori}"
          matches-count="${stats.numeroPartite}"
          average-elo="${stats.eloMedio}"
          max-elo="${stats.eloMassimo}">
        </stats-grid>

        <!-- Players Section -->
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            Classifica Giocatori
          </div>
          <players-ranking class="divide-y divide-border"></players-ranking>
        </div>
      `;
      
    } catch (error) {
      this.innerHTML = `<div class="p-10 text-center text-destructive">Errore: ${error.message}</div>`;
    }
  }
}

customElements.define('home-view', HomeView);
