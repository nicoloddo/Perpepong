# 🏓 Classifica Perpeponghieri

Un'applicazione web per tracciare e visualizzare le classifiche dei giocatori basate sul sistema di rating ELO, simile a quello utilizzato negli scacchi.

## 🎯 Caratteristiche

- **Sistema ELO Avanzato**: Calcolo del rating basato sul sistema ELO degli scacchi
- **Fattore Differenza Punti**: Il margine di vittoria influenza il cambio di rating
- **Statistiche Dettagliate**: Visualizzazione di vittorie, sconfitte, punti segnati per ogni giocatore
- **Design Moderno**: Interfaccia responsive e accattivante
- **Tutto in Italiano**: Interfaccia completamente localizzata

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

1. Apri il file `index.html` nella root del progetto in un browser moderno
2. Assicurati che il file `matches.txt` sia nella root del progetto

**Nota**: A causa delle restrizioni CORS, è necessario usare un server locale:

```bash
# Con Python 3
python -m http.server 8000

# Oppure con Node.js
npx serve

# Oppure con PHP
php -S localhost:8000
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

## 🛠️ Struttura del Progetto

```
Perpepong/
├── index.html              # Redirect alla home page
├── matches.txt             # File dati con lo storico delle partite
├── README.md               # Documentazione
└── src/
    ├── backend/
    │   └── elo.js          # Logica di calcolo ELO e gestione dati
    ├── shared/             # Componenti condivisi
    │   ├── base.css        # Stili base comuni a tutte le pagine
    │   ├── header/
    │   │   ├── header.html # Componente header
    │   │   └── header.css  # Stili header
    │   └── nav/
    │       ├── nav.html    # Componente navigazione
    │       └── nav.css     # Stili navigazione
    └── pages/
        ├── home/
        │   └── index.html  # Pagina principale con classifica
        ├── matches/
        │   └── index.html  # Lista di tutte le partite
        ├── match-detail/
        │   └── index.html  # Dettaglio partita con calcolo ELO
        ├── player-profile/
        │   └── index.html  # Profilo del giocatore
        ├── quote/
        │   └── index.html  # Quote scommesse e confronti
        └── stats/
            └── index.html  # Statistiche globali
```

### `src/backend/elo.js`
Contiene tutta la logica JavaScript:

- `calcolaElo()`: Funzione isolata per il calcolo del rating ELO
- `analizzaRiga()`: Parser per il formato del file matches.txt
- `caricaPartite()`: Carica e processa il file matches.txt
- `calcolaClassifica()`: Calcola gli ELO di tutti i giocatori
- `visualizzaStatistiche()`: Mostra le statistiche globali
- `visualizzaClassifica()`: Renderizza la classifica dei giocatori

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
