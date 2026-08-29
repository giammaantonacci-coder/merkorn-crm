export function Errore({ messaggio }: { messaggio?: string | null }) {
  if (!messaggio) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl bg-bad-wash px-4 py-3 text-sm font-semibold text-bad"
    >
      {messaggio}
    </p>
  );
}
