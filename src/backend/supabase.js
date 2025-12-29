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
 * @returns {Promise<Array>} Array of player objects with username and email
 */
export async function fetchPlayersFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('giocatori')
            .select('username, email')
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
 * Finds a player by email
 * @param {string} email - The user's email address
 * @returns {Promise<Object|null>} Player object or null if not found
 */
export async function findPlayerByEmail(email) {
    try {
        const { data, error } = await supabase
            .from('giocatori')
            .select('username, email')
            .eq('email', email)
            .single();
        
        if (error) {
            // Return null if player not found, don't log error
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Supabase error:', error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error finding player by email:', error);
        return null;
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

/**
 * Inserts a new match into Supabase
 * @param {Object} matchData - Match data
 * @param {string} matchData.player1 - First player name
 * @param {string} matchData.player2 - Second player name
 * @param {number} matchData.score1 - First player score
 * @param {number} matchData.score2 - Second player score
 * @param {string} matchData.matchType - Match type (single-21 or single-11)
 * @returns {Promise<Object>} Inserted match data
 */
export async function insertMatchToSupabase(matchData) {
    try {
        // Get current timestamp in Rome timezone
        const now = new Date();
        const romeTimezone = 'Europe/Rome';
        const formatter = new Intl.DateTimeFormat('sv-SE', {
            timeZone: romeTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const parts = formatter.formatToParts(now);
        const dateStr = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
        const timeStr = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;
        const timestampStr = `${dateStr} ${timeStr}+01:00`; // Rome timezone offset
        
        const { data, error } = await supabase
            .from('partite')
            .insert([
                {
                    player1: matchData.player1,
                    player2: matchData.player2,
                    score1: matchData.score1,
                    score2: matchData.score2,
                    match_type: matchData.matchType,
                    match_timestamp: timestampStr
                }
            ])
            .select();
        
        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }
        
        console.log('Match inserted successfully:', data);
        return data[0];
    } catch (error) {
        console.error('Error inserting match to Supabase:', error);
        throw error;
    }
}
