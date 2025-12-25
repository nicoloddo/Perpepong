/**
 * Virtual Match Engine
 * Deterministic ping pong match simulation using ELO-based probability
 * 
 * All visitors see the same match at the same time because:
 * - Same seed → same RNG sequence → same match outcome
 * - Match is precomputed instantly at page load
 * - Current state is determined by elapsed time from match start
 * 
 * Usage:
 * const match = new VirtualMatch(seed, playerA, playerB);
 * const state = match.getStateAt(elapsedSeconds);
 */
class VirtualMatch {
    /**
     * Create and precompute a virtual match
     * @param {number} seed - RNG seed (typically time block ID)
     * @param {Object} playerA - { name, elo }
     * @param {Object} playerB - { name, elo }
     */
    constructor(seed, playerA, playerB) {
        this.rng = new DeterministicRNG(seed);
        this.playerA = playerA;
        this.playerB = playerB;
        
        // Match state
        this.scoreA = 0;
        this.scoreB = 0;
        this.pointHistory = [];
        this.matchEnded = false;
        
        // Precompute the entire match
        this.precomputeMatch();
    }
    
    /**
     * Calculate point-winning probability for player A
     * Uses chess ELO formula to get MATCH win probability, then converts to per-point probability
     * @param {number} playerEloA - Player A's ELO rating
     * @param {number} playerEloB - Player B's ELO rating
     * @param {boolean} aIsServing - Whether player A is serving
     * @returns {number} Probability (0.0-1.0) that player A wins the point
     */
    calculatePointWinProbability(playerEloA, playerEloB, aIsServing) {
        // Chess ELO expected score formula gives MATCH win probability
        // P(A wins match) = 1 / (1 + 10^((ELO_B - ELO_A) / 400))
        const matchWinProb = 1 / (1 + Math.pow(10, (playerEloB - playerEloA) / 400));
        
        // Convert match win probability to per-point win probability
        // This ensures ELO translates directly to match outcomes, not individual points
        const perPointProb = this.matchWinProbToPerPointProb(matchWinProb);
        
        // Add serving advantage (currently 0% - no serving advantage)
        const servingBonus = aIsServing ? 0.0 : 0.0;
        
        // Apply serving bonus and clamp between 0.05 and 0.95
        const finalProb = perPointProb + servingBonus;
        return Math.max(0.05, Math.min(0.95, finalProb));
    }
    
    /**
     * Convert match win probability to per-point win probability
     * Uses empirical calibration for first-to-11 table tennis scoring
     * @param {number} matchWinProb - Desired match win probability (0.0-1.0)
     * @returns {number} Per-point win probability that achieves this match win rate
     */
    matchWinProbToPerPointProb(matchWinProb) {
        // Clamp input to valid range
        matchWinProb = Math.max(0.01, Math.min(0.99, matchWinProb));
        
        // Empirical calibration table for first-to-11 scoring
        // Format: [matchWinProb, perPointProb]
        const calibration = [
            [0.50, 0.500],
            [0.55, 0.505],
            [0.60, 0.520],
            [0.64, 0.535],
            [0.70, 0.560],
            [0.75, 0.575],
            [0.80, 0.610],
            [0.85, 0.630],
            [0.90, 0.640],
            [0.95, 0.665]
        ];
        
        // Linear interpolation between calibration points
        for (let i = 0; i < calibration.length - 1; i++) {
            const [match1, point1] = calibration[i];
            const [match2, point2] = calibration[i + 1];
            
            if (matchWinProb >= match1 && matchWinProb <= match2) {
                // Linear interpolation
                const t = (matchWinProb - match1) / (match2 - match1);
                return point1 + t * (point2 - point1);
            }
        }
        
        // Edge cases
        if (matchWinProb < 0.50) return 0.500;
        return 0.665;
    }
    
    /**
     * Check if match is over
     * Standard table tennis rules: first to 11, win by 2
     * @param {number} scoreA - Player A's score
     * @param {number} scoreB - Player B's score
     * @returns {boolean} Whether the match has ended
     */
    isMatchOver(scoreA, scoreB) {
        const maxScore = Math.max(scoreA, scoreB);
        const scoreDiff = Math.abs(scoreA - scoreB);
        return maxScore >= 11 && scoreDiff >= 2;
    }
    
