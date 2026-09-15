import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Finanza",
  description: "La tua finanza personale: saldo, spese, obiettivi e conti, in un colpo d'occhio.",
  manifest: "/manifest.webmanifest",
  applicationName: "Finanza",
  appleWebApp: {
    capable: true,
    title: "Finanza",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icone/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icone/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icone/apple-touch.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f5f6f8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
