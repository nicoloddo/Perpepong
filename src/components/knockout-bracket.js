/**
 * Knockout Bracket Web Component
 * Displays tournament knockout stage as a classic bracket visualization
 * 
 * Attributes:
 * - nodes: JSON string of node objects
 * - tournament-id: Tournament UUID
 * 
 * Usage:
 * <knockout-bracket nodes='[...]' tournament-id="uuid"></knockout-bracket>
 */
class KnockoutBracket extends HTMLElement {
  connectedCallback() {
    const nodesStr = this.getAttribute('nodes') || '[]';
    const tournamentId = this.getAttribute('tournament-id');
    
    let nodes = [];
    try {
      nodes = JSON.parse(nodesStr);
    } catch (e) {
      console.error('Error parsing nodes JSON:', e);
    }
    
    if (nodes.length === 0) {
      this.innerHTML = `
        <div class="bg-card rounded-xl shadow-lg p-8 text-center text-muted-foreground">
          Nessun tabellone eliminazione diretta disponibile
        </div>
      `;
      return;
    }
    
    // Group nodes by type
    const nodesByType = this.groupNodesByType(nodes);
    
    // Render bracket with zoom-out scaling
    this.innerHTML = `
      <div class="bg-card rounded-xl shadow-lg p-4 overflow-auto">
        <div class="bracket-container" style="min-width: 800px; transform: scale(0.85); transform-origin: top left; width: 117%;">
          ${this.renderBracket(nodesByType)}
        </div>
      </div>
    `;
  }
  
  groupNodesByType(nodes) {
    const grouped = {};
    nodes.forEach(node => {
      if (!grouped[node.type]) {
        grouped[node.type] = [];
      }
      grouped[node.type].push(node);
    });
    return grouped;
  }
  
  renderBracket(nodesByType) {
    // Determine bracket stages in order (from early to final)
    const stageOrder = ['quarterfinal', 'semifinal', 'final'];
    const stages = stageOrder.filter(stage => nodesByType[stage]);
    
    if (stages.length === 0) {
      return '<div class="text-center text-muted-foreground p-4">Nessuna fase eliminatoria configurata</div>';
    }
    
    // Build bracket HTML with CSS Grid
    return `
      <div class="grid gap-8" style="grid-template-columns: repeat(${stages.length}, 1fr);">
        ${stages.map(stage => this.renderStage(stage, nodesByType[stage])).join('')}
      </div>
    `;
  }
  
  renderStage(stageName, nodes) {
    const stageLabels = {
      'quarterfinal': 'Quarti di Finale',
      'semifinal': 'Semifinali',
      'final': 'Finale'
    };
    
    return `
      <div class="space-y-4">
        <h4 class="text-center font-bold text-primary text-sm uppercase tracking-wide">${stageLabels[stageName]}</h4>
        <div class="space-y-8">
          ${nodes.map(node => this.renderNode(node)).join('')}
        </div>
      </div>
    `;
  }
  
  renderNode(node) {
    const players = node.players || [];
    const player1 = players[0] || '';
    const player2 = players[1] || '';
    const tournamentId = this.getAttribute('tournament-id');
    
    // Only allow clicking if both players are present
    const canViewMatches = player1 && player2;
    const clickHandler = canViewMatches 
      ? `onclick="window.location.href = window.getPath('/tornei/partite/?tournament=${encodeURIComponent(tournamentId)}&node=${encodeURIComponent(node.id)}')"` 
      : '';
    const cursorClass = canViewMatches ? 'cursor-pointer hover:border-primary hover:shadow-md' : '';
    
    const statusConfig = {
      'pending': 'bg-muted text-muted-foreground',
      'waiting': 'bg-blue-500/10 text-blue-500',
      'in_progress': 'bg-destructive/10 text-destructive',
      'completed': 'bg-green-500/10 text-green-500'
    };
    
    const statusClass = statusConfig[node.status] || statusConfig['pending'];
    
    return `
      <div class="bg-muted/30 rounded-lg p-3 border-2 border-border relative ${cursorClass} transition-all"
           ${clickHandler}>
        <div class="text-xs font-semibold ${statusClass} px-2 py-1 rounded mb-2 inline-block">
          ${node.name}
        </div>
        <div class="space-y-2">
          <div class="bg-card p-2 rounded text-sm font-semibold ${player1 ? 'text-foreground' : 'text-muted-foreground'}">
            ${player1 || 'In attesa...'}
          </div>
          <div class="text-center text-muted-foreground text-xs">vs</div>
          <div class="bg-card p-2 rounded text-sm font-semibold ${player2 ? 'text-foreground' : 'text-muted-foreground'}">
            ${player2 || 'In attesa...'}
          </div>
        </div>
        ${canViewMatches ? '<div class="text-center mt-2 text-xs text-primary font-semibold">Clicca per vedere partite</div>' : ''}
      </div>
    `;
  }
}

customElements.define('knockout-bracket', KnockoutBracket);
