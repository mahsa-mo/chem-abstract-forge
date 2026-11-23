/**
 * Strict SMILES parsing shared by analysis, layout and rendering.
 *
 * openchemlib is lenient: it silently accepts an unclosed branch ("C(C") and
 * treats "?" as an unknown atom. Both are rejected here before parsing.
 */
import { Molecule } from "openchemlib";

export class SmilesSyntaxError extends Error {}

function cleanMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/^Class\$\w+:\s*/, "").trim();
}

export function parseSmiles(input: string): Molecule {
  const s = input.trim();
  if (!s) throw new SmilesSyntaxError("Empty SMILES string");
  if (s.includes("?")) {
    throw new SmilesSyntaxError('"?" is not a valid SMILES atom (use * for a wildcard)');
  }

  let depth = 0;
  let inBracket = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    if (inBracket) {
      if (ch === "[") throw new SmilesSyntaxError(`Nested "[" at position ${i + 1}`);
      if (ch === "]") inBracket = false;
      continue;
    }
    if (ch === "[") inBracket = true;
    else if (ch === "]") throw new SmilesSyntaxError(`Unmatched "]" at position ${i + 1}`);
    else if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth < 0) throw new SmilesSyntaxError(`Unmatched ")" at position ${i + 1}`);
    }
  }
  if (inBracket) throw new SmilesSyntaxError('Unclosed "["');
  if (depth > 0) throw new SmilesSyntaxError(`${depth} unclosed "(" branch(es)`);

  let mol: Molecule;
  try {
    mol = Molecule.fromSmiles(s);
  } catch (err) {
    throw new SmilesSyntaxError(cleanMessage(err));
  }
  if (mol.getAllAtoms() === 0) throw new SmilesSyntaxError("SMILES contains no atoms");
  return mol;
}
