/**
 * Add Match View Web Component
 * Main view component for adding a new match
 * Loads players from Supabase and submits new match data
 * 
 * Usage:
 * <add-match-view></add-match-view>
 */

import { fetchPlayersFromSupabase, insertMatchToSupabase } from '../../backend/supabase.js';
import { checkNodeCompletion, updateNodeStatus, advancePlayers, checkTournamentCompletion } from '../../backend/tournaments.js';

class AddMatchView extends HTMLElement {
  constructor() {
    super();
    this.players = [];
    this.isSubmitting = false;
    this.tournamentId = null;
    this.nodeId = null;
    this.preselectedPlayer1 = null;
    this.preselectedPlayer2 = null;
  }

  async connectedCallback() {
    // Read URL parameters for tournament context
    const urlParams = new URLSearchParams(window.location.search);
    this.tournamentId = urlParams.get('tournament');
    this.nodeId = urlParams.get('node');
    this.preselectedPlayer1 = urlParams.get('p1');
    this.preselectedPlayer2 = urlParams.get('p2');
    
    console.log('Tournament context:', {
      tournamentId: this.tournamentId,
      nodeId: this.nodeId,
      player1: this.preselectedPlayer1,
      player2: this.preselectedPlayer2
    });
    
    // Show loading state
    this.innerHTML = `
      <div class="bg-card rounded-2xl shadow-lg overflow-hidden p-6">
        <div class="text-center text-muted-foreground">Caricamento giocatori...</div>
      </div>
    `;
    
    try {
      // Load players from Supabase
      const playersData = await fetchPlayersFromSupabase();
      this.players = playersData.map(p => p.username);
      
      if (this.players.length === 0) {
        this.renderError('Nessun giocatore trovato nel database');
        return;
      }
      
      this.render();
      this.attachEventListeners();
      
    } catch (error) {
      console.error('Error loading players:', error);
      this.renderError(`Errore nel caricamento dei giocatori: ${error.message}`);
    }
  }
  
  render() {
    const isTournament = this.preselectedPlayer1 && this.preselectedPlayer2;
    const player1Value = this.preselectedPlayer1 || '';
    const player2Value = this.preselectedPlayer2 || '';
    
    const playersOptions = this.players.map(player => 
      `<option value="${player}">${player}</option>`
    ).join('');
    
    this.innerHTML = `
      <div class="max-w-2xl mx-auto">        
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            ${isTournament ? 'Aggiungi Partita Torneo' : 'Aggiungi Nuova Partita'}
          </div>
          
          <form id="add-match-form" class="p-6 space-y-6">
            ${isTournament ? `
              <!-- Hidden inputs for tournament preselected players -->
              <input type="hidden" name="player1" value="${player1Value}">
              <input type="hidden" name="player2" value="${player2Value}">
            ` : ''}
            
            <!-- Player Selection -->
            <div class="grid grid-cols-[1fr_auto_1fr] gap-0.5">
              <div class="flex flex-col gap-2">
                ${isTournament ? `
                  <!-- Display only for tournament -->
                  <div class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-muted text-foreground text-center opacity-70">
                    ${player1Value}
                  </div>
                ` : `
                  <select 
                    id="player1" 
                    name="player1" 
                    required
                    class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors text-center">
                    <option value="">Seleziona...</option>
                    ${playersOptions}
                  </select>
                `}
              </div>
              <div class="flex items-end py-2">
                <div class="text-xl font-bold text-primary text-center px-2">VS</div>
              </div>
              <div class="flex flex-col gap-2">
                ${isTournament ? `
                  <!-- Display only for tournament -->
                  <div class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-muted text-foreground text-center opacity-70">
                    ${player2Value}
                  </div>
                ` : `
                  <select 
                    id="player2" 
                    name="player2" 
                    required
                    class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors text-center">
                    <option value="">Seleziona...</option>
                    ${playersOptions}
                  </select>
                `}
              </div>
            </div>
            
            <!-- Score Inputs -->
            <div class="grid grid-cols-[1fr_auto_1fr] gap-1">
              <input 
                type="number" 
                id="score1" 
                name="score1" 
                min="0" 
                max="30"
                value="0"
                required
                class="w-full p-4 border-2 border-border rounded-xl font-bold text-4xl bg-card text-card-foreground text-center focus:outline-none focus:border-primary transition-colors"
                style="appearance: textfield; -moz-appearance: textfield;">
              <div class="flex items-center">
                <div class="text-3xl font-bold text-muted-foreground text-center px-2">-</div>
              </div>
              <input 
                type="number" 
                id="score2" 
                name="score2" 
                min="0" 
                max="30"
                value="0"
                required
                class="w-full p-4 border-2 border-border rounded-xl font-bold text-4xl bg-card text-card-foreground text-center focus:outline-none focus:border-primary transition-colors"
                style="appearance: textfield; -moz-appearance: textfield;">
            </div>
            
            <!-- Plus Buttons -->
            <div class="grid grid-cols-[1fr_auto_1fr] gap-4">
              <button 
                type="button" 
                id="score1-plus"
                class="w-full bg-gradient-to-br from-green-200 to-green-100 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 active:scale-95 text-3xl">
                ➕
              </button>
              <div></div>
              <button 
                type="button" 
                id="score2-plus"
                class="w-full bg-gradient-to-br from-green-200 to-green-100 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 active:scale-95 text-3xl">
                ➕
              </button>
            </div>
            
            <!-- Match Type -->
            <div>
              <label for="matchType" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tipo Partita
              </label>
              <select 
                id="matchType" 
                name="matchType" 
                required
                class="w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors">
                <option value="single-21">Singolo a 21</option>
                <option value="single-11">Singolo a 11</option>
              </select>
            </div>
            
            <!-- Error Message -->
            <div id="error-message" class="hidden p-4 rounded-lg bg-destructive/10 text-destructive text-sm"></div>
            
            <!-- Submit Button -->
            <button 
              type="submit" 
              id="submit-btn"
              class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-5 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              Aggiungi Partita
            </button>
          </form>
        </div>
      </div>
    `;
  }
  
