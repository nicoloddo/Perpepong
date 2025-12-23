# 🏓 Classifica Perpeponghieri

Un'applicazione web per tracciare e visualizzare le classifiche dei giocatori basate sul sistema di rating ELO, simile a quello utilizzato negli scacchi.

## 🎯 Caratteristiche

- **Sistema ELO Avanzato**: Calcolo del rating basato sul sistema ELO degli scacchi
- **Fattore Differenza Punti**: Il margine di vittoria influenza il cambio di rating
- **Multi-pagina**: Navigazione tra Classifica, Partite e Statistiche
- **Dettaglio Calcoli**: Clicca su una partita per vedere come è stato calcolato l'ELO
- **Spiegazioni User-Friendly**: Capire facilmente perché l'ELO è cambiato
- **Statistiche Dettagliate**: Visualizzazione di vittorie, sconfitte, punti segnati per ogni giocatore
- **Design Moderno**: Interfaccia responsive e accattivante
- **Tutto in Italiano**: Interfaccia completamente localizzata

## 📱 Sezioni dell'Applicazione

### 🏆 Classifica
Visualizza tutti i giocatori ordinati per ELO con:
- Posizione in classifica (medaglie per i primi 3)
- Rating ELO corrente
- Statistiche complete (partite, vittorie, sconfitte, percentuali)
- Punti totali segnati

### ⚔️ Partite
Storico completo di tutte le partite con:
- Numero progressivo della partita
- Risultato e punteggio
- Cambi di ELO per entrambi i giocatori
- **Clicca su una partita** per vedere il calcolo dettagliato dell'ELO!

### 📊 Statistiche
Dashboard completa con:
- Numero giocatori, partite totali
- ELO medio, massimo e minimo
- Punti medi per partita
- Record e primati (più partite, più vittorie, miglior percentuale, ecc.)

## 🔍 Dettaglio Calcolo ELO (Novità!)

Cliccando su qualsiasi partita nella sezione "Partite", si apre una finestra modale che mostra:

### Per ogni giocatore:
1. **Situazione Iniziale**
   - ELO iniziale e dell'avversario
   - Differenza di ELO
   
2. **Probabilità di Vittoria**
   - Probabilità calcolata in base alla differenza di ELO
   - Formula matematica visualizzata
   - Spiegazione se era favorito o sfavorito
   
3. **Impatto della Differenza Punti**
   - Differenza di punteggio nella partita
   - Fattore moltiplicativo applicato
   - Spiegazione dell'impatto (equilibrata, moderata, schiacciante)
   
4. **Calcolo Finale**
   - Cambio ELO base (senza fattore differenza)
   - Cambio ELO finale (con fattore differenza)
   - Formula completa del calcolo
   - **Spiegazione in parole semplici** del perché l'ELO è cambiato di quella quantità

### Esempio di Spiegazione
> "Eri lo sfavorito (ELO inferiore di 150), quindi questa vittoria vale molto! Il margine di 8 punti dimostra una vittoria dominante, quindi guadagni +45 punti ELO."

Questo aiuta a capire l'impatto sia del **risultato** (vittoria/sconfitta) che del **margine** (differenza punti).

## 📁 Formato Dati

Il file `matches.txt` deve contenere una partita per riga nel seguente formato:

```
nome1 - nome2: punteggio1-punteggio2
```

### Esempio:

```
london - sergej: 21-23
mario - luigi: 15-21
london - mario: 21-18
```

## 🔢 Calcolo ELO

### Formula Base

Il calcolo dell'ELO segue la formula standard degli scacchi:

1. **Punteggio Atteso**: `E = 1 / (1 + 10^((ELO_avversario - ELO_giocatore) / 400))`
2. **Risultato Effettivo**: `R = 1` (vittoria) o `0` (sconfitta)
3. **Cambio ELO**: `Δ = K × M × (R - E)`

Dove:
- `K` = 32 (fattore K standard)
- `M` = Moltiplicatore basato sulla differenza punti

### Fattore Differenza Punti

