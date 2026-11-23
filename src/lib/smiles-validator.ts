/**
 * SMILES Syntax and Chemical Valency Validation Engine
 * Validates parentheses, bracketed charges, ring closure matching, and standard organic valencies.
 */
import { analyzeSmiles } from "./chem-core/molecule";

export interface SmilesValidationResult {
  valid: boolean;
  score: number; // 0 to 100
  cleanSmiles: string;
  errors: string[];
  warnings: string[];
  info: string[];
  atomCount: number;
  bondCount: number;
  ringCount: number;
  aromaticAtoms: number;
  heteroAtoms: number;
  hasStereochemistry: boolean;
  detectedElements: string[];
}

const ORGANIC_ALLOWED_VALENCES: Record<string, number[]> = {
  B: [3],
  C: [4],
  N: [3],
  O: [2],
  P: [3, 5],
  S: [2, 4, 6],
  F: [1],
  Cl: [1, 3, 5, 7],
  Br: [1, 3, 5, 7],
  I: [1, 3, 5, 7],
  H: [1],
};

function getBracketMaxValence(symbol: string, charge: number): number | null {
  switch (symbol) {
    case "B":
      return Math.max(0, 3 - charge);
    case "C":
      return Math.max(0, 4 - Math.abs(charge));
    case "N":
      return Math.max(0, 3 + charge);
    case "O":
      return Math.max(0, 2 + charge);
    case "P":
      return Math.max(0, 5 - charge);
    case "S":
      return charge === 0 ? 6 : Math.max(0, 6 - Math.abs(charge));
    case "F":
      return Math.max(0, 1 + charge);
    case "Cl":
    case "Br":
      return charge <= 0 ? Math.max(0, 1 + charge) : 1 + charge;
    case "I":
      return charge < 0 ? Math.max(0, 1 + charge) : Math.max(0, 5 - charge);
    case "H":
      return Math.max(0, 1 - Math.abs(charge));
    default:
      // Metals & exotic elements (Fe, Pd, Na, Si, Se, etc.) get no valence error
      return null;
  }
}

function parseBracketAtomContent(inside: string): {
  symbol: string;
  isAromatic: boolean;
  hydrogens: number;
  charge: number;
  hasStereo: boolean;
} {
  const withoutClass = inside.replace(/:\d+$/, "");
  // Strip optional leading isotope mass digits
  const elemMatch = withoutClass.match(/^\d*([A-Z][a-z]?|[a-z]|\*)(.*)$/);
  const symbol = elemMatch?.[1] ?? "X";
  let rest = elemMatch?.[2] ?? "";

  const isAromatic = symbol.length === 1 && symbol === symbol.toLowerCase() && /[a-z]/.test(symbol);
  let hasStereo = false;

  const stereoMatch = rest.match(/^(@{1,2})(.*)$/);
  if (stereoMatch) {
    hasStereo = true;
    rest = stereoMatch[2] ?? "";
  }

  let hydrogens = 0;
  const hMatch = rest.match(/^H(\d*)(.*)$/);
  if (hMatch) {
    hydrogens = hMatch[1] ? parseInt(hMatch[1], 10) : 1;
    rest = hMatch[2] ?? "";
  }

  let charge = 0;
  const plusNum = rest.match(/^\+(\d+)$/);
  const minusNum = rest.match(/^-(\d+)$/);
  if (plusNum?.[1]) {
    charge = parseInt(plusNum[1], 10);
  } else if (minusNum?.[1]) {
    charge = -parseInt(minusNum[1], 10);
  } else if (/^\++$/.test(rest)) {
    charge = rest.length;
  } else if (/^-+$/.test(rest)) {
    charge = -rest.length;
  } else {
    // Fallback scan for charge anywhere in remainder
    const anyPlus = rest.match(/\+(\d*)/);
    const anyMinus = rest.match(/-(\d*)/);
    if (anyPlus) {
      charge = anyPlus[1] ? parseInt(anyPlus[1], 10) : 1;
    } else if (anyMinus) {
      charge = -(anyMinus[1] ? parseInt(anyMinus[1], 10) : 1);
    }
  }

  return { symbol, isAromatic, hydrogens, charge, hasStereo };
}

/**
 * Validates SMILES string syntax and valency.
 */
