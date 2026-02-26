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
