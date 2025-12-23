/**
 * Calcola il nuovo rating ELO per un giocatore dopo una partita
 * 
 * @param {number} playerElo - ELO attuale del giocatore
 * @param {number} opponentElo - ELO attuale dell'avversario
 * @param {number} playerScore - Punteggio del giocatore nella partita
 * @param {number} opponentScore - Punteggio dell'avversario nella partita
 * @param {number} kFactor - Fattore K per la sensibilità del cambiamento (default: 32)
 * @returns {Object} - Oggetto contenente nuovo ELO e dettagli del calcolo
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
    // Formula: 1 + (differenza / 20) per dare più peso alle vittorie schiaccianti
    const fattoreDifferenza = 1 + (differenzaPunti / 20);
    
    // Calcola il nuovo ELO
    const cambioElo = kFactor * fattoreDifferenza * (risultato - punteggioAtteso);
    const nuovoElo = playerElo + cambioElo;
    
    return {
        nuovoElo: Math.round(nuovoElo),
        cambioElo: Math.round(cambioElo),
        dettagli: {
            eloIniziale: playerElo,
            eloAvversario: opponentElo,
            risultato: risultato,
            punteggioAtteso: punteggioAtteso,
            differenzaPunti: differenzaPunti,
            fattoreDifferenza: fattoreDifferenza,
            kFactor: kFactor,
            cambioBase: kFactor * (risultato - punteggioAtteso),
            cambioConDifferenza: cambioElo
        }
    };
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
    const partiteConElo = [];
    
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
    for (let i = 0; i < partite.length; i++) {
        const partita = partite[i];
        const g1 = giocatori[partita.giocatore1];
        const g2 = giocatori[partita.giocatore2];
        
        // Salva gli ELO attuali prima del calcolo
        const elo1Vecchio = g1.elo;
        const elo2Vecchio = g2.elo;
        
        // Calcola i nuovi ELO con dettagli
        const risultato1 = calcolaElo(elo1Vecchio, elo2Vecchio, partita.punteggio1, partita.punteggio2);
        const risultato2 = calcolaElo(elo2Vecchio, elo1Vecchio, partita.punteggio2, partita.punteggio1);
        
        // Salva i dettagli della partita con i calcoli ELO
        partiteConElo.push({
            ...partita,
            numeroPartita: i + 1,
            elo1Prima: elo1Vecchio,
            elo2Prima: elo2Vecchio,
            elo1Dopo: risultato1.nuovoElo,
            elo2Dopo: risultato2.nuovoElo,
            cambioElo1: risultato1.cambioElo,
            cambioElo2: risultato2.cambioElo,
            dettagli1: risultato1.dettagli,
            dettagli2: risultato2.dettagli
        });
        
        // Applica i nuovi ELO
        g1.elo = risultato1.nuovoElo;
        g2.elo = risultato2.nuovoElo;
        
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
    
    return { classifica, partiteConElo };
}

/**
 * Visualizza le statistiche globali
 */
