/**
 * Supabase Client Configuration
 * Handles connection to Supabase backend for match data
 */

// Import from CDN for browser compatibility
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase configuration
const SUPABASE_URL = 'https://mmyfqpsmnbczqnshubjs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aFTZs0WwWmgqxGC9DtbgLw_a6arCN6q';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Fetches all matches from Supabase
 * @returns {Promise<Array>} Array of match objects from database
 */
export async function fetchMatchesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('partite')
            .select('*')
            .order('match_timestamp', { ascending: true });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Matches loaded from Supabase:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching matches from Supabase:', error);
        throw error;
    }
}

/**
 * Fetches all players from Supabase
 * @returns {Promise<Array>} Array of player usernames
 */
export async function fetchPlayersFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('giocatori')
            .select('username')
            .order('username', { ascending: true });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Players loaded from Supabase:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching players from Supabase:', error);
        throw error;
    }
}

/**
 * Transforms Supabase match data to the format expected by elo.js
 * @param {Array} supabaseMatches - Matches from Supabase (snake_case)
 * @returns {Array} Matches in elo.js format (camelCase)
 */
export function transformSupabaseMatchesToEloFormat(supabaseMatches) {
    return supabaseMatches.map(match => ({
        giocatore1: match.player1,
        giocatore2: match.player2,
        punteggio1: match.score1,
        punteggio2: match.score2,
        matchType: match.match_type,
        timestamp: match.match_timestamp
    }));
}
