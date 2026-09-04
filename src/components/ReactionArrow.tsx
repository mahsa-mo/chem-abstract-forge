/**
 * "Reactant -> product" connector between the source-text panel and the
 * generated-abstract panel, styled as a hand-drawn chemistry reaction
 * arrow: a small decorative loop/coil near the start (mineral teal), a
 * smooth swoosh curve, and a bold hollow (outline) arrowhead in cobalt
 * at the tip. A horizontal version bridges the two side-by-side panels
 * on desktop; a compact vertical version connects them when they stack
 * on small screens.
 */
function HorizontalArrow() {
  return (
    <div
      aria-hidden
      className="relative hidden shrink-0 self-stretch lg:flex lg:w-16 lg:items-center lg:justify-center xl:w-20"
    >
      {/* soft glow bridging the two card edges so the connector doesn't read as empty gap */}
      <div
        className="reaction-arrow-glow pointer-events-none absolute inset-y-1/3 inset-x-0 rounded-full opacity-40"
        style={{
          background: "linear-gradient(90deg, var(--accent-strong) 0%, var(--primary) 100%)",
        }}
      />
      <svg viewBox="0 0 104 52" className="relative h-auto w-full overflow-visible rtl:-scale-x-100">
        {/* decorative loop/coil near the start, mineral teal */}
        <path
          d="M10,38 C3,39 1,32 6,28 C11,25 16,28 14,33 C12.5,37 7,36.5 9,32.5"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* base swoosh curve, from the loop up to the arrowhead */}
        <path
          d="M9,32.5 Q 48,4 84,15"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* flowing dashed overlay for a sense of motion */}
        <path
          d="M9,32.5 Q 48,4 84,15"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.85"
        />
        {/* bold hollow arrowhead, cobalt */}
        <path
          d="M74,8 L96,15 L75,24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3.6"
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
    <div aria-hidden className="flex h-20 items-center justify-center lg:hidden">
      <svg viewBox="0 0 52 104" className="h-full w-auto overflow-visible">
        {/* decorative loop/coil near the start, mineral teal */}
        <path
          d="M38,10 C39,3 32,1 28,6 C25,11 28,16 33,14 C37,12.5 36.5,7 32.5,9"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M32.5,9 Q 4,48 15,86"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M32.5,9 Q 4,48 15,86"
          fill="none"
          stroke="var(--accent-strong)"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="reaction-arrow-line"
          opacity="0.85"
        />
        <path
          d="M8,74 L15,96 L24,75"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3.6"
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
