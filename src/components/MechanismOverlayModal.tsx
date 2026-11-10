import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  Copy,
  Check,
  Undo2,
  Redo2,
  Layers,
  Move,
  CornerDownRight,
  MousePointer,
  Atom,
  Tag,
  Type,
  Plus,
  Scale,
  Zap,
  Info,
} from "lucide-react";
import {
  type VectorOverlayItem,
  type CurvedMechanismArrowItem,
  type ReactionArrowItem,
  type CalloutBadgeItem,
  type OrbitalMarkerItem,
  type TextAnnotationItem,
  type ArrowType,
  type BarbType,
  type OrbitalMarkerType,
  renderOverlayToSvg,
} from "@/lib/vector-overlay-types";
import { parseAndAuditReaction } from "@/lib/reaction-parser";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface MechanismOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseImageUrl: string;
  sourceText?: string;
  onSaveMergedImage?: (mergedDataUrl: string) => void;
}

type EditorMode =
  | "select"
  | "curved-double"
  | "curved-single"
  | "reaction-arrow"
  | "equilibrium-arrow"
  | "retrosynthesis-arrow"
  | "yield-badge"
  | "orbital-marker"
  | "text";

const COLOR_SWATCHES = [
  { name: "Black", color: "#111827" },
  { name: "Cobalt Blue", color: "#2563EB" },
  { name: "Crimson Red", color: "#DC2626" },
  { name: "Emerald Green", color: "#16A34A" },
  { name: "Catalyst Purple", color: "#9333EA" },
  { name: "Amber Orange", color: "#D97706" },
  { name: "Pure White", color: "#FFFFFF" },
];

