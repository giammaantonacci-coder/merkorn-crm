/** I cinque blocchi del marchio Merkorn: salgono e ridiscendono come una pipeline. */
export function Logo({ className = "w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 600" role="img" aria-label="Merkorn" className={className}>
      <g fill="currentColor">
        <rect x="400" y="0" width="200" height="200" rx="26" />
        <rect x="200" y="200" width="200" height="200" rx="26" />
        <rect x="600" y="200" width="200" height="200" rx="26" />
        <rect x="0" y="400" width="200" height="200" rx="26" />
        <rect x="800" y="400" width="200" height="200" rx="26" />
      </g>
    </svg>
  );
}
