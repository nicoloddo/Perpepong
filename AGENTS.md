# 🤖 Agent Guide - Perpepong Architecture

This document explains the architecture patterns and conventions used in this project. Follow these patterns when making changes or adding features.

## 📋 Table of Contents

- [Core Principles](#core-principles)
- [Directory Structure](#directory-structure)
- [File Naming Conventions](#file-naming-conventions)
- [Component Architecture](#component-architecture)
- [Separation of Concerns](#separation-of-concerns)
- [Adding New Pages](#adding-new-pages)
- [Adding New Components](#adding-new-components)
- [Navigation & Routing](#navigation--routing)
- [Styling](#styling)
- [Development Workflow](#development-workflow)

---

## 🎯 Core Principles

1. **Pure computation in backend** - No DOM manipulation in `elo.js`
2. **Web Components for UI** - Native browser components, no framework
3. **Self-contained components** - Each component manages its own lifecycle
4. **Declarative HTML** - Pages are clean, no inline scripts
5. **Clear separation** - Shared vs page-specific components
6. **Consistent naming** - Files match their purpose and location

---

## 📁 Directory Structure

```
Perpepong/
├── index.html                    # Home page (accessible via /)
├── matches/                      # /matches/ URL
│   └── index.html                # Page HTML
├── quote/                        # /quote/ URL
│   └── index.html                # Page HTML
├── virtualini/                   # /virtualini/ URL
│   └── index.html                # Page HTML
├── match-detail/                 # /match-detail/ URL
│   └── index.html                # Page HTML
├── player-profile/               # /player-profile/ URL
│   └── index.html                # Page HTML
├── matches.txt                   # Match data (never move/delete)
├── README.md                     # User documentation
├── AGENTS.md                     # This file - architecture guide
├── package.json                  # Dependencies and build scripts
├── tailwind.config.js            # Tailwind configuration
├── components.json               # shadcn/ui configuration
│
├── components/                   # shadcn/ui components (auto-generated)
│   └── ui/
│       ├── card.jsx
│       ├── button.jsx
│       └── ...
│
├── lib/
│   └── utils.js                  # Utility functions (cn helper)
│
└── src/
    ├── backend/
    │   └── elo.js                # ✅ PURE COMPUTATION ONLY
    │
    ├── components/               # ✅ SHARED reusable components
    │   ├── register.js           # Import all shared components
    │   ├── app-header.js         # <app-header>
    │   ├── app-nav.js            # <app-nav>
    │   ├── match-card.js         # <match-card>
    │   ├── player-card.js        # <player-card>
    │   ├── stats-grid.js         # <stats-grid>
    │   ├── match-detail-card.js  # <match-detail-card>
    │   └── players-ranking.js    # <players-ranking>
    │
    ├── shared/
    │   ├── input.css             # Tailwind source (gitignored)
    │   └── output.css            # Compiled CSS (committed)
    │
    └── pages/                    # ✅ PAGE-SPECIFIC view components
        ├── home/
        │   └── home-view.js      # Page view component
        ├── matches/
        │   └── matches-view.js
        ├── match-detail/
        │   └── match-detail-view.js
        ├── player-profile/
        │   └── player-profile-view.js
        ├── quote/
        │   └── quote-view.js
        └── virtualini/
            (uses components from other pages)
```

---

## 📝 File Naming Conventions

### HTML Files
- **Pattern**: `index.html`
- **Location**: `/{page-name}/` (root level) OR `/` for home page
- **Example**: `/matches/index.html` or `/index.html` (home)
- **URLs**: Clean URLs like `/matches/`, `/virtualini/`, etc.

### Page View Components
- **Pattern**: `{page-name}-view.js`
- **Location**: `src/pages/{page-name}/`
- **Example**: `src/pages/home/home-view.js`
- **Web Component Name**: `<{page-name}-view>`

### Shared Components
- **Pattern**: `{component-name}.js`
- **Location**: `src/components/`
- **Example**: `src/components/players-ranking.js`
- **Web Component Name**: `<{component-name}>`

### Backend Files
- **Pattern**: `{module-name}.js`
- **Location**: `src/backend/`
- **Example**: `src/backend/elo.js`
- **Rule**: NEVER manipulate DOM, pure computation only

---

## 🧩 Component Architecture

### Component Types

| Type | Location | Purpose | Example |
|------|----------|---------|---------|
| **Static** | `src/components/` | UI with attributes | `<app-header title="...">` |
| **Smart Shared** | `src/components/` | Reusable with data loading | `<players-ranking>` |
| **Page View** | `src/pages/{page}/` | Full page logic | `<home-view>` |
| **Display** | `src/components/` | Data display via attributes | `<player-card rank="1" ...>` |

### Component Structure Example

```javascript
/**
 * Component Name Web Component
 * Brief description of what it does
 * 
 * Attributes (if applicable):
 * - attr-name: Description
 * 
 * Usage:
 * <component-name attr="value"></component-name>
 */
class ComponentName extends HTMLElement {
  async connectedCallback() {
    // 1. Show loading state
    this.innerHTML = '<div>Loading...</div>';
    
    // 2. Load data (if needed)
    const data = await loadData();
    
    // 3. Render content
    this.render(data);
  }
  
  render(data) {
    this.innerHTML = `
      <!-- Component markup -->
    `;
  }
}

customElements.define('component-name', ComponentName);
```

### Component Registration

**Shared components** are registered in `src/components/register.js`:

```javascript
import './app-header.js';
import './app-nav.js';
import './players-ranking.js';
// ... etc
```

**Page-specific components** are imported directly in the page HTML:

```html
<script type="module" src="home-view.js"></script>
```

---

## 🎨 Separation of Concerns

### Backend (`src/backend/elo.js`)

**✅ DO:**
- Pure mathematical calculations
- Data parsing and transformation
- Return computed values
- Export functions

**❌ DON'T:**
- Manipulate DOM
- Use `document.getElementById()`
- Render HTML
- Import components

**Example:**
```javascript
// ✅ GOOD - Pure computation
function calcolaElo(playerElo, opponentElo, playerScore, opponentScore) {
  const risultato = playerScore > opponentScore ? 1 : 0;
  const punteggioAtteso = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  // ... calculations
  return Math.round(nuovoElo);
}

// ❌ BAD - DOM manipulation
function visualizzaClassifica(classifica) {
  document.getElementById('list').innerHTML = '...'; // NO!
}
```

### Components (`src/components/`)

**✅ DO:**
- Manage own lifecycle
- Load own data (if smart component)
- Render HTML via `innerHTML`
- Use backend functions for computation
- Handle user interactions

**❌ DON'T:**
- Duplicate computation logic
- Share global state
- Manipulate other components' DOM

### Pages (`src/pages/`)

**✅ DO:**
- Clean declarative HTML
- Import required components
- Use Web Components as tags

**❌ DON'T:**
- Inline `<script>` tags with logic
- Duplicate component code
- Manipulate DOM directly

**Example Page Structure:**
```html
<!DOCTYPE html>
<html lang="it">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Page Title</title>
 <link rel="stylesheet" href="/src/shared/output.css">
</head>
<body class="min-h-screen p-3 pb-20">
 <div class="container mx-auto max-w-full">
 <app-header></app-header>
 <page-name-view></page-name-view>
 </div>
 <app-nav active="page-name"></app-nav>
 
 <!-- Import order matters! Use absolute paths from root -->
 <script type="module" src="/src/components/register.js"></script>
 <script type="module" src="/src/pages/page-name/page-name-view.js"></script>
 <script src="/src/backend/elo.js"></script>
</body>
</html>
```

---

## ➕ Adding New Pages

Follow this checklist:

1. **Create view component directory**: `src/pages/{page-name}/`

2. **Create view component**: `src/pages/{page-name}/{page-name}-view.js`
 ```javascript
 class PageNameView extends HTMLElement {
 async connectedCallback() {
 // Load data and render
 }
 }
 customElements.define('page-name-view', PageNameView);
 ```

3. **Create page folder at root**: `/{page-name}/`

4. **Create HTML file**: `/{page-name}/index.html`
 ```html
 <!DOCTYPE html>
 <html lang="it">
 <head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Page Title</title>
 <link rel="stylesheet" href="/src/shared/output.css">
 </head>
 <body class="min-h-screen p-3 pb-20">
 <div class="container mx-auto max-w-full">
 <app-header></app-header>
 <page-name-view></page-name-view>
 </div>
 <app-nav active="page-name"></app-nav>
 
 <script type="module" src="/src/components/register.js"></script>
 <script type="module" src="/src/pages/{page-name}/{page-name}-view.js"></script>
 <script src="/src/backend/elo.js"></script>
 </body>
 </html>
 ```

5. **Update navigation**: Add to `src/components/app-nav.js`
 ```javascript
 const navItems = [
 // ... existing items
 { id: 'page-name', label: 'Label', href: '/page-name/' }
 ];
 ```

6. **Test the page**: Visit `http://localhost:8000/page-name/`

---

## 🎨 Adding New Components

### Shared Component (Reusable)

1. **Create component file**: `src/components/{component-name}.js`

2. **Implement component**:
   ```javascript
   class ComponentName extends HTMLElement {
     connectedCallback() {
       const attr = this.getAttribute('attr-name');
       this.innerHTML = `<div>${attr}</div>`;
     }
   }
   customElements.define('component-name', ComponentName);
   ```

3. **Register component**: Add to `src/components/register.js`
   ```javascript
   import './{component-name}.js';
   ```

4. **Use in pages**:
   ```html
   <component-name attr-name="value"></component-name>
   ```

### Page-Specific Component

1. **Create in page directory**: `src/pages/{page}/{component-name}.js`

2. **Import in page HTML**:
   ```html
   <script type="module" src="{component-name}.js"></script>
   ```

---

## 🧭 Navigation & Routing

### URL Structure

- **Home**: `/` (serves `/index.html`)
- **Other pages**: `/{page-name}/` (serves `/{page-name}/index.html`)
- **Examples**: 
  - `/matches/` → `/matches/index.html`
  - `/virtualini/` → `/virtualini/index.html`
  - `/player-profile/?player=London` → with URL parameters

### Internal Links

**Always use absolute paths from root:**

```javascript
// Navigation between pages
'/' // Home
'/matches/' // Matches page
'/quote/' // Quote page
'/player-profile/?player=London' // With parameters

// Examples in code:
onclick="window.location.href='/player-profile/?player=${encodeURIComponent(name)}'"
onclick="window.location.href='/match-detail/?match=${matchIndex}'"
```

### Navigation Component

The `<app-nav>` component handles bottom navigation:

```html
<app-nav active="home"></app-nav>
```

Valid `active` values: `home`, `matches`, `quote`, `virtualini`

### URL Parameters

Use standard `URLSearchParams`:

```javascript
// Reading parameters
const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get('player');

// Creating links with parameters
const url = `../player-profile/player-profile.html?player=${encodeURIComponent(playerName)}`;
```

---

## 🎨 Styling

### Tailwind CSS

- **Source**: `src/shared/input.css` (gitignored)
- **Output**: `src/shared/output.css` (committed for GitHub Pages)
- **Build**: `npm run build:css`
- **Dev mode**: `npm run watch:css`

### Custom Theme

The project uses a purple gradient theme:
- Primary: `#667eea` (perpe-purple)
- Secondary: `#764ba2` (perpe-dark)
- Configured in `tailwind.config.js`

### Component Styling

Use Tailwind utility classes directly in component HTML:

```javascript
this.innerHTML = `
  <div class="bg-card p-4 rounded-xl shadow-md">
    <div class="text-primary font-bold">Title</div>
  </div>
`;
```

### shadcn/ui Components

Available in `components/ui/`:
- `card.jsx`, `button.jsx`, `badge.jsx`, etc.
- Import as needed in your components

---

## 🔧 Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start CSS watch mode (terminal 1)
npm run watch:css

# Start local server (terminal 2)
python -m http.server 8000

# Visit in browser
http://localhost:8000
```

### Before Committing

```bash
# Build optimized CSS
npm run build:css

# Commit the generated output.css
git add src/shared/output.css
git commit -m "Your message"
```

### File Structure Check

Before committing, verify structure:

```
✅ HTML files named same as folder
✅ View components named {page}-view.js
✅ Shared components in src/components/
✅ No inline scripts in HTML
✅ No DOM manipulation in elo.js
✅ output.css is committed
```

---

## 🚫 Common Anti-Patterns to Avoid

### ❌ DON'T: Inline Scripts in HTML

```html
<!-- BAD -->
<script>
  async function loadData() {
    const data = await fetch(...);
    // ... logic here
  }
</script>
```

### ❌ DON'T: DOM Manipulation in Backend

```javascript
// BAD - in elo.js
function visualizzaClassifica(data) {
  document.getElementById('list').innerHTML = '...';
}
```

### ❌ DON'T: Duplicate Computation Logic

```javascript
// BAD - in component
connectedCallback() {
  // Reimplementing ELO calculation
  const elo = playerElo + 32 * (result - expected);
}

// GOOD - use backend function
connectedCallback() {
  const elo = calcolaElo(playerElo, opponentElo, score1, score2);
}
```

### ❌ DON'T: Mix HTML File Names

```
// BAD
src/pages/home/index.html
src/pages/matches/page.html

// GOOD
src/pages/home/home.html
src/pages/matches/matches.html
```

---

## ✅ Quick Reference Checklist

When making changes, ask yourself:

- [ ] Is computation in `elo.js` pure (no DOM)?
- [ ] Are components self-contained?
- [ ] Does the file naming match the pattern?
- [ ] Is the component in the right location (shared vs page-specific)?
- [ ] Are imports in the correct order?
- [ ] Is the HTML declarative (no inline scripts)?
- [ ] Are Tailwind classes used for styling?
- [ ] Is `output.css` rebuilt and committed?

---

## 📚 Additional Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Web Components**: https://developer.mozilla.org/en-US/docs/Web/Web_Components
- **shadcn/ui**: https://ui.shadcn.com/
- **ELO Rating System**: https://en.wikipedia.org/wiki/Elo_rating_system

---

## 🤝 Questions?

If you're unsure about a pattern or convention:
1. Look at existing pages (especially `home` and `matches`)
2. Check this guide
3. Follow the principle: **separation of concerns**

**When in doubt, keep computation in backend, rendering in components, and HTML declarative!**

