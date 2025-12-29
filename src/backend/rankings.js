/**
 * Rankings and Leaderboard Calculation Functions
 * Handles calculating player rankings based on ELO progression
 */

import { calcolaElo } from './elo-calculations.js';

const ELO_INIZIALE = 1500;

/**
 * Calcola gli ELO di tutti i giocatori basandosi sullo storico delle partite
 */
export function calcolaClassifica(partite) {
    const giocatori = {};
    
    // Inizializza tutti i giocatori con ELO di partenza
    for (const partita of partite) {
        if (!giocatori[partita.giocatore1]) {
            giocatori[partita.giocatore1] = {
                nome: partita.giocatore1,
                elo: ELO_INIZIALE,
                partiteGiocate: 0,
                vittorie: 0,
                sconfitte: 0,
                puntiSegnati: 0,
                puntiSubiti: 0
            };
        }
        if (!giocatori[partita.giocatore2]) {
            giocatori[partita.giocatore2] = {
                nome: partita.giocatore2,
                elo: ELO_INIZIALE,
                partiteGiocate: 0,
                vittorie: 0,
                sconfitte: 0,
                puntiSegnati: 0,
                puntiSubiti: 0
            };
        }
    }
    
    // Processa ogni partita in ordine cronologico
    for (const partita of partite) {
        const g1 = giocatori[partita.giocatore1];
        const g2 = giocatori[partita.giocatore2];
        
        // Salva gli ELO attuali prima del calcolo
        const elo1Vecchio = g1.elo;
        const elo2Vecchio = g2.elo;
        
        // Calcola i nuovi ELO
        g1.elo = calcolaElo(elo1Vecchio, elo2Vecchio, partita.punteggio1, partita.punteggio2);
        g2.elo = calcolaElo(elo2Vecchio, elo1Vecchio, partita.punteggio2, partita.punteggio1);
        
        // Aggiorna le statistiche
        g1.partiteGiocate++;
        g2.partiteGiocate++;
        g1.puntiSegnati += partita.punteggio1;
        g1.puntiSubiti += partita.punteggio2;
        g2.puntiSegnati += partita.punteggio2;
        g2.puntiSubiti += partita.punteggio1;
        
        if (partita.punteggio1 > partita.punteggio2) {
            g1.vittorie++;
            g2.sconfitte++;
        } else {
            g2.vittorie++;
            g1.sconfitte++;
        }
    }
    
    // Converti in array e ordina per ELO
    const classifica = Object.values(giocatori).sort((a, b) => b.elo - a.elo);
    
    return classifica;
}

/**
 * Calcola la classifica fino a un certo indice di partita
 * @param {Array} partite - Array di tutte le partite
 * @param {number} indice - Indice fino al quale calcolare (esclusivo)
 * @returns {Object} Oggetto con gli ELO dei giocatori a quel punto
 */
export function calcolaClassificaFinoA(partite, indice) {
    const giocatori = {};
    
    for (let i = 0; i < indice; i++) {
        const partita = partite[i];
        
        if (!giocatori[partita.giocatore1]) {
            giocatori[partita.giocatore1] = { elo: ELO_INIZIALE };
        }
        if (!giocatori[partita.giocatore2]) {
            giocatori[partita.giocatore2] = { elo: ELO_INIZIALE };
        }
        
        const g1 = giocatori[partita.giocatore1];
        const g2 = giocatori[partita.giocatore2];
        
        const elo1Vecchio = g1.elo;
        const elo2Vecchio = g2.elo;
        
        g1.elo = calcolaElo(elo1Vecchio, elo2Vecchio, partita.punteggio1, partita.punteggio2);
        g2.elo = calcolaElo(elo2Vecchio, elo1Vecchio, partita.punteggio2, partita.punteggio1);
    }
    
    if (!giocatori[partite[indice].giocatore1]) {
        giocatori[partite[indice].giocatore1] = { elo: ELO_INIZIALE };
    }
    if (!giocatori[partite[indice].giocatore2]) {
        giocatori[partite[indice].giocatore2] = { elo: ELO_INIZIALE };
    }
    
    return giocatori;
}
