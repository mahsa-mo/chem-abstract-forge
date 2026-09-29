import { supabase } from "@/integrations/supabase/client";

export type RecentReaction = {
  id: string;
  title: string;
  sourceText: string;
  imageUrl: string;
  createdAt: string;
  regenCount?: number;
  tags?: string[];
  yieldRate?: string;
  catalyst?: string;
  isSample?: boolean;
};

const STORAGE_KEY = "chemabstract_reaction_history_v2";

/**
 * Builds an authentic publication-grade SVG graphical abstract in 16:9 ratio.
 */
function createSampleSvg(opts: {
  title: string;
  equation: string;
  conditions: string;
  catalyst: string;
  yieldRate: string;
  accentColor: string;
  schemeType: string;
}): string {
  const { title, equation, conditions, catalyst, yieldRate, accentColor, schemeType } = opts;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="675" fill="url(#bgGrad)" />

  <!-- Subtle Chemical Grid Pattern -->
  <g stroke="#334155" stroke-width="0.75" stroke-opacity="0.25">
    <path d="M 0 75 L 1200 75 M 0 150 L 1200 150 M 0 225 L 1200 225 M 0 300 L 1200 300 M 0 375 L 1200 375 M 0 450 L 1200 450 M 0 525 L 1200 525 M 0 600 L 1200 600" />
    <path d="M 150 0 L 150 675 M 300 0 L 300 675 M 450 0 L 450 675 M 600 0 L 600 675 M 750 0 L 750 675 M 900 0 L 900 675 M 1050 0 L 1050 675" />
  </g>

  <!-- Outer Publication Border -->
  <rect x="24" y="24" width="1152" height="627" rx="16" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.4" />

  <!-- Header Header Ribbon -->
  <rect x="24" y="24" width="1152" height="68" rx="16" fill="#1e293b" fill-opacity="0.6" />
  <text x="60" y="66" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#f8fafc" letter-spacing="0.5">
    ${title.toUpperCase()}
  </text>
  <rect x="960" y="44" width="180" height="28" rx="6" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-opacity="0.5" />
  <text x="1050" y="63" font-family="monospace" font-size="12" font-weight="600" fill="${accentColor}" text-anchor="middle">
    ${schemeType}
  </text>

  <!-- Reactants Card (Left) -->
  <g transform="translate(60, 130)">
    <rect width="380" height="420" rx="12" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <text x="24" y="40" font-family="monospace" font-size="14" font-weight="600" fill="#94a3b8" letter-spacing="1">PRECURSORS / SUBSTRATES</text>
    
    <!-- Skeletal Molecular Representation -->
    <g transform="translate(190, 200)" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <!-- Benzene Ring A -->
      <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" stroke="#38bdf8" stroke-width="3.5" fill="#38bdf8" fill-opacity="0.08" />
      <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8,6" />
      <!-- Substituents -->
      <line x1="-52" y1="-30" x2="-95" y2="-55" />
      <text x="-125" y="-50" font-family="monospace" font-size="18" font-weight="700" fill="#f43f5e" stroke="none">Br</text>
      
      <line x1="52" y1="30" x2="95" y2="55" />
      <text x="102" y="60" font-family="monospace" font-size="16" font-weight="700" fill="#fbbf24" stroke="none">OMe</text>
    </g>

    <text x="190" y="360" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0" text-anchor="middle">
      1.0 equiv. Substrate
    </text>
  </g>

  <!-- Central Reaction Mechanism Vector (Middle) -->
  <g transform="translate(470, 240)">
    <!-- Conditions Banner -->
    <rect x="0" y="-80" width="260" height="90" rx="8" fill="#0f172a" fill-opacity="0.9" stroke="#475569" stroke-width="1" />
    <text x="130" y="-55" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="${accentColor}" text-anchor="middle">
      [ ${catalyst} ]
    </text>
    <text x="130" y="-30" font-family="monospace" font-size="12" fill="#94a3b8" text-anchor="middle">
      ${conditions}
    </text>

    <!-- Reaction Arrow -->
    <path d="M 15 50 L 220 50 M 195 32 L 225 50 L 195 68" stroke="${accentColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    
    <!-- Catalyst Molecular Sphere -->
    <circle cx="120" cy="50" r="14" fill="#0f172a" stroke="${accentColor}" stroke-width="2" />
    <circle cx="120" cy="50" r="7" fill="${accentColor}" />
    
    <text x="130" y="100" font-family="monospace" font-size="13" font-weight="600" fill="#38bdf8" text-anchor="middle">
      ΔG‡ = -18.4 kcal/mol
    </text>
  </g>

  <!-- Product Structure Card (Right) -->
  <g transform="translate(760, 130)">
    <rect width="380" height="420" rx="12" fill="url(#cardGrad)" stroke="${accentColor}" stroke-width="2" />
    <text x="24" y="40" font-family="monospace" font-size="14" font-weight="600" fill="${accentColor}" letter-spacing="1">ISOLATED PRODUCT</text>

    <!-- Coupled Biaryl Structure -->
    <g transform="translate(190, 200)" stroke="#10b981" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <!-- Ring 1 -->
      <g transform="translate(-55, 0)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" stroke="#10b981" stroke-width="3" fill="#10b981" fill-opacity="0.1" />
        <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" stroke="#10b981" stroke-width="1.5" stroke-dasharray="6,5" />
        <line x1="-43" y1="0" x2="-80" y2="0" />
        <text x="-120" y="5" font-family="monospace" font-size="16" font-weight="700" fill="#fbbf24" stroke="none">OMe</text>
      </g>
      <!-- C-C Biaryl Cross-Coupling Bond -->
      <line x1="-12" y1="0" x2="35" y2="0" stroke="#f43f5e" stroke-width="4.5" />
      <!-- Ring 2 -->
      <g transform="translate(78, 0)">
        <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" stroke="#10b981" stroke-width="3" fill="#10b981" fill-opacity="0.1" />
        <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" stroke="#10b981" stroke-width="1.5" stroke-dasharray="6,5" />
      </g>
    </g>

    <!-- Yield & Enantiomeric Purity Badge -->
    <rect x="65" y="340" width="250" height="42" rx="8" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5" />
    <text x="190" y="367" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#34d399" text-anchor="middle">
      ★ ${yieldRate}
    </text>
  </g>

  <!-- Scientific Metadata Footer -->
  <g transform="translate(60, 580)" fill="#64748b" font-family="monospace" font-size="11">
    <text x="0" y="25">ACS / RSC 16:9 TOC STANDARD · 300 DPI EQUIV · CPK COMPLIANT</text>
    <text x="1080" y="25" text-anchor="end">GENERATED VIA CHEMABSTRACT SCIENTIFIC ENGINE</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_HISTORIC_REACTIONS: RecentReaction[] = [
  {
    id: "sample-suzuki-miyaura",
    title: "Suzuki-Miyaura Cross-Coupling",
    sourceText:
      "Palladium-catalyzed Suzuki-Miyaura cross-coupling: 4-bromoanisole (1.0 equiv) reacts with phenylboronic acid (1.2 equiv) in the presence of Pd(PPh3)4 (5 mol%) and K2CO3 (2.0 equiv) in DMF/H2O (4:1) at 80 °C for 6 h to afford 4-methoxybiphenyl in 92% yield.",
    imageUrl: createSampleSvg({
      title: "Pd-Catalyzed Suzuki-Miyaura Cross-Coupling",
      equation: "Ar-Br + Ar'-B(OH)2 → Ar-Ar'",
      conditions: "K2CO3 (2 equiv), DMF/H2O (4:1), 80 °C, 6 h",
      catalyst: "Pd(PPh3)4 (5 mol%)",
      yieldRate: "92% Isolated Yield",
      accentColor: "#38bdf8",
      schemeType: "ORGANOMETALLIC C-C",
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    regenCount: 0,
    tags: ["Pd-Catalyzed", "Cross-Coupling", "92% Yield", "Biaryl"],
    yieldRate: "92% Yield",
    catalyst: "Pd(PPh3)4 (5 mol%)",
    isSample: true,
  },
  {
    id: "sample-photoredox-activation",
    title: "Photoredox Functionalization",
    sourceText:
      "Visible-light-mediated photoredox functionalization: [Ir(dF(CF3)ppy)2(dtbbpy)]PF6 photocatalyst (1 mol%) under 450 nm blue LED irradiation couples quinuclidine with diethyl bromomalonate in acetonitrile at room temperature, affording α-alkylated product with 86% selectivity.",
    imageUrl: createSampleSvg({
      title: "Photoredox C(sp3)-H Functionalization",
      equation: "Quinuclidine + Br-CH(CO2Et)2 → α-Adduct",
      conditions: "450 nm Blue LED, MeCN, 25 °C, 12 h",
      catalyst: "Ir[dF(CF3)ppy]2(dtbbpy)PF6 (1 mol%)",
      yieldRate: "86% Selectivity",
      accentColor: "#a855f7",
      schemeType: "PHOTOREDOX C(sp3)-H",
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    regenCount: 1,
    tags: ["Iridium Photocatalyst", "Blue LED", "C-H Functionalization"],
    yieldRate: "86% Selectivity",
    catalyst: "[Ir] Photoredox (1 mol%)",
    isSample: true,
  },
  {
    id: "sample-asymmetric-aldol",
    title: "Enantioselective Direct Aldol",
    sourceText:
      "Asymmetric direct aldol reaction: cyclohexanone and 4-nitrobenzaldehyde react with 20 mol% L-proline catalyst in DMSO at 25 °C for 24 h to produce (2S,1'R)-2-(hydroxy(4-nitrophenyl)methyl)cyclohexan-1-one in 88% yield and 96% enantiomeric excess (ee).",
    imageUrl: createSampleSvg({
      title: "Enantioselective Direct Aldol Reaction",
      equation: "Cyclohexanone + 4-Nitrobenzaldehyde → Aldol",
      conditions: "DMSO solvent, 25 °C, 24 h",
      catalyst: "L-Proline (20 mol%)",
      yieldRate: "88% Yield · 96% ee",
      accentColor: "#34d399",
      schemeType: "ORGANOCATALYSIS",
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    regenCount: 0,
    tags: ["L-Proline", "Asymmetric", "96% ee", "Aldol"],
    yieldRate: "88% Yield / 96% ee",
    catalyst: "L-Proline Organocatalyst",
    isSample: true,
  },
  {
    id: "sample-fischer-esterification",
    title: "Fischer Esterification (Aspirin)",
    sourceText:
      "Acid-catalyzed Fischer esterification: salicylic acid is heated under reflux with excess acetic anhydride in the presence of concentrated sulfuric acid catalyst (5 drops) at 85 °C for 30 minutes, precipitating acetylsalicylic acid (aspirin) and acetic acid byproduct upon cooling.",
    imageUrl: createSampleSvg({
      title: "Fischer Esterification (Aspirin Synthesis)",
      equation: "Salicylic Acid + Ac2O → Acetylsalicylic Acid",
      conditions: "H2SO4 catalyst, 85 °C reflux, 30 min",
      catalyst: "H2SO4 (conc. 5 drops)",
      yieldRate: "94% Recrystallized",
      accentColor: "#f59e0b",
      schemeType: "PHARMACEUTICAL SYNTHESIS",
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    regenCount: 0,
    tags: ["Acid Catalyst", "Aspirin", "Esterification"],
    yieldRate: "94% Yield",
    catalyst: "H2SO4 Cat.",
    isSample: true,
  },
];

/**
 * Loads recent reactions from localStorage, seamlessly merged with any
 * backend Supabase generations if accessible, with fallback to curated samples.
 */
export async function loadRecentReactions(userId?: string): Promise<RecentReaction[]> {
  const localList: RecentReaction[] = [];

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentReaction[];
        if (Array.isArray(parsed)) {
          localList.push(...parsed);
        }
      }
    } catch (e) {
      console.warn("[RecentReactions] Failed to parse local reaction storage:", e);
    }
  }

  // Also query Supabase if userId is provided
  if (userId) {
    try {
      const { data: serverRows } = await supabase
        .from("generations")
        .select("id, user_id, parent_generation_id, title, source_text, image_path, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (serverRows && serverRows.length > 0) {
        for (const row of serverRows) {
          if (!localList.some((it) => it.id === row.id)) {
            let imageUrl = "";
            if (row.image_path) {
              const signed = await supabase.storage
                .from("abstracts")
                .createSignedUrl(row.image_path, 3600);
              imageUrl = signed.data?.signedUrl ?? "";
            }
            if (imageUrl) {
              localList.push({
                id: row.id,
                title: row.title || "Chemical Reaction Scheme",
                sourceText: row.source_text || "",
                imageUrl,
                createdAt: row.created_at,
                regenCount: 0,
                tags: ["Cloud Synced"],
              });
            }
          }
        }
      }
    } catch {
      // Offline or mock mode; local list is preserved
    }
  }

  // If user has zero items, append default samples so drawer is immediately useful and demonstrable!
  if (localList.length === 0) {
    return SAMPLE_HISTORIC_REACTIONS;
  }

  // Sort by createdAt descending
  localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return localList;
}

/**
 * Persists a new reaction or updates an existing one in recent history.
 */
export function saveRecentReaction(reaction: RecentReaction): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let list: RecentReaction[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(list)) list = [];

    // Filter out if already exists
    list = list.filter((r) => r.id !== reaction.id && r.sourceText !== reaction.sourceText);

    // Unshift to top
    list.unshift(reaction);

    // Keep up to 30 items
    list = list.slice(0, 30);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("[RecentReactions] Failed to save reaction:", e);
  }
}

/**
 * Removes a reaction by ID from history.
 */
export function deleteRecentReaction(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let list: RecentReaction[] = JSON.parse(stored);
    if (Array.isArray(list)) {
      list = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn("[RecentReactions] Failed to delete reaction:", e);
  }
}

/**
 * Clears user's local reaction history.
 */
export function clearRecentReactions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[RecentReactions] Failed to clear reactions:", e);
  }
}
