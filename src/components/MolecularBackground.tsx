/**
 * Decorative animated molecular network layer, styled after real skeletal
 * chemical structures (hexagon rings with alternating double bonds and
 * colored substituent atoms) rather than an abstract dot graph.
 * Rendered fixed behind all page content.
 *
 * Each "molecule" cluster in the tile is self-contained: a single ring, or
 * two rings fused/bonded directly to one another. Clusters are never
 * stretched across the tile with long connector lines — unrelated
 * structures stay visually independent, exactly like real skeletal
 * diagrams, with generous open space between them.
 * The pattern tile uses pixel user units (no viewBox) so node density
 * stays constant at every viewport size.
 */
const TILE = 420;

export function MolecularBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="molecular-drift absolute -inset-[20%]">
        <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="molecular-net" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
              {/* Cluster A: two fused rings (cobalt + teal), top-left, with one short methyl-style substituent */}
              <g stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round">
                <polygon points="105,49 144.8,72 144.8,118 105,141 65.2,118 65.2,72" fill="none" />
                <line x1="111.5" y1="64.7" x2="128" y2="74.2" strokeOpacity="0.55" />
                <line x1="128" y1="115.8" x2="111.5" y2="125.3" strokeOpacity="0.55" />
                <line x1="75.5" y1="104.5" x2="75.5" y2="85.5" strokeOpacity="0.55" />
                {/* short substituent branch, terminates in a lime atom */}
                <line x1="105" y1="49" x2="99" y2="27" strokeOpacity="0.5" />
              </g>
              <g stroke="var(--accent-strong)" strokeOpacity="0.46" strokeWidth="1.5" strokeLinecap="round">
                <polygon points="178,105 212.6,125 212.6,165 178,185 143.4,165 143.4,125" fill="none" />
                <line x1="183.6" y1="118.7" x2="198" y2="126.9" strokeOpacity="0.5" />
                <line x1="198" y1="163.1" x2="183.6" y2="171.3" strokeOpacity="0.5" />
                <line x1="152.4" y1="153.3" x2="152.4" y2="136.7" strokeOpacity="0.5" />
              </g>
              <g>
                {[
                  { x: 105, y: 49, c: "var(--primary)" },
                  { x: 144.8, y: 72, c: "var(--accent-strong)" },
                  { x: 144.8, y: 118, c: "var(--primary)" },
                  { x: 105, y: 141, c: "var(--accent-strong)" },
                  { x: 65.2, y: 118, c: "var(--primary)" },
                  { x: 65.2, y: 72, c: "var(--accent-strong)" },
                  { x: 178, y: 105, c: "var(--accent-strong)" },
                  { x: 212.6, y: 125, c: "var(--primary)" },
                  { x: 212.6, y: 165, c: "var(--accent-strong)" },
                  { x: 178, y: 185, c: "var(--primary)" },
                  { x: 143.4, y: 165, c: "var(--accent-strong)" },
                  { x: 143.4, y: 125, c: "var(--primary)" },
                ].map((n, i) => (
                  <circle
                    key={`clusterA-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r="3.8"
                    fill={n.c}
                    fillOpacity="0.82"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 1.1}s` }}
                  />
                ))}
                <circle cx="99" cy="27" r="3.6" fill="var(--decorative-lime)" fillOpacity="0.85" className="molecular-node" />
              </g>

              {/* Cluster B: single large hexagon, pale/faint, upper right */}
              <g stroke="var(--decorative-violet)" strokeOpacity="0.24" strokeWidth="1.6" strokeLinecap="round">
                <polygon points="330,20 373.3,45 373.3,95 330,120 286.7,95 286.7,45" fill="none" />
                <line x1="337" y1="37.1" x2="355" y2="47.4" strokeOpacity="0.24" />
                <line x1="355" y1="92.6" x2="337" y2="102.9" strokeOpacity="0.24" />
                <line x1="298" y1="80.4" x2="298" y2="59.6" strokeOpacity="0.24" />
              </g>
              <g>
                {[
                  { x: 330, y: 20 }, { x: 373.3, y: 45 }, { x: 373.3, y: 95 },
                  { x: 330, y: 120 }, { x: 286.7, y: 95 }, { x: 286.7, y: 45 },
                ].map((n, i) => (
                  <circle
                    key={`clusterB-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r="3.6"
                    fill={i % 2 === 0 ? "var(--decorative-violet)" : "var(--primary)"}
                    fillOpacity="0.4"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 1.3}s` }}
                  />
                ))}
              </g>

              {/* Cluster C: two fused rings (teal + apricot), lower right */}
              <g stroke="var(--accent-strong)" strokeOpacity="0.48" strokeWidth="1.6" strokeLinecap="round">
                <polygon points="300,260 334.6,280 334.6,320 300,340 265.4,320 265.4,280" fill="none" />
                <line x1="305.6" y1="273.7" x2="320" y2="281.9" strokeOpacity="0.5" />
                <line x1="320" y1="318.1" x2="305.6" y2="326.3" strokeOpacity="0.5" />
                <line x1="274.4" y1="308.3" x2="274.4" y2="291.7" strokeOpacity="0.5" />
              </g>
              <g stroke="var(--spark)" strokeOpacity="0.42" strokeWidth="1.4" strokeLinecap="round">
                <polygon points="355,224 384.4,241 384.4,275 355,292 325.6,275 325.6,241" fill="none" />
                <line x1="359.8" y1="235.6" x2="372" y2="242.7" strokeOpacity="0.45" />
                <line x1="372" y1="273.3" x2="359.8" y2="280.4" strokeOpacity="0.45" />
                <line x1="333.2" y1="265" x2="333.2" y2="251" strokeOpacity="0.45" />
              </g>
              <g>
                {[
                  { x: 300, y: 260, c: "var(--accent-strong)" },
                  { x: 334.6, y: 280, c: "var(--spark)" },
                  { x: 334.6, y: 320, c: "var(--accent-strong)" },
                  { x: 300, y: 340, c: "var(--spark)" },
                  { x: 265.4, y: 320, c: "var(--accent-strong)" },
                  { x: 265.4, y: 280, c: "var(--spark)" },
                  { x: 355, y: 224, c: "var(--spark)" },
                  { x: 384.4, y: 241, c: "var(--accent-strong)" },
                  { x: 384.4, y: 275, c: "var(--spark)" },
                  { x: 355, y: 292, c: "var(--accent-strong)" },
                  { x: 325.6, y: 275, c: "var(--spark)" },
                  { x: 325.6, y: 241, c: "var(--accent-strong)" },
                ].map((n, i) => (
                  <circle
                    key={`clusterC-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r="3.6"
                    fill={n.c}
                    fillOpacity="0.78"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 1.2}s` }}
                  />
                ))}
              </g>

              {/* Cluster D: single faint hexagon, bottom-left */}
              <g stroke="var(--accent-strong)" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round">
                <polygon points="55,296 84.4,313 84.4,347 55,364 25.6,347 25.6,313" fill="none" />
                <line x1="59.8" y1="307.6" x2="72" y2="314.7" strokeOpacity="0.2" />
                <line x1="72" y1="345.3" x2="59.8" y2="352.4" strokeOpacity="0.2" />
                <line x1="33.2" y1="337" x2="33.2" y2="323" strokeOpacity="0.2" />
              </g>
              <g>
                {[
                  { x: 55, y: 296 }, { x: 84.4, y: 313 }, { x: 84.4, y: 347 },
                  { x: 55, y: 364 }, { x: 25.6, y: 347 }, { x: 25.6, y: 313 },
                ].map((n, i) => (
                  <circle
                    key={`clusterD-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r="3.2"
                    fill={i % 2 === 0 ? "var(--accent-strong)" : "var(--decorative-violet)"}
                    fillOpacity="0.35"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 1.4}s` }}
                  />
                ))}
              </g>

              {/* free-floating single atoms — never bonded to anything, so no connector lines needed */}
              <g>
                {[
                  { x: 230, y: 40, r: 4, c: "var(--spark)" },
                  { x: 20, y: 210, r: 3.4, c: "var(--decorative-lime)" },
                  { x: 390, y: 190, r: 3.8, c: "var(--decorative-violet)" },
                  { x: 230, y: 390, r: 3.4, c: "var(--primary)" },
                  { x: 130, y: 260, r: 2.8, c: "var(--spark)" },
                ].map((n, i) => (
                  <circle
                    key={`floater-${i}`}
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={n.c}
                    fillOpacity="0.7"
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
