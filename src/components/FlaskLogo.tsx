import { FlaskConical } from "lucide-react";

/** Flask mark with slow rising bubbles. */
export function FlaskLogo() {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <span className="pointer-events-none absolute -top-3 left-1/2 h-4 w-6 -translate-x-1/2 overflow-visible">
        <span className="bubble bubble-1" />
        <span className="bubble bubble-2" />
        <span className="bubble bubble-3" />
      </span>
      <FlaskConical className="size-5" aria-hidden />
    </span>
  );
}
