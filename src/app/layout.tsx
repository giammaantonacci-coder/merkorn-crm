import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Merkorn CRM",
  description: "Dal primo contatto all'assistenza, con il tempo di ogni fase.",
  manifest: "/manifest.webmanifest",
  applicationName: "Merkorn",
  appleWebApp: {
    capable: true,
    title: "Merkorn",
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