  renderError(message) {
    this.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="mb-4">
          <button 
            onclick="window.location.href=window.getPath('/matches/')"
            class="text-foreground hover:text-foreground/80 font-semibold flex items-center gap-1.5 transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Torna alle Partite
          </button>
        </div>
        
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            Errore
          </div>
          <div class="p-6 text-center text-destructive">
            ${message}
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const form = this.querySelector('#add-match-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Set preselected players if in tournament context (only for non-tournament mode)
    if (!this.preselectedPlayer1 || !this.preselectedPlayer2) {
      if (this.preselectedPlayer1) {
        const player1Select = this.querySelector('#player1');
        if (player1Select) {
          player1Select.value = this.preselectedPlayer1;
        }
      }
      
      if (this.preselectedPlayer2) {
        const player2Select = this.querySelector('#player2');
        if (player2Select) {
          player2Select.value = this.preselectedPlayer2;
        }
      }
    }
    
    // Score plus buttons
    const score1Input = this.querySelector('#score1');
    const score1Plus = this.querySelector('#score1-plus');
    
    if (score1Plus && score1Input) {
      score1Plus.addEventListener('click', () => {
        const currentValue = parseInt(score1Input.value) || 0;
        if (currentValue < 30) {
          score1Input.value = currentValue + 1;
        }
      });
    }
    
    const score2Input = this.querySelector('#score2');
    const score2Plus = this.querySelector('#score2-plus');
    
    if (score2Plus && score2Input) {
      score2Plus.addEventListener('click', () => {
        const currentValue = parseInt(score2Input.value) || 0;
        if (currentValue < 30) {
          score2Input.value = currentValue + 1;
        }
      });
    }
    
    // Prevent same player selection
    const player1Select = this.querySelector('#player1');
    const player2Select = this.querySelector('#player2');
    
    if (player1Select && player2Select) {
      player1Select.addEventListener('change', () => {
        this.updatePlayerOptions();
      });
      
      player2Select.addEventListener('change', () => {
        this.updatePlayerOptions();
      });
    }
  }
  
  updatePlayerOptions() {
    const player1Select = this.querySelector('#player1');
    const player2Select = this.querySelector('#player2');
    
    if (!player1Select || !player2Select) return;
    
    const player1Value = player1Select.value;
    const player2Value = player2Select.value;
    
    // Update player2 options
    Array.from(player2Select.options).forEach(option => {
      if (option.value === '') return; // Skip the "Seleziona..." option
      option.disabled = option.value === player1Value;
    });
    
    // Update player1 options
    Array.from(player1Select.options).forEach(option => {
      if (option.value === '') return; // Skip the "Seleziona..." option
      option.disabled = option.value === player2Value;
    });
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    const form = event.target;
    const formData = new FormData(form);
    
    const player1 = formData.get('player1');
    const player2 = formData.get('player2');
    const score1 = parseInt(formData.get('score1'));
    const score2 = parseInt(formData.get('score2'));
    const matchType = formData.get('matchType');
    
    // Validation
    const errorDiv = this.querySelector('#error-message');
    errorDiv.classList.add('hidden');
    
    if (player1 === player2) {
      this.showError('I due giocatori devono essere diversi');
      return;
    }
    
    if (score1 === score2) {
      this.showError('I punteggi non possono essere uguali (non ci sono pareggi nel ping pong!)');
      return;
    }
    
    // Disable submit button
    this.isSubmitting = true;
    const submitBtn = this.querySelector('#submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvataggio in corso...';
    
    try {
      // Insert match to Supabase with tournament node if applicable
      await insertMatchToSupabase({
        player1,
        player2,
        score1,
        score2,
        matchType
      }, this.nodeId);
      
      // If tournament context, check node completion and advance players
      if (this.nodeId) {
        await this.handleNodeCompletion();
      }
      
      // Redirect based on context
      if (this.tournamentId && this.nodeId) {
        window.location.href = window.getPath(`/tornei/partite/?tournament=${this.tournamentId}&node=${this.nodeId}`);
      } else {
        window.location.href = window.getPath('/matches/');
      }
      
    } catch (error) {
      console.error('Error inserting match:', error);
      this.showError(`Errore nel salvataggio: ${error.message}`);
      
      // Re-enable submit button
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Aggiungi Partita';
    }
  }
  
  async handleNodeCompletion() {
    try {
      console.log('Checking node completion...');
      const { complete, rankings } = await checkNodeCompletion(this.tournamentId, this.nodeId);
      
      if (complete) {
        console.log('Node complete! Advancing players...');
        // Mark node as completed
        await updateNodeStatus(this.nodeId, 'completed');
        
        // Advance players to next nodes
        await advancePlayers(this.nodeId, rankings);
        
        // Check if tournament is complete
        await checkTournamentCompletion(this.tournamentId);
      }
    } catch (error) {
      console.error('Error handling node completion:', error);
      // Don't throw - we still want to redirect even if this fails
    }
  }
  
  showError(message) {
    const errorDiv = this.querySelector('#error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

customElements.define('add-match-view', AddMatchView);

