# Mafia Card Maker

A browser tool for making **mafiascum / Mafia-Universe forum-game role cards**. It takes a card
designed in **Figma** (exported as SVG), makes its named layers editable (text + images), and
exports a PNG — keeping the exact design/format.

This is app #1 of a planned set of forum-game tools.

## Two things in this repo
- **`cardmaker.html`** — the current app. A single self-contained file (fonts + your Figma SVG
  baked in). Built from `src/cardmaker.src.html` + `design/Card2.svg` + `design/fonts/`. **This is
  the one we're working on.**
- **`index.html`** + `src/card-maker.src.html` + `assets/` + `build.js` — the original FIFA card
  maker (a friend's Node-built reference app) we started from. Kept for reference.

## How `cardmaker.html` is built (no Node needed)
The build is a Node-free PowerShell script. From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

It base64-embeds the 5 `design/fonts/FWC2026-*.ttf` files as `@font-face` and injects
`design/Card2.svg`, producing `cardmaker.html`.

**To change the card design:** re-export the SVG from Figma with **"Outline text" OFF** and
**"Include id attribute" ON** (otherwise text becomes uneditable paths and layer names are lost),
save it as `design/Card2.svg`, then re-run `build.ps1`.

## Preview locally
Any static server works. With Python:

```bash
python -m http.server 8753
# then open http://localhost:8753/cardmaker.html
```

(`.claude/launch.json` is set up to do this via the editor's preview.)

## How the editing works
Controls in `src/cardmaker.src.html` bind to the Figma layer ids in the SVG:
`Player Name`, `Character Name`, `Character Role`, `Player Alignment`,
`Ability Name - Night` (+`_2`), `Ability Description` (+`_2`), `Character Image`, `Flag Image`.
Text layers become inputs; image layers become upload slots (cover-fitted). Download = serialize
the SVG → canvas → PNG (2×).

### Font note (important)
Figma collapsed two FWC2026 widths into one family + weight. In `build.ps1`, `FWC2026` **bold**
must point at the **UltraCondensed** ttf (the "FIFA WORLD CUP 2026" wordmark + the player tag),
while normal weight = Normal Regular. Mapping bold to Normal Black makes those layers ~2× too wide.

## Data
`mafia_universe_role_index.html` holds a 476-role library (`const DATA`: name, desc, alignment,
effects, timing, rarity, aliases) — intended to power a future "pick a role → autofill" feature.

## Open items / next steps
1. Long ability descriptions overflow the fixed-height ability card (shrink-to-fit vs. grow cards).
2. Alignment recolor (town/mafia/third) — background + accents are currently baked red.
3. Wire the role-library autofill from `mafia_universe_role_index.html`.
