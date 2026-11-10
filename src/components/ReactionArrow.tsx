import React from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Compact Plump Looped Reaction Arrow
 * - Sized to sit cleanly in the gap between the two boxes, gently touching their borders
 *   without intruding into the main content area of either box.
 * - Plump, full-bodied tail and loop.
 */

export function ReactionArrow({ variant = "all" }: { variant?: "all" | "desktop" | "mobile" }) {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <>
      {variant !== "mobile" && <HorizontalExactArrow isRtl={isRtl} />}
      {variant !== "desktop" && <VerticalExactArrow />}
    </>
  );
}

function HorizontalExactArrow({ isRtl }: { isRtl: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:flex items-center justify-center w-[4rem] xl:w-[4.65rem] h-12 xl:h-15 select-none"
      title={
        isRtl
          ? "تبدیل واکنش به تصویر گرافیکال ابسترکت"
          : "Reactants → Graphical Abstract Transformation"
      }
    >
      {/* Subtle Ambient Cyan Glow in the gap */}
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-8 rounded-full bg-[#00AEEF]/15 blur-md pointer-events-none" />

      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible filter drop-shadow-[0_3px_7px_rgba(0,174,239,0.45)] transition-transform duration-500 ${
          isRtl ? "scale-x-[-1]" : ""
        }`}
      >
        <defs>
          <linearGradient id="exactCyanBorder" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00AEEF" />
            <stop offset="45%" stopColor="#0284C7" />
            <stop offset="70%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="exactCoreFill" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0F7FA" stopOpacity="0.96" />
            <stop offset="50%" stopColor="#F0FDFA" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          <filter id="exactCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.5"
              floodColor="#00AEEF"
              floodOpacity="0.7"
            />
          </filter>
        </defs>

        <g filter="url(#exactCyanGlow)">
          {/* Plump Tapered Tail Base */}
          <path
            d="M 22 158 C 34 140, 50 122, 72 110 L 80 125 C 58 138, 42 150, 28 164 Z"
            fill="url(#exactCoreFill)"
            stroke="url(#exactCyanBorder)"
            strokeWidth="4.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Outer Plump Cyan Border */}
          <path
            d="
              M 30 150
              C 48 132, 78 108, 108 96
              C 120 91, 134 92, 142 98
              C 156 108, 160 125, 150 140
              C 140 154, 122 155, 108 143
              C 97 132, 100 116, 114 104
              C 134 88, 172 70, 218 64
            "
            fill="none"
            stroke="url(#exactCyanBorder)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Plump Light Core */}
          <path
            d="
              M 30 150
              C 48 132, 78 108, 108 96
              C 120 91, 134 92, 142 98
              C 156 108, 160 125, 150 140
              C 140 154, 122 155, 108 143
              C 97 132, 100 116, 114 104
              C 134 88, 172 70, 218 64
            "
            fill="none"
            stroke="url(#exactCoreFill)"
            strokeWidth="9.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Plump Stylized Barbed Arrowhead */}
          <polygon
            points="212,64 202,38 258,64 200,94 211,67"
            fill="url(#exactCoreFill)"
            stroke="url(#exactCyanBorder)"
            strokeWidth="4.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Inner Gloss Highlights */}
          <path
            d="M 48 130 C 70 110, 95 98, 115 95"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M 146 84 C 172 73, 196 67, 214 64"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}

function VerticalExactArrow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative flex flex-col items-center justify-center lg:hidden select-none -my-2.5 py-1 z-30"
    >
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 160 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-11 filter drop-shadow-[0_3px_7px_rgba(0,174,239,0.45)]"
        >
          <defs>
            <linearGradient id="vExactCyanBorder" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00AEEF" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="vExactCoreFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F7FA" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Outer Plump Cyan Stroke */}
          <path
            d="
              M 40 25
              C 58 43, 82 73, 94 103
              C 99 115, 98 129, 92 137
              C 82 151, 65 155, 50 145
              C 36 135, 35 117, 47 103
              C 58 92, 74 95, 86 109
              C 102 129, 120 167, 126 196
            "
            fill="none"
            stroke="url(#vExactCyanBorder)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Plump Light Core */}
          <path
            d="
              M 40 25
              C 58 43, 82 73, 94 103
              C 99 115, 98 129, 92 137
              C 82 151, 65 155, 50 145
              C 36 135, 35 117, 47 103
              C 58 92, 74 95, 86 109
              C 102 129, 120 167, 126 196
            "
            fill="none"
            stroke="url(#vExactCoreFill)"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Plump Arrowhead Pointing Down */}
          <polygon
            points="126,191 102,182 126,218 152,180 127,189"
            fill="url(#vExactCoreFill)"
            stroke="url(#vExactCyanBorder)"
            strokeWidth="4.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
