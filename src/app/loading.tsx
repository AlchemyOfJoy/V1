/** Route-transition fallback — the brand's "breathing dot" signal. */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white"
      role="status"
      aria-label="Loading"
    >
      <span className="h-3 w-3 animate-breathe rounded-full bg-cyan" />
    </div>
  );
}
