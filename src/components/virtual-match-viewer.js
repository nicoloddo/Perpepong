/**
 * Virtual Match Viewer Web Component
 * Displays a live virtual ping pong match synchronized across all visitors
 * 
 * This component:
 * - Calculates time block to ensure all visitors see the same match
 * - Loads real player ELO data
 * - Uses deterministic RNG to select players
 * - Runs a game loop at 60fps to update the display
 * 
 * Usage:
 * <virtual-match-viewer></virtual-match-viewer>
 */
class VirtualMatchViewer extends HTMLElement {
    async connectedCallback() {
        // Ensure the component is displayed as block with proper spacing
        this.style.display = 'block';
        this.style.marginBottom = '1rem';
        
        // Show loading state
        this.innerHTML = `
            <div class="bg-card p-6 rounded-xl shadow-lg text-center">
                <div class="text-lg text-muted-foreground">Caricamento partita virtuale...</div>
            </div>
        `;
        
        try {
            // Load real player data
            const partite = await caricaPartite();
            const classifica = calcolaClassifica(partite);
            
            if (classifica.length < 2) {
                this.innerHTML = `
                    <div class="bg-card p-6 rounded-xl shadow-lg text-center">
                        <div class="text-lg text-destructive">Servono almeno 2 giocatori per una partita virtuale!</div>
                    </div>
                `;
                return;
            }
            
            // Initialize the match
            this.initMatch(classifica);
            
            // Start the game loop
            this.startGameLoop();
        } catch (error) {
            console.error('Errore nel caricamento della partita virtuale:', error);
            this.innerHTML = `
                <div class="bg-card p-6 rounded-xl shadow-lg text-center">
                    <div class="text-lg text-destructive">Errore nel caricamento della partita</div>
                    <div class="text-sm text-muted-foreground mt-2">${error.message}</div>
                </div>
            `;
        }
    }
    
    /**
     * Initialize the match with time-block synchronization
     * @param {Array} classifica - Array of players with ELO ratings
     */
    initMatch(classifica) {
        // Calculate the current 10-minute time block
        // All visitors worldwide calculate the same block ID at any given moment
        const BLOCK_DURATION = 600 * 1000; // 10 minutes in milliseconds
        const now = Date.now();
        this.currentBlockID = Math.floor(now / BLOCK_DURATION);
        this.blockStartTime = this.currentBlockID * BLOCK_DURATION;
        
        // Use the block ID as the seed for deterministic player selection
        const selectionRng = new DeterministicRNG(this.currentBlockID);
        
        // Pick two random players from the top 15 (or all if less than 15)
        const poolSize = Math.min(classifica.length, 15);
        const idx1 = selectionRng.nextInt(0, poolSize - 1);
        let idx2 = selectionRng.nextInt(0, poolSize - 1);
        
        // Ensure we pick two different players
        while (idx2 === idx1 && poolSize > 1) {
            idx2 = selectionRng.nextInt(0, poolSize - 1);
        }
        
        const playerA = {
            name: classifica[idx1].nome,
            elo: classifica[idx1].elo
        };
        
        const playerB = {
            name: classifica[idx2].nome,
            elo: classifica[idx2].elo
        };
        
        // Create the virtual match with the same block ID as seed
        // This ensures all visitors compute the exact same match
        this.match = new VirtualMatch(this.currentBlockID, playerA, playerB);
        
        console.log('Virtual match initialized:', {
            blockID: this.currentBlockID,
            playerA: playerA.name,
            playerB: playerB.name,
            eloA: playerA.elo,
            eloB: playerB.elo
        });
        
        // Dispatch event with player names so quote section can auto-populate
        this.dispatchEvent(new CustomEvent('match-initialized', {
            bubbles: true,
            detail: {
                player1: playerA.name,
                player2: playerB.name
            }
        }));
    }
    
