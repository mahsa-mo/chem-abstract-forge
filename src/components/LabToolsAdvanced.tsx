import React, { useState, useMemo } from "react";
import { Droplets, Gauge, Leaf, Copy, Check, Thermometer, Layers, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUFFER_SYSTEMS, LAB_SOLVENTS } from "@/data/lab-reference-data";
import { toast } from "sonner";

export function BufferAndPhLab({ isRtl }: { isRtl: boolean }) {
  const [selectedBufferId, setSelectedBufferId] = useState<string>(BUFFER_SYSTEMS[0].id);
  const [targetPh, setTargetPh] = useState<number>(7.4);
  const [bufferConcMm, setBufferConcMm] = useState<number>(100); // mM
  const [bufferVolMl, setBufferVolMl] = useState<number>(500); // mL
  const [labTempC, setLabTempC] = useState<number>(25);
  const [copiedBuffer, setCopiedBuffer] = useState(false);

  // Custom pKa Ionization Analyzer
  const [compoundPka, setCompoundPka] = useState<number>(4.75);
  const [solutionPh, setSolutionPh] = useState<number>(7.4);
  const [compoundType, setCompoundType] = useState<"acid" | "base">("acid");

  const activeBuffer = useMemo(
    () => BUFFER_SYSTEMS.find((b) => b.id === selectedBufferId) || BUFFER_SYSTEMS[0],
    [selectedBufferId],
  );

  const bufferCalc = useMemo(() => {
    const effectivePka = activeBuffer.pKa25 + (labTempC - 25) * activeBuffer.dpKaPerC;
    // Henderson-Hasselbalch: pH = pKa + log10([A-]/[HA]) => ratio = [A-]/[HA] = 10^(pH - pKa)
    const ratioBaseToAcid = Math.pow(10, targetPh - effectivePka);
    const fracBase = ratioBaseToAcid / (1 + ratioBaseToAcid);
    const fracAcid = 1 - fracBase;

    const totalMoles = (bufferConcMm / 1000) * (bufferVolMl / 1000); // mol
    const molesAcid = totalMoles * fracAcid;
    const molesBase = totalMoles * fracBase;

    const massAcidG = molesAcid * activeBuffer.acidMw;
    const massBaseG = molesBase * activeBuffer.baseMw;

    // Van Slyke Buffering Capacity beta = 2.303 * C * (Ka * [H+]) / (Ka + [H+])^2
    const cTotalM = bufferConcMm / 1000;
    const beta = 2.303 * cTotalM * fracAcid * fracBase;

    const inRange = targetPh >= activeBuffer.rangeMin && targetPh <= activeBuffer.rangeMax;

    return {
      effectivePka,
      ratioBaseToAcid,
      percentAcid: fracAcid * 100,
      percentBase: fracBase * 100,
      massAcidG,
      massBaseG,
      beta,
      inRange,
    };
  }, [activeBuffer, targetPh, bufferConcMm, bufferVolMl, labTempC]);

  const pkaIonization = useMemo(() => {
    // For weak acid HA: % ionized [A-] = 100 / (1 + 10^(pKa - pH))
    // For weak base B: % protonated [BH+] = 100 / (1 + 10^(pH - pKa))
    const diff = compoundType === "acid" ? compoundPka - solutionPh : solutionPh - compoundPka;
    const chargedPercent = 100 / (1 + Math.pow(10, diff));
    const neutralPercent = 100 - chargedPercent;
    return { chargedPercent, neutralPercent };
  }, [compoundPka, solutionPh, compoundType]);

  const bufferProtocolText = useMemo(() => {
    return isRtl
      ? `دستورالعمل تهیه ${bufferVolMl} میلی‌لیتر ${activeBuffer.name_fa} (${bufferConcMm} mM، pH = ${targetPh.toFixed(2)} در ${labTempC} °C): مقدار ${bufferCalc.massAcidG.toFixed(3)} گرم (${(bufferCalc.massAcidG * 1000).toFixed(0)} mg) از ${activeBuffer.acidName_fa} و مقدار ${bufferCalc.massBaseG.toFixed(3)} گرم (${(bufferCalc.massBaseG * 1000).toFixed(0)} mg) از ${activeBuffer.baseName_fa} را در ${(bufferVolMl * 0.8).toFixed(0)} میلی‌لیتر آب دیونیزه حل کرده و حجم نهایی را به ${bufferVolMl} میلی‌لیتر برسانید.`
      : `To prepare ${bufferVolMl} mL of ${bufferConcMm} mM ${activeBuffer.name_en} at pH ${targetPh.toFixed(2)} (${labTempC} °C): Dissolve ${bufferCalc.massAcidG.toFixed(3)} g (${(bufferCalc.massAcidG * 1000).toFixed(0)} mg) of ${activeBuffer.acidName_en} and ${bufferCalc.massBaseG.toFixed(3)} g (${(bufferCalc.massBaseG * 1000).toFixed(0)} mg) of ${activeBuffer.baseName_en} in ${(bufferVolMl * 0.8).toFixed(0)} mL of deionized water, verify pH, and bring to ${bufferVolMl} mL total volume.`;
  }, [isRtl, bufferVolMl, activeBuffer, bufferConcMm, targetPh, labTempC, bufferCalc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Henderson-Hasselbalch Buffer Recipe Designer */}
      <div className="lg:col-span-7 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-muted-foreground">
                pH = pKₐ + log₁₀([A⁻] / [HA]) · Temperature-Compensated
              </div>
              <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                {isRtl
                  ? "طراح فرمولاسیون بافر هندرسون-هاسلباخ"
                  : "Henderson-Hasselbalch Buffer Recipe Designer"}
              </h3>
            </div>
            <span className="text-xs font-mono text-[#06B6D4] tabular-nums">
              pKₐ({labTempC}°C) = {bufferCalc.effectivePka.toFixed(2)}
            </span>
          </div>

          {/* Buffer Selector & Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "انتخاب سیستم بافری استاندارد" : "Select Buffer System"}
              </label>
              <select
                value={selectedBufferId}
                onChange={(e) => {
                  const next = BUFFER_SYSTEMS.find((b) => b.id === e.target.value);
                  setSelectedBufferId(e.target.value);
                  if (next) setTargetPh(Number(next.pKa25.toFixed(1)));
                }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
              >
                {BUFFER_SYSTEMS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {isRtl ? b.name_fa : b.name_en} (pKₐ = {b.pKa25})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl
                  ? `pH هدف (محدوده بهینه: ${activeBuffer.rangeMin}–${activeBuffer.rangeMax})`
                  : `Target pH (Optimal: ${activeBuffer.rangeMin}–${activeBuffer.rangeMax})`}
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="13"
                value={targetPh}
                onChange={(e) => setTargetPh(parseFloat(e.target.value) || 7.0)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "غلظت کل بافر (mM)" : "Buffer Concentration (mM)"}
              </label>
              <input
                type="number"
                step="10"
                min="1"
                value={bufferConcMm}
                onChange={(e) => setBufferConcMm(Math.max(1, parseFloat(e.target.value) || 50))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "حجم نهایی محلول (mL)" : "Final Volume (mL)"}
              </label>
              <input
                type="number"
                step="50"
                min="1"
                value={bufferVolMl}
                onChange={(e) => setBufferVolMl(Math.max(1, parseFloat(e.target.value) || 100))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "دمای محیط آزمایشگاه (°C)" : "Operating Temp (°C)"}
              </label>
              <input
                type="number"
                step="1"
                value={labTempC}
                onChange={(e) => setLabTempC(parseFloat(e.target.value) || 25)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          {!bufferCalc.inRange && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
              {isRtl
                ? `توجه: pH انتخاب‌شده خارج از محدوده ظرفیت بافری بهینه (${activeBuffer.rangeMin} تا ${activeBuffer.rangeMax}) است.`
                : `Note: Target pH is outside the optimal buffering range (${activeBuffer.rangeMin}–${activeBuffer.rangeMax}).`}
            </div>
          )}

          {/* Speciation Distribution Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#F43F5E] font-semibold">
                [HA] {isRtl ? "فرم اسیدی" : "Acid"}: {bufferCalc.percentAcid.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                [A⁻]/[HA] = {bufferCalc.ratioBaseToAcid.toFixed(2)}
              </span>
              <span className="text-[#06B6D4] font-semibold">
                [A⁻] {isRtl ? "باز مزدوج" : "Conj. Base"}: {bufferCalc.percentBase.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-secondary">
              <div
                style={{ width: `${bufferCalc.percentAcid}%` }}
                className="bg-[#F43F5E] transition-all"
              />
              <div
                style={{ width: `${bufferCalc.percentBase}%` }}
                className="bg-[#06B6D4] transition-all"
              />
            </div>
          </div>

          {/* Exact Weighing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 flex flex-col justify-between gap-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRtl ? "جزء اسیدی (HA)" : "Weak Acid Component (HA)"}
              </span>
              <span className="text-xs font-bold text-foreground">
                {isRtl ? activeBuffer.acidName_fa : activeBuffer.acidName_en}
              </span>
              <div className="flex items-baseline justify-between pt-2 border-t border-border/60 font-mono">
                <span className="text-[11px] text-muted-foreground">MW: {activeBuffer.acidMw}</span>
                <span className="text-base font-extrabold text-[#F43F5E] tabular-nums">
                  {bufferCalc.massAcidG.toFixed(3)} g ({(bufferCalc.massAcidG * 1000).toFixed(0)}{" "}
                  mg)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 flex flex-col justify-between gap-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRtl ? "جزء باز مزدوج (A⁻)" : "Conjugate Base Component (A⁻)"}
              </span>
              <span className="text-xs font-bold text-foreground">
                {isRtl ? activeBuffer.baseName_fa : activeBuffer.baseName_en}
              </span>
              <div className="flex items-baseline justify-between pt-2 border-t border-border/60 font-mono">
                <span className="text-[11px] text-muted-foreground">MW: {activeBuffer.baseMw}</span>
                <span className="text-base font-extrabold text-[#06B6D4] tabular-nums">
                  {bufferCalc.massBaseG.toFixed(3)} g ({(bufferCalc.massBaseG * 1000).toFixed(0)}{" "}
                  mg)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Box & Copy */}
        <div className="pt-3 border-t border-border/70 flex flex-col gap-2.5">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed bg-background p-3 rounded-xl border border-border/70">
            {bufferProtocolText}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground">
              {isRtl ? "ظرفیت بافری ون‌اسلایک (β):" : "Van Slyke Capacity (β):"}{" "}
              <strong className="text-foreground tabular-nums">
                {(bufferCalc.beta * 1000).toFixed(1)} mM/pH
              </strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(bufferProtocolText);
                setCopiedBuffer(true);
                setTimeout(() => setCopiedBuffer(false), 2000);
                toast.success(isRtl ? "دستورالعمل تهیه بافر کپی شد" : "Buffer protocol copied");
              }}
              className="h-8 text-xs gap-1.5"
            >
              {copiedBuffer ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>{isRtl ? "کپی دستورالعمل تهیه بافر" : "Copy Recipe"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right: pKa Protonation & Extraction Partition Predictor */}
      <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-mono text-muted-foreground">
              Acid/Base Ionization & Extraction Guide
            </div>
            <h3 className="text-base font-bold font-display text-foreground mt-0.5">
              {isRtl
                ? "تحلیل وضعیت یونش (pKa) برای استخراج مایع-مایع"
                : "pKₐ Ionization & Extraction Phase Predictor"}
            </h3>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/70 border border-border/70 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCompoundType("acid")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                compoundType === "acid"
                  ? "bg-card text-foreground shadow-2xs border border-border font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {isRtl ? "ترکیب اسیدی (R-COOH / Ar-OH)" : "Acidic Substrate (HA)"}
            </button>
            <button
              type="button"
              onClick={() => setCompoundType("base")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                compoundType === "base"
                  ? "bg-card text-foreground shadow-2xs border border-border font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {isRtl ? "ترکیب بازی (R-NH₂ / Pyridine)" : "Basic Substrate (B)"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "pKₐ ترکیب مورد نظر" : "Compound pKₐ"}
              </label>
              <input
                type="number"
                step="0.2"
                value={compoundPka}
                onChange={(e) => setCompoundPka(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                {isRtl ? "pH فاز آبی" : "Aqueous Phase pH"}
              </label>
              <input
                type="number"
                step="0.2"
                value={solutionPh}
                onChange={(e) => setSolutionPh(parseFloat(e.target.value) || 7.0)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
              />
            </div>
          </div>

          {/* Quick Functional Group pKa Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground">
              {isRtl ? "گروه‌های عاملی:" : "Presets:"}
            </span>
            {[
              { label: "R-COOH (4.8)", pka: 4.8, type: "acid" as const },
              { label: "Phenol (9.9)", pka: 9.9, type: "acid" as const },
              { label: "Aniline (4.6)", pka: 4.6, type: "base" as const },
              { label: "Et₃N (10.7)", pka: 10.7, type: "base" as const },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setCompoundPka(p.pka);
                  setCompoundType(p.type);
                }}
                className="px-2 py-0.5 rounded bg-secondary/70 hover:bg-secondary text-[11px] font-mono text-foreground border border-border/60"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "فرم خنثی (وارد شونده به فاز آلی)" : "Neutral Form (Organic Phase)"}
              </span>
              <span className="text-lg font-extrabold text-[#10B981] tabular-nums">
                {pkaIonization.neutralPercent.toFixed(2)}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "فرم یونیزه (محلول در فاز آبی)" : "Ionized Form (Aqueous Phase)"}
              </span>
              <span className="text-lg font-extrabold text-[#06B6D4] tabular-nums">
                {pkaIonization.chargedPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 text-xs leading-relaxed">
          <span className="font-bold text-foreground block mb-1">
            {isRtl ? "توصیه استخراج آزمایشگاهی (Workup):" : "Workup & Extraction Recommendation:"}
          </span>
          {pkaIonization.neutralPercent >= 90 ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              {isRtl
                ? `در pH = ${solutionPh}، بیش از ${pkaIonization.neutralPercent.toFixed(0)}٪ ترکیب در فرم خنثی قرار دارد و به راحتی وارد فاز آلی (مانند EtOAc یا DCM) می‌شود.`
                : `At pH ${solutionPh}, ${pkaIonization.neutralPercent.toFixed(1)}% of the compound is uncharged and readily extracts into the organic layer (EtOAc / DCM).`}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {isRtl
                ? compoundType === "acid"
                  ? `برای استخراج کامل به فاز آلی، pH فاز آبی را به کمتر از ${(compoundPka - 2).toFixed(1)} کاهش دهید.`
                  : `برای استخراج کامل به فاز آلی، pH فاز آبی را به بیشتر از ${(compoundPka + 2).toFixed(1)} افزایش دهید.`
                : compoundType === "acid"
                  ? `To extract >99% into organic solvent, acidify aqueous layer below pH ${(compoundPka - 2).toFixed(1)}.`
                  : `To extract >99% into organic solvent, basify aqueous layer above pH ${(compoundPka + 2).toFixed(1)}.`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VacuumAndGreenChemLab({ isRtl }: { isRtl: boolean }) {
  // Clausius-Clapeyron Vacuum Boiling Point Calculator
  const [solventId, setSolventId] = useState<string>("dcm");
  const [vacuumMbar, setVacuumMbar] = useState<number>(400);

  // Pairwise Miscibility & Separatory Funnel Predictor
  const [solventAId, setSolventAId] = useState<string>("dcm");
  const [solventBId, setSolventBId] = useState<string>("water");

  // Green Chemistry Metrics State (grams)
  const [reactantsMassG, setReactantsMassG] = useState<number>(3.5);
  const [solventMassG, setSolventMassG] = useState<number>(18.0);
  const [auxiliaryMassG, setAuxiliaryMassG] = useState<number>(4.0);
  const [productMassG, setProductMassG] = useState<number>(2.8);

  const activeSolvent = useMemo(
    () => LAB_SOLVENTS.find((s) => s.id === solventId) || LAB_SOLVENTS[0],
    [solventId],
  );

  // Clausius-Clapeyron: 1/T2 = 1/T1 - (R / dHvap) * ln(P2 / P1)
  const vacuumCalc = useMemo(() => {
    const p1Mbar = 1013.25;
    const t1K = activeSolvent.bp760 + 273.15;
    const rGas = 8.314; // J/(mol*K)
    const dHJoule = activeSolvent.dHvap * 1000;
    const p2 = Math.max(1, Math.min(1013.25, vacuumMbar));

    const invT2 = 1 / t1K - (rGas / dHJoule) * Math.log(p2 / p1Mbar);
    const t2C = 1 / invT2 - 273.15;

    // 20-40-60 Rotavap Rule: Bath = BP + 20°C, Chiller = BP - 20°C
    const recommendedBathC = Math.min(80, Math.max(25, t2C + 20));
    const recommendedPressureFor40CBath = Math.round(
      p1Mbar * Math.exp((dHJoule / rGas) * (1 / t1K - 1 / (20 + 273.15))),
    );

    return {
      bpAtVacC: t2C,
      recommendedBathC,
      recommendedPressureFor40CBath: Math.max(5, Math.min(900, recommendedPressureFor40CBath)),
    };
  }, [activeSolvent, vacuumMbar]);

  const pairComparison = useMemo(() => {
    const sA = LAB_SOLVENTS.find((s) => s.id === solventAId) || LAB_SOLVENTS[0];
    const sB = LAB_SOLVENTS.find((s) => s.id === solventBId) || LAB_SOLVENTS[11];
    const isImmiscible =
      sA.id !== sB.id && (sA.immiscibleWith.includes(sB.id) || sB.immiscibleWith.includes(sA.id));

    const topLayer = sA.density <= sB.density ? sA : sB;
    const bottomLayer = sA.density <= sB.density ? sB : sA;

    return { sA, sB, isImmiscible, topLayer, bottomLayer };
  }, [solventAId, solventBId]);

  const greenMetrics = useMemo(() => {
    const totalInputG = reactantsMassG + solventMassG + auxiliaryMassG;
    const prodG = Math.max(0.01, productMassG);
    const totalWasteG = Math.max(0, totalInputG - prodG);
    const eFactor = totalWasteG / prodG;
    const pmi = totalInputG / prodG;
    const rme = Math.min(100, (prodG / Math.max(0.01, reactantsMassG)) * 100);
    return { totalInputG, totalWasteG, eFactor, pmi, rme };
  }, [reactantsMassG, solventMassG, auxiliaryMassG, productMassG]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Vacuum Distillation & Rotavap Pressure-Temperature Nomograph */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground">
                Clausius–Clapeyron Equation · Rotary Evaporator (20–40–60 Rule)
              </div>
              <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                {isRtl
                  ? "نوموگراف فشار-دما (روتواپ و تقطیر در خلأ)"
                  : "Vacuum Boiling Point & Rotavap Calculator"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "انتخاب حلال" : "Select Solvent"}
                </label>
                <select
                  value={solventId}
                  onChange={(e) => setSolventId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                >
                  {LAB_SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? s.name_fa : s.name_en} (BP: {s.bp760} °C)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "فشار پمپ خلأ (mbar)" : "Vacuum Pressure (mbar)"}
                </label>
                <input
                  type="number"
                  step="10"
                  min="1"
                  max="1013"
                  value={vacuumMbar}
                  onChange={(e) => setVacuumMbar(Math.max(1, parseFloat(e.target.value) || 100))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-mono text-muted-foreground">
                {isRtl ? "فشارهای سریع:" : "Quick Vacuum:"}
              </span>
              {[850, 400, 240, 150, 72, 15].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setVacuumMbar(p)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                    vacuumMbar === p
                      ? "bg-accent-strong text-accent-foreground border-accent-strong font-bold"
                      : "bg-secondary/60 text-foreground border-border/60"
                  }`}
                >
                  {p} mbar ({(p * 0.75006).toFixed(0)} Torr)
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/70">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "نقطه جوش در ۱ اتمسفر" : "Normal BP (1 atm)"}
                </span>
                <span className="text-base font-bold text-foreground tabular-nums">
                  {activeSolvent.bp760.toFixed(1)} °C
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30">
                <span className="text-[10px] text-[#06B6D4] block">
                  {isRtl ? `نقطه جوش در ${vacuumMbar} mbar` : `BP at ${vacuumMbar} mbar`}
                </span>
                <span className="text-base font-extrabold text-[#06B6D4] tabular-nums">
                  {vacuumCalc.bpAtVacC.toFixed(1)} °C
                </span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/70">
                <span className="text-[10px] text-muted-foreground block">
                  {isRtl ? "دمای پیشنهادی بن‌ماری" : "Rotavap Bath Temp"}
                </span>
                <span className="text-base font-bold text-foreground tabular-nums">
                  {vacuumCalc.recommendedBathC.toFixed(0)} °C
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 text-xs font-mono flex items-center justify-between">
            <span className="text-muted-foreground">
              {isRtl
                ? "فشار بهینه برای تبخیر ملایم در بن‌ماری ۴۰ درجه:"
                : "Optimal pressure for 40 °C water bath:"}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {vacuumCalc.recommendedPressureFor40CBath} mbar
            </span>
          </div>
        </div>

        {/* 2. Liquid-Liquid Extraction & Separatory Funnel Layer Predictor */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground">
                Solvent Miscibility & Separatory Funnel Density Predictor
              </div>
              <h3 className="text-base font-bold font-display text-foreground mt-0.5">
                {isRtl
                  ? "امتزاج‌پذیری حلال‌ها و تشخیص فاز بالایی/پایینی در دکانتور"
                  : "Solvent Miscibility & Separatory Funnel Layer Guide"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "حلال اول (Solvent A)" : "Solvent A"}
                </label>
                <select
                  value={solventAId}
                  onChange={(e) => setSolventAId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                >
                  {LAB_SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? s.name_fa : s.name_en} (d = {s.density})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  {isRtl ? "حلال دوم (Solvent B)" : "Solvent B"}
                </label>
                <select
                  value={solventBId}
                  onChange={(e) => setSolventBId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                >
                  {LAB_SOLVENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? s.name_fa : s.name_en} (d = {s.density})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pairComparison.isImmiscible ? (
              <div className="p-4 rounded-xl bg-secondary/40 border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>
                    {isRtl
                      ? "غیرقابل امتزاج (تشکیل دو فاز مجزا در قیف دکانتور)"
                      : "Immiscible — Forms Two Distinct Layers"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-between">
                    <span>
                      ▲ {isRtl ? "فاز بالایی (سبک‌تر):" : "Top Layer:"}{" "}
                      <strong>
                        {isRtl ? pairComparison.topLayer.name_fa : pairComparison.topLayer.name_en}
                      </strong>
                    </span>
                    <span className="tabular-nums">d = {pairComparison.topLayer.density} g/mL</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-between">
                    <span>
                      ▼ {isRtl ? "فاز پایینی (سنگین‌تر):" : "Bottom Layer:"}{" "}
                      <strong>
                        {isRtl
                          ? pairComparison.bottomLayer.name_fa
                          : pairComparison.bottomLayer.name_en}
                      </strong>
                    </span>
                    <span className="tabular-nums">
                      d = {pairComparison.bottomLayer.density} g/mL
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-secondary/40 border border-border text-xs">
                <span className="font-bold text-foreground block mb-1">
                  {isRtl
                    ? "قابل امتزاج (تک‌فاز / محلول همگن)"
                    : "Miscible — Forms a Single Homogeneous Phase"}
                </span>
                <p className="text-muted-foreground">
                  {isRtl
                    ? "این دو حلال در یکدیگر حل می‌شوند و برای استخراج دو فازی با قیف دکانتور مناسب نیستند (مناسب برای سیستم حلال مشترک یا کروماتوگرافی)."
                    : "These two solvents are miscible and will not separate into two layers in a separatory funnel."}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono pt-2 border-t border-border/70">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "ثابت دی‌الکتریک (ε)" : "Dielectric Constant (ε)"}
              </span>
              <span className="text-foreground font-semibold tabular-nums">
                {pairComparison.sA.formula}: {pairComparison.sA.dielectric} ·{" "}
                {pairComparison.sB.formula}: {pairComparison.sB.dielectric}
              </span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "قطبیت اسنایدر (P')" : "Polarity Index (P')"}
              </span>
              <span className="text-foreground font-semibold tabular-nums">
                {pairComparison.sA.polarityIndex} vs {pairComparison.sB.polarityIndex}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Green Chemistry Process Metrics (E-Factor & PMI) */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-muted-foreground">
              ACS Green Chemistry Institute · Sheldon&apos;s E-Factor & Process Mass Intensity (PMI)
            </div>
            <h3 className="text-base font-bold font-display text-foreground mt-0.5">
              {isRtl
                ? "ارزیاب شاخص‌های شیمی سبز (E-Factor، شدت جرم فرآیند PMI و بازده جرمی RME)"
                : "Green Chemistry Sustainability Metrics (E-Factor, PMI & RME)"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-muted-foreground mb-1">
              {isRtl ? "مجموع جرم واکنش‌دهنده‌ها (g)" : "Total Reactants Mass (g)"}
            </label>
            <input
              type="number"
              step="0.5"
              value={reactantsMassG}
              onChange={(e) => setReactantsMassG(Math.max(0.01, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-muted-foreground mb-1">
              {isRtl ? "جرم حلال‌های مصرفی (g)" : "Solvents Mass (g)"}
            </label>
            <input
              type="number"
              step="1"
              value={solventMassG}
              onChange={(e) => setSolventMassG(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-muted-foreground mb-1">
              {isRtl ? "مواد کمکی و استخراج (g)" : "Workup / Auxiliaries (g)"}
            </label>
            <input
              type="number"
              step="0.5"
              value={auxiliaryMassG}
              onChange={(e) => setAuxiliaryMassG(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background font-mono text-xs tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-muted-foreground mb-1">
              {isRtl ? "جرم محصول خالص نهایی (g)" : "Isolated Product Mass (g)"}
            </label>
            <input
              type="number"
              step="0.2"
              value={productMassG}
              onChange={(e) => setProductMassG(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
              className="w-full h-9 px-3 rounded-lg border border-emerald-500/50 bg-background font-mono text-xs font-bold tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "فاکتور محیط‌زیستی شلدون (E-Factor)" : "Sheldon E-Factor (Waste/Product)"}
              </span>
              <span className="text-lg font-extrabold text-foreground tabular-nums">
                {greenMetrics.eFactor.toFixed(2)} kg/kg
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {greenMetrics.eFactor < 10
                ? isRtl
                  ? "عالی (سبز)"
                  : "Excellent"
                : isRtl
                  ? "متوسط آزمایشگاهی"
                  : "Typical Lab"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {isRtl ? "شدت جرم فرآیند (PMI)" : "Process Mass Intensity (PMI)"}
              </span>
              <span className="text-lg font-extrabold text-[#06B6D4] tabular-nums">
                {greenMetrics.pmi.toFixed(2)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">PMI = E + 1</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                {isRtl ? "کارایی جرمی واکنش (RME)" : "Reaction Mass Efficiency (RME)"}
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {greenMetrics.rme.toFixed(1)}%
              </span>
            </div>
            <Leaf className="size-5 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