    /**
     * Precompute the entire match point by point
     * This runs once at construction and takes ~1ms for a typical match
     */
    precomputeMatch() {
        let currentTime = 0;
        let server = "A"; // Player A serves first
        let pointCount = 0;
        
        while (!this.matchEnded) {
            // Calculate probability that player A wins this point
            const probA = this.calculatePointWinProbability(
                this.playerA.elo,
                this.playerB.elo,
                server === "A"
            );
            
            // Roll the dice - who wins this point?
            const winner = this.rng.nextFloat() < probA ? "A" : "B";
            
            // Determine how long this point takes (3-15 seconds)
            // Shorter points = quick ace/error, longer = extended rally
            const pointDuration = this.rng.nextInt(3, 15);
            
            // Update scores
            const oldScoreA = this.scoreA;
            const oldScoreB = this.scoreB;
            
            if (winner === "A") {
                this.scoreA++;
            } else {
                this.scoreB++;
            }
            
            // Record the point
            this.pointHistory.push({
                winner: winner,
                startTime: currentTime,
                endTime: currentTime + pointDuration,
                scoreBeforeA: oldScoreA,
                scoreBeforeB: oldScoreB,
                scoreAfterA: this.scoreA,
                scoreAfterB: this.scoreB,
                server: server,
                duration: pointDuration
            });
            
            currentTime += pointDuration;
            
            // Add a 3-second break between points (players reset)
            currentTime += 3;
            
            pointCount++;
            
            // Check if match is over
            if (this.isMatchOver(this.scoreA, this.scoreB)) {
                this.matchEnded = true;
            }
            
            // Update server (switch every 2 points, or every 1 in deuce)
            const isDeuce = this.scoreA >= 10 && this.scoreB >= 10;
            const switchInterval = isDeuce ? 1 : 2;
            
            if (pointCount % switchInterval === 0) {
                server = server === "A" ? "B" : "A";
            }
        }
        
        // Store total match duration
        this.totalDuration = currentTime;
    }
    
    /**
     * Get the current match state at a specific time
     * @param {number} elapsedSeconds - Seconds elapsed since match start
     * @returns {Object} Current match state
     */
    getStateAt(elapsedSeconds) {
        // Find which point is happening right now
        for (let i = 0; i < this.pointHistory.length; i++) {
            const point = this.pointHistory[i];
            
            // Are we in the middle of this point?
            if (elapsedSeconds >= point.startTime && elapsedSeconds < point.endTime) {
                return {
                    status: "PLAYING",
                    currentScore: {
                        A: point.scoreBeforeA,
                        B: point.scoreBeforeB
                    },
                    targetWinner: point.winner,
                    server: point.server,
                    secondsLeft: point.endTime - elapsedSeconds,
                    totalDuration: point.duration,
                    progress: (elapsedSeconds - point.startTime) / point.duration,
                    pointNumber: i + 1
                };
            }
            
            // Are we in the break after this point?
            if (elapsedSeconds >= point.endTime && elapsedSeconds < point.endTime + 3) {
                return {
                    status: "BETWEEN_POINTS",
                    currentScore: {
                        A: point.scoreAfterA,
                        B: point.scoreAfterB
                    },
                    lastWinner: point.winner,
                    nextServer: point.server,
                    secondsUntilNext: (point.endTime + 3) - elapsedSeconds,
                    pointNumber: i + 1
                };
            }
        }
        
        // Match has finished
        return {
            status: "FINISHED",
            finalScore: {
                A: this.scoreA,
                B: this.scoreB
            },
            winner: this.scoreA > this.scoreB ? "A" : "B",
            totalPoints: this.pointHistory.length,
            matchDuration: this.totalDuration
        };
    }
    
    /**
     * Get match summary/statistics
     * @returns {Object} Match statistics
     */
    getMatchStats() {
        let pointsWonByA = 0;
        let pointsWonByB = 0;
        
        for (const point of this.pointHistory) {
            if (point.winner === "A") pointsWonByA++;
            else pointsWonByB++;
        }
        
        return {
            playerA: {
                name: this.playerA.name,
                elo: this.playerA.elo,
                finalScore: this.scoreA,
                pointsWon: pointsWonByA
            },
            playerB: {
                name: this.playerB.name,
                elo: this.playerB.elo,
                finalScore: this.scoreB,
                pointsWon: pointsWonByB
            },
            totalPoints: this.pointHistory.length,
            matchDuration: this.totalDuration
        };
    }
}

