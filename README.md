# 🏓 Classifica Perpeponghieri

Un'applicazione web per tracciare e visualizzare le classifiche dei giocatori basate sul sistema di rating ELO, simile a quello utilizzato negli scacchi.

## 🎯 Caratteristiche

- **Sistema ELO Avanzato**: Calcolo del rating basato sul sistema ELO degli scacchi
- **Fattore Differenza Punti**: Il margine di vittoria influenza il cambio di rating
- **Statistiche Dettagliate**: Visualizzazione di vittorie, sconfitte, punti segnati per ogni giocatore
- **Design Moderno**: Interfaccia responsive con Tailwind CSS e shadcn/ui
- **Web Components**: Componenti riutilizzabili nativi del browser
- **Completamente Statico**: Perfetto per GitHub Pages, nessun server backend richiesto
- **Tutto in Italiano**: Interfaccia completamente localizzata

## 🔧 Tecnologie

- **HTML5 + JavaScript ES6**: Logica applicativa
- **Tailwind CSS**: Framework CSS utility-first
- **shadcn/ui**: Componenti UI professionali
- **Web Components**: Componenti personalizzati nativi (`<app-header>`, `<app-nav>`, `<match-card>`)
- **Sistema ELO**: Algoritmo di rating matematico

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

### Sviluppo Locale

1. Installa le dipendenze:
```bash
npm install
```

2. Avvia il watch mode per Tailwind CSS (ricompila automaticamente i CSS):
```bash
npm run dev
```

3. In un altro terminale, avvia un server locale:
```bash
# Con Python 3
python -m http.server 8000

# Oppure con Node.js
npx serve

# Oppure con PHP
php -S localhost:8000
```

4. Visita `http://localhost:8000` nel browser

**Nota**: Il server locale è necessario a causa delle restrizioni CORS per il caricamento di `matches.txt`.

### Build per Produzione

Prima di fare il deploy, genera il CSS ottimizzato:

```bash
npm run build:css
```

Questo comando genera il file `src/shared/output.css` minificato pronto per la produzione.

### GitHub Pages

1. Esegui il build del CSS: `npm run build:css`
2. Fai commit di tutti i file incluso `src/shared/output.css`
3. Vai nelle impostazioni del repository su GitHub
4. Abilita GitHub Pages nella sezione "Pages"
5. Seleziona il branch `main` e la cartella root `/`
6. Il sito sarà disponibile all'indirizzo: `https://[tuo-username].github.io/[nome-repo]`

**Importante**: Assicurati di committare il file `src/shared/output.css` generato, necessario per GitHub Pages.

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

## 🧩 Web Components

L'applicazione utilizza Web Components nativi per componenti riutilizzabili:

### `<app-header>`
Header principale dell'applicazione con titolo e sottotitolo.

```html
<app-header></app-header>
<app-header title="Titolo Personalizzato" subtitle="Sottotitolo"></app-header>
```

**Attributi**:
- `title`: Titolo personalizzato (default: "🏓 Classifica Perpeponghieri")
- `subtitle`: Sottotitolo (default: "Sistema di Rating ELO")

### `<app-nav>`
Barra di navigazione fissa in basso con indicatore pagina attiva.

```html
<app-nav active="home"></app-nav>
<app-nav active="matches"></app-nav>
```

**Attributi**:
- `active`: ID della pagina attiva (`home`, `matches`, `quote`, `stats`)

### `<match-card>`
Card per visualizzare una partita con giocatori e punteggio.

```html
<match-card 
  match-number="1" 
  match-index="0"
  player1="London" 
  player2="Sergej" 
  score1="21" 
  score2="18">
</match-card>
```

**Attributi**:
- `match-number`: Numero della partita visualizzato
- `match-index`: Indice per la navigazione (base 0)
- `player1`: Nome del primo giocatore
- `player2`: Nome del secondo giocatore
- `score1`: Punteggio primo giocatore
- `score2`: Punteggio secondo giocatore
- `clickable`: "true"/"false" per abilitare/disabilitare il click (default: "true")

### Registrazione Components

I Web Components vengono registrati automaticamente importando:

```html
<script type="module" src="../../components/register.js"></script>
```

## 🛠️ Struttura del Progetto

```
Perpepong/
├── index.html                  # Redirect alla home page
├── matches.txt                 # File dati con lo storico delle partite
├── README.md                   # Documentazione
├── package.json                # Dipendenze e script npm
├── tailwind.config.js          # Configurazione Tailwind CSS
├── components.json             # Configurazione shadcn/ui
├── jsconfig.json               # Configurazione import aliases
├── .gitignore                  # File da ignorare in git
├── components/                 # Componenti shadcn/ui
│   └── ui/                     # Componenti UI (card, button, badge, etc.)
│       ├── card.jsx
│       ├── button.jsx
│       └── ...
├── lib/
│   └── utils.js                # Utility functions (cn helper)
└── src/
    ├── backend/
    │   └── elo.js              # Logica di calcolo ELO e gestione dati
    ├── components/             # Web Components personalizzati
    │   ├── register.js         # Registra tutti i Web Components
    │   ├── app-header.js       # Header component (<app-header>)
    │   ├── app-nav.js          # Navigation component (<app-nav>)
    │   └── match-card.js       # Match card component (<match-card>)
    ├── shared/
    │   ├── input.css           # Tailwind CSS sorgente (non committato)
    │   └── output.css          # CSS compilato per produzione (committato)
    └── pages/                  # Pagine dell'applicazione
        ├── home/
        │   └── index.html      # Pagina principale con classifica
        ├── matches/
        │   └── index.html      # Lista di tutte le partite
        ├── match-detail/
        │   └── index.html      # Dettaglio partita con calcolo ELO
        ├── player-profile/
        │   └── index.html      # Profilo del giocatore
        ├── quote/
        │   └── index.html      # Quote scommesse e confronti
        └── stats/
            └── index.html      # Statistiche globali
```

### `src/backend/elo.js`
Contiene tutta la logica JavaScript per il calcolo ELO:

- `calcolaElo()`: Funzione isolata per il calcolo del rating ELO
- `analizzaRiga()`: Parser per il formato del file matches.txt
- `caricaPartite()`: Carica e processa il file matches.txt
- `calcolaClassifica()`: Calcola gli ELO di tutti i giocatori
- `visualizzaStatistiche()`: Mostra le statistiche globali (con Tailwind classes)
- `visualizzaClassifica()`: Renderizza la classifica dei giocatori (con Tailwind classes)

### `src/components/`
Web Components personalizzati dell'applicazione:

- `app-header.js`: Componente header riutilizzabile
- `app-nav.js`: Componente navigazione con stato attivo
- `match-card.js`: Card per visualizzare partite
- `register.js`: File di registrazione che importa tutti i components

### `components/ui/`
Componenti shadcn/ui per elementi UI professionali (card, button, badge, select, dialog, table, separator).

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
