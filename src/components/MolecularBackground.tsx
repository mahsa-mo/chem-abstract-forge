import React, { useEffect, useState, useRef } from "react";

interface PolyVertex {
  id: string;
  baseX: number; // 0..1440
  baseY: number; // 0..900
  r: number;
  color: string;
  layer: "fg" | "bg";
  phaseX: number;
  phaseY: number;
  speed: number;
  amp: number;
}

interface PolyEdge {
  from: string;
  to: string;
  layer: "fg" | "bg";
}

// Smooth horizontal spectrum matching the reference image:
// Left: Indigo/Blue (#5B6BF0 -> #2596F5) -> Cyan (#14B8D4) -> Green/Lime (#4CC355 -> #82C93E) -> Amber/Orange (#D9A332 -> #F28B24)
function getSpectrumColor(x: number): string {
  const t = Math.max(0, Math.min(1, x / 1440));
  if (t < 0.2) return "#5B6BF0";
  if (t < 0.35) return "#2596F5";
  if (t < 0.48) return "#14B8D4";
  if (t < 0.62) return "#4CC355";
  if (t < 0.75) return "#82C93E";
  if (t < 0.87) return "#D9A332";
  return "#F28B24";
}

function buildPolygonRing(
  prefix: string,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotationDeg: number,
  layer: "fg" | "bg",
  vertexRadius = 3.2,
): { vertices: PolyVertex[]; edges: PolyEdge[] } {
  const vertices: PolyVertex[] = [];
  const edges: PolyEdge[] = [];
  const rot = (rotationDeg * Math.PI) / 180;

  for (let i = 0; i < sides; i++) {
    const angle = rot + (i * 2 * Math.PI) / sides;
    const vx = Number((cx + radius * Math.cos(angle)).toFixed(1));
    const vy = Number((cy + radius * Math.sin(angle)).toFixed(1));
    const seed = (cx * 0.035 + cy * 0.045 + i * 0.95) % (Math.PI * 2);
    vertices.push({
      id: `${prefix}-${i}`,
      baseX: vx,
      baseY: vy,
      r: i % 2 === 0 ? vertexRadius : vertexRadius * 0.76,
      color: getSpectrumColor(vx),
      layer,
      phaseX: seed,
      phaseY: seed + 1.4,
      speed: layer === "fg" ? 0.95 : 0.65,
      amp: layer === "fg" ? 6.5 : 4.2,
    });
  }

  for (let i = 0; i < sides; i++) {
    edges.push({
      from: `${prefix}-${i}`,
      to: `${prefix}-${(i + 1) % sides}`,
      layer,
    });
  }

  return { vertices, edges };
}

