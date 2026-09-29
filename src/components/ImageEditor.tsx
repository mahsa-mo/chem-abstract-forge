import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Crop,
  Download,
  Eraser,
  Highlighter,
  Minus,
  Paintbrush,
  Pencil,
  Pen,
  Pipette,
  Redo2,
  RotateCcw,
  Scissors,
  Square,
  Stamp,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditingSuite } from "@/components/EditingSuite";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export type EditorState = {
  history: string[];
  index: number;
};

export type EditorTool =
  | "pencil"
  | "pen"
  | "highlighter"
  | "brush"
  | "eraser"
  | "text-whiteout"
  | "line"
  | "arrow"
  | "rect"
  | "text"
  | "stamp"
  | "eyedropper"
  | "crop";

const FONTS = [
  { label: "Sans", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, 'Courier New', monospace" },
];

/** Standard chemical and illustration palette swatches */
const SWATCHES = [
  { label: "Charcoal Black", color: "#111827" },
  { label: "Pure White", color: "#FFFFFF" },
  { label: "Cobalt Blue (N)", color: "#2563EB" },
  { label: "Crimson Red (O)", color: "#DC2626" },
  { label: "Emerald Green (Cl)", color: "#16A34A" },
  { label: "Solar Amber (S)", color: "#EAB308" },
  { label: "Fluorine Cyan", color: "#06B6D4" },
  { label: "Catalyst Purple", color: "#9333EA" },
  { label: "Graphite Gray", color: "#4B5563" },
  { label: "Neon Highlighter", color: "#FDE047" },
];

const QUICK_CHEM_STAMPS = ["→", "⇌", "⇄", "Δ", "hν", "80 °C", "Me", "Ph", "Ac", "Et", "Yield: 92%"];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image_load_failed"));
    img.src = src;
  });
}

