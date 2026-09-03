/**
 * Decorative animated molecular network layer, styled after real skeletal
 * chemical structures (hexagon rings with alternating double bonds and
 * colored substituent atoms) rather than an abstract dot graph.
 * Rendered fixed behind all page content.
 * The pattern tile uses pixel user units (no viewBox) so node density
 * stays constant at every viewport size.
 */
const TILE = 300;

const BOND = "var(--primary)";

export function MolecularBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="molecular-drift absolute -inset-[20%]">
        <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="molecular-net"
              width={TILE}
              height={TILE}
              patternUnits="userSpaceOnUse"
            >
              {/* bonds */}
              <g stroke={BOND} strokeOpacity="0.38" strokeWidth="1.4" strokeLinecap="round">
                {/* ring A hexagon */}
                <polygon points="92,66 118,81 118,111 92,126 66,111 66,81" fill="none" />
                {/* ring B hexagon */}
                <polygon
                  points="220,185.8 236.2,202 230.3,224.3 208,230.2 191.8,214 197.7,191.7"
                  fill="none"
                />
                {/* substituent branches */}
                <line x1="92" y1="66" x2="66" y2="40" />
                <line x1="236.2" y1="202" x2="262" y2="192" />
                <line x1="92" y1="126" x2="92" y2="152" />
                {/* scattered floater bonds */}
                <line x1="268" y1="36" x2="286" y2="58" />
                <line x1="26" y1="240" x2="44" y2="264" />
                {/* faint long chain implying the network continues off-tile */}
                <line x1="118" y1="81" x2="268" y2="36" strokeOpacity="0.5" />
                <line x1="66" y1="111" x2="26" y2="240" strokeOpacity="0.5" />
              </g>

              {/* alternating double-bond ticks, aromatic-ring style */}
              <g stroke={BOND} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round">
                <line x1="92" y1="74.4" x2="110.7" y2="85.2" />
                <line x1="110.7" y1="106.8" x2="92" y2="117.6" />
                <line x1="73.3" y1="106.8" x2="73.3" y2="85.2" />
                <line x1="218.3" y1="192" x2="230" y2="203.7" />
                <line x1="225.7" y1="219.7" x2="209.7" y2="224" />
                <line x1="198" y1="212.3" x2="202.3" y2="196.3" />
              </g>

              {/* ring backbone atoms — alternating cobalt / mineral teal */}
              <g>
                {[
                  { x: 92, y: 66, c: "var(--primary)" },
                  { x: 118, y: 81, c: "var(--accent-strong)" },
                  { x: 118, y: 111, c: "var(--primary)" },
                  { x: 92, y: 126, c: "var(--accent-strong)" },
                  { x: 66, y: 111, c: "var(--primary)" },
                  { x: 66, y: 81, c: "var(--accent-strong)" },
                  { x: 220, y: 185.8, c: "var(--accent-strong)" },
                  { x: 236.2, y: 202, c: "var(--primary)" },
                  { x: 230.3, y: 224.3, c: "var(--accent-strong)" },
                  { x: 208, y: 230.2, c: "var(--primary)" },
                  { x: 191.8, y: 214, c: "var(--accent-strong)" },
                  { x: 197.7, y: 191.7, c: "var(--primary)" },
                ].map((n, i) => (
                  <circle
                    key={`ring-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r="3.4"
                    fill={n.c}
                    fillOpacity="0.7"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 1.3}s` }}
                  />
                ))}
              </g>

              {/* colored substituent heteroatoms + scattered floaters */}
              <g>
                {[
                  { x: 66, y: 40, r: 4, c: "var(--spark)" },
                  { x: 262, y: 192, r: 4, c: "var(--decorative-lime)" },
                  { x: 92, y: 152, r: 4, c: "var(--decorative-violet)" },
                  { x: 268, y: 36, r: 3.2, c: "var(--accent-strong)" },
                  { x: 286, y: 58, r: 2.6, c: "var(--primary)" },
                  { x: 26, y: 240, r: 3.2, c: "var(--decorative-violet)" },
                  { x: 44, y: 264, r: 2.6, c: "var(--primary)" },
                  { x: 150, y: 268, r: 2.8, c: "var(--spark)" },
                ].map((n, i) => (
                  <circle
                    key={`atom-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={n.c}
                    fillOpacity="0.75"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 5) * 1.6}s` }}
                  />
                ))}
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#molecular-net)" />
        </svg>
      </div>
    </div>
  );
}