function createFullViewportPolygonLattice(): { vertices: PolyVertex[]; edges: PolyEdge[] } {
  const allVertices: PolyVertex[] = [];
  const allEdges: PolyEdge[] = [];

  const addRing = (
    prefix: string,
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    rot: number,
    layer: "fg" | "bg",
    r = 3.3,
  ) => {
    const { vertices, edges } = buildPolygonRing(prefix, cx, cy, radius, sides, rot, layer, r);
    allVertices.push(...vertices);
    allEdges.push(...edges);
  };

  // --- 16 FINER BACKGROUND RINGS DISTRIBUTED ACROSS ALL ZONES ---
  const bgRings: [string, number, number, number, number, number][] = [
    ["bg1", 75, 145, 30, 6, 15],
    ["bg2", 265, 210, 32, 6, 0],
    ["bg3", 480, 175, 28, 5, 18],
    ["bg4", 690, 125, 30, 6, 30],
    ["bg5", 930, 195, 32, 6, 12],
    ["bg6", 1180, 130, 30, 6, 25],
    ["bg7", 1365, 215, 28, 6, 10],
    ["bg8", 110, 440, 32, 6, 20],
    ["bg9", 390, 480, 30, 5, 15],
    ["bg10", 740, 430, 34, 6, 30],
    ["bg11", 1060, 470, 30, 6, 18],
    ["bg12", 1340, 445, 32, 6, 5],
    ["bg13", 190, 740, 32, 6, 22],
    ["bg14", 540, 780, 30, 6, 10],
    ["bg15", 890, 760, 32, 5, 28],
    ["bg16", 1240, 750, 30, 6, 15],
  ];
  for (const [id, x, y, rad, sides, rot] of bgRings) {
    addRing(id, x, y, rad, sides, rot, "bg", 2.1);
  }

  // --- 30 FINER FOREGROUND POLYGON RINGS COVERING ENTIRE VIEWPORT (TOP, UPPER-MID, CENTER, LOWER-MID, BOTTOM & OUTER MARGINS) ---
  // Row 1 (Top band y ~ 65..135)
  addRing("r1_1", 85, 82, 32, 6, 20, "fg", 3.4);
  addRing("r1_2", 230, 105, 34, 6, 15, "fg", 3.5);
  addRing("r1_3", 365, 72, 29, 8, 22.5, "fg", 3.1);
  addRing("r1_4", 525, 88, 33, 6, 8, "fg", 3.3);
  addRing("r1_5", 685, 76, 30, 5, 18, "fg", 3.2);
  addRing("r1_6", 835, 98, 35, 6, 30, "fg", 3.6);
  addRing("r1_7", 1010, 78, 32, 6, 12, "fg", 3.3);
  addRing("r1_8", 1175, 96, 34, 6, 25, "fg", 3.4);
  addRing("r1_9", 1335, 84, 31, 6, 10, "fg", 3.3);

  // Row 2 (Upper-Mid band y ~ 215..295)
  addRing("r2_1", 65, 245, 33, 6, 10, "fg", 3.4);
  addRing("r2_2", 185, 270, 35, 6, 30, "fg", 3.5);
  addRing("r2_3", 335, 235, 31, 5, 12, "fg", 3.2);
  addRing("r2_4", 475, 265, 34, 6, 30, "fg", 3.4);
  addRing("r2_5", 635, 225, 36, 6, 30, "fg", 3.6);
  addRing("r2_6", 780, 255, 34, 6, 0, "fg", 3.5);
  addRing("r2_7", 945, 240, 35, 8, 22.5, "fg", 3.3);
  addRing("r2_8", 1110, 268, 34, 6, 30, "fg", 3.5);
  addRing("r2_9", 1265, 230, 33, 6, 15, "fg", 3.4);
  addRing("r2_10", 1385, 275, 30, 6, 25, "fg", 3.2);

  // Row 3 (Center band y ~ 390..495 — ensures continuous lattice across middle & outer edges)
  addRing("r3_1", 58, 420, 32, 6, 25, "fg", 3.4);
  addRing("r3_2", 165, 465, 34, 6, 15, "fg", 3.4);
  addRing("r3_3", 310, 415, 31, 6, 30, "fg", 3.2);
  addRing("r3_4", 495, 450, 33, 5, 18, "fg", 3.3);
  addRing("r3_5", 675, 410, 35, 6, 30, "fg", 3.5);
  addRing("r3_6", 855, 455, 34, 6, 12, "fg", 3.4);
  addRing("r3_7", 1025, 420, 33, 6, 30, "fg", 3.4);
  addRing("r3_8", 1205, 460, 35, 6, 20, "fg", 3.5);
  addRing("r3_9", 1365, 415, 32, 6, 8, "fg", 3.4);

  // Row 4 (Lower-Mid band y ~ 580..670)
  addRing("r4_1", 82, 605, 33, 6, 18, "fg", 3.4);
  addRing("r4_2", 235, 635, 34, 6, 30, "fg", 3.4);
  addRing("r4_3", 395, 595, 31, 8, 22.5, "fg", 3.1);
  addRing("r4_4", 565, 640, 35, 6, 10, "fg", 3.5);
  addRing("r4_5", 735, 600, 34, 6, 30, "fg", 3.4);
  addRing("r4_6", 905, 635, 33, 5, 15, "fg", 3.3);
  addRing("r4_7", 1075, 595, 35, 6, 30, "fg", 3.5);
  addRing("r4_8", 1245, 630, 33, 6, 12, "fg", 3.4);
  addRing("r4_9", 1380, 590, 30, 6, 28, "fg", 3.2);

  // Row 5 (Bottom band y ~ 760..845)
  addRing("r5_1", 70, 795, 32, 6, 12, "fg", 3.3);
  addRing("r5_2", 215, 825, 34, 6, 30, "fg", 3.4);
  addRing("r5_3", 375, 785, 32, 6, 20, "fg", 3.3);
  addRing("r5_4", 535, 820, 33, 6, 5, "fg", 3.4);
  addRing("r5_5", 705, 785, 35, 6, 30, "fg", 3.5);
  addRing("r5_6", 875, 825, 33, 6, 15, "fg", 3.4);
  addRing("r5_7", 1045, 790, 34, 6, 30, "fg", 3.4);
  addRing("r5_8", 1210, 825, 32, 5, 18, "fg", 3.3);
  addRing("r5_9", 1355, 790, 33, 6, 22, "fg", 3.4);

  // Exocyclic substituent terminal vertices for delicate branching
  const extraCoords: [string, number, number, number][] = [
    ["ex-1", 28, 42, 3.6],
    ["ex-2", 155, 45, 3.0],
    ["ex-3", 295, 155, 3.6],
    ["ex-4", 445, 142, 3.4],
    ["ex-5", 605, 145, 3.5],
    ["ex-6", 755, 150, 3.5],
    ["ex-7", 920, 142, 3.6],
    ["ex-8", 1095, 152, 3.4],
    ["ex-9", 1255, 155, 3.5],
    ["ex-10", 1412, 140, 3.4],
    ["ex-11", 118, 335, 3.5],
    ["ex-12", 255, 345, 3.4],
    ["ex-13", 412, 338, 3.5],
    ["ex-14", 575, 335, 3.4],
    ["ex-15", 715, 332, 3.6],
    ["ex-16", 865, 345, 3.5],
    ["ex-17", 1030, 340, 3.5],
    ["ex-18", 1185, 348, 3.4],
    ["ex-19", 1325, 338, 3.5],
    ["ex-20", 122, 535, 3.4],
    ["ex-21", 285, 525, 3.5],
    ["ex-22", 445, 530, 3.3],
    ["ex-23", 615, 522, 3.5],
    ["ex-24", 795, 530, 3.5],
    ["ex-25", 965, 525, 3.4],
    ["ex-26", 1140, 532, 3.5],
    ["ex-27", 1295, 525, 3.4],
    ["ex-28", 148, 715, 3.4],
    ["ex-29", 310, 710, 3.5],
    ["ex-30", 465, 718, 3.4],
    ["ex-31", 635, 712, 3.5],
    ["ex-32", 805, 715, 3.4],
    ["ex-33", 975, 712, 3.5],
    ["ex-34", 1145, 715, 3.4],
    ["ex-35", 1305, 710, 3.5],
  ];

  for (const [id, x, y, r] of extraCoords) {
    const seed = (x * 0.04 + y * 0.05) % (Math.PI * 2);
    allVertices.push({
      id,
      baseX: x,
      baseY: y,
      r,
      color: getSpectrumColor(x),
      layer: "fg",
      phaseX: seed,
      phaseY: seed + 1.2,
      speed: 0.95,
      amp: 6.5,
    });
  }

  // Inter-ring connecting bridges across the full network
  const bridgePairs: [string, string][] = [
    // Row 1 bridges
    ["ex-1", "r1_1-3"],
    ["r1_1-0", "ex-2"],
    ["ex-2", "r1_2-3"],
    ["r1_2-0", "r1_3-4"],
    ["r1_3-0", "r1_4-3"],
    ["r1_4-0", "r1_5-3"],
    ["r1_5-0", "r1_6-3"],
    ["r1_6-0", "r1_7-3"],
    ["r1_7-0", "r1_8-3"],
    ["r1_8-0", "r1_9-3"],
    ["r1_9-0", "ex-10"],

    // Row 1 to Row 2 vertical/diagonal bridges
    ["r1_1-1", "r2_1-4"],
    ["r1_2-1", "ex-3"],
    ["ex-3", "r2_3-3"],
    ["r1_3-2", "ex-4"],
    ["ex-4", "r2_4-4"],
    ["r1_4-1", "ex-5"],
    ["ex-5", "r2_5-4"],
    ["r1_5-1", "ex-6"],
    ["ex-6", "r2_6-4"],
    ["r1_6-1", "ex-7"],
    ["ex-7", "r2_7-5"],
    ["r1_7-1", "ex-8"],
    ["ex-8", "r2_8-4"],
    ["r1_8-1", "ex-9"],
    ["ex-9", "r2_9-4"],
    ["r1_9-1", "r2_10-4"],

    // Row 2 horizontal bridges
    ["r2_1-0", "r2_2-3"],
    ["r2_2-0", "r2_3-2"],
    ["r2_3-0", "r2_4-3"],
    ["r2_4-0", "r2_5-3"],
    ["r2_5-0", "r2_6-3"],
    ["r2_6-0", "r2_7-4"],
    ["r2_7-0", "r2_8-3"],
    ["r2_8-0", "r2_9-3"],
    ["r2_9-0", "r2_10-3"],

    // Row 2 to Row 3 bridges
    ["r2_1-2", "ex-11"],
    ["ex-11", "r3_1-4"],
    ["r2_2-1", "ex-12"],
    ["ex-12", "r3_2-4"],
    ["r2_3-1", "ex-13"],
    ["ex-13", "r3_3-4"],
    ["r2_4-1", "ex-14"],
    ["ex-14", "r3_4-3"],
    ["r2_5-1", "ex-15"],
    ["ex-15", "r3_5-4"],
    ["r2_6-1", "ex-16"],
    ["ex-16", "r3_6-4"],
    ["r2_7-2", "ex-17"],
    ["ex-17", "r3_7-4"],
    ["r2_8-1", "ex-18"],
    ["ex-18", "r3_8-4"],
    ["r2_9-1", "ex-19"],
    ["ex-19", "r3_9-4"],

    // Row 3 horizontal & diagonal bridges
    ["r3_1-0", "r3_2-3"],
    ["r3_2-0", "r3_3-3"],
    ["r3_3-0", "r3_4-2"],
    ["r3_4-0", "r3_5-3"],
    ["r3_5-0", "r3_6-3"],
    ["r3_6-0", "r3_7-3"],
    ["r3_7-0", "r3_8-3"],
    ["r3_8-0", "r3_9-3"],

    // Row 3 to Row 4 bridges
    ["r3_1-1", "ex-20"],
    ["ex-20", "r4_1-4"],
    ["r3_3-1", "ex-21"],
    ["ex-21", "r4_2-4"],
    ["r3_4-1", "ex-22"],
    ["ex-22", "r4_3-5"],
    ["r3_5-1", "ex-23"],
    ["ex-23", "r4_4-4"],
    ["r3_6-1", "ex-24"],
    ["ex-24", "r4_5-4"],
    ["r3_7-1", "ex-25"],
    ["ex-25", "r4_6-3"],
    ["r3_8-1", "ex-26"],
    ["ex-26", "r4_7-4"],
    ["r3_9-1", "ex-27"],
    ["ex-27", "r4_8-4"],

    // Row 4 horizontal bridges
    ["r4_1-0", "r4_2-3"],
    ["r4_2-0", "r4_3-4"],
    ["r4_3-0", "r4_4-3"],
    ["r4_4-0", "r4_5-3"],
    ["r4_5-0", "r4_6-2"],
    ["r4_6-0", "r4_7-3"],
    ["r4_7-0", "r4_8-3"],
    ["r4_8-0", "r4_9-3"],

    // Row 4 to Row 5 bridges
    ["r4_1-1", "ex-28"],
    ["ex-28", "r5_1-4"],
    ["r4_2-1", "ex-29"],
    ["ex-29", "r5_3-4"],
    ["r4_3-2", "ex-30"],
    ["ex-30", "r5_4-4"],
    ["r4_4-1", "ex-31"],
    ["ex-31", "r5_5-4"],
    ["r4_5-1", "ex-32"],
    ["ex-32", "r5_6-4"],
    ["r4_6-1", "ex-33"],
    ["ex-33", "r5_7-4"],
    ["r4_7-1", "ex-34"],
    ["ex-34", "r5_8-3"],
    ["r4_8-1", "ex-35"],
    ["ex-35", "r5_9-4"],

    // Row 5 horizontal bridges
    ["r5_1-0", "r5_2-3"],
    ["r5_2-0", "r5_3-3"],
    ["r5_3-0", "r5_4-3"],
    ["r5_4-0", "r5_5-3"],
    ["r5_5-0", "r5_6-3"],
    ["r5_6-0", "r5_7-3"],
    ["r5_7-0", "r5_8-2"],
    ["r5_8-0", "r5_9-3"],
  ];

  for (const [from, to] of bridgePairs) {
    allEdges.push({ from, to, layer: "fg" });
  }

  return { vertices: allVertices, edges: allEdges };
}

