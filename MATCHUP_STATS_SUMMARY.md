# Matchup Statistics Enhancement

## Summary

This document describes the enhancements made to the Perpepong application to add matchup statistics on the Quote page and player profile pages.

## Changes Made

### 1. Backend Functions (`src/backend/elo.js`)

Added three new pure computation functions:

#### `calcolaStatisticheMatchup(partite, classifica)`
- Analyzes all matches to build comprehensive matchup statistics between all player pairs
- Calculates:
  - Total games played between each pair
  - Win/loss records
  - Actual win rates vs ELO-predicted win probabilities
  - Balance score (how close to 50/50)
  - Surprise factor (deviation from expected results)

#### `trovaMatchupInteressanti(partite, classifica)`
- Identifies the most interesting matchups:
  - **Most Balanced**: Most evenly matched rivalry (closest to 50/50 with minimum 3 games)
  - **Most Surprising**: Biggest deviation between actual results and ELO predictions (min 3 games)
  - **Most Played**: The most frequent matchup
  - **Most Dominant**: Most one-sided matchup (min 3 games)

#### `calcolaMatchupGiocatore(partite, playerName, classifica)`
- Calculates matchup statistics for a specific player against all opponents
- Identifies:
  - **Best Matchup**: Highest win rate (min 2 games)
  - **Worst Matchup**: Lowest win rate (min 2 games)
  - **Biggest Overperformer**: Largest positive deviation from ELO expectation (min 2 games)
  - **Biggest Underperformer**: Largest negative deviation from ELO expectation (min 2 games)

### 2. Quote Page (`src/pages/quote/quote-view.js`)

#### Changed Behavior
- **Before**: Displayed "Seleziona due giocatori per visualizzare le quote e lo storico" when no players selected
- **After**: Shows interesting matchup statistics cards when no players are selected

#### New Method: `renderMatchupStats()`
- Renders 4 cards with interesting matchup statistics
- Each card is clickable and navigates to the detailed comparison
- Cards include:
  - ⚖️ **Matchup Più Equilibrato** (Most Balanced)
  - 🤯 **Matchup Più Sorprendente** (Most Surprising)
  - 🔥 **Rivalità Più Accesa** (Most Played / Hottest Rivalry)
  - 👑 **Dominio Totale** (Most Dominant)

### 3. Player Profile Page (`src/pages/player-profile/player-profile-view.js`)

#### Added Section: Statistiche Matchup
New section displayed between "Statistiche Dettagliate" and "Storico Partite"

#### New Method: `renderMatchupStat(emoji, title, matchup, playerName)`
- Renders individual matchup statistic cards
- Shows "Dati insufficienti" when less than 2 games played
- Displays:
  - Win-loss record
  - Win rate percentage
  - Expected win probability based on ELO
  - Performance deviation (overperformance/underperformance)

#### Four Statistics Displayed:
- 🏆 **Miglior Matchup** (Best Matchup)
- 😰 **Peggior Matchup** (Worst Matchup)
- 💪 **Maggiore Overperformance** (Biggest Overperformance)
- 📉 **Maggiore Underperformance** (Biggest Underperformance)

## Design Decisions

### Minimum Game Thresholds
- **Matchup Statistics**: Requires 3+ games for "interesting" matchups (balanced, surprising, dominant)
- **Player Matchups**: Requires 2+ games to show best/worst matchups
- Rationale: Ensures statistical significance and avoids highlighting flukes

### Balance Score Calculation
- Formula: `1 - Math.abs(0.5 - winRate)`
- Range: 0 (completely one-sided) to 1 (perfectly balanced)
- Tie-breaker: When balance scores are close (<0.05 difference), prefer more games played

### Surprise Factor Calculation
- Formula: `Math.abs(actualWinRate - predictedWinProb)`
- Measures how much reality deviates from ELO expectations
- Higher values = more surprising results

### Overperformance/Underperformance
- Formula: `actualWinRate - predictedWinProb`
- Positive = player is performing better than ELO suggests
- Negative = player is performing worse than ELO suggests

## User Experience

### Quote Page
- Users can now see interesting matchup highlights immediately
- Clicking any statistic card navigates to the detailed head-to-head comparison
- Maintains existing player selection functionality

### Player Profile Page
- New insight into player's strengths and weaknesses
- Helps identify favorable/unfavorable opponents
- Shows how player performs relative to expectations
- All matchup cards are clickable to view full head-to-head stats

## Technical Notes

### Separation of Concerns
- All computation logic remains in `elo.js` (backend)
- Component files handle only rendering and user interaction
- Follows existing project architecture patterns

### Performance
- Calculations are done once when page loads
- No additional API calls or data fetching required
- Uses existing match data and ranking calculations

### Compatibility
- No breaking changes to existing functionality
- Works with current data structure
- Handles edge cases (insufficient data, no matchups, etc.)

## Testing Recommendations

1. Navigate to `/quote/` and verify 4 matchup statistics cards appear
2. Click each card and verify navigation to correct player comparison
3. Navigate to any player profile page
4. Verify "Statistiche Matchup" section appears with 4 cards
5. Click each matchup card and verify navigation works
6. Test with players who have limited matchup data (<2 games with some opponents)
7. Verify "Dati insufficienti" message appears appropriately

## Future Enhancements (Optional)

Potential improvements for future iterations:
- Add more matchup metrics (point differential, comeback wins, etc.)
- Add filters/sorting options for viewing all matchups
- Create a dedicated "Matchups" page with full comparison matrix
- Add historical trends (how matchup evolved over time)
- Include psychological factors (win streaks in matchups)
