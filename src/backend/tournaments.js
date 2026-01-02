/**
 * Tournament Management Backend Module
 * Pure computation and database operations for tournaments
 * No DOM manipulation - only data operations
 */

import { supabase } from './supabase.js';

/**
 * Fetches all tournaments from Supabase
 * @returns {Promise<Array>} Array of tournament objects
 */
export async function fetchTournaments() {
    try {
        const { data, error } = await supabase
            .from('tornei')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase tournaments fetch error:', error);
            throw error;
        }
        
        console.log('Tournaments loaded:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
}

/**
 * Fetches a single tournament by ID
 * @param {string} id - Tournament UUID
 * @returns {Promise<Object>} Tournament object
 */
export async function fetchTournamentById(id) {
    try {
        const { data, error } = await supabase
            .from('tornei')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Supabase tournament fetch error:', error);
            throw error;
        }
        
        console.log('Tournament loaded:', id);
        return data;
    } catch (error) {
        console.error('Error fetching tournament by ID:', error);
        throw error;
    }
}

/**
 * Fetches all nodes for a tournament
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<Array>} Array of tournament node objects
 */
export async function fetchTournamentNodes(tournamentId) {
    try {
        const { data, error } = await supabase
            .from('nodi_torneo')
            .select('*')
            .eq('tournament', tournamentId)
            .order('type', { ascending: true });
        
        if (error) {
            console.error('Supabase tournament nodes fetch error:', error);
            throw error;
        }
        
        console.log('Tournament nodes loaded:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching tournament nodes:', error);
        throw error;
    }
}

/**
 * Creates a new tournament
 * @param {string} name - Tournament name
 * @param {Object} settings - Tournament settings (win_pts, draw_pts, tiebreaker, etc.)
 * @param {Array<string>} participants - Array of player usernames
 * @returns {Promise<Object>} Created tournament object
 */
export async function createTournament(name, settings, participants) {
    try {
        const { data, error } = await supabase
            .from('tornei')
            .insert({
                name,
                status: 'setup',
                settings,
                participants
            })
            .select()
            .single();
        
        if (error) {
            console.error('Supabase tournament creation error:', error);
            throw error;
        }
        
        console.log('Tournament created:', data.id);
        return data;
    } catch (error) {
        console.error('Error creating tournament:', error);
        throw error;
    }
}

/**
 * Creates a tournament node
 * @param {string} tournamentId - Tournament UUID
 * @param {string} type - Node type (group, semifinal, final, etc.)
 * @param {string} typeVar - Type variant (A, B, 1, 2, etc.)
 * @param {Array<string>} playerIds - Player usernames for this node
 * @param {Object} nextNodeMap - Routing map for progression
 * @returns {Promise<Object>} Created node object
 */
export async function createTournamentNode(tournamentId, type, typeVar, playerIds = [], nextNodeMap = {}) {
    try {
        const slug = `${type}_${typeVar}`;
        const name = generateNodeName(type, typeVar);
        
        console.log('Creating node:', { tournamentId, type, typeVar, slug, name, players: playerIds, nextNodeMap });
        
        const { data, error } = await supabase
            .from('nodi_torneo')
            .insert({
                tournament: tournamentId,
                type,
                type_var: typeVar,
                slug,
                name,
                players: playerIds,
                next_node_map: nextNodeMap,
                status: playerIds.length > 0 ? 'waiting' : 'pending'
            })
            .select()
            .single();
        
        if (error) {
            console.error('Supabase tournament node creation error:', error);
            throw error;
        }
        
        console.log('Tournament node created successfully:', data.slug);
        return data;
    } catch (error) {
        console.error('Error creating tournament node:', error);
        throw error;
    }
}

/**
 * Generates a display name for a node based on type and variant
 * @param {string} type - Node type
 * @param {string} typeVar - Type variant
 * @returns {string} Display name
 */
function generateNodeName(type, typeVar) {
    const nameMap = {
        'group': `Girone ${typeVar}`,
        'semifinal': `Semifinale ${typeVar}`,
        'final': typeVar.includes('-') ? `Finale ${typeVar}` : 'Finale',
        'quarterfinal': `Quarti ${typeVar}`
    };
    
    return nameMap[type] || `${type} ${typeVar}`;
}

