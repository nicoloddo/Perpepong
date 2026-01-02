/**
 * Backend Module Index
 * Central export point for all backend functionality
 * Organized by domain for better code organization
 */

// ELO Calculation Functions
export { calcolaElo, calcolaDettagliElo } from './elo-calculations.js';

// Matches Data Loading
export { caricaPartite, caricaPartiteDaFile, caricaConteggioPartite, caricaPartitePaginate } from './matches-loader.js';

// Rankings and Leaderboard
export { calcolaClassifica, calcolaClassificaFinoA } from './rankings.js';

// Statistics and Analytics
export {
    calcolaStatisticheGlobali,
    calcolaStatisticheGiocatore,
    calcolaStatisticheMatchup,
    trovaMatchupInteressanti,
    calcolaMatchupGiocatore
} from './statistics.js';

// Tournament Management
export {
    fetchTournaments,
    fetchTournamentById,
    fetchTournamentNodes,
    createTournament,
    createTournamentNode,
    distributePlayersBalanced,
    distributePlayersClustered,
    distributePlayersRandom,
    updateTournamentStatus,
    updateNodePlayers,
    updateNodeStatus
} from './tournaments.js';

// Make all functions available globally for backward compatibility
// This allows non-module scripts to access these functions via window object
import { calcolaElo, calcolaDettagliElo } from './elo-calculations.js';
import { caricaPartite, caricaPartiteDaFile, caricaConteggioPartite, caricaPartitePaginate } from './matches-loader.js';
import { calcolaClassifica, calcolaClassificaFinoA } from './rankings.js';
import {
    calcolaStatisticheGlobali,
    calcolaStatisticheGiocatore,
    calcolaStatisticheMatchup,
    trovaMatchupInteressanti,
    calcolaMatchupGiocatore
} from './statistics.js';
import {
    fetchTournaments,
    fetchTournamentById,
    fetchTournamentNodes,
    createTournament,
    createTournamentNode,
    distributePlayersBalanced,
    distributePlayersClustered,
    distributePlayersRandom,
    updateTournamentStatus,
    updateNodePlayers,
    updateNodeStatus
} from './tournaments.js';

if (typeof window !== 'undefined') {
    window.caricaPartite = caricaPartite;
    window.caricaPartiteDaFile = caricaPartiteDaFile;
    window.caricaConteggioPartite = caricaConteggioPartite;
    window.caricaPartitePaginate = caricaPartitePaginate;
    window.calcolaClassifica = calcolaClassifica;
    window.calcolaElo = calcolaElo;
    window.calcolaStatisticheGlobali = calcolaStatisticheGlobali;
    window.calcolaDettagliElo = calcolaDettagliElo;
    window.calcolaClassificaFinoA = calcolaClassificaFinoA;
    window.calcolaStatisticheGiocatore = calcolaStatisticheGiocatore;
    window.calcolaStatisticheMatchup = calcolaStatisticheMatchup;
    window.trovaMatchupInteressanti = trovaMatchupInteressanti;
    window.calcolaMatchupGiocatore = calcolaMatchupGiocatore;
    window.fetchTournaments = fetchTournaments;
    window.fetchTournamentById = fetchTournamentById;
    window.fetchTournamentNodes = fetchTournamentNodes;
    window.createTournament = createTournament;
    window.createTournamentNode = createTournamentNode;
    window.distributePlayersBalanced = distributePlayersBalanced;
    window.distributePlayersClustered = distributePlayersClustered;
    window.distributePlayersRandom = distributePlayersRandom;
    window.updateTournamentStatus = updateTournamentStatus;
    window.updateNodePlayers = updateNodePlayers;
    window.updateNodeStatus = updateNodeStatus;
}