export function MechanismOverlayModal({
  isOpen,
  onClose,
  baseImageUrl,
  sourceText = "",
  onSaveMergedImage,
}: MechanismOverlayModalProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";

  const [mode, setMode] = useState<EditorMode>("select");
  const [items, setItems] = useState<VectorOverlayItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<VectorOverlayItem[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Active color and stroke
  const [activeColor, setActiveColor] = useState("#2563EB");
  const [strokeWidth, setStrokeWidth] = useState(3.5);
  const [fontSize, setFontSize] = useState(14);

  // Orbital marker subtype
  const [orbitalType, setOrbitalType] = useState<OrbitalMarkerType>("lone-pair");

  // Interaction dragging states
  const [draggingPoint, setDraggingPoint] = useState<{
    itemId: string;
    handle: "start" | "control" | "end" | "whole";
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 900,
    height: 500,
  });

  // Measure base image on open
  useEffect(() => {
    if (!isOpen || !baseImageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageSize({
        width: img.naturalWidth || 900,
        height: img.naturalHeight || 500,
      });
    };
    img.src = baseImageUrl;
  }, [isOpen, baseImageUrl]);

  // History push helper
  const pushState = useCallback(
    (newItems: VectorOverlayItem[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIdx + 1);
        return [...sliced, newItems];
      });
      setHistoryIdx((prev) => prev + 1);
      setItems(newItems);
    },
    [historyIdx],
  );

  function handleUndo() {
    if (historyIdx > 0) {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setItems(history[nextIdx] ?? []);
      setSelectedId(null);
    }
  }

  function handleRedo() {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setItems(history[nextIdx] ?? []);
      setSelectedId(null);
    }
  }

  function handleClear() {
    if (items.length === 0) return;
    pushState([]);
    setSelectedId(null);
    toast.info(isRtl ? "تمام لایه‌های برداری پاکسازی شدند" : "Overlays cleared");
  }

  // Auto-generate standard reaction arrow and yield badge from parsed reaction text
  async function handleAutoPlaceReactionPreset() {
    if (!sourceText.trim()) {
      toast.info(isRtl ? "متن واکنشی برای استخراج شرایط وجود ندارد" : "No reaction text provided");
      return;
    }
    try {
      const audit = await parseAndAuditReaction(sourceText);
      const catText = audit.catalysts
        .map((c) => `${c.name} (${c.molPercent || 5} mol%)`)
        .join(", ");
      const condText = [
        audit.conditions.solvent,
        audit.conditions.temperature,
        audit.conditions.time,
      ]
        .filter(Boolean)
        .join(", ");

      const midX = imageSize.width / 2;
      const midY = imageSize.height / 2;

      // Create central reaction arrow
      const newArrow: ReactionArrowItem = {
        id: `auto-arrow-${Date.now()}`,
        type: "reaction-arrow",
        start: { x: midX - 120, y: midY },
        end: { x: midX + 120, y: midY },
        arrowType: "forward",
        topText: catText || "Catalyst / Reagent",
        bottomText: condText || "Solvent, Temp",
        color: "#111827",
        strokeWidth: 3.5,
        fontSize: 13,
      };

      // Create yield badge near product
      const newBadge: CalloutBadgeItem = {
        id: `auto-badge-${Date.now()}`,
        type: "badge",
        x: imageSize.width - 180,
        y: midY + 70,
        title: `${audit.products[0]?.yieldPercent || 92}% Yield`,
        subtitle: audit.products[0]?.eePercent ? `${audit.products[0].eePercent}% ee` : "isolated",
        variant: "yield",
        bgColor: "#ECFDF5",
        textColor: "#059669",
        color: "#10B981",
        strokeWidth: 1,
      };

      pushState([...items, newArrow, newBadge]);
      toast.success(
        isRtl
          ? "فلش واکنش و برچسب بازده بر اساس شرایط استخراج‌شده درج گردید!"
          : "Standard reaction arrow and yield badge placed!",
      );
    } catch {
      toast.error(isRtl ? "خطا در استخراج خودکار شرایط" : "Failed to parse reaction preset");
    }
  }

  // Canvas click to add item based on active tool
  function handleCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
    if (mode === "select") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    if (mode === "curved-double" || mode === "curved-single") {
      const isDouble = mode === "curved-double";
      const newItem: CurvedMechanismArrowItem = {
        id: `curved-${Date.now()}`,
        type: "curved-arrow",
        start: { x: clickX - 45, y: clickY + 25 },
        control: { x: clickX, y: clickY - 30 },
        end: { x: clickX + 45, y: clickY + 25 },
        barbType: isDouble ? "double" : "single",
        color: activeColor,
        strokeWidth,
      };
      pushState([...items, newItem]);
      setSelectedId(newItem.id);
      setMode("select");
      toast.success(
        isRtl
          ? `فلش منحنی ${isDouble ? "انتقال جفت‌الکترون" : "رادیکالی تک‌الکترون"} درج شد`
          : "Curved mechanism arrow placed",
      );
    } else if (
      mode === "reaction-arrow" ||
      mode === "equilibrium-arrow" ||
      mode === "retrosynthesis-arrow"
    ) {
      let arrowType: ArrowType = "forward";
      if (mode === "equilibrium-arrow") arrowType = "equilibrium";
      if (mode === "retrosynthesis-arrow") arrowType = "retrosynthesis";

      const newItem: ReactionArrowItem = {
        id: `arrow-${Date.now()}`,
        type: "reaction-arrow",
        start: { x: clickX - 80, y: clickY },
        end: { x: clickX + 80, y: clickY },
        arrowType,
        topText: "Catalyst / Reagent",
        bottomText: "Solvent, 80 °C",
        color: activeColor,
        strokeWidth,
        fontSize,
      };
      pushState([...items, newItem]);
      setSelectedId(newItem.id);
      setMode("select");
      toast.success(isRtl ? "فلش واکنش درج شد" : "Reaction arrow placed");
    } else if (mode === "yield-badge") {
      const newItem: CalloutBadgeItem = {
        id: `badge-${Date.now()}`,
        type: "badge",
        x: clickX,
        y: clickY,
        title: "92% Yield",
        subtitle: "96% ee",
        variant: "yield",
        bgColor: "#ECFDF5",
        textColor: "#059669",
        color: activeColor,
        strokeWidth: 1,
      };
      pushState([...items, newItem]);
      setSelectedId(newItem.id);
      setMode("select");
      toast.success(isRtl ? "برچسب بازده درج شد" : "Yield badge placed");
    } else if (mode === "orbital-marker") {
      const newItem: OrbitalMarkerItem = {
        id: `orbital-${Date.now()}`,
        type: "orbital-marker",
        x: clickX,
        y: clickY,
        markerType: orbitalType,
        size: 16,
        color: activeColor,
        strokeWidth: 2,
      };
      pushState([...items, newItem]);
      setSelectedId(newItem.id);
      setMode("select");
      toast.success(isRtl ? "نشانگر اوربیتال/بار درج شد" : "Orbital marker placed");
    } else if (mode === "text") {
      const newItem: TextAnnotationItem = {
        id: `text-${Date.now()}`,
        type: "text",
        x: clickX,
        y: clickY,
        text: "Label",
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
        color: activeColor,
        strokeWidth: 1,
      };
      pushState([...items, newItem]);
      setSelectedId(newItem.id);
      setMode("select");
    }
  }

  // Pointer dragging handler for bezier control points and items
  function handlePointerDown(
    e: React.PointerEvent,
    itemId: string,
    handle: "start" | "control" | "end" | "whole",
  ) {
    e.stopPropagation();
    setSelectedId(itemId);
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;

    setDraggingPoint({
      itemId,
      handle,
      offsetX: curX,
      offsetY: curY,
    });
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggingPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    const curX = Math.round((e.clientX - rect.left) * scaleX);
    const curY = Math.round((e.clientY - rect.top) * scaleY);

    const dx = curX - draggingPoint.offsetX;
    const dy = curY - draggingPoint.offsetY;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== draggingPoint.itemId) return item;

        if (item.type === "curved-arrow") {
          if (draggingPoint.handle === "start") {
            return { ...item, start: { x: curX, y: curY } };
          }
          if (draggingPoint.handle === "control") {
            return { ...item, control: { x: curX, y: curY } };
          }
          if (draggingPoint.handle === "end") {
            return { ...item, end: { x: curX, y: curY } };
          }
          if (draggingPoint.handle === "whole") {
            return {
              ...item,
              start: { x: item.start.x + dx, y: item.start.y + dy },
              control: { x: item.control.x + dx, y: item.control.y + dy },
              end: { x: item.end.x + dx, y: item.end.y + dy },
            };
          }
        } else if (item.type === "reaction-arrow") {
          if (draggingPoint.handle === "start") {
            return { ...item, start: { x: curX, y: curY } };
          }
          if (draggingPoint.handle === "end") {
            return { ...item, end: { x: curX, y: curY } };
          }
          if (draggingPoint.handle === "whole") {
            return {
              ...item,
              start: { x: item.start.x + dx, y: item.start.y + dy },
              end: { x: item.end.x + dx, y: item.end.y + dy },
            };
          }
        } else if (
          item.type === "badge" ||
          item.type === "orbital-marker" ||
          item.type === "text"
        ) {
          return {
            ...item,
            x: item.x + dx,
            y: item.y + dy,
          };
        }

        return item;
      }),
    );

    setDraggingPoint((prev) => (prev ? { ...prev, offsetX: curX, offsetY: curY } : null));
  }

  function handlePointerUp() {
    if (draggingPoint) {
      setDraggingPoint(null);
      // commit to history
      pushState(items);
    }
  }

  function handleDeleteSelected() {
    if (!selectedId) return;
    const next = items.filter((i) => i.id !== selectedId);
    pushState(next);
    setSelectedId(null);
  }

  // Merge vector SVG over base image into a 300 DPI Data URL and apply back to app
  async function handleMergeAndSave() {
    try {
      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        baseImg.onload = res;
        baseImg.onerror = rej;
        baseImg.src = baseImageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = imageSize.width;
      canvas.height = imageSize.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas_context_failed");

      // 1. Draw base abstract image
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // 2. Render SVG overlay on top
      if (items.length > 0) {
        const svgString = renderOverlayToSvg(items, canvas.width, canvas.height);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgImg = new Image();
        await new Promise((res, rej) => {
          svgImg.onload = res;
          svgImg.onerror = rej;
          svgImg.src = svgUrl;
        });
        ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(svgUrl);
      }

      const mergedDataUrl = canvas.toDataURL("image/png");
      if (onSaveMergedImage) {
        onSaveMergedImage(mergedDataUrl);
      }
      toast.success(
        isRtl
          ? "فلش‌ها و نشانه‌های مکانیزم با کیفیت اصلی در ابسترکت ادغام شدند!"
          : "Vector mechanism overlays merged losslessly into abstract!",
      );
      onClose();
    } catch (err) {
      console.error("Merge error:", err);
      toast.error(isRtl ? "خطا در ذخیره و ادغام لایه‌ها" : "Failed to merge overlay");
    }
  }

  function handleDownloadSvg() {
    const svgStr = renderOverlayToSvg(items, imageSize.width, imageSize.height);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chemical-mechanism-overlays.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isRtl ? "فایل برداری SVG دانلود شد" : "Vector SVG downloaded");
  }

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[96vh] p-0 border border-border/80 shadow-2xl bg-card rounded-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-border/60 bg-gradient-to-r from-primary/10 via-background to-secondary/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <CornerDownRight className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-display flex items-center gap-2">
                {isRtl
                  ? "ویرایشگر لایه‌ای فلش‌های مکانیزم و شرایط واکنش"
                  : "Vector Mechanism & Annotation Overlay"}
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-primary/15 text-primary border border-primary/30">
                  Phase 3 Core
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "فلش‌های منحنی انتقال الکترون، فلش‌های تعادل و رتروسنتز، شرایط واکنش بالا و پایین فلش، و برچسب‌های بازده"
                  : "Curved electron-pushing arrows, reaction arrows with reagents/conditions, and orbital callouts"}
              </DialogDescription>
            </div>
          </div>

          {/* Quick Undo / Redo / History */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              title={isRtl ? "بازگشت" : "Undo"}
            >
              <Undo2 className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              title={isRtl ? "انجام مجدد" : "Redo"}
            >
              <Redo2 className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              title={isRtl ? "پاکسازی لایه‌ها" : "Clear Overlays"}
            >
              <Trash2 className="size-3.5 mr-1" />
              <span>{isRtl ? "پاکسازی" : "Clear"}</span>
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-border/60 bg-muted/40 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Tool Modes */}
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant={mode === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("select")}
              className="h-8 gap-1 text-xs"
            >
              <MousePointer className="size-3" />
              <span>{isRtl ? "انتخاب و جابجایی" : "Select / Move"}</span>
            </Button>

            <Button
              variant={mode === "curved-double" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("curved-double")}
              className="h-8 gap-1 text-xs"
              title={isRtl ? "فلش منحنی جفت‌الکترون (۲ الکترون)" : "Curved Arrow (2e- Pair)"}
            >
              <CornerDownRight className="size-3 text-blue-500" />
              <span>{isRtl ? "منحنی ۲ الکترون" : "Curved (2e⁻)"}</span>
            </Button>

            <Button
              variant={mode === "curved-single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("curved-single")}
              className="h-8 gap-1 text-xs"
              title={isRtl ? "فلش قلابی رادیکال (۱ الکترون)" : "Fish-hook Arrow (1e- Radical)"}
            >
              <Zap className="size-3 text-amber-500" />
              <span>{isRtl ? "تک‌الکترون رادیکال" : "Radical (1e⁻)"}</span>
            </Button>

            <Button
              variant={mode === "reaction-arrow" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("reaction-arrow")}
              className="h-8 gap-1 text-xs"
            >
              <ArrowRight className="size-3" />
              <span>{isRtl ? "فلش با شرایط" : "Reaction Arrow"}</span>
            </Button>

            <Button
              variant={mode === "yield-badge" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("yield-badge")}
              className="h-8 gap-1 text-xs"
            >
              <Tag className="size-3 text-emerald-500" />
              <span>{isRtl ? "برچسب بازده/ee" : "Yield Badge"}</span>
            </Button>

            <Button
              variant={mode === "orbital-marker" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("orbital-marker")}
              className="h-8 gap-1 text-xs"
            >
              <Atom className="size-3 text-purple-500" />
              <span>{isRtl ? "اوربیتال / بار" : "Orbital/Charge"}</span>
            </Button>

            <Button
              variant={mode === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("text")}
              className="h-8 gap-1 text-xs"
            >
              <Type className="size-3" />
              <span>{isRtl ? "متن" : "Text"}</span>
            </Button>
          </div>

          {/* Preset Helper & Colors */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoPlaceReactionPreset}
              className="h-8 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
              title={
                isRtl
                  ? "درج خودکار فلش و برچسب بازده از متن واکنش"
                  : "Auto-place reaction arrow from text"
              }
            >
              <Sparkles className="size-3" />
              <span>{isRtl ? "درج خودکار از متن" : "Auto from Text"}</span>
            </Button>

            {/* Color Swatches */}
            <div className="flex items-center gap-1 border-s border-border ps-2">
              {COLOR_SWATCHES.map((sw) => (
                <button
                  key={sw.name}
                  type="button"
                  onClick={() => setActiveColor(sw.color)}
                  style={{ backgroundColor: sw.color }}
                  className={`size-5 rounded-full border border-black/20 transition-transform ${
                    activeColor === sw.color ? "scale-125 ring-2 ring-primary" : "hover:scale-110"
                  }`}
                  title={sw.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Work Canvas Area */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-neutral-900 overflow-auto flex items-center justify-center p-4 select-none min-h-[420px]"
        >
          <div
            className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-700 max-w-full"
            style={{
              aspectRatio: `${imageSize.width} / ${imageSize.height}`,
              width: "100%",
              maxHeight: "68vh",
            }}
          >
            {/* Background Abstract Image */}
            <img
              src={baseImageUrl}
              alt="Base Abstract"
              className="absolute inset-0 size-full object-contain pointer-events-none"
            />

            {/* Interactive Vector Overlay SVG */}
            <svg
              viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
              className="absolute inset-0 size-full cursor-crosshair"
              onClick={handleCanvasClick}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {items.map((item) => {
                const isSelected = item.id === selectedId;

                if (item.type === "curved-arrow") {
                  const { start, control, end, barbType, color, strokeWidth } = item;
                  const dx = end.x - control.x;
                  const dy = end.y - control.y;
                  const angle = Math.atan2(dy, dx);
                  const headLen = strokeWidth * 4;

                  let headPath = "";
                  if (barbType === "double") {
                    const x1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
                    const y1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
                    const x2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
                    const y2 = end.y - headLen * Math.sin(angle + Math.PI / 6);
                    headPath = `M ${x1} ${y1} L ${end.x} ${end.y} L ${x2} ${y2}`;
                  } else {
                    const x1 = end.x - headLen * Math.cos(angle - Math.PI / 5);
                    const y1 = end.y - headLen * Math.sin(angle - Math.PI / 5);
                    headPath = `M ${x1} ${y1} L ${end.x} ${end.y}`;
                  }

                  return (
                    <g key={item.id} className="cursor-move">
                      {/* Selection glow */}
                      {isSelected && (
                        <path
                          d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth={strokeWidth + 6}
                          opacity="0.4"
                        />
                      )}

                      {/* Main quadratic curve path */}
                      <path
                        d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}
                      />
                      <path
                        d={headPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}
                      />

                      {/* Interactive Vertex Handles when selected */}
                      {isSelected && (
                        <>
                          <line
                            x1={start.x}
                            y1={start.y}
                            x2={control.x}
                            y2={control.y}
                            stroke="#38BDF8"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <line
                            x1={end.x}
                            y1={end.y}
                            x2={control.x}
                            y2={control.y}
                            stroke="#38BDF8"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />

                          {/* Start Handle */}
                          <circle
                            cx={start.x}
                            cy={start.y}
                            r="6"
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onPointerDown={(e) => handlePointerDown(e, item.id, "start")}
                          />
                          {/* Quadratic Control Point Handle */}
                          <circle
                            cx={control.x}
                            cy={control.y}
                            r="7"
                            fill="#F59E0B"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onPointerDown={(e) => handlePointerDown(e, item.id, "control")}
                          />
                          {/* End Arrowhead Handle */}
                          <circle
                            cx={end.x}
                            cy={end.y}
                            r="6"
                            fill="#FFFFFF"
                            stroke="#DC2626"
                            strokeWidth="2"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onPointerDown={(e) => handlePointerDown(e, item.id, "end")}
                          />
                        </>
                      )}
                    </g>
                  );
                } else if (item.type === "reaction-arrow") {
                  const {
                    start,
                    end,
                    arrowType,
                    topText,
                    bottomText,
                    color,
                    strokeWidth,
                    fontSize,
                  } = item;
                  const dx = end.x - start.x;
                  const dy = end.y - start.y;
                  const angle = Math.atan2(dy, dx);
                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2;
                  const headLen = strokeWidth * 3.5;

                  let arrowGraphic = null;
                  if (arrowType === "forward") {
                    const x1 = end.x - headLen * Math.cos(angle - Math.PI / 6);
                    const y1 = end.y - headLen * Math.sin(angle - Math.PI / 6);
                    const x2 = end.x - headLen * Math.cos(angle + Math.PI / 6);
                    const y2 = end.y - headLen * Math.sin(angle + Math.PI / 6);
                    arrowGraphic = (
                      <>
                        <line
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <path
                          d={`M ${x1} ${y1} L ${end.x} ${end.y} L ${x2} ${y2}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                      </>
                    );
                  } else if (arrowType === "equilibrium") {
                    arrowGraphic = (
                      <>
                        <line
                          x1={start.x}
                          y1={start.y - 4}
                          x2={end.x}
                          y2={end.y - 4}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <line
                          x1={start.x}
                          y1={start.y + 4}
                          x2={end.x}
                          y2={end.y + 4}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <path
                          d={`M ${end.x - headLen} ${end.y - 8} L ${end.x} ${end.y - 4}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <path
                          d={`M ${start.x + headLen} ${start.y + 8} L ${start.x} ${start.y + 4}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                      </>
                    );
                  } else if (arrowType === "retrosynthesis") {
                    arrowGraphic = (
                      <>
                        <line
                          x1={start.x}
                          y1={start.y - 3}
                          x2={end.x - headLen}
                          y2={end.y - 3}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <line
                          x1={start.x}
                          y1={start.y + 3}
                          x2={end.x - headLen}
                          y2={end.y + 3}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        <path
                          d={`M ${end.x - headLen} ${end.y - 8} L ${end.x} ${end.y} L ${end.x - headLen} ${end.y + 8}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                      </>
                    );
                  }

                  return (
                    <g key={item.id} className="cursor-move">
                      {isSelected && (
                        <rect
                          x={Math.min(start.x, end.x) - 15}
                          y={midY - 25}
                          width={Math.abs(end.x - start.x) + 30}
                          height={50}
                          fill="#38BDF8"
                          opacity="0.15"
                          rx="4"
                        />
                      )}

                      <g onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}>
                        {arrowGraphic}
                        {topText && (
                          <text
                            x={midX}
                            y={midY - 9}
                            fill={color}
                            fontSize={fontSize}
                            fontFamily="sans-serif"
                            fontWeight="600"
                            textAnchor="middle"
                          >
                            {topText}
                          </text>
                        )}
                        {bottomText && (
                          <text
                            x={midX}
                            y={midY + fontSize + 6}
                            fill={color}
                            fontSize={fontSize * 0.9}
                            fontFamily="sans-serif"
                            textAnchor="middle"
                          >
                            {bottomText}
                          </text>
                        )}
                      </g>

                      {isSelected && (
                        <>
                          <circle
                            cx={start.x}
                            cy={start.y}
                            r="6"
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2"
                            className="cursor-pointer"
                            onPointerDown={(e) => handlePointerDown(e, item.id, "start")}
                          />
                          <circle
                            cx={end.x}
                            cy={end.y}
                            r="6"
                            fill="#FFFFFF"
                            stroke="#DC2626"
                            strokeWidth="2"
                            className="cursor-pointer"
                            onPointerDown={(e) => handlePointerDown(e, item.id, "end")}
                          />
                        </>
                      )}
                    </g>
                  );
                } else if (item.type === "badge") {
                  const { x, y, title, subtitle, bgColor, textColor } = item;
                  const textLen = Math.max(title.length, (subtitle || "").length) * 8 + 24;
                  const height = subtitle ? 36 : 24;

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${x}, ${y})`}
                      className="cursor-move"
                      onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}
                    >
                      {isSelected && (
                        <rect
                          x="-3"
                          y="-3"
                          width={textLen + 6}
                          height={height + 6}
                          rx="8"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="2"
                        />
                      )}
                      <rect
                        x="0"
                        y="0"
                        width={textLen}
                        height={height}
                        rx="6"
                        fill={bgColor}
                        stroke={textColor}
                        strokeWidth="1.2"
                      />
                      <text
                        x={textLen / 2}
                        y={subtitle ? 15 : 16}
                        fill={textColor}
                        fontSize="12"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {title}
                      </text>
                      {subtitle && (
                        <text
                          x={textLen / 2}
                          y="29"
                          fill={textColor}
                          fontSize="10"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          opacity="0.85"
                        >
                          {subtitle}
                        </text>
                      )}
                    </g>
                  );
                } else if (item.type === "orbital-marker") {
                  const { x, y, markerType, size, color } = item;
                  return (
                    <g
                      key={item.id}
                      className="cursor-move"
                      onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={size + 5}
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="2"
                        />
                      )}
                      {markerType === "lone-pair" && (
                        <>
                          <circle cx={x - size * 0.6} cy={y} r={size * 0.35} fill={color} />
                          <circle cx={x + size * 0.6} cy={y} r={size * 0.35} fill={color} />
                        </>
                      )}
                      {markerType === "radical-dot" && (
                        <circle cx={x} cy={y} r={size * 0.4} fill={color} />
                      )}
                      {markerType === "charge-plus" && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r={size * 0.7}
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                          />
                          <line
                            x1={x - size * 0.4}
                            y1={y}
                            x2={x + size * 0.4}
                            y2={y}
                            stroke={color}
                            strokeWidth="1.5"
                          />
                          <line
                            x1={x}
                            y1={y - size * 0.4}
                            x2={x}
                            y2={y + size * 0.4}
                            stroke={color}
                            strokeWidth="1.5"
                          />
                        </>
                      )}
                      {markerType === "charge-minus" && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r={size * 0.7}
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                          />
                          <line
                            x1={x - size * 0.4}
                            y1={y}
                            x2={x + size * 0.4}
                            y2={y}
                            stroke={color}
                            strokeWidth="1.5"
                          />
                        </>
                      )}
                      {markerType === "homo" && (
                        <rect
                          x={x - size}
                          y={y - size * 0.6}
                          width={size * 2}
                          height={size * 1.2}
                          rx="3"
                          fill="#2563EB"
                        />
                      )}
                      {markerType === "lumo" && (
                        <rect
                          x={x - size}
                          y={y - size * 0.6}
                          width={size * 2}
                          height={size * 1.2}
                          rx="3"
                          fill="#DC2626"
                        />
                      )}
                    </g>
                  );
                } else if (item.type === "text") {
                  return (
                    <text
                      key={item.id}
                      x={item.x}
                      y={item.y}
                      fill={item.color}
                      fontSize={item.fontSize}
                      fontFamily={item.fontFamily}
                      fontWeight={item.fontWeight}
                      className="cursor-move"
                      onPointerDown={(e) => handlePointerDown(e, item.id, "whole")}
                    >
                      {item.text}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </div>

        {/* Selected Item Properties Bar */}
        {selectedItem && (
          <div className="p-3 border-t border-border/60 bg-muted/50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-foreground">
                {isRtl ? "تنظیمات لایه انتخابی:" : "Selected Item:"}
              </span>

              {selectedItem.type === "reaction-arrow" && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedItem.topText}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItem.id
                            ? { ...(i as ReactionArrowItem), topText: txt }
                            : i,
                        ),
                      );
                    }}
                    placeholder="Top Text (Catalyst)"
                    className="px-2 py-1 rounded border border-border bg-card text-xs font-mono w-44"
                  />
                  <input
                    type="text"
                    value={selectedItem.bottomText}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItem.id
                            ? { ...(i as ReactionArrowItem), bottomText: txt }
                            : i,
                        ),
                      );
                    }}
                    placeholder="Bottom Text (Solvent, Temp)"
                    className="px-2 py-1 rounded border border-border bg-card text-xs font-mono w-44"
                  />
                </div>
              )}

              {selectedItem.type === "badge" && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedItem.title}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItem.id ? { ...(i as CalloutBadgeItem), title: txt } : i,
                        ),
                      );
                    }}
                    placeholder="Badge Title (e.g. 92% Yield)"
                    className="px-2 py-1 rounded border border-border bg-card text-xs font-mono w-36"
                  />
                  <input
                    type="text"
                    value={selectedItem.subtitle || ""}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItem.id
                            ? { ...(i as CalloutBadgeItem), subtitle: txt }
                            : i,
                        ),
                      );
                    }}
                    placeholder="Subtitle (e.g. 96% ee)"
                    className="px-2 py-1 rounded border border-border bg-card text-xs font-mono w-36"
                  />
                </div>
              )}

              {selectedItem.type === "curved-arrow" && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{isRtl ? "نوع نوک فلش:" : "Barb:"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === selectedItem.id
                            ? {
                                ...(i as CurvedMechanismArrowItem),
                                barbType:
                                  (i as CurvedMechanismArrowItem).barbType === "double"
                                    ? "single"
                                    : "double",
                              }
                            : i,
                        ),
                      );
                    }}
                    className="px-2 py-1 rounded bg-card border border-border text-xs font-bold"
                  >
                    {selectedItem.barbType === "double" ? "2e⁻ Double Barb" : "1e⁻ Fish Hook"}
                  </button>
                </div>
              )}

              {/* Stroke / Size */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{isRtl ? "ضخامت:" : "Thickness:"}</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={selectedItem.strokeWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setItems((prev) =>
                      prev.map((i) => (i.id === selectedItem.id ? { ...i, strokeWidth: val } : i)),
                    );
                  }}
                  className="w-20"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 text-xs"
            >
              <Trash2 className="size-3 mr-1" />
              <span>{isRtl ? "حذف این لایه" : "Delete Item"}</span>
            </Button>
          </div>
        )}

        {/* Bottom Actions Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-3.5 text-primary" />
            <span>
              {isRtl
                ? "برای جابجایی دستگیره‌های زرد و آبی فلش‌ها، روی هر لایه کلیک کنید."
                : "Click any arrow to drag its control vertices and curve curvature."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3.5" />
              <span>{isRtl ? "دانلود وکتور SVG" : "Export Vector SVG"}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleMergeAndSave}
              className="h-8 text-xs gap-1.5 bg-gradient-to-r from-primary to-cyan-600 text-white font-bold shadow-md hover:opacity-95"
            >
              <Check className="size-3.5" />
              <span>{isRtl ? "ادغام در تصویر ابسترکت" : "Merge Overlays into Abstract"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
