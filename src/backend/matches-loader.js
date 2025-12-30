/**
 * Matches Data Loading Functions
 * Handles loading match data from various sources
 */

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
 * Carica e processa le partite da Supabase
 */
export async function caricaPartite() {
    try {
        // Dynamically import Supabase module
        const { fetchMatchesFromSupabase, transformSupabaseMatchesToEloFormat } = await import('./supabase.js');
        
        // Fetch matches from Supabase
        const supabaseMatches = await fetchMatchesFromSupabase();
        
        // Transform to elo.js format
        const partite = transformSupabaseMatchesToEloFormat(supabaseMatches);
        
        console.log('Partite caricate da Supabase:', partite.length);
        return partite;
    } catch (error) {
        console.error('Errore nel caricamento delle partite da Supabase:', error);
        throw error;
    }
}

/**
 * Carica il numero totale di partite da Supabase
 * @returns {Promise<number>} Total number of matches
 */
export async function caricaConteggioPartite() {
    try {
        const { fetchMatchesCount } = await import('./supabase.js');
        const count = await fetchMatchesCount();
        console.log('Conteggio totale partite:', count);
        return count;
    } catch (error) {
        console.error('Errore nel caricamento del conteggio partite:', error);
        throw error;
    }
}

/**
 * Carica partite paginate da Supabase
 * @param {number} startIndex - Starting index (inclusive)
 * @param {number} stopIndex - Ending index (inclusive)
 * @param {boolean} ascending - Sort order (default: false for newest first)
 * @returns {Promise<Array>} Array of match objects in elo.js format
 */
export async function caricaPartitePaginate(startIndex, stopIndex, ascending = false) {
    try {
        const { fetchMatchesPaginated, transformSupabaseMatchesToEloFormat } = await import('./supabase.js');
        
        // Fetch paginated matches from Supabase
        const supabaseMatches = await fetchMatchesPaginated(startIndex, stopIndex, ascending);
        
        // Transform to elo.js format
        const partite = transformSupabaseMatchesToEloFormat(supabaseMatches);
        
        console.log('Partite paginate caricate:', partite.length);
        return partite;
    } catch (error) {
        console.error('Errore nel caricamento delle partite paginate:', error);
        throw error;
    }
}

/**
 * [LEGACY] Carica e processa le partite dal file matches.txt
 * Kept for backward compatibility or fallback
 */
export async function caricaPartiteDaFile() {
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
        
        console.log('Partite caricate dal file:', partite.length);
        return partite;
    } catch (error) {
        console.error('Errore nel caricamento delle partite dal file:', error);
        throw error;
    }
}
