/**
 * Laboratory Flask (Beaker/Erlenmeyer) Logo
 *
 * Aesthetic Harmony:
 * - Badge Background: High-energy silky pastel candy rose to lilac gradient (#FF758C -> #FF7EB3 -> #C084FC)
 * - Liquid Solution: Luminous Electric Azure / Sapphire Jewel Blue (#67E8F9 -> #38BDF8 -> #2563EB -> #1D4ED8)
 * - Rising Vapor Bubbles: 4 uniquely colored pastel spheres (Lemon, Mint, Lavender, Peach)
 * - Glass Finish: High-clarity specular reflections and star sparkle
 */
export function FlaskLogo({ className = "size-10" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex ${className} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF758C] via-[#FF7EB3] to-[#C084FC] p-1.5 shadow-[0_6px_22px_-3px_rgba(255,117,140,0.5),0_2px_8px_-1px_rgba(192,132,252,0.35)] ring-1 ring-white/70 transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_8px_26px_-2px_rgba(255,117,140,0.7),0_4px_14px_-1px_rgba(192,132,252,0.5)]`}
    >
      {/* Specular glass gloss overlay across top half of badge */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/45 to-transparent" />

      {/* Floating luminous pastel vapor bubbles rising from the flask neck in 4 distinct pastel colors */}
      <span className="pointer-events-none absolute -top-3.5 left-1/2 h-5 w-7 -translate-x-1/2 overflow-visible">
        <span className="bubble bubble-pastel-yellow" />
        <span className="bubble bubble-pastel-mint" />
        <span className="bubble bubble-pastel-lavender" />
        <span className="bubble bubble-pastel-peach" />
      </span>

      {/* High-Luster Vector Glass Flask SVG with crisp drop-shadow for contrast */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full overflow-visible select-none drop-shadow-[0_2px_5px_rgba(131,24,67,0.35)]"
        aria-hidden="true"
      >
        <defs>
          {/* Reaction Liquid Fluid: Radiant Luminous Sapphire-Azure Jewel Blue */}
          <linearGradient
            id="flask-azure-fluid"
            x1="8"
            y1="18"
            x2="28"
            y2="33"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* Meniscus surface shimmer */}
          <linearGradient
            id="flask-azure-meniscus"
            x1="11"
            y1="20.5"
            x2="25"
            y2="20.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
          </linearGradient>

          {/* Glass Specular Glare along slanted wall */}
          <linearGradient
            id="flask-azure-specular"
            x1="16"
            y1="14"
            x2="8"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Bottom caustic glow in luminous azure blue */}
          <radialGradient
            id="flask-azure-caustic"
            cx="18"
            cy="30"
            r="10"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Flask Glass Body Background subtle transparent tint */}
        <path
          d="M 15 5 L 21 5 L 21 13 L 29.5 28.5 C 30.5 30.2 29.3 32 27.5 32 L 8.5 32 C 6.7 32 5.5 30.2 6.5 28.5 L 15 13 Z"
          fill="rgba(255, 255, 255, 0.16)"
        />

        {/* Liquid Bottom Caustic Glow */}
        <ellipse cx="18" cy="30" rx="9" ry="2.2" fill="url(#flask-azure-caustic)" />

        {/* Chemical Reaction Liquid Fill (Vibrant Luminous Azure Blue) */}
        <path
          d="M 11.2 20.5 Q 14.5 19.5 18 20.5 T 24.8 20.5 L 27.5 28.5 C 28.5 30.2 27.3 32 25.5 32 L 10.5 32 C 8.7 32 7.5 30.2 8.5 28.5 Z"
          fill="url(#flask-azure-fluid)"
        />

        {/* Liquid Surface Meniscus line */}
        <path
          d="M 11.2 20.5 Q 14.5 19.5 18 20.5 T 24.8 20.5"
          stroke="url(#flask-azure-meniscus)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Internal Effervescent Multi-colored Micro-Bubbles */}
        <circle cx="14" cy="26" r="1.1" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="21" cy="24.5" r="1.3" fill="#FEF08A" fillOpacity="0.95" />
        <circle cx="17.5" cy="28.5" r="0.9" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="23" cy="28" r="0.8" fill="#BAE6FD" fillOpacity="0.95" />

        {/* Measurement Graduation Lines (Ticks on left glass wall) */}
        <line
          x1="12"
          y1="22"
          x2="14.5"
          y2="22"
          stroke="#FFFFFF"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <line
          x1="10.2"
          y1="25"
          x2="13.2"
          y2="25"
          stroke="#FFFFFF"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <line
          x1="8.5"
          y1="28"
          x2="12"
          y2="28"
          stroke="#FFFFFF"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        {/* Outer Glass Contour & Lip */}
        {/* Flask Rim / Lip */}
        <rect x="13.5" y="3.5" width="9" height="2.2" rx="1.1" fill="#FFFFFF" fillOpacity="0.95" />

        {/* Glass Outer Wall Line */}
        <path
          d="M 15 5 L 15 13 L 6.5 28.5 C 5.5 30.2 6.7 32 8.5 32 L 27.5 32 C 29.3 32 30.5 30.2 29.5 28.5 L 21 13 L 21 5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.95"
        />

        {/* Specular Light Reflection Streak along Left Slanted Wall */}
        <path
          d="M 15.5 14.5 L 9.2 27"
          stroke="url(#flask-azure-specular)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Prismatic Sparkle Star at Flask Lip */}
        <path
          d="M 22.5 4.5 Q 23.5 4.5 23.5 3.5 Q 23.5 4.5 24.5 4.5 Q 23.5 4.5 23.5 5.5 Q 23.5 4.5 22.5 4.5 Z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
}
