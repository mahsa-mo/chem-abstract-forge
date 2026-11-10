import React, { useState, useMemo, useRef } from "react";
import {
  Hexagon,
  Pentagon,
  MousePointer,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ArrowLeftRight,
  FileCode2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  type BondType,
  type ChemAtom,
  type ChemBond,
  type ChemGraph,
  BOND_LENGTH,
  CPK_ATOM_COLORS,
  computeGraphFormulaAndMw,
  exportGraphToSvg,
  fuseRingToBond,
  generateRingTemplate,
  graphToSmiles,
  smilesToGraph,
} from "@/lib/chemdraw-engine";
import { toast } from "sonner";

type ToolMode =
  | { kind: "select" }
  | { kind: "eraser" }
  | { kind: "bond"; bondType: BondType }
  | {
      kind: "ring";
      ringType: "benzene" | "cyclohexane" | "cyclopentane" | "pyridine" | "naphthalene" | "indole";
    }
  | { kind: "atom"; element: string };

const PRESET_TEMPLATES = [
  {
    id: "aspirin",
    name_fa: "آسپرین (Aspirin)",
    name_en: "Aspirin",
    smiles: "CC(=O)Oc1ccccc1C(=O)O",
  },
  {
    id: "paracetamol",
    name_fa: "استامینوفن (Paracetamol)",
    name_en: "Paracetamol",
    smiles: "CC(=O)Nc1ccc(O)cc1",
  },
  {
    id: "biphenyl",
    name_fa: "۴-متوکسی‌بی‌فنیل (محصول سوزوکی)",
    name_en: "4-Methoxybiphenyl",
    smiles: "COc1ccc(-c2ccccc2)cc1",
  },
];

const ATOM_PALETTE = [
  "C",
  "N",
  "O",
  "S",
  "P",
  "F",
  "Cl",
  "Br",
  "I",
  "B",
  "Pd",
  "OH",
  "NH2",
  "NO2",
  "COOH",
  "OMe",
  "CF3",
];

interface MolecularDrawer2DProps {
  onSendToStudio?: (reactionPrompt: string) => void;
  onSendImageToEditor?: (dataUrl: string) => void;
}

