/**
 * generate-icons.ts
 *
 * Reads SVG sources from src/assets/logo/ and generates all PNG variants
 * in public/. Run via `npm run icons` whenever logo sources change.
 *
 * Outputs:
 *   public/favicon.svg             (copy of light mark, direct SVG favicon)
 *   public/favicon-dark.svg        (copy of dark mark)
 *   public/favicon-16.png          (16x16)
 *   public/favicon-32.png          (32x32)
 *   public/favicon-48.png          (48x48)
 *   public/apple-touch-icon.png    (180x180, from dedicated apple-touch-icon.svg)
 *   public/icon-192.png            (192x192, PWA)
 *   public/icon-512.png            (512x512, PWA)
 *   public/og-image.png            (1200x630, social share)
 */

import sharp from 'sharp';
import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src/assets/logo');
const outDir = resolve(root, 'public');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ─── helpers ──────────────────────────────────────────────────────────────

async function svgToPng(svgPath: string, outPath: string, size: number) {
  const svg = readFileSync(svgPath);
  await sharp(svg, { density: Math.max(300, size * 2) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, quality: 95 })
    .toFile(outPath);
  console.log(`  ✓ ${outPath.replace(root + '/', '').replace(root + '\\', '')}  (${size}×${size})`);
}

async function svgToRectPng(svgPath: string, outPath: string, width: number, height: number) {
  const svg = readFileSync(svgPath);
  await sharp(svg, { density: 300 })
    .resize(width, height, { fit: 'fill' })
    .png({ compressionLevel: 9, quality: 95 })
    .toFile(outPath);
  console.log(`  ✓ ${outPath.replace(root + '/', '').replace(root + '\\', '')}  (${width}×${height})`);
}

// ─── run ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating brand assets…\n');

  const faviconLight = resolve(srcDir, 'favicon-mark.svg');
  const faviconDark = resolve(srcDir, 'favicon-mark-dark.svg');
  const appleTouchSource = resolve(srcDir, 'apple-touch-icon.svg');
  const ogSource = resolve(srcDir, 'og-image.svg');

  // Copy SVG favicons directly (modern browsers)
  copyFileSync(faviconLight, resolve(outDir, 'favicon.svg'));
  console.log(`  ✓ public/favicon.svg  (source copy)`);
  copyFileSync(faviconDark, resolve(outDir, 'favicon-dark.svg'));
  console.log(`  ✓ public/favicon-dark.svg  (source copy)`);

  // PNG favicons (fallbacks)
  await svgToPng(faviconLight, resolve(outDir, 'favicon-16.png'), 16);
  await svgToPng(faviconLight, resolve(outDir, 'favicon-32.png'), 32);
  await svgToPng(faviconLight, resolve(outDir, 'favicon-48.png'), 48);

  // Apple Touch Icon (uses dedicated source — no rounded corners, iOS adds them)
  await svgToPng(appleTouchSource, resolve(outDir, 'apple-touch-icon.png'), 180);

  // PWA icons (use apple touch source — brand bg + F9FAFB mark)
  await svgToPng(appleTouchSource, resolve(outDir, 'icon-192.png'), 192);
  await svgToPng(appleTouchSource, resolve(outDir, 'icon-512.png'), 512);

  // OG image (1200×630, not square)
  await svgToRectPng(ogSource, resolve(outDir, 'og-image.png'), 1200, 630);

  console.log('\n✓ Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
