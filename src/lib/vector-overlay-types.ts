/**
 * Vector Mechanism & Chemical Annotation Data Structures (Phase 3)
 */

export type ArrowType = "forward" | "equilibrium" | "resonance" | "retrosynthesis";
export type BarbType = "double" | "single"; // double = 2-electron transfer, single = fish-hook 1e- radical
export type OrbitalMarkerType =
  "lone-pair" | "radical-dot" | "charge-plus" | "charge-minus" | "homo" | "lumo";

export interface Point {
  x: number;
  y: number;
}

export interface BaseVectorItem {
  id: string;
  type: string;
  color: string;
  strokeWidth: number;
  locked?: boolean;
}

export interface CurvedMechanismArrowItem extends BaseVectorItem {
  type: "curved-arrow";
  start: Point;
  control: Point;
  end: Point;
  barbType: BarbType; // double (pair) vs single (radical fish-hook)
}

export interface ReactionArrowItem extends BaseVectorItem {
  type: "reaction-arrow";
  start: Point;
  end: Point;
  arrowType: ArrowType;
  topText: string; // e.g. "Pd(PPh3)4 (5 mol%)"
  bottomText: string; // e.g. "DMF/H2O, 80 °C, 6 h"
  fontSize: number;
}

export interface CalloutBadgeItem extends BaseVectorItem {
  type: "badge";
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  variant: "yield" | "ee" | "energy" | "custom";
  bgColor: string;
  textColor: string;
}

export interface OrbitalMarkerItem extends BaseVectorItem {
  type: "orbital-marker";
  x: number;
  y: number;
  markerType: OrbitalMarkerType;
  size: number;
}

export interface TextAnnotationItem extends BaseVectorItem {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
}

export type VectorOverlayItem =
  | CurvedMechanismArrowItem
  | ReactionArrowItem
  | CalloutBadgeItem
  | OrbitalMarkerItem
  | TextAnnotationItem;

export interface OverlayState {
  items: VectorOverlayItem[];
  selectedId: string | null;
}

/**
 * Generate standalone SVG markup for all vector overlay items
 */
