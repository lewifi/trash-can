/**
 * Draws the two axe cursors used once a player has walked out of the buried
 * world carrying the axe, and writes them to public/. Regenerate with:
 *
 *   node scripts/make-axe-cursor.mjs
 *
 * Kept as a script rather than hand-drawn assets so the shape, colours and
 * hotspot stay adjustable. Needs playwright's chromium, which is only a dev
 * dependency of this script: the site itself ships the two PNGs.
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const SIZE = 32; // browsers are only reliable up to 32x32 for custom cursors

const draw = (cocked) => `(() => {
  const c = document.createElement('canvas');
  c.width = ${SIZE}; c.height = ${SIZE};
  const x = c.getContext('2d');
  x.clearRect(0, 0, ${SIZE}, ${SIZE});
  // Cocked back a little for the interactive variant, pivoting on the blade.
  x.translate(7, 6); x.rotate(${cocked ? -0.30 : 0}); x.translate(-7, -6);

  // Everything is drawn with a dark outline first, so the cursor stays legible
  // on the dark site chrome and on the light cards alike.
  const stroke = (w) => { x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; };

  // haft
  x.beginPath(); x.moveTo(26, 29); x.lineTo(9, 9);
  x.strokeStyle = '#120c08'; stroke(6.5); x.stroke();
  x.strokeStyle = '#8a6136'; stroke(3.4); x.stroke();
  x.strokeStyle = '#b08a56'; stroke(1.1); x.stroke();

  // head: a wedge sitting across the top of the haft
  x.beginPath();
  x.moveTo(11.5, 11.5); x.lineTo(6.5, 12.5); x.lineTo(1.5, 5.5);
  x.lineTo(4.5, 1.0); x.lineTo(12.0, 4.0); x.closePath();
  x.fillStyle = '#0f1318'; x.strokeStyle = '#0f1318'; stroke(3.0); x.stroke(); x.fill();
  x.beginPath();
  x.moveTo(11.0, 11.0); x.lineTo(7.0, 11.6); x.lineTo(3.0, 5.6);
  x.lineTo(5.2, 2.4); x.lineTo(11.2, 4.8); x.closePath();
  x.fillStyle = '#aab4c0'; x.fill();
  // bevel along the cutting edge
  x.beginPath(); x.moveTo(3.0, 5.6); x.lineTo(5.2, 2.4); x.lineTo(7.4, 3.3); x.lineTo(4.9, 6.6); x.closePath();
  x.fillStyle = '#e6ecf2'; x.fill();

  return c.toDataURL('image/png');
})()`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setContent("<html><body></body></html>");

for (const [name, cocked] of [["axe-cursor", false], ["axe-cursor-active", true]]) {
  const url = await page.evaluate(draw(cocked));
  const png = Buffer.from(url.split(",")[1], "base64");
  writeFileSync(new URL(`../public/${name}.png`, import.meta.url), png);
  console.log(`wrote public/${name}.png (${png.length} bytes)`);
}

await browser.close();
