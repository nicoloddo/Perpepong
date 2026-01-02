/**
 * Tornei View Web Component
 * Main view component for the tournaments listing page
 * Displays all tournaments with status and navigation
 * 
 * Usage:
 * <tornei-view></tornei-view>
 */

import { fetchTournaments } from '../../backend/tournaments.js';
import { getCurrentUser } from '../../backend/auth.js';

class TorneiView extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = '<div class="p-10 text-center text-muted-foreground">Caricamento tornei...</div>';
    
    try {
      // Check if user is logged in
      const { user } = await getCurrentUser();
      
      // Fetch tournaments
      const tournaments = await fetchTournaments();
      
      this.render(tournaments, user);
      
    } catch (error) {
      console.error('Error loading tournaments:', error);
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore nel caricamento dei tornei: ${error.message}</div>
        </div>
      `;
    }
  }
  
  async handleCreateTournament() {
    // Check if user is logged in
    const { user } = await getCurrentUser();
    
    if (!user) {
      // Not logged in - redirect to auth page
      window.location.href = window.getPath('/auth/');
    } else {
      // Logged in - go to create tournament page
      window.location.href = window.getPath('/tornei/nuovo/');
    }
  }
  
  render(tournaments, user) {
    // Determine winner for completed tournaments
    const tournamentsWithWinners = tournaments.map(tournament => {
      let winner = null;
      
      if (tournament.status === 'completed') {
        // TODO: In future, fetch the actual winner from tournament nodes
        // For now, we'll leave it as null until match results are implemented
        winner = tournament.winner || null;
      }
      
      return {
        ...tournament,
        winner
      };
    });
    
    this.innerHTML = `
      <div class="mb-4">
        <button 
          id="create-tournament-btn"
          class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          style="padding: 0.5rem 1.5rem;">
          + Nuovo Torneo
        </button>
      </div>
      
      ${tournaments.length === 0 ? `
        <div class="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
          Nessun torneo disponibile. Crea il primo torneo!
        </div>
      ` : `
        <div class="space-y-3">
          ${tournamentsWithWinners.map(tournament => `
            <tournament-card
              id="${tournament.id}"
              name="${tournament.name}"
              status="${tournament.status}"
              ${tournament.winner ? `winner="${tournament.winner}"` : ''}>
            </tournament-card>
          `).join('')}
        </div>
      `}
    `;
    
    // Attach event listener to create button
    const createBtn = this.querySelector('#create-tournament-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.handleCreateTournament());
    }
  }
}

customElements.define('tornei-view', TorneiView);
