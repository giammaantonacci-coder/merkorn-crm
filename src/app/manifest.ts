import type { MetadataRoute } from "next";

/**
 * «Aggiungi alla schermata Home» salva l'app con la sua icona e la apre a
 * schermo intero. Splash indaco col marchio, barra di stato chiara come l'app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finanza",
    short_name: "Finanza",
    description: "Saldo, spese, obiettivi e conti in un colpo d'occhio.",
    lang: "it",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#6b72f0",
    theme_color: "#f5f6f8",
    icons: [
      { src: "/icone/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icone/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
