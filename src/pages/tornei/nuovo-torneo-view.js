/**
 * Nuovo Torneo View Web Component
 * Multi-step tournament creation flow
 * Step 1: Player selection
 * Step 2: Tournament settings
 * Step 3: Automatic creation and redirect
 * 
 * Usage:
 * <nuovo-torneo-view></nuovo-torneo-view>
 */

import { fetchPlayersFromSupabase } from '../../backend/supabase.js';
import { caricaPartite } from '../../backend/matches-loader.js';
import { calcolaClassifica } from '../../backend/rankings.js';
import { 
  createTournament, 
  createTournamentNode, 
  distributePlayersBalanced,
  distributePlayersClustered,
  distributePlayersRandom,
  updateTournamentStatus
} from '../../backend/tournaments.js';

class NuovoTorneoView extends HTMLElement {
  constructor() {
    super();
    this.currentStep = 1;
    this.selectedPlayers = new Set();
    this.tournamentSettings = {
      name: '',
      hasGroupStage: true,
      distributionStrategy: 'balanced',
      gamesPerNode: {
        group: 1,
        semifinal: 1,
        final: 1
      }
    };
  }

  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento...</div>';
    
    try {
      // Load players
      const players = await fetchPlayersFromSupabase();
      
      // Load ELO data
      const partite = await caricaPartite();
      const classifica = calcolaClassifica(partite);
      
      // Merge player data with ELO
      this.players = players.map(player => {
        const eloData = classifica.find(c => c.nome === player.username);
        return {
          username: player.username,
          email: player.email,
          elo: eloData ? eloData.elo : 1500
        };
      });
      
      this.renderStep1();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
        </div>
      `;
    }
  }
  
  renderStep1() {
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <h2 class="text-xl font-bold">Nuovo Torneo - Step 1/3</h2>
          <p class="text-sm opacity-90 mt-1">Seleziona i partecipanti</p>
        </div>
        
        <div class="p-5">
          <div class="text-sm text-muted-foreground mb-4">
            Selezionati: <span id="selected-count" class="font-bold text-primary">${this.selectedPlayers.size}</span> giocatori
            <span class="text-destructive">(Minimo 4 richiesti)</span>
          </div>
          
          <div class="space-y-2 mb-6">
            ${this.players.map(player => `
              <label class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input 
                  type="checkbox" 
                  value="${player.username}"
                  ${this.selectedPlayers.has(player.username) ? 'checked' : ''}
                  onchange="document.querySelector('nuovo-torneo-view').togglePlayer('${player.username}')"
                  class="w-5 h-5 text-primary rounded">
                <div class="flex-1">
                  <div class="font-semibold">${player.username}</div>
                  <div class="text-xs text-muted-foreground">ELO: ${player.elo}</div>
                </div>
              </label>
            `).join('')}
          </div>
          
          <button 
            id="next-step-btn"
            class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            ${this.selectedPlayers.size < 4 ? 'disabled' : ''}
            onclick="document.querySelector('nuovo-torneo-view').goToStep2()">
            Avanti →
          </button>
        </div>
      </div>
    `;
  }
  
  togglePlayer(username) {
    if (this.selectedPlayers.has(username)) {
      this.selectedPlayers.delete(username);
    } else {
      this.selectedPlayers.add(username);
    }
    
    // Update count and button state
    const countEl = this.querySelector('#selected-count');
    const nextBtn = this.querySelector('#next-step-btn');
    
    if (countEl) {
      countEl.textContent = this.selectedPlayers.size;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.selectedPlayers.size < 4;
    }
  }
  
  goToStep2() {
    this.currentStep = 2;
    this.renderStep2();
  }
  
