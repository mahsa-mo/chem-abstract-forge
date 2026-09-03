/**
 * "Reactant -> product" connector between the source-text panel and the
 * generated-abstract panel, styled after a chemistry reaction arrow.
 * A horizontal version bridges the two side-by-side panels on desktop; a
 * compact vertical version connects them when they stack on small screens.
 */
function HorizontalArrow() {
  return (
    <div
      aria-hidden
      className="relative hidden shrink-0 self-stretch lg:flex lg:w-28 lg:items-center lg:justify-center xl:w-36"
    >
      {/* soft glow bridging the two card edges so the connector doesn't read as empty gap */}
      <div
        className="reaction-arrow-glow pointer-events-none absolute inset-y-1/3 inset-x-0 rounded-full opacity-40"
        style={{
          background:
            "linear-gradient(90deg, var(--primary) 0%, var(--decorative-violet) 50%, var(--accent-strong) 100%)",
        }}
      />
      <svg viewBox="0 0 100 54" className="relative h-auto w-full overflow-visible rtl:-scale-x-100">
        <defs>
          <linearGradient id="reaction-grad-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--decorative-violet)" />
            <stop offset="100%" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>

        {/* reactant marker: small hexagon outline, echoing the ring motifs in the background */}
        <polygon
          points="6,20 11,23 11,29 6,32 1,29 1,23"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.4"
          opacity="0.9"
        />
        {/* product marker: small sparkle */}
        <path
          d="M94 20 L96 26 L100 27 L96 28 L94 34 L92 28 L88 27 L92 26 Z"
          fill="var(--accent-strong)"
          opacity="0.9"
        />

        {/* base curve */}
        <path
          d="M6 27 Q 50 4 94 27"
          fill="none"
          stroke="url(#reaction-grad-h)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* flowing dashed overlay for a sense of motion */}
        <path
          d="M6 27 Q 50 4 94 27"
          fill="none"
          stroke="url(#reaction-grad-h)"
          strokeWidth="3"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.9"
        />

        {/* arrowhead */}
        <path d="M84 15 L98 27 L84 39 L88 27 Z" fill="var(--accent-strong)" />

        {/* traveling energy spark, in the sharp accent color */}
        <circle r="6" fill="var(--spark)" opacity="0.22" className="reaction-arrow-ring" />
        <circle r="3.2" fill="var(--spark)" className="reaction-arrow-spark" />
      </svg>
    </div>
  );
}

function VerticalArrow() {
  return (
    <div aria-hidden className="flex h-16 items-center justify-center lg:hidden">
      <svg viewBox="0 0 54 100" className="h-full w-auto overflow-visible">
        <defs>
          <linearGradient id="reaction-grad-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--decorative-violet)" />
            <stop offset="100%" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>

        <path
          d="M27 6 Q 4 50 27 94"
          fill="none"
          stroke="url(#reaction-grad-v)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M27 6 Q 4 50 27 94"
          fill="none"
          stroke="url(#reaction-grad-v)"
          strokeWidth="3"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.9"
        />
        <path d="M15 84 L27 98 L39 84 L27 88 Z" fill="var(--accent-strong)" />

        <circle r="5.5" fill="var(--spark)" opacity="0.22" className="reaction-arrow-ring-v" />
        <circle r="3" fill="var(--spark)" className="reaction-arrow-spark-v" />
      </svg>
    </div>
  );
}

export function ReactionArrow() {
  return (
    <>
      <HorizontalArrow />
      <VerticalArrow />
    </>
  );
}
