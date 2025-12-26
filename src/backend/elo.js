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
        const response = await fetch(window.getPath('/matches.txt'));
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

/**
 * Calcola le statistiche di tutti i matchup tra giocatori
 * @param {Array} partite - Array di tutte le partite
 * @param {Array} classifica - Classifica attuale dei giocatori
 * @returns {Array} Array di matchup con statistiche
 */
function calcolaStatisticheMatchup(partite, classifica) {
    const matchups = {};
    
    // Analizza tutte le partite per costruire statistiche di matchup
    for (const partita of partite) {
        const key1 = `${partita.giocatore1}-${partita.giocatore2}`;
        const key2 = `${partita.giocatore2}-${partita.giocatore1}`;
        
        // Usa sempre la chiave con i giocatori in ordine alfabetico per evitare duplicati
        const sortedKey = [partita.giocatore1, partita.giocatore2].sort().join('-');
        
        if (!matchups[sortedKey]) {
            matchups[sortedKey] = {
                player1: [partita.giocatore1, partita.giocatore2].sort()[0],
                player2: [partita.giocatore1, partita.giocatore2].sort()[1],
                totalGames: 0,
                player1Wins: 0,
                player2Wins: 0
            };
        }
        
        matchups[sortedKey].totalGames++;
        
        // Determina chi ha vinto
        const winner = partita.punteggio1 > partita.punteggio2 ? partita.giocatore1 : partita.giocatore2;
        if (winner === matchups[sortedKey].player1) {
            matchups[sortedKey].player1Wins++;
        } else {
            matchups[sortedKey].player2Wins++;
        }
    }
    
    // Converti in array e aggiungi statistiche calcolate
    const matchupArray = Object.values(matchups).map(matchup => {
        const player1Data = classifica.find(p => p.nome === matchup.player1);
        const player2Data = classifica.find(p => p.nome === matchup.player2);
        
        // Calcola probabilità basata su ELO
        const player1WinProb = 1 / (1 + Math.pow(10, (player2Data.elo - player1Data.elo) / 400));
        const player2WinProb = 1 - player1WinProb;
        
        // Calcola win rate attuale
        const player1WinRate = matchup.player1Wins / matchup.totalGames;
        const player2WinRate = matchup.player2Wins / matchup.totalGames;
        
        // Calcola quanto il win rate è vicino a 0.5 (più vicino = più bilanciato)
        const balanceScore = 1 - Math.abs(0.5 - player1WinRate);
        
        // Calcola la differenza tra win rate attuale e probabilità prevista (sorpresa)
        const surpriseFactor = Math.abs(player1WinRate - player1WinProb);
        
        return {
            ...matchup,
            player1Elo: player1Data.elo,
            player2Elo: player2Data.elo,
            player1WinRate,
            player2WinRate,
            player1WinProb,
            player2WinProb,
            balanceScore,
            surpriseFactor
        };
    });
    
    return matchupArray;
}

/**
 * Trova i matchup più interessanti
 * @param {Array} partite - Array di tutte le partite
 * @param {Array} classifica - Classifica attuale dei giocatori
 * @returns {Object} Oggetto con vari matchup interessanti
 */
