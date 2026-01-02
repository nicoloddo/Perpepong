/**
 * Date Group Header Web Component
 * Displays a date header for grouping matches by day
 * 
 * Attributes:
 * - date: The date to display (ISO format or timestamp)
 * 
 * Usage:
 * <date-group-header date="2024-01-15"></date-group-header>
 */
class DateGroupHeader extends HTMLElement {
  connectedCallback() {
    const dateStr = this.getAttribute('date');
    
    // Parse and format the date
    const date = new Date(dateStr);
    
    // Format the date in Italian style
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('it-IT', options);
    
    // Capitalize first letter
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    this.innerHTML = `
      <div class="bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-3 mb-2 mt-4 first:mt-0 rounded-lg">
        <div class="text-sm font-bold text-white uppercase tracking-wide">
          ${capitalizedDate}
        </div>
      </div>
    `;
  }
}

customElements.define('date-group-header', DateGroupHeader);

