# CLAUDE.md

## Project Overview

Simplespil is a collection of simple offline games for kids. No frameworks, no build tools, no dependencies - just plain HTML, CSS, and JavaScript that runs directly in the browser.

## Key Principles

- **Offline-first**: Everything must work without internet. No CDNs, no external resources, no API calls.
- **No ads**: This is for kids. No tracking, no analytics, no monetization.
- **Simple**: Plain HTML/CSS/JS only. No build steps, no npm, no bundlers.
- **Kid-friendly**: Big touch targets, bright colors, simple controls. Must work well on phones and tablets.
- **Self-contained**: Each game lives in its own folder with its own HTML, CSS, and JS files.

## Project Structure

```
simplespil/
├── index.html          # Main menu page
├── shared/
│   └── style.css       # Shared base styles and CSS variables
├── jump/               # Side-scrolling jump game
├── puzzle/             # Jigsaw puzzle game
└── labyrinth/          # Maze navigation game
```

Each game folder contains:
- `index.html` - Game page (links back to main menu)
- `<game>.js` - Game logic
- `<game>.css` - Game-specific styles
- `icon.js` - Canvas-drawn icon for the main menu

## Adding a New Game

When adding a new game, you must also integrate it into the main menu and stats system:

### 1. Game icon (`<game>/icon.js`)
Each game needs an `icon.js` that draws a small icon on a canvas element. The pattern:
```js
(() => {
  const canvas = document.getElementById('icon-<game>');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Draw icon using Canvas 2D API (simple shapes, ~60x60)
})();
```
- Wrapped in an IIFE, no exports
- Gets canvas by `id="icon-<game>"` — must match the ID in `index.html`
- Uses only vanilla Canvas 2D API (arcs, rects, paths, fills)
- Keep it simple: basic geometric shapes, bright colors

### 2. Stats tracking
Games use `shared/stats.js` which provides `SimplespilStats.recordPlay('<game>')` and `SimplespilStats.getCount('<game>')` backed by localStorage.

In the game's `index.html`, load stats before the game script:
```html
<script src="../shared/stats.js"></script>
<script src="<game>.js"></script>
```

In the game's JS, call `SimplespilStats.recordPlay('<game>')` at the start of the `startGame()` function.

### 3. Main menu entry (`index.html`)
Add a card to the `.game-cards` grid:
```html
<a href="<game>/index.html" class="game-card" data-game="<game>" data-color="<color>">
  <div class="game-icon">
    <canvas id="icon-<game>" width="60" height="60"></canvas>
  </div>
  <h2>Game Name</h2>
  <p>Short description of the game</p>
</a>
```
And add the icon script at the bottom of `index.html` alongside the others:
```html
<script src="<game>/icon.js"></script>
```

Available `data-color` values: `primary`, `green`, `blue`, `accent`, `pink`, `purple`, `orange`.

### 4. Service worker cache (`sw.js`)
All game files must be added to the `FILES_TO_CACHE` array in `sw.js` so they work offline. Add these entries:
```js
  '/<game>/index.html',
  '/<game>/<game>.css',
  '/<game>/<game>.js',
  '/<game>/icon.js',
```
Also add any new shared scripts (e.g. `/shared/high-scores.js`) if not already listed.

**Important:** After updating `FILES_TO_CACHE` or changing any cached file, bump the `CACHE_NAME` version number (e.g. `simplespil-v5` → `simplespil-v6`) so existing installations re-cache. Without this, offline users won't get the updated files.

A pre-commit hook in `.githooks/` automates this — it bumps the version whenever cached files are staged. To enable it (one-time setup):
```sh
git config core.hooksPath .githooks
```

## Code Style

- Use vanilla JS (no frameworks or libraries)
- Use CSS variables for theming (defined in `shared/style.css`)
- Use `const`/`let`, never `var`
- Use canvas for game rendering where appropriate
- Keep files focused - one JS file per game is fine for simple games
- All art/graphics are drawn with canvas or built with CSS/SVG - no image file dependencies

## Testing

No test framework. Games are tested manually by opening in a browser. To verify:
1. Open `index.html` in a browser
2. Each game link should work
3. Games should be playable on both desktop (keyboard) and mobile (touch)
4. Everything works with no internet connection

## Colors / Theme

Games use a shared color palette defined as CSS variables in `shared/style.css`. Bright, kid-friendly colors with good contrast.
