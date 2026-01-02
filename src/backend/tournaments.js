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

/**
 * Fetches all matches for a specific tournament node
 * @param {string} nodeId - Node UUID
 * @returns {Promise<Array>} Array of match objects
 */
export async function fetchNodeMatches(nodeId) {
    try {
        const { data, error } = await supabase
            .from('partite')
            .select('*')
            .eq('tournament_node', nodeId)
            .order('match_timestamp', { ascending: true });
        
        if (error) {
            console.error('Supabase node matches fetch error:', error);
            throw error;
        }
        
        console.log('Node matches loaded:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching node matches:', error);
        throw error;
    }
}

/**
 * Fetches a single node by ID
 * @param {string} nodeId - Node UUID
 * @returns {Promise<Object>} Node object
 */
export async function fetchNodeById(nodeId) {
    try {
        const { data, error } = await supabase
            .from('nodi_torneo')
            .select('*')
            .eq('id', nodeId)
            .single();
        
        if (error) {
            console.error('Supabase node fetch error:', error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching node by ID:', error);
        throw error;
    }
}

/**
 * Fetches a node by tournament ID and slug
 * @param {string} tournamentId - Tournament UUID
 * @param {string} slug - Node slug
 * @returns {Promise<Object|null>} Node object or null if not found
 */
export async function fetchNodeBySlug(tournamentId, slug) {
    try {
        const { data, error } = await supabase
            .from('nodi_torneo')
            .select('*')
            .eq('tournament', tournamentId)
            .eq('slug', slug)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // Not found
                return null;
            }
            console.error('Supabase node by slug fetch error:', error);
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching node by slug:', error);
        throw error;
    }
}

/**
 * Calculates player rankings within a node
 * @param {Object} node - Node object
 * @param {Array} matches - Match objects
 * @param {Object} settings - Node settings
 * @returns {Array} Ranked players [{username, points, wins, losses, rank}]
 */
function calculateNodeRankings(node, matches, settings) {
    // Initialize player stats
    const stats = {};
    node.players.forEach(p => {
        stats[p] = { username: p, points: 0, wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    });
    
    // Process matches
    matches.forEach(match => {
        const winner = match.score1 > match.score2 ? match.player1 : match.player2;
        const loser = match.score1 > match.score2 ? match.player2 : match.player1;
        const winnerScore = Math.max(match.score1, match.score2);
        const loserScore = Math.min(match.score1, match.score2);
        
        if (stats[winner]) {
            stats[winner].wins++;
            stats[winner].points += settings.win_pts || 3;
            stats[winner].goalsFor += winnerScore;
            stats[winner].goalsAgainst += loserScore;
        }
        
        if (stats[loser]) {
            stats[loser].losses++;
            stats[loser].goalsFor += loserScore;
            stats[loser].goalsAgainst += winnerScore;
        }
    });
    
    // Sort by points, then goal difference
    const ranked = Object.values(stats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const goalDiffA = a.goalsFor - a.goalsAgainst;
        const goalDiffB = b.goalsFor - b.goalsAgainst;
        return goalDiffB - goalDiffA;
    });
    
    // Add rank numbers
    ranked.forEach((player, index) => {
        player.rank = index + 1;
    });
    
    return ranked;
}

/**
 * Checks if all required matches for a node are complete
 * @param {string} tournamentId - Tournament UUID
 * @param {string} nodeId - Node UUID
 * @returns {Promise<Object>} { complete: boolean, rankings: Array }
 */
export async function checkNodeCompletion(tournamentId, nodeId) {
    try {
        // Fetch tournament to get settings for this node type
        const tournament = await fetchTournamentById(tournamentId);
        const node = await fetchNodeById(nodeId);
        
        // Get type-specific settings
        const nodeSettings = tournament.settings[node.type] || {};
        const gamesPerPair = nodeSettings.games_per_pair || 1;
        
        // Fetch all matches for this node
        const matches = await fetchNodeMatches(nodeId);
        
        // Calculate required matches: players × (players-1) / 2 × gamesPerPair
        const playerCount = node.players.length;
        const requiredMatches = (playerCount * (playerCount - 1) / 2) * gamesPerPair;
        
        console.log('Node completion check:', {
            nodeId,
            playerCount,
            gamesPerPair,
            requiredMatches,
            currentMatches: matches.length
        });
        
        // Check if all matches are played
        const complete = matches.length >= requiredMatches;
        
        // Calculate rankings if complete
        let rankings = [];
        if (complete) {
            rankings = calculateNodeRankings(node, matches, nodeSettings);
            console.log('Node rankings:', rankings);
        }
        
        return { complete, rankings };
    } catch (error) {
        console.error('Error checking node completion:', error);
        throw error;
    }
}

/**
 * Advances players to next nodes based on rankings and next_node_map
 * @param {string} nodeId - Completed node UUID
 * @param {Array} rankings - Player rankings
 * @returns {Promise<void>}
 */
export async function advancePlayers(nodeId, rankings) {
    try {
        const node = await fetchNodeById(nodeId);
        const nextNodeMap = node.next_node_map || {};
        
        console.log('Advancing players:', { nodeId, nextNodeMap, rankings });
        
        // For each rank in the map, advance players
        for (const [rank, targetSlug] of Object.entries(nextNodeMap)) {
            const player = rankings.find(r => r.rank === parseInt(rank));
            if (!player) {
                console.log(`No player found for rank ${rank}`);
                continue;
            }
            
            // Find target node by slug
            const targetNode = await fetchNodeBySlug(node.tournament, targetSlug);
            if (!targetNode) {
                console.log(`Target node not found: ${targetSlug}`);
                continue;
            }
            
            // Add player to target node if not already there
            const currentPlayers = targetNode.players || [];
            if (!currentPlayers.includes(player.username)) {
                const updatedPlayers = [...currentPlayers, player.username];
                await updateNodePlayers(targetNode.id, updatedPlayers);
                console.log(`Advanced ${player.username} to ${targetSlug}`);
            }
        }
    } catch (error) {
        console.error('Error advancing players:', error);
        throw error;
    }
}

/**
 * Checks if all tournament nodes are complete and updates tournament status
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<void>}
 */
export async function checkTournamentCompletion(tournamentId) {
    try {
        const nodes = await fetchTournamentNodes(tournamentId);
        
        // Check if all nodes are completed
        const allComplete = nodes.every(node => node.status === 'completed');
        
        console.log('Tournament completion check:', {
            tournamentId,
            totalNodes: nodes.length,
            completedNodes: nodes.filter(n => n.status === 'completed').length,
            allComplete
        });
        
        if (allComplete) {
            await updateTournamentStatus(tournamentId, 'completed');
            console.log('Tournament marked as completed');
        }
    } catch (error) {
        console.error('Error checking tournament completion:', error);
        throw error;
    }
}
