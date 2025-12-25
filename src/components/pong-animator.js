/**
 * Pong Animator Component
 * Renders an animated ping pong game on canvas synchronized to match state
 * 
 * Features:
 * - Ball hits paddle exactly every second
 * - Deterministic animation (all visitors see the same thing)
 * - AI-like paddle movement with imperfection
 * - Miss and net ending animations based on point winner
 * 
 * Usage:
 * const animator = new PongAnimator(canvasElement);
 * animator.animate(matchState);
 */
class PongAnimator {
    /**
     * Create a new Pong Animator
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Canvas dimensions
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game constants
        this.PADDLE_WIDTH = 15;
        this.PADDLE_HEIGHT = 80;
        this.BALL_RADIUS = 8;
        this.PADDLE_OFFSET = 30; // Distance from edge
        
        // Colors
        this.COLOR_PADDLE = '#ffffff';
        this.COLOR_BALL = '#ffff00';
        this.COLOR_LINE = 'rgba(255, 255, 255, 0.3)';
        
        // Animation state
        this.lastState = null;
        this.rng = null;
        this.initialBallAngle = 0;
        this.paddleImperfections = { A: [], B: [] };
        
        // Current positions
        this.ballX = 0;
        this.ballY = 0;
        this.paddleAY = 0;
        this.paddleBY = 0;
        
        // Last paddle positions when they hit the ball
        this.lastPaddleAY = undefined;
        this.lastPaddleBY = undefined;
        
        // Target positions for next hit
        this.targetPaddleAY = 0;
        this.targetPaddleBY = 0;
        
        // Ball trajectory for current segment (fixed at segment start)
        this.ballTrajectory = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };
        
        this.currentSegment = -1;
        
        // Track where the ball actually ends up (for next segment start)
        this.lastBallEndX = 0;
        this.lastBallEndY = 0;
        
        // Final ball position for BETWEEN_POINTS display
        this.finalBallX = 0;
        this.finalBallY = 0;
    }
    
    /**
     * Animate the pong game based on match state
     * @param {Object} state - Current match state from VirtualMatch
     */
    animate(state) {
        // Initialize RNG and deterministic values if this is a new point
        if (!this.lastState || 
            this.lastState.pointNumber !== state.pointNumber ||
            this.lastState.status !== state.status) {
            this.initializePoint(state);
        }
        
        if (state.status === "PLAYING") {
            this.animatePlaying(state);
        } else if (state.status === "BETWEEN_POINTS") {
            // Keep ball at final position from last segment
            // Ball position and paddle positions are already set from last frame
            this.render();
        }
        
        this.lastState = state;
    }
    
    /**
     * Initialize deterministic values for a new point
     * @param {Object} state - Match state
     */
    initializePoint(state) {
        // Use point number as seed for determinism
        const seed = state.pointNumber || 1;
        this.rng = new DeterministicRNG(seed * 12345);
        
        // Generate initial ball angle (15-45 degrees up or down)
        const angleRange = 30; // degrees
        const minAngle = 15;
        const angle = this.rng.nextFloat() * angleRange + minAngle;
        const upOrDown = this.rng.nextFloat() < 0.5 ? 1 : -1;
        this.initialBallAngle = (angle * Math.PI / 180) * upOrDown;
        
        // Generate paddle imperfections (small random offsets per hit)
        this.paddleImperfections = { A: [], B: [] };
        for (let i = 0; i < 20; i++) {
            this.paddleImperfections.A.push((this.rng.nextFloat() - 0.5) * 20);
            this.paddleImperfections.B.push((this.rng.nextFloat() - 0.5) * 20);
        }
        
        // Initialize paddle positions
        this.paddleAY = this.height / 2;
        this.paddleBY = this.height / 2;
        
        // Reset segment tracker to force recalculation
        this.currentSegment = -1;
        
        // Reset ball end positions
        this.lastBallEndX = 0;
        this.lastBallEndY = 0;
        
        // Reset final ball position
        this.finalBallX = 0;
        this.finalBallY = 0;
    }
    
    /**
     * Animate the playing state
     * @param {Object} state - Match state with progress, targetWinner, server, duration
     */
    animatePlaying(state) {
        const progress = state.progress || 0;
        const duration = state.totalDuration || state.duration || 5;
        const elapsedTime = progress * duration;
        
        // Calculate which hit we're between
        const currentHit = Math.floor(elapsedTime);
        const progressInCurrentSegment = elapsedTime - currentHit;
        
        // Determine ending type based on duration and winner
        const totalHits = Math.floor(duration);
        const lastHitTime = totalHits - 1;
        const receiver = state.server === "A" ? "B" : "A";
        
        // Who made the last hit?
        const lastHitter = (lastHitTime % 2 === 0) ? state.server : receiver;
        
        // Determine ending
        let endingType = "NORMAL";
        if (currentHit >= lastHitTime) {
            if (state.targetWinner === lastHitter) {
                endingType = "MISS"; // Winner hit, opponent misses
            } else {
                endingType = "NET"; // Loser hit into net
            }
        }
        
        // If we're in a new segment, calculate the fixed ball trajectory
        if (this.currentSegment !== currentHit) {
            this.calculateBallTrajectory(state, currentHit, endingType);
            this.currentSegment = currentHit;
        }
        
        // Update paddle positions (they move to intercept the ball's trajectory)
        this.updatePaddlePositions(state, currentHit, progressInCurrentSegment, endingType);
        
        // Update ball position along its fixed trajectory
        this.updateBallPosition(progressInCurrentSegment, endingType);
        
        // At the end of the segment, save the final ball position for BETWEEN_POINTS
        if (progressInCurrentSegment > 0.99) {
            this.finalBallX = this.ballX;
            this.finalBallY = this.ballY;
        }
        
        // Render everything
        this.render();
    }
    
