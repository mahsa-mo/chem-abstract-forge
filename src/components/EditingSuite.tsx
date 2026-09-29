import React from "react";
import { BoxSelect, Eraser, Pencil, Trash2, SlidersHorizontal, Palette } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type EditingSuiteTool = "pencil" | "eraser" | "selection";

export interface EditingSuiteProps {
  activeTool?: EditingSuiteTool | string | undefined;
  onSelectTool: (tool: EditingSuiteTool) => void;
  onClear: () => void;
  onOpenFullSuite?: () => void;
  color?: string;
  className?: string;
}

/**
 * Vertical 'Editing Suite' Toolbar
 *
 * Designed with absolute positioning aligned to the right side of the image display area
 * inside a high-luster glassmorphism container.
 */
export function EditingSuite({
  activeTool = "pencil",
  onSelectTool,
  onClear,
  onOpenFullSuite,
  color,
  className = "",
}: EditingSuiteProps) {
  const { locale } = useI18n();
  const isRtl = locale === "fa";

  return (
    <div
      role="toolbar"
      aria-label={isRtl ? "جعبه ابزار ویرایش" : "Editing Suite"}
      className={`absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 rounded-2xl border border-white/40 dark:border-white/15 bg-white/75 dark:bg-neutral-900/80 backdrop-blur-xl p-1.5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 select-none ${className}`}
    >
      {/* Subtle glass reflection highlight on top */}
      <span className="pointer-events-none absolute inset-x-2 top-0.5 h-3 rounded-t-xl bg-gradient-to-b from-white/60 to-transparent" />

      {/* 1. Pencil Tool (مداد) */}
      <button
        type="button"
        onClick={() => onSelectTool("pencil")}
        title={isRtl ? "مداد (Pencil)" : "Pencil Tool"}
        aria-label="Pencil Tool"
        aria-pressed={activeTool === "pencil"}
        className={`group relative flex size-9 items-center justify-center rounded-xl transition-all ${
          activeTool === "pencil"
            ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-500/30 scale-105"
            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 hover:text-foreground"
        }`}
      >
        <Pencil className="size-4 transition-transform group-hover:scale-110" />
        {/* Tooltip */}
        <span
          className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-neutral-900/90 dark:bg-neutral-100/90 px-2 py-1 text-[11px] font-medium text-white dark:text-neutral-900 shadow-md group-hover:block z-40`}
        >
          {isRtl ? "مداد" : "Pencil"}
        </span>
      </button>

      {/* 2. Eraser Tool (پاک‌کن) */}
      <button
        type="button"
        onClick={() => onSelectTool("eraser")}
        title={isRtl ? "پاک‌کن (Eraser)" : "Eraser Tool"}
        aria-label="Eraser Tool"
        aria-pressed={activeTool === "eraser"}
        className={`group relative flex size-9 items-center justify-center rounded-xl transition-all ${
          activeTool === "eraser"
            ? "bg-[#F43F5E] text-white shadow-md shadow-rose-500/30 scale-105"
            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 hover:text-foreground"
        }`}
      >
        <Eraser className="size-4 transition-transform group-hover:scale-110" />
        {/* Tooltip */}
        <span
          className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-neutral-900/90 dark:bg-neutral-100/90 px-2 py-1 text-[11px] font-medium text-white dark:text-neutral-900 shadow-md group-hover:block z-40`}
        >
          {isRtl ? "پاک‌کن" : "Eraser"}
        </span>
      </button>

      {/* 3. Selection / Box Select Tool (ابزار انتخاب و حذف کادری) */}
      <button
        type="button"
        onClick={() => onSelectTool("selection")}
        title={isRtl ? "ابزار انتخاب و کادر (Selection)" : "Selection Tool"}
        aria-label="Selection Tool"
        aria-pressed={activeTool === "selection"}
        className={`group relative flex size-9 items-center justify-center rounded-xl transition-all ${
          activeTool === "selection"
            ? "bg-[#06B6D4] text-white shadow-md shadow-cyan-500/30 scale-105"
            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 hover:text-foreground"
        }`}
      >
        <BoxSelect className="size-4 transition-transform group-hover:scale-110" />
        {/* Tooltip */}
        <span
          className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-neutral-900/90 dark:bg-neutral-100/90 px-2 py-1 text-[11px] font-medium text-white dark:text-neutral-900 shadow-md group-hover:block z-40`}
        >
          {isRtl ? "انتخاب و کادر" : "Selection"}
        </span>
      </button>

      {/* Divider */}
      <div className="my-0.5 h-px w-6 bg-neutral-300/80 dark:bg-neutral-700/80" />

      {/* 4. Clear Tool (پاکسازی ویرایش‌ها) */}
      <button
        type="button"
        onClick={onClear}
        title={isRtl ? "پاکسازی تغییرات (Clear)" : "Clear Edits"}
        aria-label="Clear Tool"
        className="group relative flex size-9 items-center justify-center rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 transition-all active:scale-95"
      >
        <Trash2 className="size-4 transition-transform group-hover:scale-110" />
        {/* Tooltip */}
        <span
          className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-neutral-900/90 dark:bg-neutral-100/90 px-2 py-1 text-[11px] font-medium text-white dark:text-neutral-900 shadow-md group-hover:block z-40`}
        >
          {isRtl ? "پاکسازی کل" : "Clear"}
        </span>
      </button>

      {/* Optional: Quick palette/color or expand studio */}
      {onOpenFullSuite && (
        <>
          <div className="my-0.5 h-px w-6 bg-neutral-300/80 dark:bg-neutral-700/80" />
          <button
            type="button"
            onClick={onOpenFullSuite}
            title={isRtl ? "همه نوشت‌افزارها و ابزارها" : "Full Editing Suite"}
            aria-label="Full Editing Suite"
            className="group relative flex size-9 items-center justify-center rounded-xl text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#4F46E5]/15 transition-all"
          >
            {color ? (
              <span
                className="size-3.5 rounded-full border border-white/60 shadow-2xs"
                style={{ backgroundColor: color }}
              />
            ) : (
              <SlidersHorizontal className="size-3.5 transition-transform group-hover:rotate-45" />
            )}
            <span
              className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-neutral-900/90 dark:bg-neutral-100/90 px-2 py-1 text-[11px] font-medium text-white dark:text-neutral-900 shadow-md group-hover:block z-40`}
            >
              {isRtl ? "تنظیمات پیشرفته" : "Full Suite"}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
