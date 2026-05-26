import Link from "next/link";

type Props = {
  q: string;
  /** Other URL params to preserve as hidden form fields on submit. */
  preserveParams?: Record<string, string | undefined>;
  /** Href to use when the user clears the search. */
  clearHref: string;
};

/**
 * SearchBar — hairline pill input. Submitting the form (Enter key) navigates
 * to /browse?q=<value> while preserving the other active filters via hidden
 * fields. The clear button is a Link, so no client JS is needed.
 */
export function SearchBar({ q, preserveParams = {}, clearHref }: Props) {
  return (
    <form
      action="/browse"
      method="get"
      role="search"
      className="mx-auto w-full max-w-md"
    >
      {Object.entries(preserveParams).map(([key, value]) =>
        value ? (
          <input key={key} type="hidden" name={key} value={value} />
        ) : null
      )}

      <div
        className="flex h-11 items-center gap-2 rounded-full px-4 transition-colors duration-200"
        style={{ background: "var(--color-bg-soft)" }}
      >
        <svg
          width={15}
          height={15}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ color: "var(--color-ink-muted)" }}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by tag, title, or @nickname"
          autoComplete="off"
          className="flex-1 border-0 bg-transparent text-[13.5px] outline-none placeholder:text-[color:var(--color-ink-faint)]"
        />

        {q && (
          <Link
            href={clearHref}
            aria-label="Clear search"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-raised)] hover:text-[color:var(--color-ink)]"
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        )}
      </div>
    </form>
  );
}
