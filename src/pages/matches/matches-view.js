/**
 * Matches View Web Component
 * Main view component for the matches page
 * Displays paginated matches grouped by date, with newest first
 * 
 * Usage:
 * <matches-view></matches-view>
 */

import { getCurrentUser } from '../../backend/auth.js';
import { caricaConteggioPartite, caricaPartitePaginate } from '../../backend/matches-loader.js';

class MatchesView extends HTMLElement {
  constructor() {
    super();
    this.currentPage = 1;
    this.itemsPerPage = 20; // Adjust for mobile
    this.totalMatches = 0;
    this.totalPages = 0;
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

  async goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    await this.loadMatches();
  }

  /**
   * Groups matches by date (without time)
   * @param {Array} matches - Array of matches with timestamp
   * @returns {Object} Object with dates as keys and arrays of matches as values
   */
  groupMatchesByDate(matches) {
    const grouped = {};
    
    matches.forEach(match => {
      // Get date without time
      const date = new Date(match.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    
    return grouped;
  }

  /**
   * Generates pagination controls HTML
   * @returns {string} HTML for pagination controls
   */
  getPaginationHTML() {
    const prevDisabled = this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:from-primary/90 hover:to-primary/70 cursor-pointer';
    const nextDisabled = this.currentPage === this.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:from-primary/90 hover:to-primary/70 cursor-pointer';
    
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalMatches);
    
    // Generate page numbers to show (current, ±1, first, last)
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show pages around current
    for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(this.totalPages - 1, this.currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Always show last page if there's more than one page
    if (this.totalPages > 1 && !pageNumbers.includes(this.totalPages)) {
      pageNumbers.push(this.totalPages);
    }
    
    // Sort page numbers
    pageNumbers.sort((a, b) => a - b);
    
    // Generate page buttons with ellipsis
    const pageButtonsHTML = pageNumbers.map((pageNum, index) => {
      const prevPageNum = index > 0 ? pageNumbers[index - 1] : 0;
      const needsEllipsis = index > 0 && pageNum - prevPageNum > 1;
      const isActive = pageNum === this.currentPage;
      
      return `
        ${needsEllipsis ? '<span class="px-2 text-muted-foreground">...</span>' : ''}
        <button 
          class="px-4 py-2 rounded-lg font-semibold transition-all ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-primary/20'
          }"
          ${isActive ? 'disabled' : ''}
          onclick="document.querySelector('matches-view').goToPage(${pageNum})">
          ${pageNum}
        </button>
      `;
    }).join('');
    
    return `
      <div class="bg-card rounded-xl shadow-lg p-4 mb-4">
        <div class="flex items-center justify-between gap-2 mb-3">
          <button 
            class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold py-3 px-4 rounded-lg transition-all ${prevDisabled}"
            ${this.currentPage === 1 ? 'disabled' : ''}
            onclick="document.querySelector('matches-view').goToPage(${this.currentPage - 1})">
            ←
          </button>
          <div class="flex items-center justify-center gap-2 flex-wrap">
            ${pageButtonsHTML}
          </div>
          <button 
            class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold py-3 px-4 rounded-lg transition-all ${nextDisabled}"
            ${this.currentPage === this.totalPages ? 'disabled' : ''}
            onclick="document.querySelector('matches-view').goToPage(${this.currentPage + 1})">
            →
          </button>
        </div>
        <div class="text-center text-sm text-muted-foreground">
          Partite ${startItem}-${endItem} di ${this.totalMatches}
        </div>
      </div>
    `;
  }

  async loadMatches() {
    try {
      // Show loading state
      const loadingHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div class="p-10 text-center text-muted-foreground">Caricamento partite...</div>
        </div>
      `;
      
      // Keep the add match button and show loading for matches
      const addMatchBtn = this.querySelector('#add-match-btn');
      const currentHTML = addMatchBtn ? addMatchBtn.parentElement.outerHTML : '';
      
      this.innerHTML = currentHTML + loadingHTML;
      
      // Calculate range for Supabase
      // Supabase range is inclusive, so for page 1 with 20 items: range(0, 19)
      // We want newest first, so ascending=false
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const stopIndex = startIndex + this.itemsPerPage - 1;
      
      // Fetch paginated matches (newest first)
      const partite = await caricaPartitePaginate(startIndex, stopIndex, false);
      
      if (partite.length === 0 && this.currentPage === 1) {
        this.innerHTML = currentHTML + `
          <div class="bg-card rounded-2xl shadow-lg overflow-hidden">
            <div class="p-10 text-center text-destructive">Nessuna partita trovata</div>
          </div>
        `;
        return;
      }
      
      // Group matches by date
      const groupedMatches = this.groupMatchesByDate(partite);
      
      // Sort dates in descending order (newest first)
      const sortedDates = Object.keys(groupedMatches).sort((a, b) => new Date(b) - new Date(a));
      
      // Calculate global match numbers
      // Since we're showing newest first, the first match on page 1 is the total count
      const firstMatchNumber = this.totalMatches - (this.currentPage - 1) * this.itemsPerPage;
      
      // Generate HTML for each date group
      let matchIndex = 0;
      const matchesGroupHTML = sortedDates.map(dateKey => {
        const dateMatches = groupedMatches[dateKey];
        
        // Sort matches within the day by timestamp (newest first)
        dateMatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const matchesHTML = dateMatches.map(partita => {
          const matchNumber = firstMatchNumber - matchIndex;
          const globalIndex = matchNumber - 1; // Zero-based index for navigation
          matchIndex++;
          
          return `
            <match-card 
              match-number="${matchNumber}"
              match-index="${globalIndex}"
              player1="${partita.giocatore1}"
              player2="${partita.giocatore2}"
              score1="${partita.punteggio1}"
              score2="${partita.punteggio2}">
            </match-card>
          `;
        }).join('');
        
        return `
          <date-group-header date="${dateKey}"></date-group-header>
          <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-2">
            <div class="divide-y divide-border">
              ${matchesHTML}
            </div>
          </div>
        `;
      }).join('');
      
      // Render complete view
      const paginationHTML = this.getPaginationHTML();
      
      this.innerHTML = `
        <div class="mb-4">
          <button 
            id="add-match-btn"
            class="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            style="padding: 0.5rem 1.5rem;">
            + Aggiungi Partita
          </button>
        </div>
        
        ${paginationHTML}
        
        ${matchesGroupHTML}
        
        ${paginationHTML}
      `;
      
      // Attach event listener to add match button
      const newAddMatchBtn = this.querySelector('#add-match-btn');
      if (newAddMatchBtn) {
        newAddMatchBtn.addEventListener('click', () => this.handleAddMatch());
      }
      
    } catch (error) {
      console.error('Error loading matches:', error);
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
        </div>
      `;
    }
  }

  async connectedCallback() {
    try {
      // Get total count first
      this.totalMatches = await caricaConteggioPartite();
      this.totalPages = Math.ceil(this.totalMatches / this.itemsPerPage);
      
      // Load first page
      await this.loadMatches();
      
    } catch (error) {
      console.error('Error initializing matches view:', error);
      this.innerHTML = `
        <div class="bg-card rounded-2xl shadow-lg overflow-hidden mb-5">
          <div class="p-10 text-center text-destructive">Errore: ${error.message}</div>
        </div>
      `;
    }
  }
}

customElements.define('matches-view', MatchesView);
