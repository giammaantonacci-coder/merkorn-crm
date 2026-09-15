import { CAT_COLORI, type Categoria } from "@/lib/finanza";

const tratto = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Icona geometrica per ogni categoria, nel colore della categoria. */
export function IconaCategoria({ cat, size = 18 }: { cat: Categoria; size?: number }) {
  const common = { viewBox: "0 0 24 24", width: size, height: size, style: { color: CAT_COLORI[cat] } };

  switch (cat) {
    case "Casa":
      return (
        <svg {...common} {...tratto}>
          <path d="M3.5 11 12 4l8.5 7" />
          <path d="M5.5 9.5V20h13V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "Cibo":
      return (
        <svg {...common} {...tratto}>
          <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12" />
          <path d="M16.5 3c-1.3 1-2 3-2 5.5 0 2 .7 2.7 2 2.9V21" />
        </svg>
      );
    case "Trasporti":
      return (
        <svg {...common} {...tratto}>
          <path d="M5 11l1.5-3.8A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.2L19 11" />
          <rect x="3.5" y="11" width="17" height="5.5" rx="1.8" />
          <path d="M7.5 16.5V18M16.5 16.5V18" />
        </svg>
      );
    case "Svago":
      return (
        <svg {...common} {...tratto}>
          <path d="M12 3.5l2 4.5 4.8.5-3.6 3.2 1 4.8L12 14l-4.2 2.5 1-4.8L5.2 8.5 10 8z" />
        </svg>
      );
    case "Entrata":
      return (
        <svg {...common} {...tratto}>
          <rect x="3" y="6.5" width="18" height="11" rx="2.5" />
          <circle cx="12" cy="12" r="2.4" />
        </svg>
      );
    default: // Altro
      return (
        <svg {...common} viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ color: CAT_COLORI[cat] }}>
          <circle cx="6" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="18" cy="12" r="1.7" />
        </svg>
      );
  }
}