    /**
     * Start the game loop that updates the display 60 times per second
     */
    startGameLoop() {
        const loop = () => {
            // Calculate elapsed time since match start
            const elapsed = (Date.now() - this.blockStartTime) / 1000; // in seconds
            
            // Get current match state
            const state = this.match.getStateAt(elapsed);
            
            // Render the appropriate view
            this.render(state);
            
            // Continue the loop
            this.animationFrame = requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    /**
     * Stop the game loop (cleanup)
     */
    disconnectedCallback() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    /**
     * Render the match state
     * @param {Object} state - Current match state
     */
    render(state) {
        if (state.status === "PLAYING") {
            this.renderPlayingPoint(state);
        } else if (state.status === "BETWEEN_POINTS") {
            this.renderBetweenPoints(state);
        } else if (state.status === "FINISHED") {
            this.renderFinished(state);
        }
    }
    
    /**
     * Render the playing state (point in progress)
     * @param {Object} state - Match state
     */
    renderPlayingPoint(state) {
        const progress = state.progress * 100;
        
        this.innerHTML = `
            <div class="bg-card p-6 rounded-xl shadow-lg space-y-6 mb-8">
                <!-- Header -->
                <div class="text-center">
                    <h2 class="text-xl font-bold text-primary mb-1">🏓 Partita Virtuale Live</h2>
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                        <span class="animate-pulse">●</span> LIVE
                    </span>
                </div>
                
                <!-- Players with Score in Between -->
                <div class="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
                    <!-- Player A -->
                    <div class="text-center p-4 bg-muted/30 rounded-lg ${state.server === "A" ? "ring-2 ring-primary" : ""}">
                        <div class="text-xl font-bold mb-1">${this.match.playerA.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerA.elo}</div>
                        <div class="text-xs font-semibold text-primary" style="visibility: ${state.server === "A" ? "visible" : "hidden"}">🎾 AL SERVIZIO</div>
                    </div>
                    
                    <!-- Score -->
                    <div class="text-center px-6">
                        <div class="text-6xl font-bold text-primary whitespace-nowrap">
                            ${state.currentScore.A} - ${state.currentScore.B}
                        </div>
                        <div class="text-sm text-muted-foreground mt-2">
                            Punto ${state.pointNumber} • ${Math.ceil(state.secondsLeft)}s
                        </div>
                    </div>
                    
                    <!-- Player B -->
                    <div class="text-center p-4 bg-muted/30 rounded-lg ${state.server === "B" ? "ring-2 ring-primary" : ""}">
                        <div class="text-xl font-bold mb-1">${this.match.playerB.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerB.elo}</div>
                        <div class="text-xs font-semibold text-primary" style="visibility: ${state.server === "B" ? "visible" : "hidden"}">🎾 AL SERVIZIO</div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full bg-accent rounded-full h-2 overflow-hidden">
                    <div class="bg-primary h-full transition-all duration-100" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render the between-points state
     * @param {Object} state - Match state
     */
    renderBetweenPoints(state) {
        const lastWinnerName = state.lastWinner === "A" ? this.match.playerA.name : this.match.playerB.name;
        
        this.innerHTML = `
            <div class="bg-card p-6 rounded-xl shadow-lg space-y-6 mb-8">
                <!-- Header -->
                <div class="text-center">
                    <h2 class="text-xl font-bold text-primary mb-1">🏓 Partita Virtuale Live</h2>
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                        <span class="animate-pulse">●</span> LIVE
                    </span>
                </div>
                
                <!-- Players with Score in Between -->
                <div class="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
                    <!-- Player A -->
                    <div class="text-center p-4 rounded-lg ${state.lastWinner === "A" ? "bg-green-500/10 ring-2 ring-green-500" : "bg-muted/30"}">
                        <div class="text-xl font-bold mb-1">${this.match.playerA.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerA.elo}</div>
                        <div class="text-xs font-semibold text-primary" style="visibility: hidden">🎾 AL SERVIZIO</div>
                    </div>
                    
                    <!-- Score -->
                    <div class="text-center px-6">
                        <div class="text-6xl font-bold text-primary whitespace-nowrap">
                            ${state.currentScore.A} - ${state.currentScore.B}
                        </div>
                        <div class="text-sm text-green-500 font-medium mt-2">
                            ✓ Punto a ${lastWinnerName}!
                        </div>
                    </div>
                    
                    <!-- Player B -->
                    <div class="text-center p-4 rounded-lg ${state.lastWinner === "B" ? "bg-green-500/10 ring-2 ring-green-500" : "bg-muted/30"}">
                        <div class="text-xl font-bold mb-1">${this.match.playerB.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerB.elo}</div>
                        <div class="text-xs font-semibold text-primary" style="visibility: hidden">🎾 AL SERVIZIO</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render the finished state
     * @param {Object} state - Match state
     */
    renderFinished(state) {
        const winnerName = state.winner === "A" ? this.match.playerA.name : this.match.playerB.name;
        
        // Calculate time until next match (next 10-minute block)
        const BLOCK_DURATION = 600 * 1000; // 10 minutes
        const now = Date.now();
        const nextBlockTime = (this.currentBlockID + 1) * BLOCK_DURATION;
        const secondsUntilNext = Math.ceil((nextBlockTime - now) / 1000);
        const minutesUntilNext = Math.floor(secondsUntilNext / 60);
        const remainingSeconds = secondsUntilNext % 60;
        
        this.innerHTML = `
            <div class="bg-card p-6 rounded-xl shadow-lg space-y-6 mb-8">
                <!-- Header -->
                <div class="text-center">
                    <h2 class="text-xl font-bold text-primary mb-2">🏓 Partita Conclusa!</h2>
                    <div class="text-lg text-green-500 font-bold">
                        Vittoria di ${winnerName}! 🎉
                    </div>
                </div>
                
                <!-- Players with Score in Between -->
                <div class="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
                    <!-- Player A -->
                    <div class="text-center p-4 rounded-lg ${state.winner === "A" ? "bg-green-500/10 ring-2 ring-green-500" : "bg-muted/30 opacity-60"}">
                        <div class="text-xl font-bold mb-1">${this.match.playerA.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerA.elo}</div>
                        <div class="text-2xl">${state.winner === "A" ? "👑" : ""}</div>
                    </div>
                    
                    <!-- Final Score -->
                    <div class="text-center px-6">
                        <div class="text-6xl font-bold text-primary whitespace-nowrap">
                            ${state.finalScore.A} - ${state.finalScore.B}
                        </div>
                    </div>
                    
                    <!-- Player B -->
                    <div class="text-center p-4 rounded-lg ${state.winner === "B" ? "bg-green-500/10 ring-2 ring-green-500" : "bg-muted/30 opacity-60"}">
                        <div class="text-xl font-bold mb-1">${this.match.playerB.name}</div>
                        <div class="text-xs text-muted-foreground mb-2">ELO: ${this.match.playerB.elo}</div>
                        <div class="text-2xl">${state.winner === "B" ? "👑" : ""}</div>
                    </div>
                </div>
                
                <!-- Countdown to next match -->
                <div class="text-center p-4 bg-accent rounded-lg">
                    <div class="text-sm text-muted-foreground mb-2">Prossima partita tra:</div>
                    <div class="text-3xl font-bold text-primary">
                        ${minutesUntilNext}:${remainingSeconds.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('virtual-match-viewer', VirtualMatchViewer);