    /**
     * Calculate the fixed trajectory for the ball at the start of a segment
     * This trajectory doesn't change during the segment
     * @param {Object} state - Match state
     * @param {number} currentHit - Which hit (0, 1, 2...)
     * @param {string} endingType - "NORMAL", "MISS", or "NET"
     */
    calculateBallTrajectory(state, currentHit, endingType) {
        const server = state.server;
        const receiver = server === "A" ? "B" : "A";
        
        // Determine who is hitting at currentHit
        const currentHitter = (currentHit % 2 === 0) ? server : receiver;
        const isMovingRight = currentHitter === "A";
        
        // Starting position - use where the ball ended in the previous segment
        let startX, startY;
        
        if (currentHit === 0) {
            // First hit - start from serving paddle
            startX = isMovingRight ? this.PADDLE_OFFSET + this.PADDLE_WIDTH : 
                                     this.width - this.PADDLE_OFFSET - this.PADDLE_WIDTH;
            startY = this.height / 2;
        } else {
            // Continue from where ball ended last segment
            startX = this.lastBallEndX;
            startY = this.lastBallEndY;
        }
        
        // Calculate ending position based on physics
        let endX, endY;
        
        if (endingType === "MISS") {
            // Ball goes past the receiving paddle
            endX = isMovingRight ? this.width + 50 : -50;
            
            // Calculate where ball would go based on physics
            const distance = this.width - (this.PADDLE_OFFSET * 2) - (this.PADDLE_WIDTH * 2);
            const angleForThisHit = this.initialBallAngle + (currentHit * 0.15);
            const verticalChange = Math.tan(angleForThisHit) * distance;
            endY = startY + verticalChange;
            
            // Apply bounces
            let bounces = 0;
            while (bounces < 10 && (endY < this.BALL_RADIUS || endY > this.height - this.BALL_RADIUS)) {
                if (endY < this.BALL_RADIUS) {
                    endY = this.BALL_RADIUS + (this.BALL_RADIUS - endY);
                } else if (endY > this.height - this.BALL_RADIUS) {
                    endY = (this.height - this.BALL_RADIUS) - (endY - (this.height - this.BALL_RADIUS));
                }
                bounces++;
            }
        } else if (endingType === "NET") {
            // Ball goes to center
            endX = this.width / 2;
            endY = this.height / 2;
        } else {
            // Normal trajectory - calculate physics-based endpoint
            endX = isMovingRight ? this.width - this.PADDLE_OFFSET - this.PADDLE_WIDTH : 
                                   this.PADDLE_OFFSET + this.PADDLE_WIDTH;
            
            // Calculate where ball will arrive based on angle and distance
            const distance = Math.abs(endX - startX);
            const angleForThisHit = this.initialBallAngle + (currentHit * 0.15);
            const verticalChange = Math.tan(angleForThisHit) * distance;
            
            endY = startY + verticalChange;
            
            // Handle wall bounces
            let bounces = 0;
            while (bounces < 10 && (endY < this.BALL_RADIUS || endY > this.height - this.BALL_RADIUS)) {
                if (endY < this.BALL_RADIUS) {
                    endY = this.BALL_RADIUS + (this.BALL_RADIUS - endY);
                } else if (endY > this.height - this.BALL_RADIUS) {
                    endY = (this.height - this.BALL_RADIUS) - (endY - (this.height - this.BALL_RADIUS));
                }
                bounces++;
            }
        }
        
        // Store the fixed trajectory
        this.ballTrajectory = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        };
        