const LATTICE = createFullViewportPolygonLattice();

export function MolecularBackground() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mousePt, setMousePt] = useState<{ x: number; y: number } | null>(null);
  const [timeSec, setTimeSec] = useState<number>(0);

  // Continuous gentle floating animation across all rings and vertices
  useEffect(() => {
    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      setTimeSec((now - start) * 0.001);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Track cursor globally so vertices respond subtly anywhere on screen
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = ((e.clientX - rect.left) / rect.width) * 1440;
      const y = ((e.clientY - rect.top) / rect.height) * 900;
      setMousePt({ x, y });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const animatedVertices = new Map<
    string,
    { x: number; y: number; liftFactor: number; v: PolyVertex }
  >();

  for (const v of LATTICE.vertices) {
    const driftX = timeSec === 0 ? 0 : Math.sin(timeSec * v.speed + v.phaseX) * v.amp;
    const driftY = timeSec === 0 ? 0 : Math.cos(timeSec * (v.speed * 0.92) + v.phaseY) * v.amp;

    const animX = v.baseX + driftX;
    const animY = v.baseY + driftY;

    let liftFactor = 0;
    if (mousePt && v.layer === "fg") {
      const dist = Math.hypot(animX - mousePt.x, animY - mousePt.y);
      if (dist < 52) {
        liftFactor = Math.max(0, 1 - dist / 52);
      }
    }

    // Subtle upward rise (-3.5px max) when hovered
    const finalY = animY - liftFactor * 3.5;

    animatedVertices.set(v.id, {
      x: Math.round(animX * 10) / 10,
      y: Math.round(finalY * 10) / 10,
      liftFactor,
      v,
    });
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-gradient-to-r from-[#EAEEFF] via-[#F2FCF8] to-[#FFF0F3] dark:from-[#090D16] dark:via-[#0D1526] dark:to-[#13111C]"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full opacity-90 dark:opacity-75"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. Finer Background Secondary Polygons */}
        <g opacity="0.24">
          {LATTICE.edges
            .filter((e) => e.layer === "bg")
            .map((e, idx) => {
              const p1 = animatedVertices.get(e.from);
              const p2 = animatedVertices.get(e.to);
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`bge-${idx}`}
                  x1={p1.x.toFixed(1)}
                  y1={p1.y.toFixed(1)}
                  x2={p2.x.toFixed(1)}
                  y2={p2.y.toFixed(1)}
                  stroke={p1.v.color}
                  strokeWidth="0.9"
                />
              );
            })}
          {LATTICE.vertices
            .filter((v) => v.layer === "bg")
            .map((v) => {
              const p = animatedVertices.get(v.id);
              if (!p) return null;
              return (
                <circle
                  key={v.id}
                  cx={p.x.toFixed(1)}
                  cy={p.y.toFixed(1)}
                  r={v.r.toFixed(2)}
                  fill={v.color}
                />
              );
            })}
        </g>

        {/* 2. Finer Foreground Primary Polygon Edges */}
        <g>
          {LATTICE.edges
            .filter((e) => e.layer === "fg")
            .map((e, idx) => {
              const p1 = animatedVertices.get(e.from);
              const p2 = animatedVertices.get(e.to);
              if (!p1 || !p2) return null;
              const active = p1.liftFactor > 0.25 || p2.liftFactor > 0.25;
              return (
                <line
                  key={`fge-${idx}`}
                  x1={p1.x.toFixed(1)}
                  y1={p1.y.toFixed(1)}
                  x2={p2.x.toFixed(1)}
                  y2={p2.y.toFixed(1)}
                  stroke={p1.v.color}
                  strokeWidth={active ? 1.45 : 1.0}
                  strokeOpacity={active ? 0.85 : 0.55}
                />
              );
            })}
        </g>

        {/* 3. Finer Foreground Polygon Vertices with subtle upward lift */}
        <g>
          {LATTICE.vertices
            .filter((v) => v.layer === "fg")
            .map((v) => {
              const p = animatedVertices.get(v.id);
              if (!p) return null;
              const radius = v.r * (1 + p.liftFactor * 0.2);

              return (
                <g key={v.id} transform={`translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`}>
                  {p.liftFactor > 0.35 && (
                    <circle
                      cx={0}
                      cy={0}
                      r={(radius + 2.4).toFixed(2)}
                      fill="none"
                      stroke={v.color}
                      strokeWidth={0.85}
                      strokeOpacity={(p.liftFactor * 0.5).toFixed(2)}
                    />
                  )}
                  <circle cx={0} cy={0} r={radius.toFixed(2)} fill={v.color} fillOpacity={0.9} />
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
