#!/usr/bin/env node
// Builds cardmaker.html from src/cardmaker.src.html + design/Card2.svg + design/fonts/*.ttf
// Node equivalent of build.ps1, for macOS/Linux where PowerShell isn't available.
// Run: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const src  = join(root, 'src/cardmaker.src.html');
const svgF = join(root, 'design/Card2.svg');
const fdir = join(root, 'design/fonts');
const playersF = join(root, 'assets/players.json');

const b64 = p => readFileSync(p).toString('base64');
const face = (fam, wt, file) =>
  `@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt};font-display:block;src:url(data:font/ttf;base64,${b64(join(fdir, file))}) format('truetype');}`;

// Font weight mapping.
// Figma's SVG export collapsed two FWC2026 widths into one family name + a weight:
//   normal-weight text  -> the wide "Normal Regular"   (Juan MUSSO, GOALKEEPER, MAFIA, abilities)
//   bold-weight text     -> the narrow "UltraCondensed" (the "FIFA WORLD CUP 2026" wordmark, KARTHAIN)
// So 'FWC2026' bold must point at the UltraCondensed files, NOT Normal Black, or those two
// layers render ~2x too wide vs the Figma/PNG design.
const faces = [
  face('FWC2026', 400, 'FWC2026-NormalRegular.77c3c249.ttf'),
  face('FWC2026', 700, 'FWC2026-UltraCondensedBold.0e7149b5.ttf'),
  face('FWC2026', 900, 'FWC2026-UltraCondensedBlack.8e6ba053.ttf'),
  face('FWC2026 Normal', 900, 'FWC2026-NormalBlack.2bd896c8.ttf'),
  face('FWC2026 Cond', 500, 'FWC2026-UltraCondensedMedium.4da29b9d.ttf'),
  face('FWC2026 Cond', 700, 'FWC2026-UltraCondensedBold.0e7149b5.ttf'),
  face('FWC2026 Cond', 900, 'FWC2026-UltraCondensedBlack.8e6ba053.ttf'),
].join('\n');

// Read the SVG and inject the @font-face block as the first child of <svg> so both the
// live DOM and the serialized-for-export SVG carry the fonts.
let svg = readFileSync(svgF, 'utf8');
svg = svg.replace(/(<svg\b[^>]*>)/, `$1\n<style>\n${faces}\n</style>`);

let html = readFileSync(src, 'utf8');
html = html.replace('<!--SVG_HERE-->', svg);
// embed the World Cup 2026 country/player roster (name, position, photo URL) as base64
// JSON, same pattern as the fonts above, so it's part of the self-contained file.
html = html.replace('"/*PLAYERS_DATA_HERE*/"', JSON.stringify(b64(playersF)));

const out = join(root, 'cardmaker.html');
writeFileSync(out, html, 'utf8');
console.log(`built cardmaker.html  ${Math.round(Buffer.byteLength(html) / 1024)}kb`);
