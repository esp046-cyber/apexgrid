#!/usr/bin/env node
/**
 * ApexGrid asset generator.
 * Usage (from the project root):
 *   npm install --no-save sharp
 *   node tools/generate-assets.js
 * Writes: icons/icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png,
 *         apple-touch-icon.png and icons/splash/*.png
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'icons');
const SPLASH_DIR = path.join(ICON_DIR, 'splash');

const BG = '#0d0f12';
const RED = '#e10600';
const FONT = 'DejaVu Sans, Arial, Helvetica, sans-serif';

// iOS splash targets: CSS size (w x h) and device pixel ratio.
// These must match the media queries in index.html.
const SPLASH = [
  { w: 430, h: 932, r: 3 },  // iPhone 16/15 Pro Max
  { w: 393, h: 852, r: 3 },  // iPhone 16/15 Pro
  { w: 390, h: 844, r: 3 },  // iPhone 14/15
  { w: 375, h: 667, r: 2 },  // iPhone SE
  { w: 834, h: 1194, r: 2 }  // iPad Pro 11"
];

/** Inner artwork on a 0..100 coordinate grid (stripes + wordmark). */
function artwork() {
  return `
    <g stroke="${RED}" stroke-width="7.5" stroke-linecap="round" fill="none">
      <path d="M19 68 L81 26"/><path d="M27 68 L62 44"/><path d="M42 68 L81 42"/>
    </g>
    <text x="50" y="90" font-family="${FONT}" font-weight="700" font-size="15"
          fill="#ffffff" text-anchor="middle">APEX</text>`;
}

/** Full icon SVG. maskable = full-bleed square with artwork inside the 80% safe zone. */
function iconSvg(size, maskable) {
  const radius = maskable ? 0 : size * 0.19;
  const scale = maskable ? 0.8 : 1;
  const offset = (size - size * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
  <g transform="translate(${offset} ${offset}) scale(${(size * scale) / 100})">${artwork()}</g>
</svg>`;
}

function splashSvg(W, H) {
  const s = Math.round(Math.min(W, H) * 0.32);
  const x = Math.round((W - s) / 2);
  const y = Math.round((H - s) / 2 - H * 0.03);
  const fs = Math.round(s * 0.14);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <g transform="translate(${x} ${y}) scale(${s / 100})">${artwork()}</g>
  <text x="${W / 2}" y="${y + s + fs * 2}" font-family="${FONT}" font-weight="700"
        font-size="${fs}" fill="#a8b3c4" text-anchor="middle">F1 2026 SEASON HUB</text>
</svg>`;
}

async function png(svg, file) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
  console.log('wrote', path.relative(ROOT, file));
}

(async () => {
  fs.mkdirSync(SPLASH_DIR, { recursive: true });

  fs.writeFileSync(path.join(ICON_DIR, 'icon.svg'), iconSvg(192, false));
  console.log('wrote icons/icon.svg');

  await png(iconSvg(192, false), path.join(ICON_DIR, 'icon-192.png'));
  await png(iconSvg(512, false), path.join(ICON_DIR, 'icon-512.png'));
  await png(iconSvg(512, true), path.join(ICON_DIR, 'icon-maskable-512.png'));
  await png(iconSvg(180, false), path.join(ICON_DIR, 'apple-touch-icon.png'));

  for (const { w, h, r } of SPLASH) {
    const W = w * r, H = h * r;
    await png(splashSvg(W, H), path.join(SPLASH_DIR, `splash-${W}x${H}.png`));
  }
  console.log('Done.');
})().catch((err) => { console.error(err); process.exit(1); });
