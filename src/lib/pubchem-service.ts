/**
 * PubChem PUG REST API Service & Chemical Resolver
 * Implements Google DeepMind Science Skill standards for PubChem querying.
 */

export interface PubChemCompound {
  cid: number;
  name: string;
  iupacName: string;
  molecularFormula: string;
  molecularWeight: number;
  canonicalSmiles: string;
  isomericSmiles?: string | undefined;
  inchikey?: string | undefined;
  xlogp?: number | undefined;
  tpsa?: number | undefined;
  hBondDonorCount?: number | undefined;
  hBondAcceptorCount?: number | undefined;
  rotatableBondCount?: number | undefined;
  complexity?: number | undefined;
  png2DUrl: string;
  sdf3DUrl: string;
  pubchemUrl: string;
}

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

// In-memory cache for fast repeated lookups
const pubchemCache = new Map<string, PubChemCompound>();

/**
 * Query PubChem compound by chemical name, common name, or CAS number.
 */
export async function queryPubChemByName(name: string): Promise<PubChemCompound | null> {
  const clean = name.trim();
  if (!clean) return null;

  const cacheKey = `name:${clean.toLowerCase()}`;
  if (pubchemCache.has(cacheKey)) {
    return pubchemCache.get(cacheKey)!;
  }

  try {
    const encoded = encodeURIComponent(clean);
    const url = `${PUBCHEM_BASE}/compound/name/${encoded}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,InChIKey,IUPACName,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const props = data?.PropertyTable?.Properties?.[0];
    if (!props || !props.CID) {
      return null;
    }

    const compound: PubChemCompound = {
      cid: props.CID,
      name: clean,
      iupacName: props.IUPACName || clean,
      molecularFormula: props.MolecularFormula || "—",
      molecularWeight: parseFloat(props.MolecularWeight) || 0,
      canonicalSmiles: props.CanonicalSMILES || "",
      isomericSmiles: props.IsomericSMILES,
      inchikey: props.InChIKey,
      xlogp: props.XLogP != null ? parseFloat(props.XLogP) : undefined,
      tpsa: props.TPSA != null ? parseFloat(props.TPSA) : undefined,
      hBondDonorCount: props.HBondDonorCount,
      hBondAcceptorCount: props.HBondAcceptorCount,
      rotatableBondCount: props.RotatableBondCount,
      complexity: props.Complexity,
      png2DUrl: `${PUBCHEM_BASE}/compound/cid/${props.CID}/PNG?image_size=300x300`,
      sdf3DUrl: `${PUBCHEM_BASE}/compound/cid/${props.CID}/SDF?record_type=3d`,
      pubchemUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${props.CID}`,
    };

    pubchemCache.set(cacheKey, compound);
    return compound;
  } catch (err) {
    console.warn(`[pubchem-service] Failed to query "${clean}":`, err);
    return null;
  }
}

/**
 * Query PubChem compound directly by SMILES string.
 */
export async function queryPubChemBySmiles(smiles: string): Promise<PubChemCompound | null> {
  const clean = smiles.trim();
  if (!clean) return null;

  const cacheKey = `smiles:${clean}`;
  if (pubchemCache.has(cacheKey)) {
    return pubchemCache.get(cacheKey)!;
  }

  try {
    const encoded = encodeURIComponent(clean);
    const url = `${PUBCHEM_BASE}/compound/smiles/${encoded}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,InChIKey,IUPACName,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const props = data?.PropertyTable?.Properties?.[0];
    if (!props || !props.CID) {
      return null;
    }

    const compound: PubChemCompound = {
      cid: props.CID,
      name: props.IUPACName || clean,
      iupacName: props.IUPACName || clean,
      molecularFormula: props.MolecularFormula || "—",
      molecularWeight: parseFloat(props.MolecularWeight) || 0,
      canonicalSmiles: props.CanonicalSMILES || clean,
      isomericSmiles: props.IsomericSMILES,
      inchikey: props.InChIKey,
      xlogp: props.XLogP != null ? parseFloat(props.XLogP) : undefined,
      tpsa: props.TPSA != null ? parseFloat(props.TPSA) : undefined,
      hBondDonorCount: props.HBondDonorCount,
      hBondAcceptorCount: props.HBondAcceptorCount,
      rotatableBondCount: props.RotatableBondCount,
      complexity: props.Complexity,
      png2DUrl: `${PUBCHEM_BASE}/compound/cid/${props.CID}/PNG?image_size=300x300`,
      sdf3DUrl: `${PUBCHEM_BASE}/compound/cid/${props.CID}/SDF?record_type=3d`,
      pubchemUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${props.CID}`,
    };

    pubchemCache.set(cacheKey, compound);
    return compound;
  } catch (err) {
    console.warn(`[pubchem-service] Failed to query SMILES "${clean}":`, err);
    return null;
  }
}

/**
 * Universal lookup: checks by name, CAS, formula, or SMILES.
 */
export async function lookupPubChemUniversal(query: string): Promise<PubChemCompound | null> {
  const clean = query.trim();
  if (!clean) return null;

  // If query contains characters characteristic of SMILES (e.g. =, #, (, ), numbers without spaces)
  const isLikelySmiles =
    !clean.includes(" ") &&
    (clean.includes("=") || clean.includes("#") || clean.includes("(") || /[cno][0-9]/.test(clean));

  if (isLikelySmiles) {
    const bySmiles = await queryPubChemBySmiles(clean);
    if (bySmiles) return bySmiles;
  }

  // Otherwise or fallback: search by name
  return queryPubChemByName(clean);
}
