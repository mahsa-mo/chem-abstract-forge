import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { registerSW } from "virtual:pwa-register";

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  registerSW({ immediate: true });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
