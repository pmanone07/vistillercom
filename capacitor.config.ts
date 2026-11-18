import type { CapacitorConfig } from "@capacitor/cli";

// Android- og iOS-appene er et skall rundt den publiserte nettsiden. Da deler
// web, PWA og native samme kode og backend, og en ny versjon på Vercel når
// appene uten ny innsending til butikkene.
//
// appId kan ikke endres etter at appen er publisert i Google Play / App Store.
const config: CapacitorConfig = {
  appId: "com.vistillercom.app",
  appName: "ViStiller",
  // Vises bare hvis nettsiden ikke kan lastes (se capacitor-web/index.html).
  webDir: "capacitor-web",
  server: {
    url: "https://vistiller.com/start",
    // Lenker til vistiller.com åpnes i appen, alt annet i nettleseren.
    allowNavigation: ["vistiller.com", "*.vistiller.com"],
    cleartext: false,
  },
  backgroundColor: "#ffffff",
};

export default config;