function visualizzaStatistiche(classifica, numeroPartite) {
    const statsGrid = document.getElementById('statsGrid');
    
    const mediaElo = Math.round(
        classifica.reduce((sum, g) => sum + g.elo, 0) / classifica.length
    );
    
    const eloMax = classifica[0].elo;
    const eloMin = classifica[classifica.length - 1].elo;
    
    const totalePuntiSegnati = classifica.reduce((sum, g) => sum + g.puntiSegnati, 0);
    const totaleVittorie = classifica.reduce((sum, g) => sum + g.vittorie, 0);
    
    const giocatorePiuPartite = classifica.reduce((max, g) => 
        g.partiteGiocate > max.partiteGiocate ? g : max
    );
    
    const giocatorePiuVittorie = classifica.reduce((max, g) => 
        g.vittorie > max.vittorie ? g : max
    );
    
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
            <div class="stat-number">${eloMax}</div>
            <div class="stat-label">ELO Massimo</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${eloMin}</div>
            <div class="stat-label">ELO Minimo</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Math.round(totalePuntiSegnati / numeroPartite)}</div>
            <div class="stat-label">Punti Medi per Partita</div>
        </div>
    `;
}

/**
 * Visualizza le statistiche dettagliate
 */
function visualizzaStatisticheDettagliate(classifica) {
    const detailedStats = document.getElementById('detailedStats');
    
    const giocatorePiuPartite = classifica.reduce((max, g) => 
        g.partiteGiocate > max.partiteGiocate ? g : max
    );
    
    const giocatorePiuVittorie = classifica.reduce((max, g) => 
        g.vittorie > max.vittorie ? g : max
    );
    
    const giocatoreMigliorPercentuale = classifica
        .filter(g => g.partiteGiocate >= 3)
        .reduce((max, g) => {
            const percMax = max.vittorie / max.partiteGiocate;
            const percG = g.vittorie / g.partiteGiocate;
            return percG > percMax ? g : max;
        });
    
    const giocatorePiuPunti = classifica.reduce((max, g) => 
        g.puntiSegnati > max.puntiSegnati ? g : max
    );
    
    detailedStats.innerHTML = `
        <div class="player-row">
            <div class="player-info">
                <div class="player-name">🏆 Giocatore con ELO più alto</div>
                <div class="player-stats">${classifica[0].nome} con ${classifica[0].elo} punti ELO</div>
            </div>
        </div>
        <div class="player-row">
            <div class="player-info">
                <div class="player-name">🎮 Giocatore più attivo</div>
                <div class="player-stats">${giocatorePiuPartite.nome} con ${giocatorePiuPartite.partiteGiocate} partite giocate</div>
            </div>
        </div>
        <div class="player-row">
            <div class="player-info">
                <div class="player-name">⚔️ Più vittorie totali</div>
                <div class="player-stats">${giocatorePiuVittorie.nome} con ${giocatorePiuVittorie.vittorie} vittorie</div>
            </div>
        </div>
        <div class="player-row">
            <div class="player-info">
                <div class="player-name">📈 Miglior percentuale vittorie (min. 3 partite)</div>
                <div class="player-stats">${giocatoreMigliorPercentuale.nome} con ${((giocatoreMigliorPercentuale.vittorie / giocatoreMigliorPercentuale.partiteGiocate) * 100).toFixed(1)}% (${giocatoreMigliorPercentuale.vittorie}/${giocatoreMigliorPercentuale.partiteGiocate})</div>
            </div>
        </div>
        <div class="player-row">
            <div class="player-info">
                <div class="player-name">🎯 Più punti segnati</div>
                <div class="player-stats">${giocatorePiuPunti.nome} con ${giocatorePiuPunti.puntiSegnati} punti totali</div>
            </div>
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
 * Visualizza lo storico delle partite
 */
