// Dynamic sitemap: lists every product page for search engines.
// Served at https://snackscheck.com/sitemap.xml (see vercel.json rewrite).
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  try {
    let all = [], from = 0;
    // Page through all products (1000 rows per request)
    for (;;) {
      const r = await fetch(`${url}/rest/v1/products?select=product_code&order=product_code`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` },
      });
      const rows = await r.json();
      if (!Array.isArray(rows) || rows.length === 0) break;
      all = all.concat(rows);
      if (rows.length < 1000) break;
      from += 1000;
    }
    const items = all
      .map(p => `  <url><loc>https://snackscheck.com/p/${encodeURIComponent(p.product_code)}</loc></url>`)
      .join("\n");
    res.setHeader("Content-Type", "application/xml");
    // Cache for a day at the edge so this stays fast and cheap
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://snackscheck.com/</loc></url>
${items}
</urlset>`);
  } catch (e) {
    res.status(500).send("sitemap error");
  }
}
