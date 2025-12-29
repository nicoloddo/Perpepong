# Backend Module Organization

This directory contains all backend logic organized by domain functionality.

## 📁 File Structure

```
src/backend/
├── index.js                  # ✅ Main entry point - exports all functions
├── elo-calculations.js       # ELO rating computations
├── matches-loader.js         # Data loading from Supabase/file
├── rankings.js               # Leaderboard and ranking calculations
├── statistics.js             # Player stats and matchup analysis
├── supabase.js              # Supabase client and API calls
├── deterministic-rng.js     # Random number generation (virtualini)
└── virtual-match.js         # Virtual match simulation (virtualini)
```

## 🎯 Module Domains

### **index.js** - Main Entry Point
Re-exports all functions from domain modules. Import from here in your code:

```javascript
// All pages should import from index.js
<script type="module" src="./src/backend/index.js"></script>
```

Functions are automatically available on `window` object for backward compatibility.

---

### **elo-calculations.js** - ELO Rating Calculations
Pure mathematical computations for the ELO rating system.

**Exports:**
- `calcolaElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32)` - Calculates new ELO rating
- `calcolaDettagliElo(playerElo, opponentElo, playerScore, opponentScore, kFactor = 32)` - Returns detailed ELO calculation breakdown

---

### **matches-loader.js** - Data Loading
Handles loading match data from various sources.

**Exports:**
- `caricaPartite()` - Loads matches from Supabase (primary method)
- `caricaPartiteDaFile()` - [LEGACY] Loads matches from matches.txt file

---

### **rankings.js** - Rankings & Leaderboards
Calculates player rankings based on ELO progression through match history.

**Exports:**
- `calcolaClassifica(partite)` - Calculates full leaderboard with all player stats
- `calcolaClassificaFinoA(partite, indice)` - Calculates rankings up to a specific match index

**Dependencies:**
- Uses `calcolaElo` from `elo-calculations.js`

---

### **statistics.js** - Statistics & Analytics
Player-specific statistics, matchup analysis, and global stats.

**Exports:**
- `calcolaStatisticheGlobali(classifica, numeroPartite)` - Global tournament statistics
- `calcolaStatisticheGiocatore(partite, playerName)` - Detailed player match history with ELO progression
- `calcolaStatisticheMatchup(partite, classifica)` - Head-to-head matchup statistics for all player pairs
- `trovaMatchupInteressanti(partite, classifica)` - Finds most balanced, surprising, and dominant matchups
- `calcolaMatchupGiocatore(partite, playerName, classifica)` - Player-specific matchup statistics

**Dependencies:**
- Uses `calcolaElo` from `elo-calculations.js`

---

### **supabase.js** - Supabase Integration
Handles all Supabase API interactions.

**Exports:**
- `supabase` - Supabase client instance
- `fetchMatchesFromSupabase()` - Fetches matches from database
- `fetchPlayersFromSupabase()` - Fetches players list
- `transformSupabaseMatchesToEloFormat(supabaseMatches)` - Transforms snake_case DB data to camelCase

---

## 🔄 Migration from Old Structure

### Before (Monolithic)
```
src/backend/
└── elo.js  # 574 lines - everything in one file
```

### After (Modular)
```
src/backend/
├── index.js                # Central export
├── elo-calculations.js     # ~70 lines - pure ELO math
├── matches-loader.js       # ~80 lines - data loading
├── rankings.js            # ~110 lines - rankings
├── statistics.js          # ~320 lines - stats & analysis
└── supabase.js           # ~80 lines - API client
```

## 📝 Usage Examples

### In Components/Pages
```javascript
// Functions are automatically available on window object
const matches = await caricaPartite();
const rankings = calcolaClassifica(matches);
const stats = calcolaStatisticheGlobali(rankings, matches.length);
```

### Direct ES6 Imports (if needed)
```javascript
import { calcolaElo } from './src/backend/elo-calculations.js';
import { caricaPartite } from './src/backend/matches-loader.js';
```

## ✅ Benefits

1. **Separation of Concerns** - Each file has a single responsibility
2. **Easier Testing** - Test individual modules in isolation
3. **Better Code Navigation** - Find functions by domain
4. **Maintainability** - Smaller files are easier to understand and modify
5. **Reusability** - Import only what you need
6. **Backward Compatible** - All functions still available on `window` object

## 🚀 Adding New Functions

1. Add function to appropriate domain file
2. Export it from that file
3. Re-export it from `index.js`
4. Add to `window` object in `index.js` if needed for backward compatibility

Example:
```javascript
// In statistics.js
export function calcolaStreaks(partite, playerName) {
    // implementation
}

// In index.js
export { 
    calcolaStatisticheGlobali,
    calcolaStreaks  // Add new export
} from './statistics.js';

// Add to window object
if (typeof window !== 'undefined') {
    window.calcolaStreaks = calcolaStreaks;
}
```
