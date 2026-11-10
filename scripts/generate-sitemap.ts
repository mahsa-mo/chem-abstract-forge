import fs from "node:fs";
import path from "node:path";

const DOMAIN = "https://chemstudio.app";

const locales = ["en", "fa", "de", "fr", "ar", "es", "zh"];

const routes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/auth", priority: "0.7", changefreq: "monthly" },
];

function generateSitemap() {
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = routes
    .map((r) => {
      const fullUrl = `${DOMAIN}${r.path}`;
      const hreflangLinks = locales
        .map(
          (lang) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${DOMAIN}${r.path === "/" ? "" : r.path}?lang=${lang}" />`,
        )
        .join("\n");

      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
${hreflangLinks}
  </url>`;
    })
    .join("\n");

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(outputPath, xmlContent, "utf-8");
  console.log(`✅ [SEO] sitemap.xml successfully generated at ${outputPath}`);
}

generateSitemap();
