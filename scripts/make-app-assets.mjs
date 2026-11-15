// Lager kildebildene til app-ikon og startskjerm i assets/.
// Kjør deretter: npm run cap:assets  (som fordeler dem til android/ og ios/).
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const GREEN = "#0f7a55";
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
await mkdir(out, { recursive: true });

// Haken fra logoen (tegnet i en 24×24-rute), skalert til ønsket størrelse og midtstilt.
function check(canvas, size, color = "#fff") {
  const scale = size / 24;
  const offset = (canvas - size) / 2;
  return `<g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

const svg = (size, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

const files = {
  // iOS og eldre Android: helt ikon, uten gjennomsiktighet (iOS avrunder selv).
  "icon-only.png": svg(1024, `<rect width="1024" height="1024" fill="${GREEN}"/>${check(1024, 620)}`),
  // Android adaptivt ikon: forgrunn innenfor den trygge sonen (midterste 2/3).
  "icon-foreground.png": svg(1024, check(1024, 440)),
  "icon-background.png": svg(1024, `<rect width="1024" height="1024" fill="${GREEN}"/>`),
  // Startskjerm: hvit flate med logoen i midten.
  "splash.png": svg(
    2732,
    `<rect width="2732" height="2732" fill="#fff"/>
     <rect x="1166" y="1166" width="400" height="400" rx="92" fill="${GREEN}"/>${check(2732, 250)}`,
  ),
};
// Appen har bare lyst tema, så startskjermen er lik i mørk modus.
files["splash-dark.png"] = files["splash.png"];

for (const [name, source] of Object.entries(files)) {
  await sharp(Buffer.from(source)).png().toFile(join(out, name));
  console.log("laget assets/" + name);
}