export function MolecularDrawer2D({ onSendToStudio, onSendImageToEditor }: MolecularDrawer2DProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";

  const initialGraph = useMemo(() => smilesToGraph("CC(=O)Oc1ccccc1C(=O)O", 380, 230), []);
  const [history, setHistory] = useState<ChemGraph[]>([initialGraph]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const graph = useMemo(
    () => history[historyIdx] || { atoms: [], bonds: [] },
    [history, historyIdx],
  );

  const [tool, setTool] = useState<ToolMode>({ kind: "bond", bondType: "single" });
  const [activeElement, setActiveElement] = useState<string>("C");
  const [smilesText, setSmilesText] = useState<string>("CC(=O)Oc1ccccc1C(=O)O");
  const [copiedSmiles, setCopiedSmiles] = useState(false);

  // Interactive canvas drag state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragStartAtomId, setDragStartAtomId] = useState<string | null>(null);
  const [movingAtomId, setMovingAtomId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
  const [hoveredBondId, setHoveredBondId] = useState<string | null>(null);

  const metrics = useMemo(() => computeGraphFormulaAndMw(graph), [graph]);

  function pushGraph(next: ChemGraph, syncSmiles = true) {
    const sliced = history.slice(0, historyIdx + 1);
    sliced.push(next);
    setHistory(sliced);
    setHistoryIdx(sliced.length - 1);
    if (syncSmiles) {
      setSmilesText(graphToSmiles(next));
    }
  }

  function handleUndo() {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setSmilesText(graphToSmiles(history[nextIdx]));
    }
  }

  function handleRedo() {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setSmilesText(graphToSmiles(history[nextIdx]));
    }
  }

  function getSvgCoords(e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 400, y: 240 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 460 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // Compute preferred 120° IUPAC sprout angle from an existing atom
  function getSproutPosition(atom: ChemAtom): { x: number; y: number } {
    const neighbors = graph.bonds
      .filter((b) => b.from === atom.id || b.to === atom.id)
      .map((b) => {
        const otherId = b.from === atom.id ? b.to : b.from;
        return graph.atoms.find((a) => a.id === otherId);
      })
      .filter(Boolean) as ChemAtom[];

    let angle = -Math.PI / 6; // default 30° up-right
    if (neighbors.length === 1) {
      const n = neighbors[0];
      const inAngle = Math.atan2(atom.y - n.y, atom.x - n.x);
      angle = inAngle + Math.PI / 3;
    } else if (neighbors.length >= 2) {
      // Bisect reflex angle away from existing neighbors
      const sumDx = neighbors.reduce((s, n) => s + (n.x - atom.x), 0);
      const sumDy = neighbors.reduce((s, n) => s + (n.y - atom.y), 0);
      angle = Math.atan2(-sumDy, -sumDx);
    }

    return {
      x: atom.x + BOND_LENGTH * Math.cos(angle),
      y: atom.y + BOND_LENGTH * Math.sin(angle),
    };
  }

  function handleAtomMouseDown(e: React.MouseEvent, atom: ChemAtom) {
    e.stopPropagation();

    if (tool.kind === "eraser") {
      const nextAtoms = graph.atoms.filter((a) => a.id !== atom.id);
      const nextBonds = graph.bonds.filter((b) => b.from !== atom.id && b.to !== atom.id);
      pushGraph({ atoms: nextAtoms, bonds: nextBonds });
      return;
    }

    if (tool.kind === "select") {
      setMovingAtomId(atom.id);
      return;
    }

    if (tool.kind === "atom") {
      const nextAtoms = graph.atoms.map((a) =>
        a.id === atom.id ? { ...a, element: tool.element } : a,
      );
      pushGraph({ atoms: nextAtoms, bonds: graph.bonds });
      return;
    }

    if (tool.kind === "ring") {
      // Sprout a ring connected to this atom
      const sproutPos = getSproutPosition(atom);
      const ringGraph = generateRingTemplate(tool.ringType, sproutPos.x, sproutPos.y);
      const closestRingAtom = ringGraph.atoms[0];
      pushGraph({
        atoms: [...graph.atoms, ...ringGraph.atoms],
        bonds: [
          ...graph.bonds,
          ...ringGraph.bonds,
          {
            id: `b-sprout-${Date.now()}`,
            from: atom.id,
            to: closestRingAtom.id,
            type: "single",
          },
        ],
      });
      return;
    }

    if (tool.kind === "bond") {
      setDragStartAtomId(atom.id);
      setCursorPos({ x: atom.x, y: atom.y });
    }
  }

  function handleBondClick(e: React.MouseEvent, bond: ChemBond) {
    e.stopPropagation();

    if (tool.kind === "eraser") {
      pushGraph({
        atoms: graph.atoms,
        bonds: graph.bonds.filter((b) => b.id !== bond.id),
      });
      return;
    }

    if (tool.kind === "ring") {
      if (
        tool.ringType === "benzene" ||
        tool.ringType === "cyclohexane" ||
        tool.ringType === "cyclopentane" ||
        tool.ringType === "pyridine"
      ) {
        const fused = fuseRingToBond(graph, bond, tool.ringType);
        pushGraph(fused);
        return;
      }
    }

    if (tool.kind === "bond") {
      // Toggle or set bond type
      const nextType: BondType =
        bond.type === tool.bondType
          ? bond.type === "single"
            ? "double"
            : bond.type === "double"
              ? "triple"
              : "single"
          : tool.bondType;

      const nextBonds = graph.bonds.map((b) => (b.id === bond.id ? { ...b, type: nextType } : b));
      pushGraph({ atoms: graph.atoms, bonds: nextBonds });
    }
  }

  function handleCanvasMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    const pt = getSvgCoords(e);

    if (tool.kind === "ring") {
      const ringGraph = generateRingTemplate(tool.ringType, pt.x, pt.y);
      pushGraph({
        atoms: [...graph.atoms, ...ringGraph.atoms],
        bonds: [...graph.bonds, ...ringGraph.bonds],
      });
      return;
    }

    if (tool.kind === "atom") {
      const newAtom: ChemAtom = {
        id: `a-${Date.now()}`,
        element: tool.element,
        x: pt.x,
        y: pt.y,
      };
      pushGraph({ atoms: [...graph.atoms, newAtom], bonds: graph.bonds });
      return;
    }

    if (tool.kind === "bond") {
      // Create a new 2-atom bond starting at pt
      const id1 = `a-${Date.now()}-1`;
      const id2 = `a-${Date.now()}-2`;
      const angle = -Math.PI / 6;
      const a1: ChemAtom = { id: id1, element: activeElement, x: pt.x, y: pt.y };
      const a2: ChemAtom = {
        id: id2,
        element: "C",
        x: pt.x + BOND_LENGTH * Math.cos(angle),
        y: pt.y + BOND_LENGTH * Math.sin(angle),
      };
      const newBond: ChemBond = {
        id: `b-${Date.now()}`,
        from: id1,
        to: id2,
        type: tool.bondType,
      };
      pushGraph({
        atoms: [...graph.atoms, a1, a2],
        bonds: [...graph.bonds, newBond],
      });
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const pt = getSvgCoords(e);

    if (movingAtomId) {
      const nextAtoms = graph.atoms.map((a) =>
        a.id === movingAtomId ? { ...a, x: pt.x, y: pt.y } : a,
      );
      const copy = [...history];
      copy[historyIdx] = { atoms: nextAtoms, bonds: graph.bonds };
      setHistory(copy);
      return;
    }

    if (dragStartAtomId) {
      const startAtom = graph.atoms.find((a) => a.id === dragStartAtomId);
      if (startAtom) {
        const dx = pt.x - startAtom.x;
        const dy = pt.y - startAtom.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 12) {
          // Snap angle to 30° increments for clean IUPAC geometry
          const rawAngle = Math.atan2(dy, dx);
          const snappedAngle = Math.round(rawAngle / (Math.PI / 6)) * (Math.PI / 6);
          setCursorPos({
            x: startAtom.x + BOND_LENGTH * Math.cos(snappedAngle),
            y: startAtom.y + BOND_LENGTH * Math.sin(snappedAngle),
          });
        } else {
          setCursorPos(getSproutPosition(startAtom));
        }
      }
    }
  }

  function handleCanvasMouseUp() {
    if (movingAtomId) {
      setMovingAtomId(null);
      return;
    }

    if (dragStartAtomId && tool.kind === "bond") {
      const startAtom = graph.atoms.find((a) => a.id === dragStartAtomId);
      if (startAtom) {
        // Check if released onto an existing atom
        if (hoveredAtomId && hoveredAtomId !== dragStartAtomId) {
          const exists = graph.bonds.find(
            (b) =>
              (b.from === dragStartAtomId && b.to === hoveredAtomId) ||
              (b.from === hoveredAtomId && b.to === dragStartAtomId),
          );
          if (!exists) {
            pushGraph({
              atoms: graph.atoms,
              bonds: [
                ...graph.bonds,
                {
                  id: `b-${Date.now()}`,
                  from: dragStartAtomId,
                  to: hoveredAtomId,
                  type: tool.bondType,
                },
              ],
            });
          }
        } else {
          const targetPos = cursorPos || getSproutPosition(startAtom);
          // Check if near another existing atom within 20px
          const nearby = graph.atoms.find(
            (a) =>
              a.id !== dragStartAtomId && Math.hypot(a.x - targetPos.x, a.y - targetPos.y) < 22,
          );
          if (nearby) {
            pushGraph({
              atoms: graph.atoms,
              bonds: [
                ...graph.bonds,
                {
                  id: `b-${Date.now()}`,
                  from: dragStartAtomId,
                  to: nearby.id,
                  type: tool.bondType,
                },
              ],
            });
          } else {
            const newAtom: ChemAtom = {
              id: `a-${Date.now()}`,
              element: activeElement,
              x: targetPos.x,
              y: targetPos.y,
            };
            pushGraph({
              atoms: [...graph.atoms, newAtom],
              bonds: [
                ...graph.bonds,
                {
                  id: `b-${Date.now()}`,
                  from: dragStartAtomId,
                  to: newAtom.id,
                  type: tool.bondType,
                },
              ],
            });
          }
        }
      }
      setDragStartAtomId(null);
      setCursorPos(null);
    }
  }

  // Export Vector SVG
  function handleDownloadSvg() {
    const svgString = exportGraphToSvg(graph, { width: 800, height: 460 });
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `structure-${metrics.formula || "molecule"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      isRtl ? "فایل برداری SVG با استاندارد مجلات دانلود شد" : "Exported publication Vector SVG",
    );
  }

  // Export 300 DPI High-Res PNG (2400 x 1380 px)
  function handleExportHighResPng(sendToEditor = false) {
    const svgString = exportGraphToSvg(graph, { width: 800, height: 460 });
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2400; // 3x scale for 300 DPI print clarity
      canvas.height = 1380;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL("image/png");
        if (sendToEditor && onSendImageToEditor) {
          onSendImageToEditor(pngDataUrl);
        } else {
          const a = document.createElement("a");
          a.href = pngDataUrl;
          a.download = `structure-300dpi-${metrics.formula || "molecule"}.png`;
          a.click();
          toast.success(
            isRtl
              ? "تصویر PNG با وضوح 300 DPI دانلود شد"
              : "Downloaded 300 DPI High-Res PNG (2400×1380 px)",
          );
        }
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  const atomMap = useMemo(() => new Map(graph.atoms.map((a) => [a.id, a])), [graph.atoms]);

  return (
    <div className="w-full flex flex-col gap-5 text-foreground">
      {/* Compact SMILES & Live Molecular Metrics Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Bidirectional SMILES Input */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1">
            <span className="text-xs font-mono font-bold text-[#06B6D4] shrink-0 px-2 py-1 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/25">
              SMILES
            </span>
            <input
              type="text"
              dir="ltr"
              value={smilesText}
              onChange={(e) => setSmilesText(e.target.value)}
              placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!smilesText.trim()) return;
                const parsed = smilesToGraph(smilesText, 380, 230);
                pushGraph(parsed, false);
                toast.success(
                  isRtl
                    ? "کد SMILES به ساختار دوبعدی تبدیل شد"
                    : "Converted SMILES string to 2D chemical structure",
                );
              }}
              className="h-9 text-xs gap-1.5 font-semibold shrink-0"
            >
              <ArrowLeftRight className="size-3.5 text-[#06B6D4]" />
              <span>{isRtl ? "تبدیل به ساختار" : "SMILES → 2D"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const generated = graphToSmiles(graph);
                setSmilesText(generated);
                void navigator.clipboard.writeText(generated);
                setCopiedSmiles(true);
                setTimeout(() => setCopiedSmiles(false), 2000);
                toast.success(
                  isRtl
                    ? "کد SMILES از روی رسم شما استخراج و کپی شد"
                    : "Extracted & copied SMILES from 2D drawing",
                );
              }}
              className="h-9 text-xs gap-1.5 font-semibold shrink-0"
            >
              {copiedSmiles ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>{isRtl ? "کپی SMILES" : "Copy SMILES"}</span>
            </Button>
          </div>

          {/* Live Molecular Formula & Exact MW Telemetry */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-secondary/70 border border-border font-mono text-xs shrink-0 self-start lg:self-auto">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "فرمول" : "Formula"}
              </span>
              <span className="text-xs font-extrabold text-foreground">{metrics.formula}</span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "جرم مولی" : "MW"}
              </span>
              <span className="text-xs font-extrabold text-[#06B6D4] tabular-nums">
                {metrics.mw.toFixed(2)} g/mol
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "حلقه" : "Rings"}
              </span>
              <span className="text-xs font-bold text-foreground tabular-nums">
                {metrics.ringCount}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Template Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] font-mono text-muted-foreground me-1">
            {isRtl ? "ساختارهای آماده:" : "Templates:"}
          </span>
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSmilesText(tpl.smiles);
                pushGraph(smilesToGraph(tpl.smiles, 380, 230), false);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-secondary text-foreground border border-border/70 text-xs font-medium transition-colors"
            >
              {isRtl ? tpl.name_fa : tpl.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sketcher Workspace: Left/Top Toolbars + Central Vector Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Toolbar: Rings, Bonds & Stereochemistry */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
          {/* Canvas Controls */}
          <div>
            <span className="text-[11px] font-mono text-muted-foreground block mb-2">
              {isRtl ? "ابزارهای ویرایش و بوم" : "Canvas & Selection Tools"}
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setTool({ kind: "select" })}
                className={`h-9 rounded-lg border flex items-center justify-center transition-all ${
                  tool.kind === "select"
                    ? "bg-accent-strong text-accent-foreground border-accent-strong font-bold"
                    : "bg-secondary/60 hover:bg-secondary text-foreground border-border/70"
                }`}
                title={isRtl ? "جابجایی اتم‌ها" : "Move Atom"}
              >
                <MousePointer className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setTool({ kind: "eraser" })}
                className={`h-9 rounded-lg border flex items-center justify-center transition-all ${
                  tool.kind === "eraser"
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-secondary/60 hover:bg-secondary text-foreground border-border/70"
                }`}
                title={isRtl ? "پاک‌کن اتم یا پیوند" : "Eraser"}
              >
                <Eraser className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIdx <= 0}
                className="h-9 rounded-lg border border-border/70 bg-secondary/60 hover:bg-secondary disabled:opacity-40 flex items-center justify-center"
                title="Undo"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIdx >= history.length - 1}
                className="h-9 rounded-lg border border-border/70 bg-secondary/60 hover:bg-secondary disabled:opacity-40 flex items-center justify-center"
                title="Redo"
              >
                <Redo2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => pushGraph({ atoms: [], bonds: [] })}
                className="h-9 rounded-lg border border-border/70 bg-secondary/60 hover:bg-destructive/15 hover:text-destructive flex items-center justify-center"
                title={isRtl ? "پاکسازی کامل بوم" : "Clear Canvas"}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Bond & Stereochemistry Tools */}
          <div>
            <span className="text-[11px] font-mono text-muted-foreground block mb-2">
              {isRtl ? "پیوندها و استریوشیمی (گوه‌ای / خط‌چین)" : "Bonds & Stereochemistry"}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { type: "single" as const, label_fa: "پیوند یگانه (—)", label_en: "Single (—)" },
                { type: "double" as const, label_fa: "پیوند دوگانه (=)", label_en: "Double (=)" },
                { type: "triple" as const, label_fa: "پیوند سه‌گانه (≡)", label_en: "Triple (≡)" },
                {
                  type: "wedge" as const,
                  label_fa: "گوه‌ای توپر (▲ Up)",
                  label_en: "Wedge Up (▲)",
                },
                {
                  type: "dash" as const,
                  label_fa: "گوه‌ای خط‌چین (⋯ Down)",
                  label_en: "Dash Down (⋯)",
                },
              ].map((b) => {
                const active = tool.kind === "bond" && tool.bondType === b.type;
                return (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => setTool({ kind: "bond", bondType: b.type })}
                    className={`px-2.5 py-2 rounded-lg border text-start font-medium transition-all ${
                      active
                        ? "bg-accent-strong text-accent-foreground border-accent-strong font-bold shadow-2xs"
                        : "bg-secondary/60 hover:bg-secondary text-foreground border-border/70"
                    }`}
                  >
                    {isRtl ? b.label_fa : b.label_en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ready-Made Rings Palette */}
          <div>
            <span className="text-[11px] font-mono text-muted-foreground block mb-2">
              {isRtl
                ? "حلقه‌های آماده (کلیک روی بوم یا جوش‌خوردن به پیوند)"
                : "Ring Templates (Click or Fuse)"}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: "benzene" as const, fa: "بنزن (آروماتیک)", en: "Benzene (Ph)" },
                { id: "cyclohexane" as const, fa: "سیکلوهگزان", en: "Cyclohexane" },
                { id: "cyclopentane" as const, fa: "سیکلوپنتان", en: "Cyclopentane" },
                { id: "pyridine" as const, fa: "پیریدین (N)", en: "Pyridine" },
                { id: "naphthalene" as const, fa: "نفتالن (۲حلقه)", en: "Naphthalene" },
                { id: "indole" as const, fa: "ایندول", en: "Indole" },
              ].map((r) => {
                const active = tool.kind === "ring" && tool.ringType === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTool({ kind: "ring", ringType: r.id })}
                    className={`px-2.5 py-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                      active
                        ? "bg-accent-strong text-accent-foreground border-accent-strong font-bold shadow-2xs"
                        : "bg-secondary/60 hover:bg-secondary text-foreground border-border/70"
                    }`}
                  >
                    {r.id === "cyclopentane" ? (
                      <Pentagon className="size-3.5 shrink-0 text-[#06B6D4]" />
                    ) : (
                      <Hexagon className="size-3.5 shrink-0 text-[#4F46E5] dark:text-[#818CF8]" />
                    )}
                    <span className="truncate">{isRtl ? r.fa : r.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Heteroatoms & Functional Groups */}
          <div>
            <span className="text-[11px] font-mono text-muted-foreground block mb-2">
              {isRtl ? "عناصر و گروه‌های عاملی" : "Heteroatoms & Functional Groups"}
            </span>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {ATOM_PALETTE.map((el) => {
                const active =
                  (tool.kind === "atom" && tool.element === el) ||
                  (tool.kind === "bond" && activeElement === el);
                return (
                  <button
                    key={el}
                    type="button"
                    onClick={() => {
                      setActiveElement(el);
                      setTool({ kind: "atom", element: el });
                    }}
                    className={`py-1.5 rounded-lg border font-bold transition-all ${
                      active
                        ? "border-accent-strong bg-secondary ring-2 ring-accent-strong/40"
                        : "border-border/70 bg-background hover:bg-secondary/60"
                    }`}
                    style={{ color: CPK_ATOM_COLORS[el] || "#0f172a" }}
                  >
                    {el}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Interactive 2D Vector Canvas & Export Bar */}
        <div className="lg:col-span-9 p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
          {/* Interactive SVG Viewport */}
          <div className="relative w-full rounded-xl border border-border bg-white overflow-hidden shadow-inner">
            {/* Subtle scientific coordinate grid */}
            <svg
              ref={svgRef}
              viewBox="0 0 800 460"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="w-full h-[380px] sm:h-[440px] cursor-crosshair select-none"
            >
              <defs>
                <pattern id="chemGrid" width="26" height="26" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#cbd5e1" />
                </pattern>
              </defs>
              <rect width="800" height="460" fill="url(#chemGrid)" />

              {/* Render Bonds */}
              {graph.bonds.map((b) => {
                const a1 = atomMap.get(b.from);
                const a2 = atomMap.get(b.to);
                if (!a1 || !a2) return null;

                const dx = a2.x - a1.x;
                const dy = a2.y - a1.y;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len;
                const ny = dx / len;
                const offset = 3.6;
                const isHovered = hoveredBondId === b.id;

                return (
                  <g
                    key={b.id}
                    onMouseEnter={() => setHoveredBondId(b.id)}
                    onMouseLeave={() => setHoveredBondId(null)}
                    onClick={(e) => handleBondClick(e, b)}
                    className="cursor-pointer"
                  >
                    {/* Invisible wide hit-target for easy clicking */}
                    <line
                      x1={a1.x}
                      y1={a1.y}
                      x2={a2.x}
                      y2={a2.y}
                      stroke={isHovered ? "rgba(6, 182, 212, 0.25)" : "transparent"}
                      strokeWidth={14}
                      strokeLinecap="round"
                    />

                    {b.type === "single" && (
                      <line
                        x1={a1.x}
                        y1={a1.y}
                        x2={a2.x}
                        y2={a2.y}
                        stroke="#0f172a"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                      />
                    )}

                    {b.type === "double" && (
                      <g stroke="#0f172a" strokeWidth={2.2} strokeLinecap="round">
                        <line
                          x1={a1.x + nx * offset}
                          y1={a1.y + ny * offset}
                          x2={a2.x + nx * offset}
                          y2={a2.y + ny * offset}
                        />
                        <line
                          x1={a1.x - nx * offset}
                          y1={a1.y - ny * offset}
                          x2={a2.x - nx * offset}
                          y2={a2.y - ny * offset}
                        />
                      </g>
                    )}

                    {b.type === "triple" && (
                      <g stroke="#0f172a" strokeWidth={2} strokeLinecap="round">
                        <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} />
                        <line
                          x1={a1.x + nx * 4.6}
                          y1={a1.y + ny * 4.6}
                          x2={a2.x + nx * 4.6}
                          y2={a2.y + ny * 4.6}
                        />
                        <line
                          x1={a1.x - nx * 4.6}
                          y1={a1.y - ny * 4.6}
                          x2={a2.x - nx * 4.6}
                          y2={a2.y - ny * 4.6}
                        />
                      </g>
                    )}

                    {b.type === "wedge" && (
                      <polygon
                        points={`${a1.x},${a1.y} ${a2.x + nx * 5.8},${a2.y + ny * 5.8} ${a2.x - nx * 5.8},${a2.y - ny * 5.8}`}
                        fill="#0f172a"
                      />
                    )}

                    {b.type === "dash" && (
                      <g stroke="#0f172a" strokeWidth={2} strokeLinecap="round">
                        {[1, 2, 3, 4, 5, 6].map((k) => {
                          const t = k / 6;
                          const hx = a1.x + dx * t;
                          const hy = a1.y + dy * t;
                          const hw = 5.6 * t;
                          return (
                            <line
                              key={k}
                              x1={hx + nx * hw}
                              y1={hy + ny * hw}
                              x2={hx - nx * hw}
                              y2={hy - ny * hw}
                            />
                          );
                        })}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Interactive Rubberband Bond Preview while dragging from an atom */}
              {dragStartAtomId && cursorPos && (
                <line
                  x1={atomMap.get(dragStartAtomId)?.x || 0}
                  y1={atomMap.get(dragStartAtomId)?.y || 0}
                  x2={cursorPos.x}
                  y2={cursorPos.y}
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  strokeDasharray="5,4"
                />
              )}

              {/* Render Atoms */}
              {graph.atoms.map((a) => {
                const degree = graph.bonds.filter((b) => b.from === a.id || b.to === a.id).length;
                const isHovered = hoveredAtomId === a.id;
                const showLabel = a.element !== "C" || degree === 0;
                const label = a.element === "C" ? "CH₄" : a.element;
                const boxW = Math.max(22, label.length * 10 + 8);

                return (
                  <g
                    key={a.id}
                    transform={`translate(${a.x}, ${a.y})`}
                    onMouseEnter={() => setHoveredAtomId(a.id)}
                    onMouseLeave={() => setHoveredAtomId(null)}
                    onMouseDown={(e) => handleAtomMouseDown(e, a)}
                    className="cursor-pointer"
                  >
                    <circle r={11} fill={isHovered ? "rgba(6, 182, 212, 0.22)" : "transparent"} />
                    {showLabel && (
                      <>
                        <rect
                          x={-boxW / 2}
                          y={-10}
                          width={boxW}
                          height={20}
                          rx={5}
                          fill="#ffffff"
                        />
                        <text
                          x={0}
                          y={5}
                          textAnchor="middle"
                          fontSize={14}
                          fontWeight={700}
                          fontFamily="Arial, sans-serif"
                          fill={CPK_ATOM_COLORS[a.element] || "#0f172a"}
                        >
                          {label}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Publication Export & Studio Integration Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadSvg}
                className="h-9 text-xs font-semibold gap-1.5"
              >
                <FileCode2 className="size-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
                <span>{isRtl ? "دانلود برداری SVG (مخصوص مقالات)" : "Export Vector SVG"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExportHighResPng(false)}
                className="h-9 text-xs font-semibold gap-1.5"
              >
                <Download className="size-3.5 text-[#10B981]" />
                <span>{isRtl ? "دانلود PNG با کیفیت 300 DPI" : "Export 300 DPI PNG"}</span>
              </Button>

              {onSendImageToEditor && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportHighResPng(true)}
                  className="h-9 text-xs font-semibold gap-1.5"
                >
                  <ImageIcon className="size-3.5 text-[#06B6D4]" />
                  <span>{isRtl ? "ارسال ساختار به بوم ادیت" : "Send to Edit Canvas"}</span>
                </Button>
              )}
            </div>

            {onSendToStudio && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const currentSmiles = graphToSmiles(graph);
                  const desc = `Chemical transformation involving structure ${metrics.formula} (MW: ${metrics.mw} g/mol, SMILES: ${currentSmiles})`;
                  onSendToStudio(desc);
                }}
                className="h-9 px-4 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
              >
                <Sparkles className="size-3.5" />
                <span>
                  {isRtl ? "ارسال ساختار به استودیو گرافیکال ابسترکت" : "Use Structure in Studio"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
