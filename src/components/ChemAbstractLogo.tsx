/**
 * Multi-Color Scientific Molecular Ring Logo
 * Matches the ChemAbstract brand identity from the design system:
 * Six distinct energetic atomic nodes connected in an aromatic ring
 * with satellite functional groups:
 * - Indigo (#4F46E5)
 * - Laser Cyan (#06B6D4)
 * - Emerald Green (#10B981)
 * - Solar Amber (#F59E0B)
 * - Vivid Magenta (#EC4899)
 * - Quantum Violet (#8B5CF6)
 */
export function ChemAbstractLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none overflow-visible`}
      aria-hidden="true"
    >
      <defs>
        {/* Soft colorful glow filters for nodes */}
        <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
        </filter>
        <linearGradient
          id="bond-cyan-indigo"
          x1="15"
          y1="16"
          x2="24"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient
          id="bond-indigo-violet"
          x1="24"
          y1="10"
          x2="33"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient
          id="bond-violet-magenta"
          x1="33"
          y1="16"
          x2="33"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient
          id="bond-magenta-amber"
          x1="33"
          y1="28"
          x2="24"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient
          id="bond-amber-emerald"
          x1="24"
          y1="34"
          x2="15"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <linearGradient
          id="bond-emerald-cyan"
          x1="15"
          y1="28"
          x2="15"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Hexagonal molecular ring bonds */}
      <line
        x1="15"
        y1="16"
        x2="24"
        y2="10"
        stroke="url(#bond-cyan-indigo)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="10"
        x2="33"
        y2="16"
        stroke="url(#bond-indigo-violet)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="16"
        x2="33"
        y2="28"
        stroke="url(#bond-violet-magenta)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="28"
        x2="24"
        y2="34"
        stroke="url(#bond-magenta-amber)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="34"
        x2="15"
        y2="28"
        stroke="url(#bond-amber-emerald)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="28"
        x2="15"
        y2="16"
        stroke="url(#bond-emerald-cyan)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Outer branch bonds */}
      <line
        x1="15"
        y1="16"
        x2="8"
        y2="12"
        stroke="#06B6D4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="28"
        x2="40"
        y2="32"
        stroke="#EC4899"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="34"
        x2="24"
        y2="42"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Satellite outer atoms */}
      <circle cx="8" cy="12" r="3.2" fill="#06B6D4" />
      <circle cx="40" cy="32" r="3" fill="#EC4899" />
      <circle cx="24" cy="42" r="2.8" fill="#F59E0B" />

      {/* Ring Vertices (Atoms) with distinct spectral colors */}
      {/* Top: Indigo */}
      <circle cx="24" cy="10" r="3.8" fill="#4F46E5" />
      {/* Top-Right: Violet */}
      <circle cx="33" cy="16" r="3.6" fill="#8B5CF6" />
      {/* Bottom-Right: Magenta */}
      <circle cx="33" cy="28" r="3.8" fill="#EC4899" />
      {/* Bottom: Amber */}
      <circle cx="24" cy="34" r="3.6" fill="#F59E0B" />
      {/* Bottom-Left: Emerald */}
      <circle cx="15" cy="28" r="3.8" fill="#10B981" />
      {/* Top-Left: Laser Cyan */}
      <circle cx="15" cy="16" r="3.6" fill="#06B6D4" />
    </svg>
  );
}