function trovaMatchupInteressanti(partite, classifica) {
    const allMatchups = calcolaStatisticheMatchup(partite, classifica);
    
    // Filtra matchup con almeno 3 partite per avere statistiche significative
    const significantMatchups = allMatchups.filter(m => m.totalGames >= 3);
    
    // Most balanced: più bilanciato con più partite giocate
    const mostBalanced = [...allMatchups]
        .filter(m => m.totalGames >= 3)
        .sort((a, b) => {
            // Prima ordina per balance score, poi per numero di partite
            if (Math.abs(a.balanceScore - b.balanceScore) < 0.05) {
                return b.totalGames - a.totalGames;
            }
            return b.balanceScore - a.balanceScore;
        })[0];
    
    // Most surprising: maggior differenza tra win rate e probabilità
    const mostSurprising = [...allMatchups]
        .filter(m => m.totalGames >= 3)
        .sort((a, b) => b.surpriseFactor - a.surpriseFactor)[0];
    
    // Most played: matchup con più partite
    const mostPlayed = [...allMatchups]
        .sort((a, b) => b.totalGames - a.totalGames)[0];
    
    // Most dominant: matchup con il win rate più sbilanciato (ma con almeno 3 partite)
    const mostDominant = [...allMatchups]
        .filter(m => m.totalGames >= 3)
        .sort((a, b) => {
            const aMax = Math.max(a.player1WinRate, a.player2WinRate);
            const bMax = Math.max(b.player1WinRate, b.player2WinRate);
            return bMax - aMax;
        })[0];
    
    return {
        mostBalanced,
        mostSurprising,
        mostPlayed,
        mostDominant,
        allMatchups
    };
}

/**
 * Calcola le statistiche di matchup per un giocatore specifico
 * @param {Array} partite - Array di tutte le partite
 * @param {string} playerName - Nome del giocatore
 * @param {Array} classifica - Classifica attuale dei giocatori
 * @returns {Object} Statistiche di matchup del giocatore
 */
function calcolaMatchupGiocatore(partite, playerName, classifica) {
    const matchups = {};
    
    // Analizza tutte le partite del giocatore
    for (const partita of partite) {
        let opponent = null;
        let isPlayer1 = false;
        
        if (partita.giocatore1 === playerName) {
            opponent = partita.giocatore2;
            isPlayer1 = true;
        } else if (partita.giocatore2 === playerName) {
            opponent = partita.giocatore1;
            isPlayer1 = false;
        } else {
            continue; // Questa partita non coinvolge il giocatore
        }
        
        if (!matchups[opponent]) {
            matchups[opponent] = {
                opponent,
                wins: 0,
                losses: 0,
                totalGames: 0
            };
        }
        
        matchups[opponent].totalGames++;
        
        const won = isPlayer1 
            ? partita.punteggio1 > partita.punteggio2 
            : partita.punteggio2 > partita.punteggio1;
        
        if (won) {
            matchups[opponent].wins++;
        } else {
            matchups[opponent].losses++;
        }
    }
    
    // Converti in array e aggiungi statistiche
    const matchupArray = Object.values(matchups).map(matchup => {
        const playerData = classifica.find(p => p.nome === playerName);
        const opponentData = classifica.find(p => p.nome === matchup.opponent);
        
        const winRate = matchup.wins / matchup.totalGames;
        
        // Calcola probabilità basata su ELO
        const winProb = opponentData 
            ? 1 / (1 + Math.pow(10, (opponentData.elo - playerData.elo) / 400))
            : 0.5;
        
        // Performance vs expectation
        const overperformance = winRate - winProb;
        
        return {
            ...matchup,
            opponentElo: opponentData ? opponentData.elo : 1500,
            winRate,
            winProb,
            overperformance
        };
    });
    
    // Trova best e worst matchup (con almeno 2 partite)
    const significantMatchups = matchupArray.filter(m => m.totalGames >= 2);
    
    const bestMatchup = [...significantMatchups]
        .sort((a, b) => b.winRate - a.winRate)[0];
    
    const worstMatchup = [...significantMatchups]
        .sort((a, b) => a.winRate - b.winRate)[0];
    
    // Biggest overperformer
    const biggestOverperformer = [...significantMatchups]
        .sort((a, b) => b.overperformance - a.overperformance)[0];
    
    // Biggest underperformer
    const biggestUnderperformer = [...significantMatchups]
        .sort((a, b) => a.overperformance - b.overperformance)[0];
    
    return {
        bestMatchup,
        worstMatchup,
        biggestOverperformer,
        biggestUnderperformer,
        allMatchups: matchupArray
    };
}

