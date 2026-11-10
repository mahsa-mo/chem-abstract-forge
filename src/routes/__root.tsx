import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { AuthProvider } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChemStudio — Scientific Vector Workbench & Reaction Studio" },
      {
        name: "description",
        content:
          "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
      },
      {
        property: "og:title",
        content: "ChemStudio — Scientific Vector Workbench for Chemistry",
      },
      {
        property: "og:description",
        content:
          "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
      },
      {
        name: "keywords",
        content:
          "ChemStudio, Graphical Abstract Generator, ACS ToC graphics maker, Elsevier graphical abstract, Cell Press ToC diagram, Nature cover art, ChemDraw online free alternative, BioRender chemistry alternative, SMILES 2D structure editor, PubChem 3D molecular viewer, stoichiometry reaction balancer, chemical vector SVG EPS, 300 DPI publication export, رسم چکیده تصویری مقاله, نرم افزار رسم شیمی آنلاین, ابزار ساخت نمودار TOC مقالات, جایگزین کم دراو, جایگزین بایورندر, موازنه آنلاین واکنش شیمیایی, محاسبه استوکیومتری مقاله, رسم فرمول ساختاری شیمی, چک لیست داوری ژورنال",
      },
      { name: "author", content: "ChemStudio Team" },
      { name: "theme-color", content: "#06B6D4" },
      { property: "og:site_name", content: "ChemStudio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ChemStudio" },
      {
        name: "twitter:title",
        content: "ChemStudio — Scientific Vector Workbench for Chemistry",
      },
      {
        name: "twitter:description",
        content:
          "Publication-grade vector graphics workbench for chemistry papers, reaction schemes, 3D structures, and journal submission dossiers.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/638bc0673691f4d258f44a79f0ac5a05/id-preview-21fc1c48--9f752915-31bf-4578-82ba-a8f7cc6fda39.lovable.app-1786799882984.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/638bc0673691f4d258f44a79f0ac5a05/id-preview-21fc1c48--9f752915-31bf-4578-82ba-a8f7cc6fda39.lovable.app-1786799882984.png",
      },
    ],
    links: [
      { rel: "canonical", href: "https://chemstudio.app/" },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Vazirmatn:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "ChemStudio",
          url: "https://chemstudio.app/",
          applicationCategory: "EducationalApplication",
          operatingSystem: "All",
          description:
            "Publication-grade scientific vector graphics workbench for chemistry papers, reaction schemes, SMILES 2D drawing, 3D molecule viewing, and ACS/Elsevier submission dossiers.",
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: "0",
            highPrice: "49",
            offerCount: "3",
          },
          creator: {
            "@type": "Organization",
            name: "ChemStudio Labs",
            url: "https://chemstudio.app/",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Are ChemStudio vector graphics compliant with ACS and Elsevier journal policies?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. ChemStudio exports 100% deterministic SVG and EPS vector artwork compliant with American Chemical Society (ACS), Elsevier, Cell Press, Springer Nature, and Wiley publishing rules.",
              },
            },
            {
              "@type": "Question",
              name: "Can I convert SMILES and chemical names into 2D structures?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. ChemStudio features an integrated 2D ChemDraw-style structure editor that parses SMILES codes, IUPAC nomenclature, and chemical formulas in real time.",
              },
            },
            {
              "@type": "Question",
              name: "How does the Stoichiometry & Reaction Lab work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The Stoichiometry Lab calculates molar masses, balances chemical equations, computes reaction yield, and evaluates atom economy for organic and inorganic reactions.",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
