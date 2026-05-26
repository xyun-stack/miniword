/**
 * The miniworld wordmark. A small pink dot lives between "mini" and
 * "world" as the only visual accent in the mark itself.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex items-baseline gap-[4px] font-semibold tracking-[-0.012em] text-[15px] ${className}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span>mini</span>
      <span aria-hidden className="pink-dot translate-y-[-1px]" />
      <span>world</span>
    </span>
  );
}