/**
 * Updates tournament status
 * @param {string} id - Tournament UUID
 * @param {string} status - New status (setup, active, completed)
 * @returns {Promise<Object>} Updated tournament object
 */
export async function updateTournamentStatus(id, status) {
    try {
        const { data, error } = await supabase
            .from('tornei')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase tournament status update error:', error);
            throw error;
        }
        
        console.log('Tournament status updated:', id, status);
        return data;
    } catch (error) {
        console.error('Error updating tournament status:', error);
        throw error;
    }
}

/**
 * Updates node players
 * @param {string} nodeId - Node UUID
 * @param {Array<string>} playerIds - Player usernames
 * @returns {Promise<Object>} Updated node object
 */
export async function updateNodePlayers(nodeId, playerIds) {
    try {
        const { data, error } = await supabase
            .from('nodi_torneo')
            .update({ 
                players: playerIds,
                status: playerIds.length > 0 ? 'waiting' : 'pending'
            })
            .eq('id', nodeId)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase node players update error:', error);
            throw error;
        }
        
        console.log('Node players updated:', nodeId);
        return data;
    } catch (error) {
        console.error('Error updating node players:', error);
        throw error;
    }
}

/**
 * Updates node status
 * @param {string} nodeId - Node UUID
 * @param {string} status - New status (pending, waiting, in_progress, completed)
 * @returns {Promise<Object>} Updated node object
 */
export async function updateNodeStatus(nodeId, status) {
    try {
        const { data, error } = await supabase
            .from('nodi_torneo')
            .update({ status })
            .eq('id', nodeId)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase node status update error:', error);
            throw error;
        }
        
        console.log('Node status updated:', nodeId, status);
        return data;
    } catch (error) {
        console.error('Error updating node status:', error);
        throw error;
    }
}

/**
 * Distributes players across groups with balanced ELO
 * Players are sorted by ELO and distributed in a snake draft pattern
 * @param {Array<Object>} players - Array of player objects with elo property
 * @param {number} groupCount - Number of groups
 * @returns {Array<Array<string>>} Array of groups, each containing player usernames
 */
export function distributePlayersBalanced(players, groupCount) {
    // Sort players by ELO descending
    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
    
    // Initialize groups
    const groups = Array.from({ length: groupCount }, () => []);
    
    // Snake draft distribution
    let direction = 1;
    let currentGroup = 0;
    
    for (const player of sortedPlayers) {
        groups[currentGroup].push(player.username);
        
        if (direction === 1 && currentGroup === groupCount - 1) {
            direction = -1;
        } else if (direction === -1 && currentGroup === 0) {
            direction = 1;
        } else {
            currentGroup += direction;
        }
    }
    
    return groups;
}

/**
 * Distributes players with similar ELO within the same group
 * Creates clusters of players with close ELO ratings
 * @param {Array<Object>} players - Array of player objects with elo property
 * @param {number} groupCount - Number of groups
 * @returns {Array<Array<string>>} Array of groups, each containing player usernames
 */
export function distributePlayersClustered(players, groupCount) {
    // Sort players by ELO descending
    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
    
    // Initialize groups
    const groups = Array.from({ length: groupCount }, () => []);
    
    // Distribute in sequence (top N to group 1, next N to group 2, etc.)
    sortedPlayers.forEach((player, index) => {
        const groupIndex = index % groupCount;
        groups[groupIndex].push(player.username);
    });
    
    return groups;
}

/**
 * Randomly distributes players across groups
 * @param {Array<Object>} players - Array of player objects
 * @param {number} groupCount - Number of groups
 * @returns {Array<Array<string>>} Array of groups, each containing player usernames
 */
export function distributePlayersRandom(players, groupCount) {
    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    // Initialize groups
    const groups = Array.from({ length: groupCount }, () => []);
    
    // Distribute sequentially
    shuffled.forEach((player, index) => {
        const groupIndex = index % groupCount;
        groups[groupIndex].push(player.username);
    });
    
    return groups;
}
