/**
 * ELO Rating Calculation Functions
 * Pure mathematical computations for ELO rating system
 */

/**
 * Calcola il nuovo rating ELO per un giocatore dopo una partita
 * 
 * @param {number} playerElo - ELO attuale del giocatore
 * @param {number} opponentElo - ELO attuale dell'avversario
 * @param {number} playerScore - Punteggio del giocatore nella partita
 * @param {number} opponentScore - Punteggio dell'avversario nella partita
 * @param {number} kFactor - Fattore K per la sensibilità del cambiamento (default: 32)
 * @returns {number} - Nuovo rating ELO del giocatore
 */
export function calcolaElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32) {
    // Calcola il risultato della partita (1 = vittoria, 0 = sconfitta)
    const risultato = playerScore > opponentScore ? 1 : 0;
    
    // Calcola il punteggio atteso basato sulla differenza di ELO
    const punteggioAtteso = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    
    // Calcola la differenza di punti nella partita
    const differenzaPunti = Math.abs(playerScore - opponentScore);
    
    // Fattore moltiplicativo basato sulla differenza di punti
    // Più grande è la differenza, maggiore è l'impatto sul rating
    // Formula: 1 + (differenza / 10) per dare più peso alle vittorie schiaccianti
    const fattoreDifferenza = 1 + (differenzaPunti / 20);
    
    // Calcola il nuovo ELO
    const cambioElo = kFactor * fattoreDifferenza * (risultato - punteggioAtteso);
    const nuovoElo = playerElo + cambioElo;
    
    return Math.round(nuovoElo);
}

/**
 * Calcola i dettagli del cambio ELO per una partita
 * @param {number} playerElo - ELO del giocatore
 * @param {number} opponentElo - ELO dell'avversario
 * @param {number} playerScore - Punteggio del giocatore
 * @param {number} opponentScore - Punteggio dell'avversario
 * @param {number} kFactor - Fattore K (default: 32)
 * @returns {Object} Dettagli del calcolo ELO
 */
export function calcolaDettagliElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32) {
    const risultato = playerScore > opponentScore ? 1 : 0;
    const punteggioAtteso = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const differenzaPunti = Math.abs(playerScore - opponentScore);
    const fattoreDifferenza = 1 + (differenzaPunti / 20);
    const cambioElo = kFactor * fattoreDifferenza * (risultato - punteggioAtteso);
    const nuovoElo = playerElo + cambioElo;
    
    return {
        risultato,
        punteggioAtteso,
        differenzaPunti,
        fattoreDifferenza,
        cambioElo,
        nuovoElo: Math.round(nuovoElo)
    };
}
