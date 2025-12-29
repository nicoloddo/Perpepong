/**
 * Add Match View Web Component
 * Main view component for adding a new match
 * Loads players from Supabase and submits new match data
 * 
 * Usage:
 * <add-match-view></add-match-view>
 */

import { fetchPlayersFromSupabase, insertMatchToSupabase } from '../../backend/supabase.js';

class AddMatchView extends HTMLElement {
  constructor() {
    super();
    this.players = [];
    this.isSubmitting = false;
  }

  async connectedCallback() {
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
    const playersOptions = this.players.map(player => 
      `<option value="${player}">${player}</option>`
    ).join('');
    
    this.innerHTML = `
      <div class="max-w-2xl mx-auto">        
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 text-lg font-bold">
            Aggiungi Nuova Partita
          </div>
          
          <form id="add-match-form" class="p-6 space-y-8">
            <!-- Player 1 -->
            <div>
              <label for="player1" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Giocatore 1
              </label>
              <select 
                id="player1" 
                name="player1" 
                required
                class="mb-4 w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors">
                <option value="">Seleziona giocatore</option>
                ${playersOptions}
              </select>
            </div>
            
            <!-- Score 1 -->
            <div>
              <label for="score1" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Punteggio Giocatore 1
              </label>
              <input 
                type="number" 
                id="score1" 
                name="score1" 
                min="0" 
                max="30"
                required
                class="mb-4 w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground focus:outline-none focus:border-primary transition-colors">
            </div>
            
            <!-- Player 2 -->
            <div>
              <label for="player2" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Giocatore 2
              </label>
              <select 
                id="player2" 
                name="player2" 
                required
                class="mb-4 w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground cursor-pointer focus:outline-none focus:border-primary transition-colors">
                <option value="">Seleziona giocatore</option>
                ${playersOptions}
              </select>
            </div>
            
            <!-- Score 2 -->
            <div>
              <label for="score2" class="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Punteggio Giocatore 2
              </label>
              <input 
                type="number" 
                id="score2" 
                name="score2" 
                min="0" 
                max="30"
                required
                class="mb-4 w-full p-3 border-2 border-border rounded-lg font-semibold bg-card text-card-foreground focus:outline-none focus:border-primary transition-colors">
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
      // Insert match to Supabase
      await insertMatchToSupabase({
        player1,
        player2,
        score1,
        score2,
        matchType
      });
      
      // Success! Redirect to matches page
      window.location.href = window.getPath('/matches/');
      
    } catch (error) {
      console.error('Error inserting match:', error);
      this.showError(`Errore nel salvataggio: ${error.message}`);
      
      // Re-enable submit button
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Aggiungi Partita';
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

