/**
 * "Reactant -> product" connector between the source-text panel and the
 * generated-abstract panel, styled as a hand-drawn chemistry reaction
 * arrow: a closed decorative loop/coil near the start, a smooth swoosh
 * curve that fades from mineral teal into cobalt along a gradient, and a
 * bold hollow (outline) cobalt arrowhead at the tip — matching the
 * reference mockup exactly. No background glow/shadow behind it.
 * A horizontal version bridges the two side-by-side panels on desktop; a
 * compact vertical version connects them when they stack on small screens.
 */
function HorizontalArrow() {
  return (
    <div
      aria-hidden
      className="relative hidden shrink-0 self-stretch lg:flex lg:w-16 lg:items-center lg:justify-center xl:w-20"
    >
      <svg viewBox="0 0 110 62" className="h-auto w-full overflow-visible rtl:-scale-x-100">
        <defs>
          <linearGradient id="reaction-grad-h" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-strong)" />
            <stop offset="65%" stopColor="var(--accent-strong)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>

        {/* closed loop/coil near the start, fading into the swoosh curve */}
        <path
          d="M6,58 C10,50 12,46 16,44 C24,40 30,44 28,50 C26,56 18,56 18,49 C18,43 26,38 34,34 Q 62,10 96,18"
          fill="none"
          stroke="url(#reaction-grad-h)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* flowing dashed overlay for a sense of motion */}
        <path
          d="M6,58 C10,50 12,46 16,44 C24,40 30,44 28,50 C26,56 18,56 18,49 C18,43 26,38 34,34 Q 62,10 96,18"
          fill="none"
          stroke="url(#reaction-grad-h)"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.8"
        />
        {/* bold hollow arrowhead, cobalt */}
        <path
          d="M84,10 L104,18 L83,28"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* traveling energy spark, in the sharp accent color */}
        <circle r="5.5" fill="var(--spark)" opacity="0.22" className="reaction-arrow-ring" />
        <circle r="3" fill="var(--spark)" className="reaction-arrow-spark" />
      </svg>
    </div>
  );
}

function VerticalArrow() {
  return (
    <div aria-hidden className="flex h-24 items-center justify-center lg:hidden">
      <svg viewBox="0 0 62 110" className="h-full w-auto overflow-visible">
        <defs>
          <linearGradient id="reaction-grad-v" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-strong)" />
            <stop offset="65%" stopColor="var(--accent-strong)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>

        <path
          d="M58,6 C50,10 46,12 44,16 C40,24 44,30 50,28 C56,26 56,18 49,18 C43,18 38,26 34,34 Q 10,62 18,96"
          fill="none"
          stroke="url(#reaction-grad-v)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M58,6 C50,10 46,12 44,16 C40,24 44,30 50,28 C56,26 56,18 49,18 C43,18 38,26 34,34 Q 10,62 18,96"
          fill="none"
          stroke="url(#reaction-grad-v)"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.8"
        />
        <path
          d="M10,84 L18,104 L28,83"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle r="5" fill="var(--spark)" opacity="0.22" className="reaction-arrow-ring-v" />
        <circle r="2.8" fill="var(--spark)" className="reaction-arrow-spark-v" />
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
