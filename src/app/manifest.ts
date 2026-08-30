import type { MetadataRoute } from "next";

/**
 * Con questo file «Aggiungi alla schermata Home» salva l'app con la sua icona
 * e la apre a schermo intero, come un'applicazione. Lo splash all'avvio è
 * arancione col marchio; la barra di stato resta bianca, come l'app in uso.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Merkorn CRM",
    short_name: "Merkorn",
    description: "Dal primo contatto all'assistenza, con il tempo di ogni fase.",
    lang: "it",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F97316",
    theme_color: "#ffffff",
    icons: [
      { src: "/icone/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icone/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