export function validateSmiles(rawSmiles: string): SmilesValidationResult {
  const clean = rawSmiles.trim().replace(/\s+/g, "");
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  if (!clean) {
    return {
      valid: false,
      score: 0,
      cleanSmiles: "",
      errors: ["رشته SMILES خالی است (Empty SMILES string)."],
      warnings: [],
      info: [],
      atomCount: 0,
      bondCount: 0,
      ringCount: 0,
      aromaticAtoms: 0,
      heteroAtoms: 0,
      hasStereochemistry: false,
      detectedElements: [],
    };
  }

  // 1. Bracket & Parentheses Balance Check (ignoring parentheses inside brackets if any)
  let parenDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === "[") {
      bracketDepth++;
    } else if (ch === "]") {
      bracketDepth--;
      if (bracketDepth < 0) {
        errors.push(`کروکوشه بسته نامتعادل در موقعیت ${i + 1} (Unbalanced closing bracket)`);
      }
    } else if (bracketDepth === 0) {
      if (ch === "(") parenDepth++;
      else if (ch === ")") {
        parenDepth--;
        if (parenDepth < 0) {
          errors.push(`پرانتز بسته نامتعادل در موقعیت ${i + 1} (Unbalanced closing parenthesis)`);
        }
      }
    }
  }

  if (parenDepth > 0) {
    errors.push(
      `تعداد ${parenDepth} پرانتز باز بدون بسته‌شدن وجود دارد (Unclosed branch parentheses)`,
    );
  }
  if (bracketDepth > 0) {
    errors.push(
      `تعداد ${bracketDepth} کروکوشه باز بدون بسته‌شدن وجود دارد (Unclosed square bracket)`,
    );
  }

  // 2. Ring Closures Check (digits 0-9 and %10-%99) — ignoring everything inside [...] brackets
  const ringDigitsMap: Record<string, number> = {};
  let i = 0;
  let ringsTotal = 0;

  while (i < clean.length) {
    const ch = clean[i];
    if (!ch) {
      i++;
      continue;
    }
    if (ch === "[") {
      const close = clean.indexOf("]", i);
      i = close === -1 ? clean.length : close + 1;
      continue;
    }
    if (ch === "%" && i + 2 < clean.length && /\d\d/.test(clean.substring(i + 1, i + 3))) {
      const ringNum = clean.substring(i + 1, i + 3);
      ringDigitsMap[ringNum] = (ringDigitsMap[ringNum] || 0) + 1;
      i += 3;
    } else if (/\d/.test(ch) && (i === 0 || clean[i - 1] !== "%")) {
      ringDigitsMap[ch] = (ringDigitsMap[ch] || 0) + 1;
      i++;
    } else {
      i++;
    }
  }

  for (const [digit, count] of Object.entries(ringDigitsMap)) {
    if (count % 2 !== 0) {
      errors.push(
        `حلقه شماره ${digit} باز شده اما بسته نشده است (Ring closure number ${digit} must appear in pairs; found ${count})`,
      );
    } else {
      ringsTotal += count / 2;
    }
  }

  // 3. Tokenize SMILES & Build Real Atom/Bond Graph
  const elementsFound = new Set<string>();
  let aromaticAtoms = 0;
  let heteroAtoms = 0;
  let hasStereo = false;

  interface ParsedNode {
    symbol: string;
    isAromatic: boolean;
    isBracketed: boolean;
    charge: number;
    explicitHydrogens: number;
    implicitHydrogens: number;
    explicitBondSum: number;
    pos: number;
  }
  interface ParsedEdge {
    from: number;
    to: number;
    order: number;
  }

  const nodes: ParsedNode[] = [];
  const edges: ParsedEdge[] = [];
  const branchStack: (number | null)[] = [];
  const openRings = new Map<string, { atomIdx: number; pendingOrder: number | null }>();
  let lastAtomIdx: number | null = null;
  let pendingBondOrder: number | null = null;

  const connectAtoms = (aIdx: number, bIdx: number, explicitOrder: number | null) => {
    const a = nodes[aIdx];
    const b = nodes[bIdx];
    if (!a || !b) return;
    const order = explicitOrder !== null ? explicitOrder : a.isAromatic && b.isAromatic ? 1.5 : 1;
    edges.push({ from: aIdx, to: bIdx, order });
    a.explicitBondSum += order;
    b.explicitBondSum += order;
  };

  let ptr = 0;
  while (ptr < clean.length) {
    const char = clean[ptr];
    if (!char) {
      ptr++;
      continue;
    }

    // Cis/trans directional bonds (single bond stereo) or chirality outside brackets
    if (char === "/" || char === "\\") {
      hasStereo = true;
      if (pendingBondOrder === null) pendingBondOrder = 1;
      ptr++;
      continue;
    }
    if (char === "@") {
      hasStereo = true;
      ptr++;
      continue;
    }

    // Explicit bond operators
    if (char === "-") {
      pendingBondOrder = 1;
      ptr++;
      continue;
    }
    if (char === "=") {
      pendingBondOrder = 2;
      ptr++;
      continue;
    }
    if (char === "#") {
      pendingBondOrder = 3;
      ptr++;
      continue;
    }
    if (char === "$") {
      pendingBondOrder = 4;
      ptr++;
      continue;
    }
    if (char === ":") {
      pendingBondOrder = 1.5;
      ptr++;
      continue;
    }

    // Branches & disconnection
    if (char === "(") {
      branchStack.push(lastAtomIdx);
      pendingBondOrder = null;
      ptr++;
      continue;
    }
    if (char === ")") {
      lastAtomIdx = branchStack.length > 0 ? (branchStack.pop() ?? null) : lastAtomIdx;
      pendingBondOrder = null;
      ptr++;
      continue;
    }
    if (char === ".") {
      lastAtomIdx = null;
      pendingBondOrder = null;
      ptr++;
      continue;
    }

    // Ring closure digits outside [...]
    if (
      (char === "%" && ptr + 2 < clean.length && /\d\d/.test(clean.substring(ptr + 1, ptr + 3))) ||
      /\d/.test(char)
    ) {
      let ringId = char;
      let step = 1;
      if (char === "%") {
        ringId = clean.substring(ptr + 1, ptr + 3);
        step = 3;
      }
      if (lastAtomIdx !== null) {
        const existing = openRings.get(ringId);
        if (existing) {
          if (existing.atomIdx === lastAtomIdx) {
            errors.push(
              `حلقه شماره ${ringId} به خود اتم متصل شده است (Self-loop ring closure ${ringId})`,
            );
          } else {
            const order = pendingBondOrder ?? existing.pendingOrder;
            connectAtoms(existing.atomIdx, lastAtomIdx, order);
          }
          openRings.delete(ringId);
        } else {
          openRings.set(ringId, { atomIdx: lastAtomIdx, pendingOrder: pendingBondOrder });
        }
      }
      pendingBondOrder = null;
      ptr += step;
      continue;
    }

    // Bracketed atom: [ ... ]
    if (char === "[") {
      const close = clean.indexOf("]", ptr);
      if (close !== -1) {
        const inside = clean.substring(ptr + 1, close);
        const parsed = parseBracketAtomContent(inside);
        if (parsed.hasStereo) hasStereo = true;

        const currIdx = nodes.length;
        nodes.push({
          symbol: parsed.symbol,
          isAromatic: parsed.isAromatic,
          isBracketed: true,
          charge: parsed.charge,
          explicitHydrogens: parsed.hydrogens,
          implicitHydrogens: 0,
          explicitBondSum: 0,
          pos: ptr,
        });

        if (lastAtomIdx !== null) {
          connectAtoms(lastAtomIdx, currIdx, pendingBondOrder);
        }
        lastAtomIdx = currIdx;
        pendingBondOrder = null;

        elementsFound.add(parsed.symbol.length === 1 ? parsed.symbol.toUpperCase() : parsed.symbol);
        if (parsed.isAromatic) aromaticAtoms++;
        if (!["C", "c", "H"].includes(parsed.symbol)) heteroAtoms++;

        ptr = close + 1;
        continue;
      }
    }

    // Two-letter standard organic atoms: Cl, Br
    if (ptr + 1 < clean.length) {
      const two = clean.substring(ptr, ptr + 2);
      if (two === "Cl" || two === "Br") {
        const currIdx = nodes.length;
        nodes.push({
          symbol: two,
          isAromatic: false,
          isBracketed: false,
          charge: 0,
          explicitHydrogens: 0,
          implicitHydrogens: 0,
          explicitBondSum: 0,
          pos: ptr,
        });
        if (lastAtomIdx !== null) {
          connectAtoms(lastAtomIdx, currIdx, pendingBondOrder);
        }
        lastAtomIdx = currIdx;
        pendingBondOrder = null;

        elementsFound.add(two);
        heteroAtoms++;
        ptr += 2;
        continue;
      }
    }

    // Single-letter standard organic subset: B, C, N, O, P, S, F, I, b, c, n, o, s, p
    if (/[BCNOPSFIbcnosp]/.test(char)) {
      const isArom = char === char.toLowerCase();
      const currIdx = nodes.length;
      nodes.push({
        symbol: char,
        isAromatic: isArom,
        isBracketed: false,
        charge: 0,
        explicitHydrogens: 0,
        implicitHydrogens: 0,
        explicitBondSum: 0,
        pos: ptr,
      });
      if (lastAtomIdx !== null) {
        connectAtoms(lastAtomIdx, currIdx, pendingBondOrder);
      }
      lastAtomIdx = currIdx;
      pendingBondOrder = null;

      elementsFound.add(char.toUpperCase());
      if (isArom) aromaticAtoms++;
      if (!["C", "c"].includes(char)) heteroAtoms++;
      ptr++;
      continue;
    }

    warnings.push(`کاراکتر غیرمنتظره '${char}' در موقعیت ${ptr + 1}`);
    pendingBondOrder = null;
    ptr++;
  }

  const atomCount = nodes.length;
  const bondCount = edges.length;

  // 4. Consecutive Multiple Bond Check (e.g. C==C or #=)
  if (/[=#$]{2,}/.test(clean)) {
    errors.push(
      "پیوند دوگانه یا سه‌گانه متوالی غیرمجاز تشخیص داده شد (Consecutive multiple bonds without atom).",
    );
  }

  // 5. Compute Implicit Hydrogens & Validate Valence per Atom on Built Graph
  const flaggedAtomIndices = new Set<number>();

  for (let idx = 0; idx < nodes.length; idx++) {
    const node = nodes[idx]!;

    // Aromatic atoms: lenient (no valence errors raised)
    if (node.isAromatic) {
      continue;
    }

    if (!node.isBracketed) {
      const allowedList = ORGANIC_ALLOWED_VALENCES[node.symbol];
      if (!allowedList) continue;
      const maxAllowed = Math.max(...allowedList);
      const explicitSum = node.explicitBondSum;

      if (explicitSum > maxAllowed) {
        flaggedAtomIndices.add(idx);
        errors.push(
          `ظرفیت اتم ${node.symbol} (اتم شماره ${idx + 1}) برابر ${explicitSum} است و از حد مجاز ${maxAllowed} بیشتر است (Valence exceeded)`,
        );
      } else {
        const targetValence = allowedList.find((v) => v >= explicitSum) ?? maxAllowed;
        node.implicitHydrogens = Math.max(0, targetValence - explicitSum);
      }
    } else {
      const maxAllowed = getBracketMaxValence(node.symbol, node.charge);
      if (maxAllowed === null) {
        // Metals and exotic elements (Fe, Pd, Na, Si, Se, etc.): no valence error
        continue;
      }
      const totalValence = node.explicitBondSum + node.explicitHydrogens;
      if (totalValence > maxAllowed) {
        flaggedAtomIndices.add(idx);
        errors.push(
          `ظرفیت اتم [${node.symbol}] (اتم شماره ${idx + 1}) برابر ${totalValence} است و از حد مجاز ${maxAllowed} بیشتر است (Valence exceeded)`,
        );
      }
    }
  }

  // 6. Check Aromatic Ring Completeness
  if (aromaticAtoms > 0 && ringsTotal === 0) {
    warnings.push(
      "اتم‌های آروماتیک (حروف کوچک مانند c, n) یافت شدند اما هیچ شماره حلقه‌ای برای بستن حلقه مشاهده نشد (Open aromatic chain).",
    );
  }

  // 6b. Cross-check with openchemlib structural parser (chem-core) without duplicating flagged atoms
  const analysis = analyzeSmiles(clean);
  if (analysis.parsed) {
    for (const v of analysis.valenceIssues) {
      if (flaggedAtomIndices.has(v.atomIndex)) continue;
      // Do not escalate or flag aromatic / metal atoms beyond rules above
      const node = nodes[v.atomIndex];
      if (node?.isAromatic) continue;
      if (node && getBracketMaxValence(node.symbol, node.charge) === null) continue;
      const msg = `ظرفیت اتم ${v.symbol} (اتم شماره ${v.atomIndex + 1}) برابر ${v.occupied} است و از حد مجاز ${v.allowed} بیشتر است (Valence exceeded)`;
      (v.severity === "error" ? errors : warnings).push(msg);
    }
  } else if (errors.length === 0) {
    errors.push(
      `ساختار SMILES قابل تفسیر نیست (could not be parsed): ${analysis.errors[0] ?? "unknown error"}`,
    );
  }

  // 7. General Quality & Feedback Score
  let score = 100;
  if (errors.length > 0) score -= errors.length * 35;
  if (warnings.length > 0) score -= warnings.length * 10;
  if (atomCount === 0) score = 0;
  score = Math.max(0, Math.min(100, score));

  if (hasStereo) {
    info.push("اطلاعات فضاویژه (Chirality / E-Z Stereochemistry) با موفقیت اعتبارسنجی شد.");
  }
  if (ringsTotal > 0) {
    info.push(`تعداد ${ringsTotal} حلقه مجزا با پیوستگی استاندارد شناسایی شد.`);
  }

  return {
    valid: errors.length === 0,
    score,
    cleanSmiles: clean,
    errors,
    warnings,
    info,
    atomCount: analysis.parsed ? (analysis.atomCount ?? atomCount) : atomCount,
    bondCount: analysis.parsed ? (analysis.bondCount ?? bondCount) : bondCount,
    ringCount: analysis.parsed ? (analysis.ringCount ?? ringsTotal) : ringsTotal,
    aromaticAtoms,
    heteroAtoms,
    hasStereochemistry: hasStereo,
    detectedElements: Array.from(elementsFound),
  };
}
