/**
 * Decorative animated molecular / atomic network layer.
 * Rendered fixed behind all page content.
 */
const NODES = [
  { x: 60, y: 80 },
  { x: 220, y: 140 },
  { x: 150, y: 300 },
  { x: 340, y: 60 },
  { x: 430, y: 220 },
  { x: 300, y: 380 },
  { x: 520, y: 120 },
  { x: 620, y: 300 },
  { x: 480, y: 420 },
  { x: 700, y: 80 },
  { x: 90, y: 460 },
  { x: 660, y: 470 },
];

const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [2, 5],
  [4, 5],
  [3, 6],
  [4, 6],
  [6, 7],
  [5, 8],
  [7, 8],
  [6, 9],
  [2, 10],
  [7, 11],
  [8, 11],
];

export function MolecularBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="molecular-drift absolute -inset-[15%]">
        <svg
          className="size-full"
          viewBox="0 0 760 520"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="molecular-net"
              width="760"
              height="520"
              patternUnits="userSpaceOnUse"
            >
              <g
                stroke="oklch(0.68 0.09 220 / 0.45)"
                strokeWidth="1.1"
                fill="oklch(0.66 0.1 220 / 0.55)"
              >
                {LINKS.map(([a, b], i) => (
                  <line
                    key={i}
                    x1={NODES[a]!.x}
                    y1={NODES[a]!.y}
                    x2={NODES[b]!.x}
                    y2={NODES[b]!.y}
                  />
                ))}
                {NODES.map((n, i) => (
                  <circle
                    key={i}
                    cx={n.x}
                    cy={n.y}
                    r={i % 3 === 0 ? 4.5 : 3}
                    stroke="none"
                    className="molecular-node"
                    style={{ animationDelay: `${(i % 6) * 0.9}s` }}
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
