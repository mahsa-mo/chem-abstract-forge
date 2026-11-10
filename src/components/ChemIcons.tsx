import React from "react";

/**
 * High-Precision Scientific & Laboratory Vector Icons for ChemAbstract.
 * Engineered with multi-stop gradients, 3D CPK radial shading, specular glass reflections,
 * and authentic IUPAC / laboratory geometry.
 */

export function IconAbstractStudio({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="studio-board-bg"
          x1="3"
          y1="6"
          x2="37"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient
          id="studio-board-stroke"
          x1="3"
          y1="6"
          x2="37"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient
          id="studio-flask-liquid"
          x1="25"
          y1="19"
          x2="33"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient
          id="studio-ring-fill"
          x1="7"
          y1="13"
          x2="16"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Outer Graphical Abstract 16:9 Artboard Frame */}
      <rect
        x="3"
        y="6.5"
        width="34"
        height="27"
        rx="5.5"
        fill="url(#studio-board-bg)"
        stroke="url(#studio-board-stroke)"
        strokeWidth="1.6"
      />

      {/* Precision Corner Crop / Journal Registration Marks */}
      <path
        d="M6.5 11.5V9.5H8.5M31.5 9.5H33.5V11.5M6.5 28.5V30.5H8.5M31.5 30.5H33.5V28.5"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Subtle Internal Divider Grid Line */}
      <line
        x1="20"
        y1="9"
        x2="20"
        y2="31"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Left Side: Reactant Aromatic Benzene Ring with Conjugated Double Bonds */}
      <polygon
        points="11.5,13 15.8,15.5 15.8,20.5 11.5,23 7.2,20.5 7.2,15.5"
        fill="url(#studio-ring-fill)"
        stroke="#06B6D4"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="18" r="2.4" stroke="#06B6D4" strokeWidth="1.15" strokeOpacity="0.85" />
      {/* Substituent Bond & Atom Node */}
      <line
        x1="11.5"
        y1="13"
        x2="11.5"
        y2="10.8"
        stroke="#06B6D4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="10.5" r="1.2" fill="#22D3EE" />
      <circle cx="7.2" cy="20.5" r="1.1" fill="#38BDF8" />

      {/* Center: Catalytic Reaction Trajectory Arc & Arrowhead */}
      <path
        d="M17.2 16.5C19.2 13.8 21.8 13.8 23.8 16.2"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M22.2 16.4L24.1 16.5L23.7 14.6"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Catalyst Sparkle Above Reaction Arrow */}
      <path
        d="M20.5 10.2L21 11.5L22.3 12L21 12.5L20.5 13.8L20 12.5L18.7 12L20 11.5L20.5 10.2Z"
        fill="#FBBF24"
      />

      {/* Right Side: Precision Conical Flask with Luminous Liquid */}
      <path
        d="M27.3 18.8Q29 18.2 30.7 18.8L32.4 23.6C32.8 24.7 32 25.8 30.8 25.8H27.2C26 25.8 25.2 24.7 25.6 23.6L27.3 18.8Z"
        fill="url(#studio-flask-liquid)"
      />
      <path
        d="M27.3 13.5H30.7M28.1 13.5V16.8L25.4 23.5C24.9 24.7 25.8 26 27.1 26H30.9C32.2 26 33.1 24.7 32.6 23.5L29.9 16.8V13.5"
        stroke="#EC4899"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Specular Reflection on Flask */}
      <path
        d="M27.8 18L26.5 23"
        stroke="#FFFFFF"
        strokeOpacity="0.75"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Bottom Data Bar Caption Simulation inside Abstract */}
      <line
        x1="8"
        y1="28"
        x2="17"
        y2="28"
        stroke="#06B6D4"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="23"
        y1="28"
        x2="31"
        y2="28"
        stroke="#EC4899"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconStructureDrawer({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="drawer-ring-grad"
          x1="6"
          y1="9"
          x2="25"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient
          id="drawer-nib-grad"
          x1="24"
          y1="20"
          x2="36"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <radialGradient id="atom-oxygen" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>
        <radialGradient id="atom-nitrogen" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </radialGradient>
      </defs>

      {/* Primary Kekulé Benzene Hexagon */}
      <polygon
        points="15.5,8.5 23.5,13.1 23.5,22.4 15.5,27 7.5,22.4 7.5,13.1"
        fill="url(#drawer-ring-grad)"
        stroke="#F43F5E"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Crisp Conjugated Inner Kekulé Double Bonds */}
      <line
        x1="15.5"
        y1="11.3"
        x2="21.1"
        y2="14.5"
        stroke="#F43F5E"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="21.1"
        y1="21"
        x2="15.5"
        y2="24.2"
        stroke="#F43F5E"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="9.9"
        y1="21"
        x2="9.9"
        y2="14.5"
        stroke="#F43F5E"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Exocyclic Carbonyl Double Bond (Top Right) */}
      <line
        x1="23.1"
        y1="12.4"
        x2="28.6"
        y2="9.2"
        stroke="#06B6D4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="24.1"
        y1="14.1"
        x2="29.6"
        y2="10.9"
        stroke="#06B6D4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Stereochemical Solid Wedge Bond (Bottom Left) */}
      <polygon points="7.5,22.4 3.2,26.2 5.1,27.8" fill="#06B6D4" />

      {/* Stereochemical Hashed Wedge Bond (Top Left) */}
      <line
        x1="6.2"
        y1="12.6"
        x2="7.2"
        y2="11.2"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="4.7"
        y1="11.9"
        x2="6.0"
        y2="10.1"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="3.2"
        y1="11.2"
        x2="4.8"
        y2="9.0"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* 3D Shaded Heteroatom Nodes */}
      <circle cx="30.8" cy="9.1" r="2.4" fill="url(#atom-oxygen)" />
      <circle cx="15.5" cy="8.5" r="2" fill="url(#atom-nitrogen)" />

      {/* Precision Vector Drafting Pen Nib & Anchor Node (Bottom Right) */}
      <line
        x1="23.5"
        y1="22.4"
        x2="26.5"
        y2="24.2"
        stroke="#6366F1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Active Bezier Control Square */}
      <rect
        x="21.7"
        y="20.6"
        width="3.6"
        height="3.6"
        rx="0.8"
        fill="#FFFFFF"
        stroke="#6366F1"
        strokeWidth="1.4"
      />
      {/* Precision Drafting Stylus Nib */}
      <path
        d="M26.5 24.2L30.2 25.4L35.2 30.4L31.4 34.2L26.4 29.2L26.5 24.2Z"
        fill="url(#drawer-nib-grad)"
        stroke="#FFFFFF"
        strokeOpacity="0.6"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <circle cx="29.5" cy="28.5" r="1" fill="#FFFFFF" />
    </svg>
  );
}