function visualizzaPartite(partiteConElo) {
    const matchesList = document.getElementById('matchesList');
    
    if (partiteConElo.length === 0) {
        matchesList.innerHTML = '<div class="error">Nessuna partita trovata</div>';
        return;
    }
    
    // Mostra le partite in ordine cronologico inverso (più recenti prima)
    const html = [...partiteConElo].reverse().map((partita) => {
        const vincitore1 = partita.punteggio1 > partita.punteggio2;
        const vincitore2 = partita.punteggio2 > partita.punteggio1;
        
        return `
            <div class="match-row" onclick="mostraDettaglioPartita(${partita.numeroPartita - 1})">
                <div class="match-header">
                    <div class="match-number">Partita #${partita.numeroPartita}</div>
                </div>
                <div class="match-players">
                    <div class="match-player ${vincitore1 ? 'winner' : ''}">${partita.giocatore1}</div>
                    <div class="match-score">${partita.punteggio1} - ${partita.punteggio2}</div>
                    <div class="match-player ${vincitore2 ? 'winner' : ''}">${partita.giocatore2}</div>
                </div>
                <div class="match-elo-changes">
                    <div class="elo-change ${partita.cambioElo1 >= 0 ? 'positive' : 'negative'}">
                        ${partita.giocatore1}: ${partita.elo1Prima} → ${partita.elo1Dopo} 
                        (${partita.cambioElo1 >= 0 ? '+' : ''}${partita.cambioElo1})
                    </div>
                    <div class="elo-change ${partita.cambioElo2 >= 0 ? 'positive' : 'negative'}">
                        ${partita.giocatore2}: ${partita.elo2Prima} → ${partita.elo2Dopo} 
                        (${partita.cambioElo2 >= 0 ? '+' : ''}${partita.cambioElo2})
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    matchesList.innerHTML = html;
}

/**
 * Mostra il dettaglio del calcolo ELO per una partita
 */
function mostraDettaglioPartita(indice) {
    const partita = datiGlobali.partiteConElo[indice];
    const modal = document.getElementById('matchModal');
    const modalBody = document.getElementById('modalBody');
    
    const vincitore1 = partita.punteggio1 > partita.punteggio2;
    
    modalBody.innerHTML = `
        <div class="match-detail-header">
            <h2>Partita #${partita.numeroPartita}</h2>
            <div class="match-detail-score">
                ${partita.giocatore1} ${partita.punteggio1} - ${partita.punteggio2} ${partita.giocatore2}
            </div>
            <p>Vincitore: <strong>${vincitore1 ? partita.giocatore1 : partita.giocatore2}</strong></p>
        </div>
        
        ${generaCalcoloGiocatore(partita, 1)}
        ${generaCalcoloGiocatore(partita, 2)}
    `;
    
    modal.classList.add('active');
}

/**
 * Genera la sezione di calcolo per un giocatore
 */
function generaCalcoloGiocatore(partita, numeroGiocatore) {
    const isGiocatore1 = numeroGiocatore === 1;
    const nome = isGiocatore1 ? partita.giocatore1 : partita.giocatore2;
    const dettagli = isGiocatore1 ? partita.dettagli1 : partita.dettagli2;
    const cambioElo = isGiocatore1 ? partita.cambioElo1 : partita.cambioElo2;
    const eloFinale = isGiocatore1 ? partita.elo1Dopo : partita.elo2Dopo;
    const haVinto = dettagli.risultato === 1;
    
    const probabilitaVittoria = (dettagli.punteggioAtteso * 100).toFixed(1);
    const differenzaElo = dettagli.eloIniziale - dettagli.eloAvversario;
    
    return `
        <div class="player-calculation">
            <div class="player-calculation-header">
                ${nome} ${haVinto ? '🏆' : ''}
            </div>
            
            <div class="calculation-section">
                <div class="calculation-title">📊 Situazione Iniziale</div>
                <div class="calculation-row">
                    <span class="calculation-label">ELO iniziale</span>
                    <span class="calculation-value">${dettagli.eloIniziale}</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label">ELO avversario</span>
                    <span class="calculation-value">${dettagli.eloAvversario}</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label">Differenza ELO</span>
                    <span class="calculation-value ${differenzaElo >= 0 ? 'highlight-positive' : 'highlight-negative'}">
                        ${differenzaElo >= 0 ? '+' : ''}${differenzaElo}
                    </span>
                </div>
            </div>
            
            <div class="calculation-section">
                <div class="calculation-title">🎯 Probabilità di Vittoria</div>
                <div class="calculation-row">
                    <span class="calculation-label">Probabilità attesa</span>
                    <span class="calculation-value highlight-neutral">${probabilitaVittoria}%</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label">Risultato effettivo</span>
                    <span class="calculation-value ${haVinto ? 'highlight-positive' : 'highlight-negative'}">
                        ${haVinto ? 'Vittoria (100%)' : 'Sconfitta (0%)'}
                    </span>
                </div>
                <div class="formula-box">
                    Probabilità = 1 / (1 + 10<sup>((ELO_avv - ELO) / 400)</sup>)
                    <br>
                    = 1 / (1 + 10<sup>((${dettagli.eloAvversario} - ${dettagli.eloIniziale}) / 400)</sup>)
                    <br>
                    = ${probabilitaVittoria}%
                </div>
                ${differenzaElo > 0 
                    ? `<p>✅ Partiva favorito: era atteso vincere nel ${probabilitaVittoria}% dei casi</p>`
                    : differenzaElo < 0
                    ? `<p>⚠️ Partiva sfavorito: era atteso vincere solo nel ${probabilitaVittoria}% dei casi</p>`
                    : `<p>⚖️ Partiva alla pari: aveva il 50% di probabilità di vittoria</p>`
                }
            </div>
            
            <div class="calculation-section">
                <div class="calculation-title">📈 Impatto della Differenza Punti</div>
                <div class="calculation-row">
                    <span class="calculation-label">Differenza punti</span>
                    <span class="calculation-value">${dettagli.differenzaPunti}</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label">Fattore moltiplicativo</span>
                    <span class="calculation-value highlight-neutral">×${dettagli.fattoreDifferenza.toFixed(2)}</span>
                </div>
                <div class="formula-box">
                    Fattore = 1 + (Differenza Punti / 20)
                    <br>
                    = 1 + (${dettagli.differenzaPunti} / 20)
                    <br>
                    = ${dettagli.fattoreDifferenza.toFixed(2)}
                </div>
                ${dettagli.differenzaPunti < 3 
                    ? `<p>⚖️ Partita equilibrata: la differenza di ${dettagli.differenzaPunti} punti ha un impatto minimo (×${dettagli.fattoreDifferenza.toFixed(2)})</p>`
                    : dettagli.differenzaPunti < 7
                    ? `<p>📊 Partita con gap moderato: la differenza di ${dettagli.differenzaPunti} punti aumenta l'impatto del ${((dettagli.fattoreDifferenza - 1) * 100).toFixed(0)}%</p>`
                    : `<p>💥 Vittoria schiacciante: la differenza di ${dettagli.differenzaPunti} punti aumenta l'impatto del ${((dettagli.fattoreDifferenza - 1) * 100).toFixed(0)}%!</p>`
                }
            </div>
            
            <div class="calculation-section">
                <div class="calculation-title">🧮 Calcolo Finale</div>
                <div class="calculation-row">
                    <span class="calculation-label">Cambio ELO base (senza fattore differenza)</span>
                    <span class="calculation-value">${Math.round(dettagli.cambioBase)}</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label">Moltiplicatore differenza punti</span>
                    <span class="calculation-value">×${dettagli.fattoreDifferenza.toFixed(2)}</span>
                </div>
                <div class="calculation-row">
                    <span class="calculation-label"><strong>Cambio ELO finale</strong></span>
                    <span class="calculation-value ${cambioElo >= 0 ? 'highlight-positive' : 'highlight-negative'}">
                        <strong>${cambioElo >= 0 ? '+' : ''}${cambioElo}</strong>
                    </span>
                </div>
                <div class="formula-box">
                    Cambio ELO = K × Fattore × (Risultato - Probabilità)
                    <br>
                    = ${dettagli.kFactor} × ${dettagli.fattoreDifferenza.toFixed(2)} × (${dettagli.risultato} - ${dettagli.punteggioAtteso.toFixed(3)})
                    <br>
                    = ${cambioElo}
                </div>
                <div class="calculation-row">
                    <span class="calculation-label"><strong>ELO finale</strong></span>
                    <span class="calculation-value highlight-neutral">
                        <strong>${eloFinale}</strong>
                    </span>
                </div>
                ${spiegaCambioElo(haVinto, differenzaElo, dettagli.differenzaPunti, cambioElo)}
            </div>
        </div>
    `;
}

/**
 * Genera una spiegazione user-friendly del cambio ELO
 */
function spiegaCambioElo(haVinto, differenzaElo, differenzaPunti, cambioElo) {
    let spiegazione = '<div style="margin-top: 15px; padding: 15px; background: #f0f7ff; border-left: 4px solid #667eea; border-radius: 4px;">';
    spiegazione += '<strong>💡 In parole semplici:</strong><br>';
    
    if (haVinto) {
        if (differenzaElo > 100) {
            spiegazione += `Eri il favorito (ELO superiore di ${differenzaElo}), quindi la vittoria era attesa. `;
        } else if (differenzaElo < -100) {
            spiegazione += `Eri lo sfavorito (ELO inferiore di ${Math.abs(differenzaElo)}), quindi questa vittoria vale molto! `;
        } else {
            spiegazione += `Eravate quasi alla pari, quindi la vittoria ha un impatto normale. `;
        }
        
        if (differenzaPunti >= 7) {
            spiegazione += `Il margine di ${differenzaPunti} punti dimostra una vittoria dominante, quindi guadagni ${Math.abs(cambioElo)} punti ELO.`;
        } else if (differenzaPunti >= 3) {
            spiegazione += `Il margine di ${differenzaPunti} punti è discreto, quindi guadagni ${Math.abs(cambioElo)} punti ELO.`;
        } else {
            spiegazione += `È stata una vittoria di misura (solo ${differenzaPunti} punti), quindi guadagni ${Math.abs(cambioElo)} punti ELO.`;
        }
    } else {
        if (differenzaElo > 100) {
            spiegazione += `Eri il favorito (ELO superiore di ${differenzaElo}), quindi questa sconfitta è pesante! `;
        } else if (differenzaElo < -100) {
            spiegazione += `Eri lo sfavorito (ELO inferiore di ${Math.abs(differenzaElo)}), quindi la sconfitta era attesa. `;
        } else {
            spiegazione += `Eravate quasi alla pari, quindi la sconfitta ha un impatto normale. `;
        }
        
        if (differenzaPunti >= 7) {
            spiegazione += `Il margine di ${differenzaPunti} punti rende la sconfitta più pesante, quindi perdi ${Math.abs(cambioElo)} punti ELO.`;
        } else if (differenzaPunti >= 3) {
            spiegazione += `Il margine di ${differenzaPunti} punti è discreto, quindi perdi ${Math.abs(cambioElo)} punti ELO.`;
        } else {
            spiegazione += `Hai perso di poco (solo ${differenzaPunti} punti), quindi perdi ${Math.abs(cambioElo)} punti ELO.`;
        }
    }
    
    spiegazione += '</div>';
    return spiegazione;
}

/**
 * Chiude il modal
 */
function chiudiModal() {
    const modal = document.getElementById('matchModal');
    modal.classList.remove('active');
}

/**
 * Cambia pagina
 */
function mostraPagina(nomePagina) {
    // Nascondi tutte le pagine
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Rimuovi classe active da tutti i bottoni
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra la pagina selezionata
    document.getElementById(`page-${nomePagina}`).classList.add('active');
    
    // Attiva il bottone corrispondente
    event.target.classList.add('active');
    
    // Se è la pagina statistiche, carica i dati
    if (nomePagina === 'statistiche' && datiGlobali) {
        visualizzaStatistiche(datiGlobali.classifica, datiGlobali.partiteConElo.length);
        visualizzaStatisticheDettagliate(datiGlobali.classifica);
    }
}

// Variabile globale per memorizzare i dati
let datiGlobali = null;

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
        
        const { classifica, partiteConElo } = calcolaClassifica(partite);
        
        // Memorizza i dati globalmente
        datiGlobali = { classifica, partiteConElo };
        
        // Visualizza classifica
        visualizzaClassifica(classifica);
        
        // Visualizza partite
        visualizzaPartite(partiteConElo);
        
        // Prepara statistiche (saranno caricate quando si visita la pagina)
        document.getElementById('detailedStats').innerHTML = '';
        
    } catch (error) {
        document.getElementById('playersList').innerHTML = 
            `<div class="error">Errore: ${error.message}</div>`;
        document.getElementById('matchesList').innerHTML = 
            `<div class="error">Errore: ${error.message}</div>`;
    }
}

// Chiudi il modal cliccando fuori
window.onclick = function(event) {
    const modal = document.getElementById('matchModal');
    if (event.target === modal) {
        chiudiModal();
    }
}

// Avvia l'applicazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', inizializza);
