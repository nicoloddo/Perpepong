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
function calcolaElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32) {
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
 * Analizza una riga del file matches.txt
 * Formato atteso: "nome1 - nome2: punteggio1-punteggio2"
 */
function analizzaRiga(riga) {
    // Trim the line to remove any whitespace or line ending characters
    riga = riga.trim();
    const match = riga.match(/^(.+?)\s*-\s*(.+?):\s*(\d+)-(\d+)$/);
    if (!match) {
        return null;
    }
    
    return {
        giocatore1: match[1].trim(),
        giocatore2: match[2].trim(),
        punteggio1: parseInt(match[3]),
        punteggio2: parseInt(match[4])
    };
}

/**
 * Carica e processa le partite dal file matches.txt
 */
async function caricaPartite() {
    try {
        const response = await fetch('../../../matches.txt');
        if (!response.ok) {
            throw new Error('Impossibile caricare il file matches.txt');
        }
        
        const testo = await response.text();
        const righe = testo.split('\n').filter(r => r.trim());
        
        const partite = [];
        for (const riga of righe) {
            const partita = analizzaRiga(riga);
            if (partita) {
                partite.push(partita);
            } else if (riga.trim()) {
                console.warn('Riga non parsata:', riga, 'Lunghezza:', riga.length, 'Char codes:', [...riga].map(c => c.charCodeAt(0)));
            }
        }
        
        console.log('Partite caricate:', partite.length);
        return partite;
    } catch (error) {
        console.error('Errore nel caricamento delle partite:', error);
        throw error;
    }
}

/**
 * Calcola gli ELO di tutti i giocatori basandosi sullo storico delle partite
 */
function calcolaClassifica(partite) {
    const ELO_INIZIALE = 1500;
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
 * Calcola le statistiche globali dalla classifica
 * @param {Array} classifica - Array di giocatori con statistiche
 * @param {number} numeroPartite - Numero totale di partite
 * @returns {Object} Oggetto con le statistiche globali
 */
function calcolaStatisticheGlobali(classifica, numeroPartite) {
    const mediaElo = Math.round(
        classifica.reduce((sum, g) => sum + g.elo, 0) / classifica.length
    );
    
    return {
        numeroGiocatori: classifica.length,
        numeroPartite: numeroPartite,
        eloMedio: mediaElo,
        eloMassimo: classifica.length > 0 ? classifica[0].elo : 1500
    };
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
function calcolaDettagliElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32) {
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

/**
 * Calcola la classifica fino a un certo indice di partita
 * @param {Array} partite - Array di tutte le partite
 * @param {number} indice - Indice fino al quale calcolare (esclusivo)
 * @returns {Object} Oggetto con gli ELO dei giocatori a quel punto
 */
function calcolaClassificaFinoA(partite, indice) {
    const ELO_INIZIALE = 1500;
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

/**
 * Calcola le statistiche dettagliate per un giocatore specifico
 * Include lo storico ELO attraverso tutte le partite
 * @param {Array} partite - Array di tutte le partite
 * @param {string} playerName - Nome del giocatore
 * @returns {Array} Array di partite con dettagli ELO
 */
function calcolaStatisticheGiocatore(partite, playerName) {
    const ELO_INIZIALE = 1500;
    const giocatori = {};
    const matchHistory = [];
    
    for (const partita of partite) {
        if (!giocatori[partita.giocatore1]) {
            giocatori[partita.giocatore1] = { elo: ELO_INIZIALE };
        }
        if (!giocatori[partita.giocatore2]) {
            giocatori[partita.giocatore2] = { elo: ELO_INIZIALE };
        }
    }
    
    for (let i = 0; i < partite.length; i++) {
        const partita = partite[i];
        const isPlayer1 = partita.giocatore1 === playerName;
        const isPlayer2 = partita.giocatore2 === playerName;
        
        if (isPlayer1 || isPlayer2) {
            const g1 = giocatori[partita.giocatore1];
            const g2 = giocatori[partita.giocatore2];
            
            const elo1Vecchio = g1.elo;
            const elo2Vecchio = g2.elo;
            
            g1.elo = calcolaElo(elo1Vecchio, elo2Vecchio, partita.punteggio1, partita.punteggio2);
            g2.elo = calcolaElo(elo2Vecchio, elo1Vecchio, partita.punteggio2, partita.punteggio1);
            
            if (isPlayer1) {
                matchHistory.push({
                    ...partita,
                    matchNumber: i + 1,
                    opponent: partita.giocatore2,
                    playerScore: partita.punteggio1,
                    opponentScore: partita.punteggio2,
                    won: partita.punteggio1 > partita.punteggio2,
                    eloChange: g1.elo - elo1Vecchio,
                    eloAfter: g1.elo
                });
            } else {
                matchHistory.push({
                    ...partita,
                    matchNumber: i + 1,
                    opponent: partita.giocatore1,
                    playerScore: partita.punteggio2,
                    opponentScore: partita.punteggio1,
                    won: partita.punteggio2 > partita.punteggio1,
                    eloChange: g2.elo - elo2Vecchio,
                    eloAfter: g2.elo
                });
            }
        } else {
            const g1 = giocatori[partita.giocatore1];
            const g2 = giocatori[partita.giocatore2];
            
            const elo1Vecchio = g1.elo;
            const elo2Vecchio = g2.elo;
            
            g1.elo = calcolaElo(elo1Vecchio, elo2Vecchio, partita.punteggio1, partita.punteggio2);
            g2.elo = calcolaElo(elo2Vecchio, elo1Vecchio, partita.punteggio2, partita.punteggio1);
        }
    }
    
    return matchHistory;
}