export function IconChemicalDatabase({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* 3D CPK Radial Gradients for Authentic Ball-and-Stick Spheres */}
        <radialGradient id="cpk-carbon" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#312E81" />
        </radialGradient>
        <radialGradient id="cpk-oxygen" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="45%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
        <radialGradient id="cpk-nitrogen" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#164E63" />
        </radialGradient>
        <radialGradient id="cpk-emerald" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <linearGradient
          id="lens-rim"
          x1="16"
          y1="16"
          x2="35"
          y2="35"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Molecular Lattice Frame */}
      <polygon
        points="18,4.5 29.5,11.2 29.5,24.5 18,31.2 6.5,24.5 6.5,11.2"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="1.3"
        strokeDasharray="2.5 2"
      />

      {/* Cylindrical Valence Bonds */}
      <line
        x1="11.5"
        y1="12.5"
        x2="18.5"
        y2="17"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="18.5"
        y1="17"
        x2="26.5"
        y2="11.5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="18.5"
        y1="17"
        x2="18.5"
        y2="25.5"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="11.5"
        y1="12.5"
        x2="8.5"
        y2="21.5"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 3D Shaded CPK Atom Spheres */}
      {/* Central Chiral Carbon Sphere */}
      <circle cx="18.5" cy="17" r="4.2" fill="url(#cpk-carbon)" />
      {/* Nitrogen Sphere (Top Left) */}
      <circle cx="11.5" cy="12.5" r="3.4" fill="url(#cpk-nitrogen)" />
      {/* Oxygen Sphere (Top Right) */}
      <circle cx="26.5" cy="11.5" r="3.2" fill="url(#cpk-oxygen)" />
      {/* Halogen / Functional Group Sphere (Bottom Left) */}
      <circle cx="8.5" cy="21.5" r="2.7" fill="url(#cpk-emerald)" />
      {/* Bottom Node */}
      <circle cx="18.5" cy="25.5" r="2.9" fill="url(#cpk-nitrogen)" />

      {/* Precision Optical Spectroscope / Database Search Lens */}
      <circle
        cx="25.5"
        cy="24.5"
        r="6.5"
        fill="rgba(6, 182, 212, 0.15)"
        stroke="url(#lens-rim)"
        strokeWidth="2"
      />
      {/* Specular Lens Glint */}
      <path
        d="M22 21.5C23 20.3 24.6 19.8 26.2 20.1"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Lens Handle */}
      <path d="M30.3 29.3L35 34" stroke="url(#lens-rim)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconStoichiometryLab({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="tile-emerald-bg"
          x1="4"
          y1="6"
          x2="21"
          y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          id="volumetric-liquid"
          x1="21"
          y1="22"
          x2="35"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Authentic IUPAC Periodic Element Tile [6 C 12.01] */}
      <rect
        x="4"
        y="6"
        width="16.5"
        height="18.5"
        rx="3.5"
        fill="url(#tile-emerald-bg)"
        stroke="#10B981"
        strokeWidth="1.65"
      />
      {/* Atomic Number */}
      <text x="6.5" y="11.5" fill="#10B981" fontSize="5" fontFamily="monospace" fontWeight="800">
        6
      </text>
      {/* Element Symbol */}
      <text
        x="9.5"
        y="19"
        fill="currentColor"
        fontSize="9.5"
        fontFamily="sans-serif"
        fontWeight="900"
      >
        C
      </text>
      {/* Atomic Weight Micro-Bar */}
      <line
        x1="7"
        y1="21.8"
        x2="17.5"
        y2="21.8"
        stroke="#10B981"
        strokeOpacity="0.7"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Precision Volumetric Flask (Right Foreground) */}
      {/* Liquid Solution Fill */}
      <path
        d="M23.2 24.2Q28 23.4 32.8 24.2L34.6 29.2C35.2 30.8 34 32.5 32.3 32.5H23.7C22 32.5 20.8 30.8 21.4 29.2L23.2 24.2Z"
        fill="url(#volumetric-liquid)"
      />
      {/* Meniscus Highlight */}
      <path
        d="M23.2 24.2Q28 23.4 32.8 24.2"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Flask Outer Glass Wall & Neck */}
      <path
        d="M25.2 8.5H30.8M26.4 8.5V15.5L21.2 28.8C20.5 30.6 21.8 32.5 23.7 32.5H32.3C34.2 32.5 35.5 30.6 34.8 28.8L29.6 15.5V8.5"
        stroke="#06B6D4"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Volumetric Neck Calibration Ring */}
      <line
        x1="25.8"
        y1="12.5"
        x2="30.2"
        y2="12.5"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Precision Analytical Graduation Ticks */}
      <line
        x1="25"
        y1="19.5"
        x2="27.5"
        y2="19.5"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="22"
        x2="27"
        y2="22"
        stroke="currentColor"
        strokeOpacity="0.65"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Glass Specular Streak */}
      <path
        d="M25.8 17L22.6 27.5"
        stroke="#FFFFFF"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Stoichiometric Balance / Equilibrium Symbol at Bottom Left */}
      <path
        d="M6.5 29H15.5M6.5 31.8H15.5"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.5 27.3L15.8 29M8.5 33.5L6.2 31.8"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconReactionArchive({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="archive-card-bg"
          x1="6"
          y1="10"
          x2="30"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient
          id="archive-dial"
          x1="22"
          y1="20"
          x2="36"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Stacked Archive Layer 1 (Back Card) */}
      <rect
        x="9"
        y="6.5"
        width="22"
        height="16"
        rx="3.5"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.4"
      />

      {/* Stacked Archive Layer 2 (Main Saved Abstract Card) */}
      <rect
        x="5.5"
        y="10.5"
        width="23"
        height="18.5"
        rx="4"
        fill="url(#archive-card-bg)"
        stroke="#06B6D4"
        strokeWidth="1.65"
      />

      {/* Mini Benzene Structure Inside Saved Card */}
      <polygon
        points="13.5,14.5 17,16.5 17,20.5 13.5,22.5 10,20.5 10,16.5"
        stroke="#06B6D4"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="rgba(6, 182, 212, 0.15)"
      />
      <line
        x1="17"
        y1="16.5"
        x2="21.5"
        y2="16.5"
        stroke="#06B6D4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="16.5" r="1.5" fill="#F43F5E" />

      {/* Chronological Precision Time Badge (Bottom Right) */}
      <circle
        cx="28.5"
        cy="27.5"
        r="6.5"
        fill="rgba(245, 158, 11, 0.16)"
        stroke="url(#archive-dial)"
        strokeWidth="1.8"
      />
      {/* Clock Hands */}
      <path
        d="M28.5 24.2V27.5L30.8 29"
        stroke="#F59E0B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLabSignIn({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="signin-hex-bg"
          x1="8"
          y1="6"
          x2="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient
          id="signin-stroke"
          x1="8"
          y1="6"
          x2="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Hexagonal Lab Portal Frame */}
      <path
        d="M17 7.5L29.5 7.5C31.2 7.5 32.5 8.8 32.5 10.5V29.5C32.5 31.2 31.2 32.5 29.5 32.5H17"
        stroke="url(#signin-stroke)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polygon
        points="23,11.5 30,15.5 30,24.5 23,28.5 16,24.5 16,15.5"
        fill="url(#signin-hex-bg)"
        stroke="#06B6D4"
        strokeWidth="1.3"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Researcher Node & Precision Entry Vector */}
      <circle
        cx="23"
        cy="17.2"
        r="2.7"
        stroke="#22D3EE"
        strokeWidth="1.5"
        fill="#06B6D4"
        fillOpacity="0.25"
      />
      <path
        d="M18.6 24.2C19.3 22.1 21 21 23 21C25 21 26.7 22.1 27.4 24.2"
        stroke="#22D3EE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Luminous Entry Arrow */}
      <path
        d="M6.5 20H17.5M14 16.5L17.8 20L14 23.5"
        stroke="#38BDF8"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="20" r="1.6" fill="#06B6D4" />
    </svg>
  );
}

