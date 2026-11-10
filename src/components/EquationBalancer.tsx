import React, { useState, useMemo } from "react";
import {
  Scale,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { balanceChemicalEquation, type BalancedEquationResult } from "@/lib/equation-balancer";
import { toast } from "sonner";

const PRESET_EQUATIONS = [
  {
    id: "permanganate",
    label_en: "Redox: KMnO4 + HCl",
    label_fa: "اکسایش-کاهش: پرمنگنات + HCl",
    eq: "KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2",
  },
  {
    id: "aspirin",
    label_en: "Aspirin Synthesis",
    label_fa: "سنتز آسپرین",
    eq: "C7H6O3 + C4H6O3 -> C9H8O4 + C2H4O2",
  },
  {
    id: "combustion",
    label_en: "Glucose Combustion",
    label_fa: "سوختن گلوکز",
    eq: "C6H12O6 + O2 -> CO2 + H2O",
  },
  {
    id: "pyrite",
    label_en: "Pyrite Roasting",
    label_fa: "برشته‌کردن پیریت آهن",
    eq: "FeS2 + O2 -> Fe2O3 + SO2",
  },
  {
    id: "thermite",
    label_en: "Thermite Reaction",
    label_fa: "واکنش ترمایت آلومینیوم",
    eq: "Fe2O3 + Al -> Al2O3 + Fe",
  },
  {
    id: "dichromate",
    label_en: "Dichromate Oxidation",
    label_fa: "اکسیداسیون دی‌کرومات",
    eq: "K2Cr2O7 + HCl -> KCl + CrCl3 + H2O + Cl2",
  },
  {
    id: "neutralization",
    label_en: "Phosphate Neutralization",
    label_fa: "خنثی‌سازی اسید فسفریک",
    eq: "Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O",
  },
];

// Format chemical formula with proper subscripts for display
function renderFormulaWithSubscripts(formula: string, charge: number) {
  const parts = formula.split(/(\d+)/g);
  return (
    <span className="font-mono">
      {parts.map((part, idx) =>
        /^\d+$/.test(part) ? (
          <sub key={idx} className="text-[0.75em] leading-none">
            {part}
          </sub>
        ) : (
          <span key={idx}>{part}</span>
        ),
      )}
      {charge !== 0 && (
        <sup className="text-[0.75em] text-[#06B6D4] ms-0.5">
          {Math.abs(charge) > 1 ? Math.abs(charge) : ""}
          {charge > 0 ? "+" : "−"}
        </sup>
      )}
    </span>
  );
}

interface EquationBalancerProps {
  isRtl: boolean;
  onLoadIntoStoichiometry?: (result: BalancedEquationResult) => void;
  onSendToStudio?: (balancedText: string) => void;
}

export function EquationBalancer({
  isRtl,
  onLoadIntoStoichiometry,
  onSendToStudio,
}: EquationBalancerProps) {
  const [equationInput, setEquationInput] = useState<string>(PRESET_EQUATIONS[0].eq);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => balanceChemicalEquation(equationInput), [equationInput]);

  return (
    <div className="flex flex-col gap-5">
      {/* Input & Presets Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-muted-foreground">
              Gaussian Elimination RREF Nullspace Solver · Exact Rational Arithmetic
            </div>
            <h3 className="text-base font-bold font-display text-foreground mt-0.5">
              {isRtl
                ? "موازنه‌گر الگوریتمی معادلات شیمیایی و استوکیومتری"
                : "Algorithmic Chemical Equation Balancer"}
            </h3>
          </div>
          {result.valid && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              <span>
                {result.wasAlreadyBalanced
                  ? isRtl
                    ? "معادله ورودی از قبل موازنه بود"
                    : "Input was already balanced"
                  : isRtl
                    ? "ضرایب استوکیومتری با موفقیت محاسبه شد"
                    : "Balanced coefficients solved"}
              </span>
            </div>
          )}
        </div>

        {/* Equation Input Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            dir="ltr"
            value={equationInput}
            onChange={(e) => setEquationInput(e.target.value)}
            placeholder="e.g. KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2"
            className="flex-1 h-11 px-4 rounded-xl border border-border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4]"
          />
          {result.valid && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(result.formattedPlain);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success(
                  isRtl ? "معادله موازنه‌شده کپی شد" : "Balanced equation copied to clipboard",
                );
              }}
              className="h-11 px-4 text-xs font-semibold gap-1.5"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              <span>{isRtl ? "کپی معادله" : "Copy Balanced"}</span>
            </Button>
          )}
        </div>

        {/* Preset Equations */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground me-1">
            {isRtl ? "واکنش‌های نمونه:" : "Sample Equations:"}
          </span>
          {PRESET_EQUATIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setEquationInput(p.eq)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                equationInput === p.eq
                  ? "bg-accent-strong text-accent-foreground border-accent-strong font-bold"
                  : "bg-secondary/70 hover:bg-secondary text-foreground border-border/70"
              }`}
            >
              {isRtl ? p.label_fa : p.label_en}
            </button>
          ))}
        </div>

        {/* Balanced Equation Display Banner */}
        {result.valid ? (
          <div className="p-5 rounded-xl bg-secondary/50 border border-border flex flex-col gap-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>
                {isRtl
                  ? "معادله موازنه‌شده با کوچک‌ترین ضرایب صحیح:"
                  : "Balanced Equation (Smallest Whole-Number Coefficients):"}
              </span>
              <span className="tabular-nums">
                Δm = 0 · Total Mass = {result.totalMassPerMoleReaction.toFixed(2)} g/mol
              </span>
            </div>

            <div
              dir="ltr"
              className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 py-2 text-base sm:text-xl font-bold text-foreground"
            >
              {result.reactants.map((sp, idx) => (
                <React.Fragment key={`r-${idx}`}>
                  {idx > 0 && <span className="text-muted-foreground font-normal">+</span>}
                  <span className="inline-flex items-baseline px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
                    <span className="text-[#06B6D4] font-extrabold font-mono me-1 tabular-nums">
                      {sp.balancedCoeff}
                    </span>
                    {renderFormulaWithSubscripts(sp.formula, sp.charge)}
                  </span>
                </React.Fragment>
              ))}

              <span className="text-[#10B981] font-mono text-xl px-2">→</span>

              {result.products.map((sp, idx) => (
                <React.Fragment key={`p-${idx}`}>
                  {idx > 0 && <span className="text-muted-foreground font-normal">+</span>}
                  <span className="inline-flex items-baseline px-2.5 py-1 rounded-lg bg-card border border-border shadow-2xs">
                    <span className="text-[#10B981] font-extrabold font-mono me-1 tabular-nums">
                      {sp.balancedCoeff}
                    </span>
                    {renderFormulaWithSubscripts(sp.formula, sp.charge)}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/70">
              {onLoadIntoStoichiometry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadIntoStoichiometry(result)}
                  className="h-9 text-xs font-semibold gap-1.5"
                >
                  <Scale className="size-3.5 text-[#06B6D4]" />
                  <span>
                    {isRtl
                      ? "انتقال ضرایب به جدول استوکیومتری و محاسبه جرم‌ها"
                      : "Load Balanced Coefficients into Stoichiometry Table"}
                  </span>
                  <ArrowRight className="size-3.5" />
                </Button>
              )}

              {onSendToStudio && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSendToStudio(result.formattedPlain)}
                  className="h-9 px-4 text-xs font-bold gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-xs hover:opacity-95"
                >
                  <Sparkles className="size-3.5" />
                  <span>
                    {isRtl ? "تولید گرافیکال ابسترکت از این واکنش" : "Generate Graphical Abstract"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{isRtl ? result.error_fa : result.error_en}</span>
          </div>
        )}
      </div>

      {/* Atom Conservation & Molar Mass Breakdown Grid */}
      {result.valid && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Atom Conservation Audit Table */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground">
                Lavoisier Law of Conservation of Atoms & Mass
              </div>
              <h3 className="text-sm font-bold font-display text-foreground mt-0.5">
                {isRtl
                  ? "جدول بررسی موازنه اتمی (قبل و بعد از موازنه)"
                  : "Element-by-Element Atom Balance Verification"}
              </h3>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/70 border-b border-border text-muted-foreground text-[11px]">
                    <th className="py-2.5 px-3 text-start">{isRtl ? "عنصر" : "Element"}</th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "واکنش‌دهنده (ورودی)" : "Reactants (Input)"}
                    </th>
                    <th className="py-2.5 px-3 text-end">
                      {isRtl ? "فرآورده (ورودی)" : "Products (Input)"}
                    </th>
                    <th className="py-2.5 px-3 text-end text-[#06B6D4]">
                      {isRtl ? "واکنش‌دهنده (موازنه)" : "Balanced Left"}
                    </th>
                    <th className="py-2.5 px-3 text-end text-[#10B6D4]">
                      {isRtl ? "فرآورده (موازنه)" : "Balanced Right"}
                    </th>
                    <th className="py-2.5 px-3 text-center">{isRtl ? "وضعیت" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {result.atomAudit.map((row) => {
                    const inputMatched = row.unbalancedLeft === row.unbalancedRight;
                    return (
                      <tr key={row.element} className="hover:bg-secondary/30">
                        <td className="py-2 px-3 font-bold text-foreground">{row.element}</td>
                        <td
                          className={`py-2 px-3 text-end tabular-nums ${
                            inputMatched ? "text-muted-foreground" : "text-amber-500"
                          }`}
                        >
                          {row.unbalancedLeft}
                        </td>
                        <td
                          className={`py-2 px-3 text-end tabular-nums ${
                            inputMatched ? "text-muted-foreground" : "text-amber-500"
                          }`}
                        >
                          {row.unbalancedRight}
                        </td>
                        <td className="py-2 px-3 text-end font-bold text-[#06B6D4] tabular-nums">
                          {row.balancedLeft}
                        </td>
                        <td className="py-2 px-3 text-end font-bold text-[#10B981] tabular-nums">
                          {row.balancedRight}
                        </td>
                        <td className="py-2 px-3 text-center text-emerald-500 font-bold">
                          ✓ {row.balancedLeft} = {row.balancedRight}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Species Stoichiometric Molar Ratios & Matrix Steps */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-xs font-mono text-muted-foreground">
                  Stoichiometric Mass Balance & Nullspace Steps
                </div>
                <h3 className="text-sm font-bold font-display text-foreground mt-0.5">
                  {isRtl
                    ? "نسبت‌های مولی و جرمی گونه‌های واکنش"
                    : "Species Molar Ratios & Algorithmic Steps"}
                </h3>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="bg-secondary/60 border-b border-border text-muted-foreground text-[11px]">
                      <th className="py-2 px-3 text-start">{isRtl ? "گونه" : "Species"}</th>
                      <th className="py-2 px-3 text-end">{isRtl ? "ضریب (ν)" : "Coeff (ν)"}</th>
                      <th className="py-2 px-3 text-end">MW (g/mol)</th>
                      <th className="py-2 px-3 text-end">ν × MW (g)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[...result.reactants, ...result.products].map((sp, i) => {
                      const isReactant = i < result.reactants.length;
                      return (
                        <tr key={`${sp.formula}-${i}`}>
                          <td className="py-1.5 px-3 font-bold text-foreground">
                            <span
                              className={`inline-block size-2 rounded-full me-1.5 ${
                                isReactant ? "bg-[#06B6D4]" : "bg-[#10B981]"
                              }`}
                            />
                            {sp.formula}
                          </td>
                          <td className="py-1.5 px-3 text-end font-bold tabular-nums">
                            {sp.balancedCoeff}
                          </td>
                          <td className="py-1.5 px-3 text-end text-muted-foreground tabular-nums">
                            {sp.mw.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 text-end font-semibold tabular-nums">
                            {(sp.balancedCoeff * sp.mw).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-[#06B6D4]" />
                <span>
                  {isRtl
                    ? "مراحل حل ماتریسی معادله (Gaussian RREF):"
                    : "Matrix Nullspace Solution Steps:"}
                </span>
              </span>
              <ul className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
                {(isRtl ? result.matrixSteps_fa : result.matrixSteps_en).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