        // Save the end position for the next segment
        this.lastBallEndX = endX;
        this.lastBallEndY = endY;
    }
    
    /**
     * Update ball position along its fixed trajectory
     * @param {number} progress - Progress within current segment (0-1)
     * @param {string} endingType - "NORMAL", "MISS", or "NET"
     */
    updateBallPosition(progress, endingType) {
        // Pure linear interpolation along the fixed trajectory
        this.ballX = this.ballTrajectory.startX + 
                     (this.ballTrajectory.endX - this.ballTrajectory.startX) * progress;
        this.ballY = this.ballTrajectory.startY + 
                     (this.ballTrajectory.endY - this.ballTrajectory.startY) * progress;
        
        // For NET ending, add falling effect after reaching center
        if (endingType === "NET" && progress > 0.5) {
            const fallProgress = (progress - 0.5) / 0.5;
            this.ballY += fallProgress * 100; // Ball falls down
        }
        
        // Clamp to court bounds
        if (this.ballY < this.BALL_RADIUS) {
            this.ballY = this.BALL_RADIUS;
        } else if (this.ballY > this.height - this.BALL_RADIUS) {
            this.ballY = this.height - this.BALL_RADIUS;
        }
    }
    
    /**
     * Update paddle positions with AI-like tracking
     * Paddles move to intercept the ball's FIXED trajectory
     * @param {Object} state - Match state
     * @param {number} currentHit - Which hit we're on
     * @param {number} progressInSegment - Progress within current segment (0-1)
     * @param {string} endingType - "NORMAL", "MISS", or "NET"
     */
    updatePaddlePositions(state, currentHit, progressInSegment, endingType) {
        const server = state.server;
        const receiver = server === "A" ? "B" : "A";
        
        // Determine who hit this time and who hits next
        const currentHitter = (currentHit % 2 === 0) ? server : receiver;
        const nextHitter = ((currentHit + 1) % 2 === 0) ? server : receiver;
        
        // At the start of the segment, ensure hitting paddle is at the ball's start position
        if (progressInSegment < 0.1) {
            if (currentHitter === "A") {
                this.paddleAY = this.ballTrajectory.startY;
            } else {
                this.paddleBY = this.ballTrajectory.startY;
            }
        }
        
        // The target is where the ball's trajectory will end (from the fixed trajectory)
        // Add imperfection to make it more realistic
        const imperfectionA = this.paddleImperfections.A[(currentHit + 1) % 20] || 0;
        const imperfectionB = this.paddleImperfections.B[(currentHit + 1) % 20] || 0;
        
        const targetWithImperfectionA = this.ballTrajectory.endY + imperfectionA;
        const targetWithImperfectionB = this.ballTrajectory.endY + imperfectionB;
        
        // Clamp targets
        this.targetPaddleAY = Math.max(this.PADDLE_HEIGHT / 2, 
                                       Math.min(this.height - this.PADDLE_HEIGHT / 2, targetWithImperfectionA));
        this.targetPaddleBY = Math.max(this.PADDLE_HEIGHT / 2, 
                                       Math.min(this.height - this.PADDLE_HEIGHT / 2, targetWithImperfectionB));
        
        // Only move the paddle that will receive the ball
        // Start moving after 30% of the segment (reaction delay)
        const moveThreshold = 0.3;
        
        if (progressInSegment >= moveThreshold && endingType === "NORMAL") {
            const trackingSpeed = 0.25;
            
            if (nextHitter === "A") {
                this.paddleAY += (this.targetPaddleAY - this.paddleAY) * trackingSpeed;
            } else {
                this.paddleBY += (this.targetPaddleBY - this.paddleBY) * trackingSpeed;
            }
        }
        
        // For MISS ending, receiving paddle should move but not reach in time
        if (endingType === "MISS" && progressInSegment >= moveThreshold) {
            const slowTrackingSpeed = 0.15;
            
            if (nextHitter === "A") {
                this.paddleAY += (this.targetPaddleAY - this.paddleAY) * slowTrackingSpeed;
            } else {
                this.paddleBY += (this.targetPaddleBY - this.paddleBY) * slowTrackingSpeed;
            }
        }
        
        // Ensure receiving paddle reaches target by the end
        if (progressInSegment > 0.9 && endingType === "NORMAL") {
            // Snap to exact position at the end
            if (nextHitter === "A") {
                this.paddleAY = this.targetPaddleAY;
            } else {
                this.paddleBY = this.targetPaddleBY;
            }
        }
        
        // Clamp paddles to canvas bounds
        this.paddleAY = Math.max(this.PADDLE_HEIGHT / 2, 
                                 Math.min(this.height - this.PADDLE_HEIGHT / 2, this.paddleAY));
        this.paddleBY = Math.max(this.PADDLE_HEIGHT / 2, 
                                 Math.min(this.height - this.PADDLE_HEIGHT / 2, this.paddleBY));
    }
    
    /**
     * Render the pong game on canvas
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a5f3f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw center line (dashed)
        this.ctx.strokeStyle = this.COLOR_LINE;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset dash
        
        // Draw paddle A (left)
        this.ctx.fillStyle = this.COLOR_PADDLE;
        this.ctx.fillRect(
            this.PADDLE_OFFSET,
            this.paddleAY - this.PADDLE_HEIGHT / 2,
            this.PADDLE_WIDTH,
            this.PADDLE_HEIGHT
        );
        
        // Draw paddle B (right)
        this.ctx.fillRect(
            this.width - this.PADDLE_OFFSET - this.PADDLE_WIDTH,
            this.paddleBY - this.PADDLE_HEIGHT / 2,
            this.PADDLE_WIDTH,
            this.PADDLE_HEIGHT
        );
        
        // Draw ball
        this.ctx.fillStyle = this.COLOR_BALL;
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
