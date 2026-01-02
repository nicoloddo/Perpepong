/**
 * Torneo Dettaglio View Web Component
 * Displays tournament details with two tabs:
 * - Gironi (Group Stage)
 * - Eliminazione Diretta (Knockout Stage)
 * 
 * Usage:
 * <torneo-dettaglio-view></torneo-dettaglio-view>
 */

import { fetchTournamentById, fetchTournamentNodes } from '../../backend/tournaments.js';

class TorneoDettaglioView extends HTMLElement {
  constructor() {
    super();
    this.activeTab = 'gironi';
    this.tournament = null;
    this.nodes = [];
  }

  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento torneo...</div>';
    
    try {
      // Get tournament ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const tournamentId = urlParams.get('id');
      
      if (!tournamentId) {
        throw new Error('ID torneo mancante');
      }
      
      // Fetch tournament and nodes
      this.tournament = await fetchTournamentById(tournamentId);
      this.nodes = await fetchTournamentNodes(tournamentId);
      
      // Determine initial tab based on available data
      const hasGroups = this.nodes.some(n => n.type === 'group');
      this.activeTab = hasGroups ? 'gironi' : 'knockout';
      
      this.render();
      
    } catch (error) {
      console.error('Error loading tournament:', error);
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
          <div class="text-center">
            <button 
              class="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg"
              onclick="window.location.href = window.getPath('/tornei/')">
              Torna ai Tornei
            </button>
          </div>
        </div>
      `;
    }
  }
  
  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  }
  
  render() {
    const hasGroups = this.nodes.some(n => n.type === 'group');
    const hasKnockout = this.nodes.some(n => ['semifinal', 'final', 'quarterfinal'].includes(n.type));
    
    this.innerHTML = `
      <!-- Tournament Header -->
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <div class="flex items-center gap-3 mb-2">
            <button 
              class="text-primary-foreground/80 hover:text-primary-foreground"
              onclick="window.location.href = window.getPath('/tornei/')">
              ← Indietro
            </button>
          </div>
          <h1 class="text-2xl font-bold">${this.tournament.name}</h1>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-sm opacity-90">Stato:</span>
            <span class="px-2 py-1 bg-primary-foreground/20 rounded text-xs font-semibold uppercase">
              ${this.tournament.status}
            </span>
          </div>
        </div>
        
        <!-- Tabs -->
        ${(hasGroups || hasKnockout) ? `
          <div class="flex border-b border-border">
            ${hasGroups ? `
              <button 
                class="flex-1 py-3 font-semibold transition-all ${
                  this.activeTab === 'gironi' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/30'
                }"
                onclick="document.querySelector('torneo-dettaglio-view').switchTab('gironi')">
                Gironi
              </button>
            ` : ''}
            
            ${hasKnockout ? `
              <button 
                class="flex-1 py-3 font-semibold transition-all ${
                  this.activeTab === 'knockout' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/30'
                }"
                onclick="document.querySelector('torneo-dettaglio-view').switchTab('knockout')">
                Eliminazione Diretta
              </button>
            ` : ''}
          </div>
        ` : ''}
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        ${this.activeTab === 'gironi' ? this.renderGironiTab() : this.renderKnockoutTab()}
      </div>
    `;
  }
  
  renderGironiTab() {
    const groupNodes = this.nodes.filter(n => n.type === 'group');
    
    if (groupNodes.length === 0) {
      return `
        <div class="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
          Nessun girone configurato per questo torneo
        </div>
      `;
    }
    
    // Sort groups by type_var (A, B, C, etc.)
    groupNodes.sort((a, b) => a.type_var.localeCompare(b.type_var));
    
    return `
      <div class="space-y-4">
        ${groupNodes.map(node => {
          // For now, create mock standings since matches aren't implemented yet
          const players = node.players || [];
          const standings = players.map((username, index) => ({
            username,
            points: 0,
            wins: 0,
            losses: 0
          }));
          
          return `
            <group-ranking
              group-name="${node.name}"
              players='${JSON.stringify(standings)}'
              tournament-id="${this.tournament.id}"
              node-id="${node.id}">
            </group-ranking>
          `;
        }).join('')}
      </div>
    `;
  }
  
  renderKnockoutTab() {
    const knockoutNodes = this.nodes.filter(n => 
      ['semifinal', 'final', 'quarterfinal'].includes(n.type)
    );
    
    if (knockoutNodes.length === 0) {
      return `
        <div class="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
          Nessuna fase eliminatoria configurata per questo torneo
        </div>
      `;
    }
    
    return `
      <knockout-bracket
        nodes='${JSON.stringify(knockoutNodes)}'
        tournament-id="${this.tournament.id}">
      </knockout-bracket>
    `;
  }
}

customElements.define('torneo-dettaglio-view', TorneoDettaglioView);