export function renderOverlayToSvg(
  items: VectorOverlayItem[],
  width: number,
  height: number,
): string {
  const elementsSvg: string[] = [];

  for (const item of items) {
    if (item.type === "curved-arrow") {
      const { start, control, end, barbType, color, strokeWidth } = item;
      // Calculate tangent angle at arrow end point for head
      const dx = end.x - control.x;
      const dy = end.y - control.y;
      const angle = Math.atan2(dy, dx);
      const headLen = strokeWidth * 3.8;

      // Draw arrow head barb(s)
      let headPath = "";
      if (barbType === "double") {
        const x1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
        const y1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
        const x2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
        const y2 = end.y - headLen * Math.sin(angle + Math.PI / 6);
        headPath = `M ${x1} ${y1} L ${end.x} ${end.y} L ${x2} ${y2}`;
      } else {
        // Single barb (fish-hook)
        const x1 = end.x - headLen * Math.cos(angle - Math.PI / 5);
        const y1 = end.y - headLen * Math.sin(angle - Math.PI / 5);
        headPath = `M ${x1} ${y1} L ${end.x} ${end.y}`;
      }

      elementsSvg.push(`
        <g id="${item.id}">
          <path d="M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />
          <path d="${headPath}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      `);
    } else if (item.type === "reaction-arrow") {
      const { start, end, arrowType, topText, bottomText, color, strokeWidth, fontSize } = item;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      let arrowLines = "";
      const headLen = strokeWidth * 3.2;

      if (arrowType === "forward") {
        const x1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
        const y1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
        const x2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
        const y2 = end.y - headLen * Math.sin(angle + Math.PI / 6);
        arrowLines = `
          <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />
          <path d="M ${x1} ${y1} L ${end.x} ${end.y} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />
        `;
      } else if (arrowType === "equilibrium") {
        const offset = 4;
        arrowLines = `
          <line x1="${start.x}" y1="${start.y - offset}" x2="${end.x}" y2="${end.y - offset}" stroke="${color}" stroke-width="${strokeWidth}" />
          <line x1="${start.x}" y1="${start.y + offset}" x2="${end.x}" y2="${end.y + offset}" stroke="${color}" stroke-width="${strokeWidth}" />
          <path d="M ${end.x - headLen} ${end.y - offset - 4} L ${end.x} ${end.y - offset}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
          <path d="M ${start.x + headLen} ${start.y + offset + 4} L ${start.x} ${start.y + offset}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
        `;
      } else if (arrowType === "resonance") {
        arrowLines = `
          <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="${strokeWidth}" />
          <path d="M ${end.x - headLen} ${end.y - 5} L ${end.x} ${end.y} L ${end.x - headLen} ${end.y + 5}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
          <path d="M ${start.x + headLen} ${start.y - 5} L ${start.x} ${start.y} L ${start.x + headLen} ${start.y + 5}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
        `;
      } else if (arrowType === "retrosynthesis") {
        // Double open line
        arrowLines = `
          <line x1="${start.x}" y1="${start.y - 3}" x2="${end.x - headLen}" y2="${end.y - 3}" stroke="${color}" stroke-width="${strokeWidth}" />
          <line x1="${start.x}" y1="${start.y + 3}" x2="${end.x - headLen}" y2="${end.y + 3}" stroke="${color}" stroke-width="${strokeWidth}" />
          <path d="M ${end.x - headLen} ${end.y - 8} L ${end.x} ${end.y} L ${end.x - headLen} ${end.y + 8}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
        `;
      }

      elementsSvg.push(`
        <g id="${item.id}">
          ${arrowLines}
          ${
            topText
              ? `<text x="${midX}" y="${midY - 8}" fill="${color}" font-size="${fontSize}" font-family="sans-serif" font-weight="600" text-anchor="middle">${escapeXml(topText)}</text>`
              : ""
          }
          ${
            bottomText
              ? `<text x="${midX}" y="${midY + fontSize + 6}" fill="${color}" font-size="${fontSize * 0.9}" font-family="sans-serif" text-anchor="middle">${escapeXml(bottomText)}</text>`
              : ""
          }
        </g>
      `);
    } else if (item.type === "badge") {
      const { x, y, title, subtitle, bgColor, textColor } = item;
      const padX = 12;
      const padY = 6;
      const textLen = Math.max(title.length, (subtitle || "").length) * 8 + padX * 2;
      const height = subtitle ? 36 : 24;

      elementsSvg.push(`
        <g id="${item.id}" transform="translate(${x}, ${y})">
          <rect x="0" y="0" width="${textLen}" height="${height}" rx="6" fill="${bgColor}" stroke="${textColor}" stroke-width="1.2" opacity="0.95" />
          <text x="${textLen / 2}" y="${subtitle ? 15 : 16}" fill="${textColor}" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">${escapeXml(title)}</text>
          ${
            subtitle
              ? `<text x="${textLen / 2}" y="29" fill="${textColor}" font-size="10" font-family="sans-serif" text-anchor="middle" opacity="0.85">${escapeXml(subtitle)}</text>`
              : ""
          }
        </g>
      `);
    } else if (item.type === "orbital-marker") {
      const { x, y, markerType, size, color } = item;
      let shape = "";
      if (markerType === "lone-pair") {
        shape = `
          <circle cx="${x - size * 0.6}" cy="${y}" r="${size * 0.35}" fill="${color}" />
          <circle cx="${x + size * 0.6}" cy="${y}" r="${size * 0.35}" fill="${color}" />
        `;
      } else if (markerType === "radical-dot") {
        shape = `<circle cx="${x}" cy="${y}" r="${size * 0.4}" fill="${color}" />`;
      } else if (markerType === "charge-plus") {
        shape = `
          <circle cx="${x}" cy="${y}" r="${size * 0.7}" fill="none" stroke="${color}" stroke-width="1.5" />
          <line x1="${x - size * 0.4}" y1="${y}" x2="${x + size * 0.4}" y2="${y}" stroke="${color}" stroke-width="1.5" />
          <line x1="${x}" y1="${y - size * 0.4}" x2="${x}" y2="${y + size * 0.4}" stroke="${color}" stroke-width="1.5" />
        `;
      } else if (markerType === "charge-minus") {
        shape = `
          <circle cx="${x}" cy="${y}" r="${size * 0.7}" fill="none" stroke="${color}" stroke-width="1.5" />
          <line x1="${x - size * 0.4}" y1="${y}" x2="${x + size * 0.4}" y2="${y}" stroke="${color}" stroke-width="1.5" />
        `;
      } else if (markerType === "homo") {
        shape = `
          <rect x="${x - size}" y="${y - size * 0.6}" width="${size * 2}" height="${size * 1.2}" rx="3" fill="#2563EB" opacity="0.85" />
          <text x="${x}" y="${y + 4}" fill="#ffffff" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">HOMO</text>
        `;
      } else if (markerType === "lumo") {
        shape = `
          <rect x="${x - size}" y="${y - size * 0.6}" width="${size * 2}" height="${size * 1.2}" rx="3" fill="#DC2626" opacity="0.85" />
          <text x="${x}" y="${y + 4}" fill="#ffffff" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">LUMO</text>
        `;
      }

      elementsSvg.push(`<g id="${item.id}">${shape}</g>`);
    } else if (item.type === "text") {
      const { x, y, text, fontSize, color, fontWeight, fontFamily } = item;
      elementsSvg.push(`
        <text id="${item.id}" x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}">${escapeXml(text)}</text>
      `);
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${elementsSvg.join("\n")}
    </svg>
  `;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