export function ImageEditor({
  src,
  state,
  onStateChange,
  onClose,
  initialTool = "pencil",
  onSaveAsCurrent,
}: {
  src: string;
  state: EditorState | null;
  initialTool?: EditorTool;
  onStateChange: (state: EditorState) => void;
  onClose: () => void;
  onSaveAsCurrent?: (dataUrl: string) => void;
}) {
  const { t, locale } = useI18n();
  const isRtl = locale === "fa";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Tool State
  const [tool, setTool] = useState<EditorTool>(initialTool);

  useEffect(() => {
    if (initialTool) {
      setTool(initialTool);
    }
  }, [initialTool]);

  // Stroke & Stationery Properties
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [brushSize, setBrushSize] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [eraseToColor, setEraseToColor] = useState(true);

  // Text Tool Properties
  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState(FONTS[0]!.value);
  const [fontBold, setFontBold] = useState(true);

  // Chemical Stamp
  const [selectedStamp, setSelectedStamp] = useState("→");

  // Zoom & View
  const [zoom, setZoom] = useState<number>(100);

  // History & Crop
  const [history, setHistory] = useState<string[]>(state?.history ?? []);
  const [index, setIndex] = useState(state?.index ?? -1);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Interaction Refs
  const isDrawing = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const snapshotData = useRef<ImageData | null>(null);

  // Push snapshot to history stack
  const commit = useCallback(
    (nextHistory?: string[], nextIndex?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const snap = canvas.toDataURL("image/png");
      const base = (nextHistory ?? history).slice(0, (nextIndex ?? index) + 1);
      const h = [...base, snap].slice(-30);
      setHistory(h);
      setIndex(h.length - 1);
      onStateChange({ history: h, index: h.length - 1 });
    },
    [history, index, onStateChange],
  );

  // Paint dataUrl or blank canvas onto canvas
  const paint = useCallback(async (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!dataUrl || dataUrl === "blank") {
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 675);
      return;
    }
    try {
      const img = await loadImage(dataUrl);
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 675;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    } catch {
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 675);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    const start = state && state.index >= 0 ? state.history[state.index]! : src;
    void paint(start).then(() => {
      if (!active) return;
      if (!state || state.index < 0) commit([], -1);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coordinate mapping from client event to canvas coordinates
  function getCanvasCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  // Draw arrow helper
  function drawArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) {
    const headLength = Math.max(12, brushSize * 3.5);
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Arrow shaft
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Freehand stroke styling
  function configureFreehandContext(ctx: CanvasRenderingContext2D) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.lineWidth = brushSize * 2.5;
      if (eraseToColor) {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = bgColor;
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      }
      return;
    }

    ctx.globalCompositeOperation = "source-over";

    if (tool === "pencil") {
      ctx.lineWidth = Math.max(1.5, brushSize * 0.7);
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = opacity;
    } else if (tool === "pen") {
      ctx.lineWidth = Math.max(2.5, brushSize * 1.2);
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = opacity;
    } else if (tool === "highlighter") {
      ctx.lineWidth = Math.max(16, brushSize * 3.5);
      ctx.lineCap = "square";
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = 0.35;
    } else if (tool === "brush") {
      ctx.lineWidth = Math.max(8, brushSize * 2.2);
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = opacity;
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const p = getCanvasCoords(e);

    // Eyedropper: sample pixel color
    if (tool === "eyedropper") {
      const pixel = ctx.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0]! << 16) + (pixel[1]! << 8) + pixel[2]!).toString(16).slice(1)}`;
      setStrokeColor(hex);
      setBgColor(hex);
      toast.success(isRtl ? `رنگ نمونه‌برداری شد: ${hex}` : `Sampled color: ${hex}`);
      setTool("pencil");
      return;
    }

    // Text Tool: place text at click coordinates
    if (tool === "text") {
      if (!textValue.trim()) {
        toast.info(
          isRtl
            ? "ابتدا متن مورد نظر را در کادر بنویسید"
            : "Enter your text in the input box first",
        );
        return;
      }
      ctx.save();
      ctx.font = `${fontBold ? "bold " : ""}${fontSize}px ${fontFamily}`;
      ctx.fillStyle = strokeColor;
      ctx.textBaseline = "middle";
      ctx.fillText(textValue, p.x, p.y);
      ctx.restore();
      commit();
      return;
    }

    // Chemical Stamp Tool: stamp selected symbol
    if (tool === "stamp") {
      ctx.save();
      ctx.font = `bold ${fontSize * 1.1}px ${fontFamily}`;
      ctx.fillStyle = strokeColor;
      ctx.textBaseline = "middle";
      ctx.fillText(selectedStamp, p.x, p.y);
      ctx.restore();
      commit();
      return;
    }

    // Crop Tool: start crop box
    if (tool === "crop") {
      dragStart.current = p;
      setCrop({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }

    // Geometry Tools: Text-Whiteout, Line, Arrow, Rect
    if (tool === "text-whiteout" || tool === "line" || tool === "arrow" || tool === "rect") {
      isDrawing.current = true;
      dragStart.current = p;
      canvas.setPointerCapture(e.pointerId);
      // Save canvas snapshot for live preview without permanent destruction
      snapshotData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    // Freehand Drawing Tools (Pencil, Pen, Highlighter, Brush, Eraser)
    isDrawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.save();
    configureFreehandContext(ctx);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    dragStart.current = p;
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const p = getCanvasCoords(e);

    // Crop tool move
    if (tool === "crop" && dragStart.current) {
      const s = dragStart.current;
      setCrop({
        x: Math.min(s.x, p.x),
        y: Math.min(s.y, p.y),
        w: Math.abs(p.x - s.x),
        h: Math.abs(p.y - s.y),
      });
      return;
    }

    if (!isDrawing.current) return;

    // Geometric & Text-Whiteout Drag Preview
    if (
      (tool === "text-whiteout" || tool === "line" || tool === "arrow" || tool === "rect") &&
      dragStart.current &&
      snapshotData.current
    ) {
      // Restore clean canvas snapshot
      ctx.putImageData(snapshotData.current, 0, 0);
      const s = dragStart.current;

      if (tool === "text-whiteout") {
        const x = Math.min(s.x, p.x);
        const y = Math.min(s.y, p.y);
        const w = Math.abs(p.x - s.x);
        const h = Math.abs(p.y - s.y);
        ctx.save();
        // Live preview of whiteout
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, h);
        // Visual dashed guide
        ctx.strokeStyle = "#F43F5E";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      } else if (tool === "line") {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      } else if (tool === "arrow") {
        drawArrow(ctx, s.x, s.y, p.x, p.y);
      } else if (tool === "rect") {
        const x = Math.min(s.x, p.x);
        const y = Math.min(s.y, p.y);
        const w = Math.abs(p.x - s.x);
        const h = Math.abs(p.y - s.y);
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = brushSize;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }
      return;
    }

    // Freehand stroke drawing
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (tool === "crop") {
      dragStart.current = null;
      return;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const p = getCanvasCoords(e);

    // Finalize geometric or whiteout shape
    if (
      (tool === "text-whiteout" || tool === "line" || tool === "arrow" || tool === "rect") &&
      dragStart.current &&
      snapshotData.current
    ) {
      ctx.putImageData(snapshotData.current, 0, 0);
      const s = dragStart.current;

      if (tool === "text-whiteout") {
        const x = Math.min(s.x, p.x);
        const y = Math.min(s.y, p.y);
        const w = Math.abs(p.x - s.x);
        const h = Math.abs(p.y - s.y);
        if (w >= 3 && h >= 3) {
          ctx.save();
          ctx.fillStyle = bgColor;
          ctx.fillRect(x, y, w, h);
          ctx.restore();
          toast.success(isRtl ? "متن / کادر با موفقیت حذف شد" : "Text erased successfully");
        }
      } else if (tool === "line") {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      } else if (tool === "arrow") {
        drawArrow(ctx, s.x, s.y, p.x, p.y);
      } else if (tool === "rect") {
        const x = Math.min(s.x, p.x);
        const y = Math.min(s.y, p.y);
        const w = Math.abs(p.x - s.x);
        const h = Math.abs(p.y - s.y);
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = brushSize;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
      }

      dragStart.current = null;
      snapshotData.current = null;
      commit();
      return;
    }

    // Freehand stroke end
    ctx.restore();
    commit();
  }

  function applyCrop() {
    const canvas = canvasRef.current;
    if (!canvas || !crop || crop.w < 8 || crop.h < 8) return;
    const w = Math.round(crop.w);
    const h = Math.round(crop.h);
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    tmp
      .getContext("2d")!
      .drawImage(canvas, Math.round(crop.x), Math.round(crop.y), w, h, 0, 0, w, h);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0);
    setCrop(null);
    setTool("pencil");
    commit();
  }

  function applyBackground() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    commit();
    toast.success(isRtl ? "رنگ پس‌زمینه اعمال شد" : "Background color applied");
  }

  async function step(to: number) {
    const url = history[to];
    if (!url) return;
    await paint(url);
    setIndex(to);
    onStateChange({ history, index: to });
  }

  async function reset() {
    await paint(src);
    commit([], -1);
    toast.info(isRtl ? "تصویر به حالت اولیه بازنشانی شد" : "Reset to original image");
  }

  function savePNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "chemabstract-edited.png";
    a.click();
    toast.success(isRtl ? "تصویر ادیت‌شده دانلود شد" : "Edited image downloaded");
  }

  function handleApplyToOutput() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (onSaveAsCurrent) {
      onSaveAsCurrent(dataUrl);
      toast.success(isRtl ? "ویرایش‌ها روی تصویر اصلی ذخیره شد" : "Edits applied to graphic");
    }
  }

  const cropStyle = (() => {
    const canvas = canvasRef.current;
    if (!crop || !canvas) return null;
    return {
      left: `${(crop.x / canvas.width) * 100}%`,
      top: `${(crop.y / canvas.height) * 100}%`,
      width: `${(crop.w / canvas.width) * 100}%`,
      height: `${(crop.h / canvas.height) * 100}%`,
    };
  })();

  const cursorClass =
    tool === "pencil" || tool === "pen" || tool === "highlighter" || tool === "brush"
      ? "cursor-crosshair"
      : tool === "eraser" || tool === "text-whiteout"
        ? "cursor-cell"
        : tool === "text"
          ? "cursor-text"
          : tool === "eyedropper"
            ? "cursor-copy"
            : "cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className="mt-3 flex flex-col lg:flex-row gap-4 rounded-2xl border border-accent-strong/40 bg-card/95 backdrop-blur-md p-3.5 sm:p-4 shadow-lg"
    >
      {/* =========================================================================
          STATIONERY & EDIT BOX (باکس ابزار ادیت و نوشت‌افزار) - Side Dock
          ========================================================================= */}
      <aside className="w-full lg:w-76 xl:w-80 shrink-0 flex flex-col gap-3.5 rounded-xl border border-border/80 bg-background/90 p-3.5 shadow-sm">
        {/* Toolbox Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#F43F5E] animate-pulse" />
            <h3 className="font-display text-xs sm:text-sm font-bold text-foreground">
              {t("editor.stationery")}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              disabled={index <= 0}
              onClick={() => void step(index - 1)}
              title={t("editor.undo")}
            >
              <Undo2 className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              disabled={index >= history.length - 1}
              onClick={() => void step(index + 1)}
              title={t("editor.redo")}
            >
              <Redo2 className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title={t("editor.close")}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Primary Tool Selector Grid (Writing instruments & eraser tools) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            {isRtl ? "انتخاب ابزار / نوشت‌افزار" : "Select Tool & Stationery"}
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {/* 1. Pencil (مداد) */}
            <button
              type="button"
              onClick={() => setTool("pencil")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "pencil"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Pencil className="size-4" />
              <span>{t("editor.pencil")}</span>
            </button>

            {/* 2. Pen (خودکار) */}
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "pen"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Pen className="size-4" />
              <span>{t("editor.pen")}</span>
            </button>

            {/* 3. Highlighter (هایلایتر) */}
            <button
              type="button"
              onClick={() => {
                setTool("highlighter");
                setStrokeColor("#FDE047");
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "highlighter"
                  ? "bg-[#EAB308] text-gray-950 font-bold shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Highlighter className="size-4" />
              <span>{t("editor.highlighter")}</span>
            </button>

            {/* 4. Brush (قلم‌مو) */}
            <button
              type="button"
              onClick={() => setTool("brush")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "brush"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Paintbrush className="size-4" />
              <span>{t("editor.brushTool")}</span>
            </button>

            {/* 5. Eraser (پاک‌کن موضعی) */}
            <button
              type="button"
              onClick={() => setTool("eraser")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "eraser"
                  ? "bg-[#F43F5E] text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Eraser className="size-4" />
              <span>{t("editor.erase")}</span>
            </button>

            {/* 6. Text Whiteout / Erase Box (حذف کادری متن) */}
            <button
              type="button"
              onClick={() => setTool("text-whiteout")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "text-whiteout"
                  ? "bg-[#E11D48] text-white shadow-xs ring-1 ring-rose-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
              }`}
            >
              <Scissors className="size-4" />
              <span className="leading-tight">{t("editor.whiteout")}</span>
            </button>

            {/* 7. Reaction Arrow (پیکان واکنش) */}
            <button
              type="button"
              onClick={() => setTool("arrow")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "arrow"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <ArrowRight className="size-4" />
              <span>{t("editor.arrow")}</span>
            </button>

            {/* 8. Line (خط مستقیم) */}
            <button
              type="button"
              onClick={() => setTool("line")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "line"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Minus className="size-4" />
              <span>{t("editor.line")}</span>
            </button>

            {/* 9. Rectangle (کادر مستطیل) */}
            <button
              type="button"
              onClick={() => setTool("rect")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "rect"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Square className="size-4" />
              <span>{t("editor.rect")}</span>
            </button>

            {/* 10. Text (درج متن و فرمول) */}
            <button
              type="button"
              onClick={() => setTool("text")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "text"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Type className="size-4" />
              <span>{t("editor.text")}</span>
            </button>

            {/* 11. Stamp (نماد شیمیایی) */}
            <button
              type="button"
              onClick={() => setTool("stamp")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "stamp"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Stamp className="size-4" />
              <span>{t("editor.stamp")}</span>
            </button>

            {/* 12. Eyedropper (قطره‌چکان) */}
            <button
              type="button"
              onClick={() => setTool("eyedropper")}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-[11px] font-semibold transition-all ${
                tool === "eyedropper"
                  ? "bg-accent-strong text-white shadow-xs"
                  : "bg-secondary/60 text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              <Pipette className="size-4" />
              <span>{t("editor.eyedropper")}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tool Properties Panel */}
        <div className="rounded-lg border border-border/70 bg-card/60 p-2.5 space-y-2 text-xs">
          {/* Specific options for Text Whiteout */}
          {tool === "text-whiteout" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-500 flex items-center gap-1">
                  <Scissors className="size-3" />
                  {t("editor.whiteout")}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {isRtl ? "کادر سفیدکننده" : "Rect Whiteout"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t("editor.whiteoutHint")}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-foreground">{t("editor.background")}:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-6 rounded border border-border cursor-pointer bg-transparent"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setBgColor("#ffffff")}
                >
                  {isRtl ? "سفید خالص" : "Pure White"}
                </Button>
              </div>
            </div>
          )}

          {/* Specific options for Eraser */}
          {tool === "eraser" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{t("editor.erase")}</span>
                <span className="tabular-nums font-mono text-[11px]">{brushSize * 2}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full cursor-pointer accent-accent-strong"
              />
              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={eraseToColor}
                  onChange={(e) => setEraseToColor(e.target.checked)}
                  className="size-3.5 rounded accent-accent-strong"
                />
                <span className="text-[11px] leading-tight">{t("editor.eraseToColor")}</span>
              </label>
            </div>
          )}

          {/* Specific options for Freehand Stationery (Pencil, Pen, Brush, Arrow, Line, Rect) */}
          {(tool === "pencil" ||
            tool === "pen" ||
            tool === "highlighter" ||
            tool === "brush" ||
            tool === "arrow" ||
            tool === "line" ||
            tool === "rect") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{t("editor.brush")}</span>
                <span className="tabular-nums font-mono text-[11px]">{brushSize}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full cursor-pointer accent-accent-strong"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">{t("editor.opacity")}</span>
                <span className="tabular-nums font-mono text-[11px]">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full cursor-pointer accent-accent-strong"
              />
            </div>
          )}

          {/* Specific options for Text Tool */}
          {tool === "text" && (
            <div className="space-y-2">
              <input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={t("editor.textPlaceholder")}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
              {/* Formula & Symbol Quick Shortcuts */}
              <div className="flex flex-wrap items-center gap-1">
                {["→", "⇌", "Δ", "hν", "°C", "Å", "α", "β", "ee%", "Pd", "Me", "Ph"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setTextValue((v) => v + sym)}
                    className="rounded bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground hover:bg-secondary transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="block text-[10px] text-muted-foreground mb-1">
                    {t("editor.size")}
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground mb-1">
                    {isRtl ? "فونت" : "Font"}
                  </span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full rounded border border-input bg-background px-1.5 py-0.5 text-xs text-foreground"
                  >
                    {FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{t("editor.textHint")}</p>
            </div>
          )}

          {/* Specific options for Chemical Stamp */}
          {tool === "stamp" && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground font-semibold">
                {isRtl ? "انتخاب نماد برای مهر زدن" : "Select Symbol to Stamp"}
              </span>
              <div className="flex flex-wrap gap-1">
                {QUICK_CHEM_STAMPS.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedStamp(sym)}
                    className={`rounded px-2 py-1 font-mono text-xs font-bold transition-all ${
                      selectedStamp === sym
                        ? "bg-accent-strong text-white shadow-xs"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">{t("editor.textHint")}</p>
            </div>
          )}

          {/* Specific options for Eyedropper */}
          {tool === "eyedropper" && (
            <p className="text-[11px] text-muted-foreground">
              {isRtl
                ? "روی هر نقطه از تصویر کلیک کنید تا رنگ دقیق آن نمونه‌برداری شود."
                : "Click on any pixel of the graphic to sample its exact color."}
            </p>
          )}
        </div>

        {/* Color Palette (پالت رنگ‌های شیمیایی و اختصاصی) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t("editor.palette")}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="size-3.5 rounded-full border border-border shadow-2xs"
                style={{ backgroundColor: strokeColor }}
              />
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="size-5 rounded border border-border cursor-pointer bg-transparent"
                title={t("editor.color")}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SWATCHES.map((s) => (
              <button
                key={s.color}
                type="button"
                onClick={() => setStrokeColor(s.color)}
                title={s.label}
                className={`size-6 rounded-full border transition-all ${
                  strokeColor.toLowerCase() === s.color.toLowerCase()
                    ? "border-accent-strong scale-110 shadow-xs ring-2 ring-accent-strong/40"
                    : "border-border/80 hover:scale-105"
                }`}
                style={{ backgroundColor: s.color }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons (Save, Apply, Upload, Reset) */}
        <div className="mt-auto pt-2 border-t border-border/80 space-y-2">
          {onSaveAsCurrent && (
            <Button
              size="sm"
              onClick={handleApplyToOutput}
              className="w-full h-8 text-xs font-semibold gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs"
            >
              <Check className="size-3.5" />
              {t("editor.applyToPreview")}
            </Button>
          )}

          {/* Quick Upload Image to Canvas */}
          <label className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-secondary/40 hover:bg-secondary/70 p-1.5 cursor-pointer text-xs font-medium text-foreground transition-colors">
            <Upload className="size-3.5 text-[#06B6D4]" />
            <span>{isRtl ? "بارگذاری عکس از کامپیوتر" : "Upload Image to Edit"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (ev) => {
                  const url = ev.target?.result as string;
                  if (url) {
                    await paint(url);
                    commit();
                    toast.success(isRtl ? "تصویر با موفقیت بارگذاری شد" : "Image loaded");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={savePNG}
              className="h-8 text-xs font-semibold gap-1"
            >
              <Download className="size-3.5" />
              {t("editor.save")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void reset()}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="size-3.5" />
              {t("editor.reset")}
            </Button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          CANVAS VIEWPORT & DRAWING WORKSPACE (بخش بوم و تصویر)
          ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 rounded-xl border border-border/80 bg-background/80 p-2 sm:p-3 overflow-hidden">
        {/* Top Canvas Bar (Zoom, Dimensions, Info) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
              1200 × 675 px · 16:9
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {tool === "text-whiteout"
                ? isRtl
                  ? "روی متن کادر بکشید تا حذف شود"
                  : "Drag a box over text to erase"
                : tool === "eraser"
                  ? isRtl
                    ? "روی تصویر بکشید تا پاک شود"
                    : "Draw over image to erase"
                  : tool === "text"
                    ? isRtl
                      ? "روی بوم کلیک کنید تا متن درج شود"
                      : "Click on canvas to insert text"
                    : isRtl
                      ? `ابزار فعال: ${tool}`
                      : `Active: ${tool}`}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border text-xs">
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              title="Zoom out"
            >
              <ZoomOut className="size-3" />
            </Button>
            <span className="px-1.5 font-mono text-[11px] font-semibold">{zoom}%</span>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              title="Zoom in"
            >
              <ZoomIn className="size-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => setZoom(100)}
              title="Reset Zoom"
            >
              <Maximize2 className="size-3" />
            </Button>
          </div>
        </div>

        {/* Scrollable Canvas Container */}
        <div className="relative flex-1 overflow-auto rounded-lg border border-border bg-neutral-900/5 dark:bg-black/40 flex items-center justify-center p-2 min-h-[380px]">
          {/* Vertical Glassmorphism Editing Suite aligned to the right side of the canvas area */}
          <EditingSuite
            activeTool={
              tool === "pencil"
                ? "pencil"
                : tool === "eraser"
                  ? "eraser"
                  : tool === "text-whiteout"
                    ? "selection"
                    : undefined
            }
            onSelectTool={(suiteTool) => {
              if (suiteTool === "pencil") setTool("pencil");
              else if (suiteTool === "eraser") setTool("eraser");
              else if (suiteTool === "selection") setTool("text-whiteout");
            }}
            onClear={() => void reset()}
            color={strokeColor}
          />

          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="relative shadow-md rounded-lg overflow-hidden bg-white max-w-full"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className={`block h-auto w-full touch-none select-none ${cursorClass}`}
              style={{ maxHeight: "72vh" }}
            />
            {cropStyle && (
              <div
                className="pointer-events-none absolute border-2 border-dashed border-accent-strong bg-accent-strong/15"
                style={cropStyle}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
