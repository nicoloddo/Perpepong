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
        const response = await fetch('matches.txt');
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
            }
        }
        
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
 * Visualizza le statistiche globali
 */
function visualizzaStatistiche(classifica, numeroPartite) {
    const statsGrid = document.getElementById('statsGrid');
    
    const mediaElo = Math.round(
        classifica.reduce((sum, g) => sum + g.elo, 0) / classifica.length
    );
    
    const totalePartite = classifica.reduce((sum, g) => sum + g.partiteGiocate, 0) / 2;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${classifica.length}</div>
            <div class="stat-label">Giocatori</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${numeroPartite}</div>
            <div class="stat-label">Partite Totali</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${mediaElo}</div>
            <div class="stat-label">ELO Medio</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${classifica[0].elo}</div>
            <div class="stat-label">ELO Massimo</div>
        </div>
    `;
}

/**
 * Visualizza la classifica dei giocatori
 */
function visualizzaClassifica(classifica) {
    const playersList = document.getElementById('playersList');
    
    if (classifica.length === 0) {
        playersList.innerHTML = '<div class="error">Nessun giocatore trovato</div>';
        return;
    }
    
    const html = classifica.map((giocatore, index) => {
        const posizione = index + 1;
        let rankClass = '';
        if (posizione === 1) rankClass = 'gold';
        else if (posizione === 2) rankClass = 'silver';
        else if (posizione === 3) rankClass = 'bronze';
        
        const percentualeVittorie = giocatore.partiteGiocate > 0
            ? ((giocatore.vittorie / giocatore.partiteGiocate) * 100).toFixed(1)
            : 0;
        
        return `
            <div class="player-row">
                <div class="rank ${rankClass}">${posizione}°</div>
                <div class="player-info">
                    <div class="player-name">${giocatore.nome}</div>
                    <div class="player-stats">
                        ${giocatore.partiteGiocate} partite • 
                        ${giocatore.vittorie}V-${giocatore.sconfitte}S • 
                        ${percentualeVittorie}% vittorie • 
                        ${giocatore.puntiSegnati} punti segnati
                    </div>
                </div>
                <div class="elo-badge">${giocatore.elo}</div>
            </div>
        `;
    }).join('');
    
    playersList.innerHTML = html;
}

/**
 * Funzione principale per inizializzare l'applicazione
 */
async function inizializza() {
    try {
        const partite = await caricaPartite();
        
        if (partite.length === 0) {
            document.getElementById('playersList').innerHTML = 
                '<div class="error">Nessuna partita trovata nel file matches.txt</div>';
            return;
        }
        
        const classifica = calcolaClassifica(partite);
        visualizzaStatistiche(classifica, partite.length);
        visualizzaClassifica(classifica);
        
    } catch (error) {
        document.getElementById('playersList').innerHTML = 
            `<div class="error">Errore: ${error.message}</div>`;
    }
}

// Avvia l'applicazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', inizializza);
