/**
 * Deterministic Random Number Generator
 * Park-Miller Linear Congruential Generator
 * 
 * Ensures identical random sequences across all clients when using the same seed.
 * This is critical for synchronizing the virtual match across all visitors.
 * 
 * Usage:
 * const rng = new DeterministicRNG(12345);
 * const randomFloat = rng.nextFloat(); // 0.0 to 1.0
 * const randomInt = rng.nextInt(1, 10); // 1 to 10 inclusive
 */
class DeterministicRNG {
    /**
     * Initialize the RNG with a seed
     * @param {number} seed - The seed value (same seed = same sequence)
     */
    constructor(seed) {
        this.state = seed;
    }
    
    /**
     * Generate the next random float between 0.0 and 1.0
     * Uses Park-Miller constants for high-quality pseudo-random numbers
     * @returns {number} Random float between 0.0 and 1.0
     */
    nextFloat() {
        // Park-Miller "minimal standard" LCG constants
        // Multiplier: 16807 (7^5)
        // Modulus: 2147483647 (2^31 - 1, a Mersenne prime)
        this.state = (this.state * 16807) % 2147483647;
        return (this.state - 1) / 2147483646;
    }
    
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @returns {number} Random integer between min and max
     */
    nextInt(min, max) {
        return Math.floor(this.nextFloat() * (max - min + 1)) + min;
    }
}

