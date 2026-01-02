/**
 * Group Ranking Web Component
 * Displays a tournament group with player rankings
 * 
 * Attributes:
 * - group-name: Display name (e.g., "Girone A")
 * - players: JSON string of player objects with {username, points, wins, losses}
 * - tournament-id: Tournament UUID
 * - node-id: Node UUID
 * 
 * Usage:
 * <group-ranking 
 *   group-name="Girone A"
 *   players='[{"username":"Player1","points":6,"wins":2,"losses":0}]'
 *   tournament-id="uuid"
 *   node-id="uuid">
 * </group-ranking>
 */
class GroupRanking extends HTMLElement {
  connectedCallback() {
    const groupName = this.getAttribute('group-name');
    const playersStr = this.getAttribute('players') || '[]';
    const tournamentId = this.getAttribute('tournament-id');
    const nodeId = this.getAttribute('node-id');
    
    let players = [];
    try {
      players = JSON.parse(playersStr);
    } catch (e) {
      console.error('Error parsing players JSON:', e);
    }
    
    // Sort players by points descending
    players.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg overflow-hidden mb-4">
        <div class="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex justify-between items-center">
          <h3 class="text-lg font-bold">${groupName}</h3>
          <div class="text-xs text-primary-foreground/70">
            Partite non ancora implementate
          </div>
        </div>
        
        <div class="p-4">
          <table class="w-full">
            <thead class="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th class="text-left pb-2">Pos</th>
                <th class="text-left pb-2">Giocatore</th>
                <th class="text-center pb-2">V</th>
                <th class="text-center pb-2">P</th>
                <th class="text-center pb-2">Pts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              ${players.map((player, index) => `
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="py-3 text-sm font-semibold text-primary">${index + 1}</td>
                  <td class="py-3 text-sm font-semibold">${player.username}</td>
                  <td class="py-3 text-sm text-center text-green-500">${player.wins || 0}</td>
                  <td class="py-3 text-sm text-center text-destructive">${player.losses || 0}</td>
                  <td class="py-3 text-sm text-center font-bold text-primary">${player.points || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

customElements.define('group-ranking', GroupRanking);
