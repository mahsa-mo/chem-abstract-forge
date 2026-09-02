/**
 * Decorative "reactant -> product" connector between the source-text panel
 * and the generated-abstract panel, echoing a chemistry reaction arrow.
 * Desktop only; the two panels stack on small screens so there is nothing
 * to visually connect there.
 */
export function ReactionArrow() {
  return (
    <div
      aria-hidden
      className="hidden shrink-0 self-center lg:flex lg:items-center lg:justify-center lg:px-1"
    >
      <svg
        viewBox="0 0 96 54"
        className="h-auto w-16 overflow-visible rtl:-scale-x-100 xl:w-20"
      >
        <defs>
          <linearGradient id="reaction-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>

        {/* endpoint nodes, echoing the molecular-background dots */}
        <circle cx="8" cy="27" r="3.2" fill="var(--primary)" opacity="0.85" />
        <circle cx="88" cy="27" r="3.2" fill="var(--accent-strong)" opacity="0.85" />

        {/* base curve */}
        <path
          d="M8 27 Q 48 8 88 27"
          fill="none"
          stroke="url(#reaction-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* flowing dashed overlay for a sense of motion */}
        <path
          d="M8 27 Q 48 8 88 27"
          fill="none"
          stroke="url(#reaction-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.9"
        />

        {/* arrowhead */}
        <path d="M80 19 L92 27 L80 35 Z" fill="var(--accent-strong)" />

        {/* traveling energy spark, in the sparingly-used sharp accent color */}
        <circle r="5" fill="var(--spark)" opacity="0.18" className="reaction-arrow-ring" />
        <circle r="2.4" fill="var(--spark)" className="reaction-arrow-spark" />
      </svg>
    </div>
  );
}
