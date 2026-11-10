import { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function PWAInstallButton() {
  const { l } = useI18n();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <Button
        onClick={() => void install()}
        size="sm"
        className="gap-2 bg-gradient-to-r from-[#06B6D4] to-[#6366F1] text-white hover:opacity-95 font-bold shadow-sm text-xs rounded-xl"
      >
        <Download className="size-3.5" />
        <span>{l("نصب اپلیکیشن ChemStudio", "Install ChemStudio App")}</span>
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button
          onClick={() => setShowIOSGuide(true)}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/10 rounded-xl"
        >
          <Smartphone className="size-3.5" />
          <span>{l("نصب در آیفون / آیوآس", "Install on iOS")}</span>
        </Button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {l("نصب ChemStudio روی آیفون", "Install ChemStudio on iPhone")}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {l(
                  "۱. دکمه Share (اشتراک‌گذاری) را در پایین مرورگر Safari لمس کنید.\n۲. گزینه Add to Home Screen (افزودن به صفحه اصلی) را انتخاب کنید.",
                  "1. Tap the Share button in Safari toolbar.\n2. Scroll down and select Add to Home Screen.",
                )}
              </p>
              <Button
                onClick={() => setShowIOSGuide(false)}
                className="w-full text-xs bg-[#06B6D4] text-white"
              >
                {l("متوجه شدم", "Got it")}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
