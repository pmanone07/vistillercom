// Lager alle logo- og ikonfiler fra assets/vistiller-logo.png (gjennomsiktig PNG
// med symbolet øverst og «ViStiller» under).
//   - public/logo-mark.png        symbolet til toppmenyen
//   - app/icon.png, app/apple-icon.png, public/icons/*  nettleser/PWA
//   - assets/icon-*.png, assets/splash*.png  kilder til app-ikon og startskjerm
// Kjør: npm run cap:assets  (kjører dette skriptet og fordeler deretter til android/ og ios/).
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "assets", "vistiller-logo.png");
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// Symbolet ligger over teksten; vi klipper bort teksten og trimmer kantene.
const meta = await sharp(source).metadata();
const markTop = Math.round(meta.height * 0.16);
const markHeight = Math.round(meta.height * 0.72) - markTop;
const markCrop = await sharp(source)
  .extract({ left: 0, top: markTop, width: meta.width, height: markHeight })
  .png()
  .toBuffer();
const mark = await sharp(markCrop).trim().png().toBuffer();
const fullLogo = await sharp(source).trim().png().toBuffer();

/** Legger et bilde midt på en kvadratisk flate, skalert til `fraction` av sidelengden. */
async function centered(image, size, fraction, background) {
  const box = Math.round(size * fraction);
  const inner = await sharp(image).resize(box, box, { fit: "inside" }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: inner, gravity: "center" }])
    .png();
}

const out = (...p) => join(root, ...p);
await mkdir(out("public", "icons"), { recursive: true });
await mkdir(out("assets"), { recursive: true });

const jobs = {
  // Toppmeny (vises i ca. 32 px høyde, lagres skarpt for retina-skjermer).
  "public/logo-mark.png": sharp(mark).resize({ height: 128 }).png(),
  // Fane-ikon og iOS hjemskjerm.
  "app/icon.png": centered(mark, 256, 0.92, CLEAR),
  "app/apple-icon.png": centered(mark, 180, 0.72, WHITE),
  // PWA-ikoner. Maskable må holde seg innenfor den trygge sirkelen (ca. 60 %).
  "public/icons/apple-touch-icon.png": centered(mark, 180, 0.72, WHITE),
  "public/icons/icon-192.png": centered(mark, 192, 0.8, WHITE),
  "public/icons/icon-512.png": centered(mark, 512, 0.8, WHITE),
  "public/icons/maskable-512.png": centered(mark, 512, 0.58, WHITE),
  // Capacitor: iOS/eldre Android (helt ikon uten gjennomsiktighet) og Android adaptivt ikon.
  "assets/icon-only.png": centered(mark, 1024, 0.72, WHITE),
  "assets/icon-foreground.png": centered(mark, 1024, 0.5, CLEAR),
  "assets/icon-background.png": sharp({ create: { width: 1024, height: 1024, channels: 4, background: WHITE } }).png(),
  // Startskjerm: hele logoen med navn på hvit flate.
  "assets/splash.png": centered(fullLogo, 2732, 0.3, WHITE),
  // Appen har bare lyst tema, så startskjermen er lik i mørk modus.
  "assets/splash-dark.png": centered(fullLogo, 2732, 0.3, WHITE),
};

for (const [name, pipeline] of Object.entries(jobs)) {
  await (await pipeline).toFile(out(...name.split("/")));
  console.log("laget " + name);
}
