import React, { useState, useRef, useEffect } from "react";
import {
  BoxSelect,
  Eraser,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Wand2,
  X,
  CornerDownRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type EditingSuiteTool = "pencil" | "eraser" | "selection";

export interface EditingSuiteProps {
  activeTool?: EditingSuiteTool | string | undefined;
  onSelectTool: (tool: EditingSuiteTool) => void;
  onClear: () => void;
  onOpenFullSuite?: (() => void) | undefined;
  onOpenMechanism?: (() => void) | undefined;
  color?: string | undefined;
  className?: string | undefined;
}

/**
 * Compact Collapsible 'Editing Suite' Plugin Widget
 *
 * Renders as a small, unobtrusive corner plugin button so the user can view the
 * entire image without obstruction. Clicking the button expands a compact popover
 * menu to pick a tool.
 */
export function EditingSuite({
  activeTool = "pencil",
  onSelectTool,
  onClear,
  onOpenFullSuite,
  onOpenMechanism,
  color,
  className = "",
}: EditingSuiteProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`absolute bottom-2.5 right-2.5 z-30 flex flex-col items-end select-none ${className}`}
    >
      {/* Popover Tool Menu — only visible when user clicks the compact plugin button */}
      {open && (
        <div
          role="toolbar"
          aria-label={isRtl ? "ابزارهای ویرایش" : "Editing Tools"}
          className="mb-2 flex items-center gap-1 rounded-xl border border-border/80 bg-background/95 dark:bg-neutral-900/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* 1. Pencil */}
          <button
            type="button"
            onClick={() => {
              onSelectTool("pencil");
              setOpen(false);
            }}
            title={isRtl ? "مداد (Pencil)" : "Pencil"}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
              activeTool === "pencil"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <Pencil className="size-3.5" />
            <span>{isRtl ? "مداد" : "Pencil"}</span>
          </button>

          {/* 2. Eraser */}
          <button
            type="button"
            onClick={() => {
              onSelectTool("eraser");
              setOpen(false);
            }}
            title={isRtl ? "پاک‌کن (Eraser)" : "Eraser"}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
              activeTool === "eraser"
                ? "bg-[#F43F5E] text-white shadow-xs"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <Eraser className="size-3.5" />
            <span>{isRtl ? "پاک‌کن" : "Eraser"}</span>
          </button>

          {/* 3. Box Selection / Whiteout */}
          <button
            type="button"
            onClick={() => {
              onSelectTool("selection");
              setOpen(false);
            }}
            title={isRtl ? "حذف کادری (Selection)" : "Box Erase"}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
              activeTool === "selection"
                ? "bg-[#06B6D4] text-white shadow-xs"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <BoxSelect className="size-3.5" />
            <span>{isRtl ? "کادر حذف" : "Select"}</span>
          </button>

          <div className="mx-0.5 h-4 w-px bg-border" />

          {/* 4. Clear */}
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            title={isRtl ? "پاکسازی تغییرات" : "Clear Edits"}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>

          {/* 5. Mechanism Overlay */}
          {onOpenMechanism && (
            <button
              type="button"
              onClick={() => {
                onOpenMechanism();
                setOpen(false);
              }}
              title={isRtl ? "فلش‌های مکانیزم" : "Mechanism Arrows"}
              className="flex items-center gap-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 px-2 py-1.5 text-[11px] font-bold transition-colors"
            >
              <CornerDownRight className="size-3" />
              <span>{isRtl ? "مکانیزم" : "Mechanism"}</span>
            </button>
          )}

          {/* 6. Full Suite */}
          {onOpenFullSuite && (
            <button
              type="button"
              onClick={() => {
                onOpenFullSuite();
                setOpen(false);
              }}
              title={isRtl ? "همه ابزارها" : "All Tools"}
              className="flex items-center gap-1 rounded-lg bg-[#4F46E5]/15 hover:bg-[#4F46E5]/25 text-[#4F46E5] dark:text-[#818CF8] px-2 py-1.5 text-[11px] font-bold transition-colors"
            >
              <SlidersHorizontal className="size-3" />
              <span>{isRtl ? "همه ابزارها" : "More"}</span>
            </button>
          )}
        </div>
      )}

      {/* Compact Plugin Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={isRtl ? "افزونه ابزارهای ویرایش" : "Editing Tools Plugin"}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-md backdrop-blur-md transition-all ${
          open
            ? "border-[#4F46E5] bg-[#4F46E5] text-white"
            : "border-border/80 bg-background/85 hover:bg-background text-foreground hover:scale-105"
        }`}
      >
        {open ? (
          <X className="size-3.5" />
        ) : (
          <>
            <Wand2 className="size-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
            {color && (
              <span
                className="size-2.5 rounded-full border border-white/60"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="text-[11px]">{isRtl ? "ابزار ادیت" : "Edit Tools"}</span>
          </>
        )}
      </button>
    </div>
  );
}
