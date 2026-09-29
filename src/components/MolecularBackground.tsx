/**
 * Scientific laboratory coordinate substrate.
 * Provides high-precision technical calibration markings (coordinate crosshairs,
 * wavelength / metric calibration scale, and energetic quantum diffraction fields)
 * behind the 3D molecular canvas and foreground cards.
 */
export function MolecularBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
    >
      {/* Precision laboratory coordinate grid & sub-resolution lattice */}
      <svg
        className="size-full opacity-[0.045] dark:opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="scientific-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            {/* Fine coordinate lines */}
            <path d="M 72 0 L 0 0 0 72" fill="none" stroke="currentColor" strokeWidth="0.75" />
            {/* Center tick crosshair */}
            <path
              d="M 34 36 L 38 36 M 36 34 L 36 38"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            {/* Sub-grid micro-dots for quantum lattice feel */}
            <circle cx="18" cy="18" r="0.8" fill="currentColor" opacity="0.6" />
            <circle cx="54" cy="18" r="0.8" fill="currentColor" opacity="0.6" />
            <circle cx="18" cy="54" r="0.8" fill="currentColor" opacity="0.6" />
            <circle cx="54" cy="54" r="0.8" fill="currentColor" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scientific-grid)" className="text-foreground" />
      </svg>

      {/* High-Energy Multi-Color Scientific Atmospheric Spectrometry Halos */}
      {/* 1. Laser Cyan (#06B6D4) & Indigo (#4F46E5) Diffraction Field (Top-Left) */}
      <div className="absolute -top-36 -left-28 size-[36rem] rounded-full bg-gradient-to-br from-[#06B6D4]/18 via-[#4F46E5]/12 to-transparent blur-[95px] pointer-events-none" />

      {/* 2. Emerald Green (#10B981) Science Fusion Glow (Top-Center) */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-[32rem] rounded-full bg-gradient-to-b from-[#10B981]/14 via-transparent to-transparent blur-[100px] pointer-events-none" />

      {/* 3. Energetic Solar Plasma Amber (#F59E0B) Reaction Spark (Center-Right) */}
      <div className="absolute top-1/4 -right-28 size-[34rem] rounded-full bg-gradient-to-bl from-[#F59E0B]/16 via-[#EC4899]/10 to-transparent blur-[105px] pointer-events-none" />

      {/* 4. Vivid Magenta (#EC4899) & Violet (#7C3AED) Energy Burst (Bottom-Left) */}
      <div className="absolute -bottom-28 left-1/6 size-[32rem] rounded-full bg-gradient-to-tr from-[#EC4899]/14 via-[#7C3AED]/12 to-transparent blur-[110px] pointer-events-none" />
    </div>
  );
}