  renderStep2() {
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <h2 class="text-xl font-bold">Nuovo Torneo - Step 2/3</h2>
          <p class="text-sm opacity-90 mt-1">Configura il torneo</p>
        </div>
        
        <div class="p-5">
          <form id="tournament-settings-form" class="space-y-6">
            <!-- Tournament Name -->
            <div>
              <label class="block text-sm font-semibold mb-2">Nome del Torneo</label>
              <input 
                type="text" 
                id="tournament-name"
                class="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none"
                placeholder="Es: Coppa di Natale 2026"
                required>
            </div>
            
            <!-- Group Stage Toggle -->
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="has-group-stage"
                  checked
                  class="w-5 h-5 text-primary rounded">
                <div>
                  <div class="font-semibold">Fase a Gironi</div>
                  <div class="text-xs text-muted-foreground">Abilita una fase a gironi prima dell'eliminazione diretta</div>
                </div>
              </label>
            </div>
            
            <!-- Distribution Strategy -->
            <div>
              <label class="block text-sm font-semibold mb-2">Strategia di Distribuzione Giocatori</label>
              <select 
                id="distribution-strategy"
                class="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none">
                <option value="balanced">Bilanciato - ELO distribuito equamente tra i gironi</option>
                <option value="clustered">Cluster ELO - Giocatori con ELO simile nello stesso girone</option>
                <option value="random">Casuale - Distribuzione completamente casuale</option>
              </select>
            </div>
            
            <div class="flex gap-3">
              <button 
                type="button"
                class="flex-1 bg-muted hover:bg-muted/70 text-foreground font-bold py-3 rounded-xl shadow-lg transition-all duration-200"
                onclick="document.querySelector('nuovo-torneo-view').goBackToStep1()">
                ← Indietro
              </button>
              
              <button 
                type="submit"
                class="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-3 rounded-xl shadow-lg transition-all duration-200">
                Avanti →
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Attach form submit handler
    const form = this.querySelector('#tournament-settings-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveStep2AndContinue();
      });
    }
  }
  
  saveStep2AndContinue() {
    // Save settings from step 2
    this.tournamentSettings.name = document.getElementById('tournament-name')?.value || 'Torneo Senza Nome';
    this.tournamentSettings.hasGroupStage = document.getElementById('has-group-stage')?.checked || false;
    this.tournamentSettings.distributionStrategy = document.getElementById('distribution-strategy')?.value || 'balanced';
    
    console.log('Step 2 saved:', this.tournamentSettings);
    
    // Go to step 3
    this.currentStep = 3;
    this.renderStep3();
  }
  
  renderStep3() {
    const hasGroupStage = this.tournamentSettings.hasGroupStage;
    
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-5">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5">
          <h2 class="text-xl font-bold">Nuovo Torneo - Step 3/3</h2>
          <p class="text-sm opacity-90 mt-1">Configura le partite per fase</p>
        </div>
        
        <div class="p-5">
          <form id="games-per-node-form" class="space-y-6">
            ${hasGroupStage ? `
              <!-- Group Stage Games -->
              <div>
                <label class="block text-sm font-semibold mb-2">Fase a Gironi - Partite per coppia</label>
                <input 
                  type="number" 
                  id="games-group"
                  min="1" 
                  max="5"
                  value="${this.tournamentSettings.gamesPerNode.group}"
                  class="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none"
                  required>
                <p class="text-xs text-muted-foreground mt-1">
                  Quante partite devono giocare due giocatori dello stesso girone tra loro
                </p>
              </div>
            ` : ''}
            
            <!-- Semifinal Games -->
            <div>
              <label class="block text-sm font-semibold mb-2">Semifinali - Partite per coppia</label>
              <input 
                type="number" 
                id="games-semifinal"
                min="1" 
                max="5"
                value="${this.tournamentSettings.gamesPerNode.semifinal}"
                class="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none"
                required>
              <p class="text-xs text-muted-foreground mt-1">
                Quante partite devono giocare i due giocatori in una semifinale
              </p>
            </div>
            
            <!-- Final Games -->
            <div>
              <label class="block text-sm font-semibold mb-2">Finale - Partite per coppia</label>
              <input 
                type="number" 
                id="games-final"
                min="1" 
                max="5"
                value="${this.tournamentSettings.gamesPerNode.final}"
                class="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none"
                required>
              <p class="text-xs text-muted-foreground mt-1">
                Quante partite devono giocare i due giocatori in finale
              </p>
            </div>
            
            <div class="flex gap-3">
              <button 
                type="button"
                class="flex-1 bg-muted hover:bg-muted/70 text-foreground font-bold py-3 rounded-xl shadow-lg transition-all duration-200"
                onclick="document.querySelector('nuovo-torneo-view').goBackToStep2()">
                ← Indietro
              </button>
              
              <button 
                type="submit"
                class="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-3 rounded-xl shadow-lg transition-all duration-200">
                Crea Torneo
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Attach form submit handler
    const form = this.querySelector('#games-per-node-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createTournament();
      });
    }
  }
  
  goBackToStep2() {
    this.currentStep = 2;
    this.renderStep2();
  }
  
  goBackToStep1() {
    this.currentStep = 1;
    this.renderStep1();
  }
  
  async createTournament() {
    try {
      // Get games per node values from step 3 form
      const gamesGroup = parseInt(document.getElementById('games-group')?.value) || 1;
      const gamesSemifinal = parseInt(document.getElementById('games-semifinal')?.value) || 1;
      const gamesFinal = parseInt(document.getElementById('games-final')?.value) || 1;
      
      // Use saved settings from step 2
      const name = this.tournamentSettings.name;
      const hasGroupStage = this.tournamentSettings.hasGroupStage;
      const strategy = this.tournamentSettings.distributionStrategy;
      
      console.log('Creating tournament:', { name, hasGroupStage, strategy, gamesGroup, gamesSemifinal, gamesFinal });
      
      // Show loading state
      this.innerHTML = `
        <div class="bg-card rounded-xl shadow-lg p-10 text-center">
          <div class="text-lg text-primary font-bold mb-2">Creazione torneo in corso...</div>
          <div class="text-sm text-muted-foreground">Attendere prego</div>
        </div>
      `;
      
      // Get selected players with ELO data
      const selectedPlayersData = this.players.filter(p => this.selectedPlayers.has(p.username));
      
      // Create tournament with type-specific settings
      const settings = {
        win_pts: 3,
        draw_pts: 1,
        tiebreaker: 'goal_diff',
        has_group_stage: hasGroupStage,
        distribution_strategy: strategy,
        group: {
          games_per_pair: gamesGroup,
          ranking_strategy: 'points'
        },
        semifinal: {
          games_per_pair: gamesSemifinal,
          ranking_strategy: gamesSemifinal > 1 ? 'aggregate' : 'winner'
        },
        final: {
          games_per_pair: gamesFinal,
          ranking_strategy: gamesFinal > 1 ? 'aggregate' : 'winner'
        }
      };
      
      const participants = Array.from(this.selectedPlayers);
      
      const tournament = await createTournament(name, settings, participants);
      
      // Generate tournament structure
      if (hasGroupStage) {
        await this.createGroupStage(tournament.id, selectedPlayersData, strategy);
      }
      
      // Create knockout stage
      await this.createKnockoutStage(tournament.id, hasGroupStage, selectedPlayersData.length);
      
      // Update tournament status to active
      await updateTournamentStatus(tournament.id, 'active');
      
      // Redirect to tournament detail page
      window.location.href = window.getPath(`/tornei/dettaglio/?id=${tournament.id}`);
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      this.innerHTML = `
        <div class="bg-card rounded-xl shadow-lg p-10 text-center">
          <div class="text-lg text-destructive font-bold mb-2">Errore nella creazione</div>
          <div class="text-sm text-muted-foreground mb-4">${error.message}</div>
          <button 
            class="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg"
            onclick="document.querySelector('nuovo-torneo-view').goBackToStep1()">
            Riprova
          </button>
        </div>
      `;
    }
  }
  
  async createGroupStage(tournamentId, players, strategy) {
    console.log('Creating group stage:', { tournamentId, playerCount: players.length, strategy });
    
    // Determine number of groups (4 players per group minimum)
    const groupCount = Math.max(2, Math.floor(players.length / 4));
    console.log('Group count:', groupCount);
    
    // Distribute players
    let groups;
    if (strategy === 'balanced') {
      groups = distributePlayersBalanced(players, groupCount);
    } else if (strategy === 'clustered') {
      groups = distributePlayersClustered(players, groupCount);
    } else {
      groups = distributePlayersRandom(players, groupCount);
    }
    
    console.log('Groups distributed:', groups);
    
    // Create group nodes
    const groupLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Determine knockout structure
    // We always create 2 semifinals regardless of group count
    // Top player from each group goes to semifinal 1 or 2 in alternating pattern
    // Second place goes to opposite semifinal
    
    for (let i = 0; i < groups.length; i++) {
      // Map to only 2 semifinals
      // Group A winner -> SF1, Group A runner-up -> SF2
      // Group B winner -> SF2, Group B runner-up -> SF1
      const nextNodeMap = {
        '1': i % 2 === 0 ? 'semifinal_1' : 'semifinal_2',  // Winners alternate
        '2': i % 2 === 0 ? 'semifinal_2' : 'semifinal_1'   // Runners-up go opposite
      };
      
      console.log(`Creating group ${groupLetters[i]} with players:`, groups[i], 'mapping:', nextNodeMap);
      
      await createTournamentNode(
        tournamentId,
        'group',
        groupLetters[i],
        groups[i],
        nextNodeMap
      );
    }
    
    console.log('Group stage creation complete');
  }
  
  async createKnockoutStage(tournamentId, hasGroupStage, totalPlayers) {
    // Determine knockout structure based on player count
    const knockoutPlayers = hasGroupStage ? Math.min(8, totalPlayers) : totalPlayers;
    
    // Create semifinals
    await createTournamentNode(
      tournamentId,
      'semifinal',
      '1',
      [],
      { '1': 'final_1-2', '2': 'final_3-4' }
    );
    
    await createTournamentNode(
      tournamentId,
      'semifinal',
      '2',
      [],
      { '1': 'final_1-2', '2': 'final_3-4' }
    );
    
    // Create finals
    await createTournamentNode(
      tournamentId,
      'final',
      '1-2',
      [],
      {}
    );
    
    await createTournamentNode(
      tournamentId,
      'final',
      '3-4',
      [],
      {}
    );
  }
}

customElements.define('nuovo-torneo-view', NuovoTorneoView);
