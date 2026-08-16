/**
 * Decorative animated molecular / atomic network layer.
 * Rendered fixed behind all page content.
 * The pattern tile uses pixel user units (no viewBox) so node density
 * stays constant at every viewport size.
 */
const TILE = 300;

const NODES: { x: number; y: number; r: number }[] = [
  { x: 34, y: 48, r: 4.5 },
  { x: 128, y: 22, r: 3 },
  { x: 96, y: 130, r: 5 },
  { x: 210, y: 92, r: 3.5 },
  { x: 268, y: 190, r: 4 },
  { x: 152, y: 236, r: 3 },
  { x: 44, y: 214, r: 4.5 },
  { x: 240, y: 292, r: 3 },
  { x: 292, y: 40, r: 3.5 },
];

const LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [3, 4],
  [2, 5],
  [5, 4],
  [5, 6],
  [0, 6],
  [3, 8],
  [4, 7],
  [5, 7],
];

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
              <g stroke="oklch(0.72 0.09 220 / 0.5)" strokeWidth="1.2">
                {LINKS.map(([a, b], i) => (
                  <line
                    key={i}
                    x1={NODES[a]!.x}
                    y1={NODES[a]!.y}
                    x2={NODES[b]!.x}
                    y2={NODES[b]!.y}
                  />
                ))}
              </g>
              <g fill="oklch(0.66 0.11 220 / 0.6)">
                {NODES.map((n, i) => (
                  <circle
                    key={i}
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 5) * 1.4}s` }}
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
