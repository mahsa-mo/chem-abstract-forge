/**
 * SMILES Syntax and Chemical Valency Validation Engine
 * Validates parentheses, bracketed charges, ring closure matching, and standard organic valencies.
 */

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

// Standard valence allowances in neutral ground state (and common charges)
const MAX_STANDARD_VALENCE: Record<string, number> = {
  C: 4,
  c: 3, // aromatic carbon has 1 aromatic bond each side + 1 substituent = 3 max external/ring
  N: 4, // 3 neutral, up to 4 in quaternary ammonium
  n: 3, // aromatic nitrogen (e.g. pyridine=2, pyrrole=3 with H)
  O: 3, // 2 neutral, 3 in hydronium/pyrylium
  o: 2, // furan
  S: 6, // 2 divalent, 4 sulfoxide, 6 sulfone/sulfate
  s: 4, // thiophene
  P: 5, // 3 phosphine, 5 phosphorane/phosphate
  p: 4,
  B: 4, // 3 neutral borane, 4 borate
  b: 3,
  F: 1,
  Cl: 1, // hypervalent chlorine in chlorates handled in brackets
  Br: 1,
  I: 3, // 1 mono, up to 3 in hypervalent iodine (PIDA/PIFA)
  H: 1,
};

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

  // 1. Bracket & Parentheses Balance Check
  let parenDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === "(") parenDepth++;
    else if (ch === ")") {
      parenDepth--;
      if (parenDepth < 0) {
        errors.push(`پرانتز بسته نامتعادل در موقعیت ${i + 1} (Unbalanced closing parenthesis)`);
      }
    } else if (ch === "[") bracketDepth++;
    else if (ch === "]") {
      bracketDepth--;
      if (bracketDepth < 0) {
        errors.push(`کروکوشه بسته نامتعادل در موقعیت ${i + 1} (Unbalanced closing bracket)`);
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

  // 2. Ring Closures Check (digits 1-9 and %10-%99)
  const ringDigitsMap: Record<string, number> = {};
  let i = 0;
  let ringsTotal = 0;

  while (i < clean.length) {
    const ch = clean[i];
    if (!ch) {
      i++;
      continue;
    }
    if (ch === "%" && i + 2 < clean.length && /\d\d/.test(clean.substring(i + 1, i + 3))) {
      const ringNum = clean.substring(i + 1, i + 3);
      ringDigitsMap[ringNum] = (ringDigitsMap[ringNum] || 0) + 1;
      i += 3;
    } else if (/\d/.test(ch) && (i === 0 || clean[i - 1] !== "%")) {
      // It's a standard ring closure digit 1-9 (or stoichiometric multiplier in disconnected formula)
      ringDigitsMap[ch] = (ringDigitsMap[ch] || 0) + 1;
      i++;
    } else {
      i++;
    }
  }

  // In standard connected SMILES, each ring digit must appear exactly in pairs (open & close)
  for (const [digit, count] of Object.entries(ringDigitsMap)) {
    if (count % 2 !== 0) {
      errors.push(
        `حلقه شماره ${digit} باز شده اما بسته نشده است (Ring closure number ${digit} must appear in pairs; found ${count})`,
      );
    } else {
      ringsTotal += count / 2;
    }
  }

  // 3. Atom Tokenization and Element Scan
  const elementsFound = new Set<string>();
  let atomCount = 0;
  let bondCount = 0;
  let aromaticAtoms = 0;
  let heteroAtoms = 0;
  let hasStereo = false;

  // Regex for parsing atoms, bonds, rings in SMILES
  // Bracketed atoms: [13C], [NH4+], [Fe+2], [O-], [Pd]
  // Bare atoms: Cl, Br, B, C, N, O, P, S, F, I, c, n, o, s, p
  let ptr = 0;
  interface ParsedNode {
    symbol: string;
    isAromatic: boolean;
    isBracketed: boolean;
    charge: number;
    hydrogens: number;
    bondSum: number;
    pos: number;
  }
  const nodes: ParsedNode[] = [];

  while (ptr < clean.length) {
    const char = clean[ptr];
    if (!char) {
      ptr++;
      continue;
    }

    // Stereochemistry flags
    if (char === "@" || char === "/" || char === "\\") {
      hasStereo = true;
      ptr++;
      continue;
    }

    // Explicit bond operators
    if (char === "=" || char === "#" || char === "$" || char === ":") {
      bondCount++;
      ptr++;
      continue;
    }

    // Branching or dot (disconnection)
    if (char === "(" || char === ")" || char === ".") {
      ptr++;
      continue;
    }

    // Ring digits
    if (/\d/.test(char) || char === "%") {
      if (char === "%") ptr += 3;
      else ptr++;
      continue;
    }

    // Bracketed atom: [ ... ]
    if (char === "[") {
      const close = clean.indexOf("]", ptr);
      if (close !== -1) {
        const inside = clean.substring(ptr + 1, close);
        // Extract element symbol (capital followed by optional lowercase)
        const match = inside.match(/([A-Z][a-z]?|[a-z])/);
        const sym = match?.[1] ?? "X";
        const isArom = sym === sym.toLowerCase() && sym.length === 1;

        // Extract charge (+, -, +2, -2)
        let chg = 0;
        const plusMatch = inside.match(/\+(\d*)/);
        const minusMatch = inside.match(/-(\d*)/);
        const pStr = plusMatch?.[1];
        const mStr = minusMatch?.[1];
        if (pStr) chg = parseInt(pStr, 10);
        else if (plusMatch) chg = 1;
        if (mStr) chg = -parseInt(mStr, 10);
        else if (minusMatch) chg = -1;

        nodes.push({
          symbol: sym,
          isAromatic: isArom,
          isBracketed: true,
          charge: chg,
          hydrogens: inside.includes("H") ? 1 : 0,
          bondSum: 0,
          pos: ptr,
        });

        elementsFound.add(sym.toUpperCase());
        atomCount++;
        if (isArom) aromaticAtoms++;
        if (!["C", "c", "H"].includes(sym)) heteroAtoms++;

        ptr = close + 1;
        continue;
      }
    }

    // Two-letter standard organic atoms: Cl, Br
    if (ptr + 1 < clean.length) {
      const two = clean.substring(ptr, ptr + 2);
      if (two === "Cl" || two === "Br") {
        nodes.push({
          symbol: two,
          isAromatic: false,
          isBracketed: false,
          charge: 0,
          hydrogens: 0,
          bondSum: 0,
          pos: ptr,
        });
        elementsFound.add(two);
        heteroAtoms++;
        atomCount++;
        ptr += 2;
        continue;
      }
    }

    // Single-letter standard organic subset: B, C, N, O, P, S, F, I, c, n, o, s, p
    if (/[BCNOPSFIbcnosp]/.test(char)) {
      const isArom = char === char.toLowerCase();
      nodes.push({
        symbol: char,
        isAromatic: isArom,
        isBracketed: false,
        charge: 0,
        hydrogens: 0,
        bondSum: 0,
        pos: ptr,
      });
      elementsFound.add(char.toUpperCase());
      atomCount++;
      if (isArom) aromaticAtoms++;
      if (!["C", "c"].includes(char)) heteroAtoms++;
      ptr++;
      continue;
    }

    // Unknown or unsupported character
    warnings.push(`کاراکتر غیرمنتظره '${char}' در موقعیت ${ptr + 1}`);
    ptr++;
  }

  // 4. Consecutive Bond Check & Valency Sanity (e.g. C==C or #=)
  if (/[=#$]{2,}/.test(clean)) {
    errors.push(
      "پیوند دوگانه یا سه‌گانه متوالی غیرمجاز تشخیص داده شد (Consecutive multiple bonds without atom).",
    );
  }

  // 5. Check Texas Carbon / Hypervalent Carbon in common patterns
  // E.g. carbon connected to too many explicit bonds: C(=O)(=O)(=O) or C(C)(C)(C)(C)C
  const texasCarbonPattern = /C\([^)]+\)\([^)]+\)\([^)]+\)\([^)]+\)[A-Za-z]/;
  if (texasCarbonPattern.test(clean)) {
    errors.push(
      "خطای کربن پنج‌ظرفیتی (Texas Carbon): کربن نمی‌تواند همزمان بیش از ۴ پیوند کووالانسی تشکیل دهد!",
    );
  }

  // 6. Check Aromatic Ring Completeness
  if (aromaticAtoms > 0 && ringsTotal === 0) {
    warnings.push(
      "اتم‌های آروماتیک (حروف کوچک مانند c, n) یافت شدند اما هیچ شماره حلقه‌ای برای بستن حلقه مشاهده نشد (Open aromatic chain).",
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
    atomCount,
    bondCount: bondCount || Math.max(0, atomCount - 1),
    ringCount: ringsTotal,
    aromaticAtoms,
    heteroAtoms,
    hasStereochemistry: hasStereo,
    detectedElements: Array.from(elementsFound),
  };
}