Il moltiplicatore `M` è calcolato come:

```
M = 1 + (|punteggio_giocatore - punteggio_avversario| / 20)
```

Questo significa che:
- Una vittoria 21-20 ha un impatto quasi normale (M ≈ 1.05)
- Una vittoria 21-15 ha un impatto maggiore (M ≈ 1.30)
- Una vittoria 21-10 ha un impatto significativo (M ≈ 1.55)

### ELO Iniziale

Tutti i giocatori iniziano con un ELO di **1500 punti**.

## 🚀 Come Usare

### GitHub Pages

1. Carica i file su un repository GitHub
2. Vai nelle impostazioni del repository
3. Abilita GitHub Pages nella sezione "Pages"
4. Seleziona il branch `main` e la cartella root `/`
5. Il sito sarà disponibile all'indirizzo: `https://[tuo-username].github.io/[nome-repo]`

### Locale

1. Apri il file `index.html` in un browser moderno
2. Assicurati che il file `matches.txt` sia nella stessa cartella

**Nota**: A causa delle restrizioni CORS, potrebbe essere necessario usare un server locale:

```bash
# Con Python 3
python -m http.server 8000

# Oppure con Node.js
npx serve
```

Poi visita `http://localhost:8000`

## 📊 Funzionalità

### Statistiche Globali

- Numero totale di giocatori
- Numero totale di partite
- ELO medio
- ELO massimo

### Classifica Giocatori

Per ogni giocatore viene mostrato:
- Posizione in classifica (con medaglie per i primi 3)
- Nome
- Rating ELO corrente
- Numero di partite giocate
- Record vittorie-sconfitte
- Percentuale di vittorie
- Punti totali segnati

## 🛠️ Struttura del Codice

### `index.html`
File principale con:
- Struttura HTML multi-pagina (SPA)
- Stili CSS completi
- Navigazione tra sezioni
- Modal per dettaglio partite

### `elo.js`
Contiene tutta la logica JavaScript:

#### Funzioni Core
- `calcolaElo()`: Funzione isolata per il calcolo del rating ELO con dettagli completi
- `analizzaRiga()`: Parser per il formato del file matches.txt
- `caricaPartite()`: Carica e processa il file matches.txt
- `calcolaClassifica()`: Calcola gli ELO di tutti i giocatori e memorizza i dettagli di ogni partita

#### Funzioni di Visualizzazione
- `visualizzaClassifica()`: Renderizza la classifica dei giocatori
- `visualizzaPartite()`: Mostra lo storico delle partite
- `visualizzaStatistiche()`: Mostra le statistiche globali
- `visualizzaStatisticheDettagliate()`: Mostra analisi e record

#### Funzioni Interattive
- `mostraPagina()`: Gestisce la navigazione tra pagine
- `mostraDettaglioPartita()`: Apre il modal con i dettagli del calcolo ELO
- `generaCalcoloGiocatore()`: Genera la visualizzazione dettagliata del calcolo per un giocatore
- `spiegaCambioElo()`: Crea spiegazioni user-friendly dei cambi di ELO
- `chiudiModal()`: Chiude il modal dei dettagli

### `matches.txt`
File di dati contenente lo storico delle partite.

## 🎨 Personalizzazione

### Modificare il Fattore K

Nel file `elo.js`, puoi modificare il valore predefinito del fattore K nella funzione `calcolaElo()`:

```javascript
function calcolaElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32)
```

### Modificare il Fattore Differenza Punti

Nella funzione `calcolaElo()`, modifica questa riga:

```javascript
const fattoreDifferenza = 1 + (differenzaPunti / 20);
```

Riduci il divisore (es. `/10`) per un impatto maggiore, aumentalo (es. `/30`) per un impatto minore.

### Modificare l'ELO Iniziale

Nella funzione `calcolaClassifica()`, modifica:

```javascript
const ELO_INIZIALE = 1500;
```

## 📝 Licenza

Progetto open source - sentiti libero di usarlo e modificarlo come preferisci!

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di aprire issue o pull request.
