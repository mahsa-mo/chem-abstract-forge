import React from "react";

/**
 * Harmonious, Uniform Atmospheric Quantum Nebula Background
 *
 * Provides a clean, balanced, seamless luminous backdrop designed to perfectly
 * complement the interconnected 3D molecular lattice without visual clutter.
 */
export function MolecularBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
    >
      {/* 1. Seamless Uniform Atmospheric Halos */}
      {/* Soft Cyan & Indigo Wave (Top Half) */}
      <div className="absolute -top-40 left-1/4 size-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#06B6D4]/16 via-[#4F46E5]/12 to-transparent blur-[120px] pointer-events-none" />

      {/* Gentle Rose & Violet Resonance (Right Side) */}
      <div className="absolute top-1/4 -right-20 size-[44rem] rounded-full bg-gradient-to-bl from-[#EC4899]/14 via-[#8B5CF6]/10 to-transparent blur-[130px] pointer-events-none" />

      {/* Warm Emerald & Amber Fusion Glow (Bottom-Left) */}
      <div className="absolute -bottom-36 left-10 size-[46rem] rounded-full bg-gradient-to-tr from-[#10B981]/12 via-[#F59E0B]/8 to-transparent blur-[140px] pointer-events-none" />

      {/* Center Harmonizing Quantum Aura */}
      <div className="absolute top-1/2 left-1/2 size-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,rgba(6,182,212,0.05)_45%,transparent_70%)] blur-[100px] pointer-events-none" />

      {/* 2. Micro-Atmospheric Quantum Stardust (Soft & Evenly Distributed) */}
      <svg
        className="absolute inset-0 size-full opacity-[0.22] dark:opacity-[0.28]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8%" cy="14%" r="1.5" fill="#38BDF8" opacity="0.6" />
        <circle cx="22%" cy="28%" r="1" fill="#818CF8" opacity="0.5" />
        <circle cx="36%" cy="12%" r="1.8" fill="#34D399" opacity="0.5" />
        <circle cx="50%" cy="22%" r="1" fill="#F472B6" opacity="0.6" />
        <circle cx="68%" cy="15%" r="1.5" fill="#FBBF24" opacity="0.6" />
        <circle cx="84%" cy="24%" r="1" fill="#38BDF8" opacity="0.5" />
        <circle cx="94%" cy="16%" r="1.8" fill="#A78BFA" opacity="0.5" />

        <circle cx="12%" cy="50%" r="1" fill="#34D399" opacity="0.5" />
        <circle cx="28%" cy="58%" r="1.5" fill="#38BDF8" opacity="0.6" />
        <circle cx="75%" cy="48%" r="1.2" fill="#F472B6" opacity="0.5" />
        <circle cx="88%" cy="60%" r="1.6" fill="#FBBF24" opacity="0.6" />

        <circle cx="15%" cy="82%" r="1.5" fill="#818CF8" opacity="0.6" />
        <circle cx="30%" cy="88%" r="1.2" fill="#34D399" opacity="0.5" />
        <circle cx="48%" cy="78%" r="1.8" fill="#38BDF8" opacity="0.5" />
        <circle cx="65%" cy="85%" r="1" fill="#F472B6" opacity="0.6" />
        <circle cx="82%" cy="80%" r="1.5" fill="#A78BFA" opacity="0.6" />
        <circle cx="92%" cy="90%" r="1.2" fill="#38BDF8" opacity="0.5" />
      </svg>
    </div>
  );
}
