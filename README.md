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

## How `cardmaker.html` is built
On Windows, it's a Node-free PowerShell script. From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

On macOS/Linux, use the Node equivalent instead:

```bash
node build.mjs
```

Either one base64-embeds the 5 `design/fonts/FWC2026-*.ttf` files as `@font-face` and injects
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
`Player Name`, `Character Name`, `Character Role`, `Character Type`, `Player Alignment`,
`Character Image`, `Flag Image`. Text layers become inputs; `Character Image` is an upload slot
(cover-fitted). Download = serialize the SVG → canvas → PNG (2×).

`Character Type` sits top-right of the header, right-aligned to line up with the ability boxes'
right edge below it, styled to match the "FIFA WORLD CUP 2026™" wordmark on its left. It shrinks
to fit (see `initFit`'s `anchor` param) so it never overlaps the wordmark, measured against the
wordmark's actual rendered width at runtime rather than a hardcoded guess.

`Player Name` is right-aligned (not auto-shrunk) and supports a user-typed line break — its
control is a textarea, and pressing Enter splits it onto a second line via `initLinesRight`/
`setLinesRight` instead of auto word-wrapping, so you control exactly where a long name breaks.

**Country / Player autofill:** the Images panel has a Country dropdown (the 48 World Cup 2026
teams, from `assets/players.json`, baked into `cardmaker.html` at build time) and a dependent
Player dropdown listing that country's 26-player roster. Picking a country fetches its flag from
flagcdn.com; picking a player fetches their photo from digitalhub.fifa.com and fills Character
Name/Role. Both are just convenience autofills — every field stays editable after, and the
Character photo / Flag photo upload inputs always override whatever was auto-filled. Pick
"Other (custom)" as the country to leave the flag/photo alone and type your own name/role.

**Actions:** a repeatable list of 1-5 (add/remove in the panel), driven by `abilities` in
`src/cardmaker.src.html`. Each is a runtime clone of the single "Ability 1" template in
`design/Card2.svg`, positioned by a wrapping `<g transform>` so no per-clone id rewriting is
needed. The group centers itself within the card's header-to-footer band; at 4-5 actions it
auto-scales down uniformly (not just squished) to keep everything on the card. Each action can
also take a custom icon upload, rendered full-bleed on the left (rounded to match the box's own
corner, square where it meets the text) in place of the default ball doodle.

The "Show icons" toggle above the action list switches all actions at once between that
icon-slot layout and a text-only one (`ABILITY_LAYOUT.icon` / `.noIcon` in
`src/cardmaker.src.html`) that uses the full box width and roomier top/bottom padding, since
there's more space to work with once the icon column is gone.

Selecting **Alignment** (Town/Mafia/Third Party) also recolors the Player Name/Character Name/
Character Role/Player Alignment text and swaps the card's background image — see `ALIGN_CFG` in
`src/cardmaker.src.html`. The three background images live in `design/backgrounds/` and are baked
into `design/Card2.svg` as hidden/shown `<image>` layers (`BG (mafia)`, `BG (town)`, `BG (3p)`).

### Network dependency
The flag and player-photo fetches are the only parts of the app that aren't fully offline/
self-contained — they hit flagcdn.com / digitalhub.fifa.com at runtime when you change those
dropdowns. Everything else (fonts, backgrounds, the player roster data, uploaded photos) is baked
into the file with no network calls.

### Font note (important)
Figma collapsed two FWC2026 widths into one family + weight. In `build.ps1`, `FWC2026` **bold**
must point at the **UltraCondensed** ttf (the "FIFA WORLD CUP 2026" wordmark + the player tag),
while normal weight = Normal Regular. Mapping bold to Normal Black makes those layers ~2× too wide.

## Data
`mafia_universe_role_index.html` holds a 476-role library (`const DATA`: name, desc, alignment,
effects, timing, rarity, aliases) — intended to power a future "pick a role → autofill" feature.

## Open items / next steps
1. A very long single action description can still overflow its own box's white background —
   text wraps to fit the width, but there's no cap/shrink for the number of wrapped lines vs. box
   height. (Having too many *actions* is handled — the group auto-scales down at 4-5.)
2. Wire the role-library autofill from `mafia_universe_role_index.html`.