export function IconLabSignUp({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="signup-hex-bg"
          x1="6"
          y1="6"
          x2="32"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.24" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient
          id="signup-ring"
          x1="6"
          y1="6"
          x2="32"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Aromatic Benzene Researcher Shield */}
      <polygon
        points="18.5,6.5 29.5,12.8 29.5,25.2 18.5,31.5 7.5,25.2 7.5,12.8"
        fill="url(#signup-hex-bg)"
        stroke="url(#signup-ring)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Researcher Profile Silhouette Inside Hexagon */}
      <circle
        cx="18.5"
        cy="15.8"
        r="3.3"
        fill="#06B6D4"
        fillOpacity="0.25"
        stroke="#22D3EE"
        strokeWidth="1.55"
      />
      <path
        d="M12.5 25.5C13.4 22.6 15.7 21.2 18.5 21.2C21.3 21.2 23.6 22.6 24.5 25.5"
        stroke="#22D3EE"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Glowing Emerald New-Account Plus Badge */}
      <circle cx="29.5" cy="28.5" r="6" fill="#0F172A" stroke="#10B981" strokeWidth="1.6" />
      <circle cx="29.5" cy="28.5" r="5.2" fill="#10B981" fillOpacity="0.22" />
      <path
        d="M29.5 25.8V31.2M26.8 28.5H32.2"
        stroke="#34D399"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLabLanguage({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="lang-sphere-bg"
          x1="7"
          y1="7"
          x2="33"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient
          id="lang-stroke"
          x1="7"
          y1="7"
          x2="33"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* Scientific Globe Sphere */}
      <circle
        cx="20"
        cy="20"
        r="12.5"
        fill="url(#lang-sphere-bg)"
        stroke="url(#lang-stroke)"
        strokeWidth="1.75"
      />

      {/* Meridian & Latitude Orbital Lines */}
      <ellipse
        cx="20"
        cy="20"
        rx="6"
        ry="12.5"
        stroke="#22D3EE"
        strokeWidth="1.35"
        strokeOpacity="0.8"
      />
      <line
        x1="8"
        y1="16"
        x2="32"
        y2="16"
        stroke="#A78BFA"
        strokeWidth="1.25"
        strokeOpacity="0.75"
      />
      <line
        x1="8"
        y1="24"
        x2="32"
        y2="24"
        stroke="#22D3EE"
        strokeWidth="1.25"
        strokeOpacity="0.75"
      />

      {/* Outer Atomic Orbital Ring with Nodes */}
      <ellipse
        cx="20"
        cy="20"
        rx="16"
        ry="6.2"
        transform="rotate(-24 20 20)"
        stroke="#F472B6"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        strokeDasharray="2.5 2"
      />
      <circle cx="6.2" cy="25.8" r="1.8" fill="#22D3EE" />
      <circle cx="33.8" cy="14.2" r="1.8" fill="#F472B6" />
    </svg>
  );
}

export function IconLabQuota({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="quota-crystal-bg"
          x1="8"
          y1="7"
          x2="32"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.26" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient
          id="quota-stroke"
          x1="8"
          y1="7"
          x2="32"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Crystalline Lattice Gem / Pro License Prism */}
      <polygon
        points="13,9 27,9 33,17.5 20,32.5 7,17.5"
        fill="url(#quota-crystal-bg)"
        stroke="url(#quota-stroke)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Internal Crystal Facet Lines */}
      <path
        d="M7 17.5H33M13 9L16 17.5L20 32.5L24 17.5L27 9"
        stroke="#FBBF24"
        strokeWidth="1.2"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Top Sparkle Node */}
      <circle cx="20" cy="9" r="1.6" fill="#FDE68A" />
      <circle cx="20" cy="17.5" r="1.8" fill="#22D3EE" />
    </svg>
  );
}
