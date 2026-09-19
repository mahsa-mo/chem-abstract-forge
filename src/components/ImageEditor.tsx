import { useCallback, useEffect, useRef, useState } from "react";
import { Crop, Download, Eraser, Redo2, RotateCcw, Type, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/**
 * Fully client-side raster image editor. No network calls, no dependencies:
 * every operation is drawn straight onto a 2D canvas and each committed step
 * is snapshotted as a PNG data URL for undo/redo.
 */
export type EditorState = {
  history: string[];
  index: number;
};

type Tool = "erase" | "text" | "crop";

const FONTS = [
  { label: "Sans", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, 'Courier New', monospace" },
];

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
}: {
  src: string;
  state: EditorState | null;
  onStateChange: (state: EditorState) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("erase");
  const [brush, setBrush] = useState(28);
  const [eraseToColor, setEraseToColor] = useState(true);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState(FONTS[0]!.value);
  const [textColor, setTextColor] = useState("#111827");
  const [history, setHistory] = useState<string[]>(state?.history ?? []);
  const [index, setIndex] = useState(state?.index ?? -1);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drawing = useRef(false);
  const cropStart = useRef<{ x: number; y: number } | null>(null);

  const commit = useCallback(
    (nextHistory?: string[], nextIndex?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const snap = canvas.toDataURL("image/png");
      const base = (nextHistory ?? history).slice(0, (nextIndex ?? index) + 1);
      const h = [...base, snap].slice(-25);
      setHistory(h);
      setIndex(h.length - 1);
      onStateChange({ history: h, index: h.length - 1 });
    },
    [history, index, onStateChange],
  );

  const paint = useCallback(async (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = await loadImage(dataUrl);
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // Initial load: restore the session's edit state, or start from the generated image.
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

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  function strokeAt(x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brush;
    if (eraseToColor) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = bgColor;
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const p = pos(e);

    if (tool === "text") {
      if (!textValue.trim()) return;
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";
      ctx.fillText(textValue, p.x, p.y);
      ctx.restore();
      commit();
      return;
    }

    if (tool === "crop") {
      cropStart.current = p;
      setCrop({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }

    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    strokeAt(p.x, p.y, ctx);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    if (tool === "crop" && cropStart.current) {
      const s = cropStart.current;
      setCrop({
        x: Math.min(s.x, p.x),
        y: Math.min(s.y, p.y),
        w: Math.abs(p.x - s.x),
        h: Math.abs(p.y - s.y),
      });
      return;
    }
    if (!drawing.current) return;
    strokeAt(p.x, p.y, ctx);
  }

  function onPointerUp() {
    if (tool === "crop") {
      cropStart.current = null;
      return;
    }
    if (!drawing.current) return;
    drawing.current = false;
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
    tmp.getContext("2d")!.drawImage(canvas, Math.round(crop.x), Math.round(crop.y), w, h, 0, 0, w, h);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0);
    setCrop(null);
    commit();
  }

  /** Solid colour layer painted *behind* the existing pixels. */
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
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "graphical-abstract-edited.png";
    a.click();
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

  return (
    <div className="mt-3 rounded-xl border border-accent-strong/40 bg-background/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={tool === "erase" ? "default" : "outline"}
          onClick={() => setTool("erase")}
        >
          <Eraser className="size-4" aria-hidden />
          {t("editor.erase")}
        </Button>
        <Button size="sm" variant={tool === "text" ? "default" : "outline"} onClick={() => setTool("text")}>
          <Type className="size-4" aria-hidden />
          {t("editor.text")}
        </Button>
        <Button size="sm" variant={tool === "crop" ? "default" : "outline"} onClick={() => setTool("crop")}>
          <Crop className="size-4" aria-hidden />
          {t("editor.crop")}
        </Button>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button size="sm" variant="outline" disabled={index <= 0} onClick={() => void step(index - 1)}>
          <Undo2 className="size-4" aria-hidden />
          {t("editor.undo")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={index >= history.length - 1}
          onClick={() => void step(index + 1)}
        >
          <Redo2 className="size-4" aria-hidden />
          {t("editor.redo")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void reset()}>
          <RotateCcw className="size-4" aria-hidden />
          {t("editor.reset")}
        </Button>
        <div className="ms-auto flex items-center gap-2">
          <Button size="sm" onClick={save}>
            <Download className="size-4" aria-hidden />
            {t("editor.save")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label={t("editor.close")}>
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Tool options */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {tool === "erase" && (
          <>
            <label className="flex items-center gap-2">
              {t("editor.brush")}
              <input
                type="range"
                min={4}
                max={120}
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
              />
              <span className="tabular-nums">{brush}px</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={eraseToColor}
                onChange={(e) => setEraseToColor(e.target.checked)}
              />
              {t("editor.eraseToColor")}
            </label>
          </>
        )}

        {tool === "text" && (
          <>
            <input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={t("editor.textPlaceholder")}
              className="min-w-40 flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-foreground"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              {t("editor.size")}
              <input
                type="number"
                min={8}
                max={300}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-16 rounded-md border border-input bg-background px-2 py-1 text-foreground"
              />
            </label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              aria-label={t("editor.textColor")}
              className="size-7 rounded border border-input bg-background"
            />
            <span>{t("editor.textHint")}</span>
          </>
        )}

        {tool === "crop" && (
          <>
            <span>{t("editor.cropHint")}</span>
            <Button size="sm" variant="outline" onClick={applyCrop} disabled={!crop || crop.w < 8}>
              {t("editor.applyCrop")}
            </Button>
          </>
        )}

        <span className="mx-1 h-5 w-px bg-border" />
        <label className="flex items-center gap-2">
          {t("editor.background")}
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            aria-label={t("editor.background")}
            className="size-7 rounded border border-input bg-background"
          />
        </label>
        <Button size="sm" variant="outline" onClick={applyBackground}>
          {t("editor.applyBackground")}
        </Button>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-lg border border-border bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="block h-auto w-full touch-none"
          style={{ cursor: tool === "crop" ? "crosshair" : tool === "text" ? "text" : "crosshair" }}
        />
        {cropStyle && (
          <div
            className="pointer-events-none absolute border-2 border-dashed border-accent-strong bg-accent-strong/10"
            style={cropStyle}
          />
        )}
      </div>
    </div>
  );
}

