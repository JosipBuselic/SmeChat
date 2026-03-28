const UPSTREAM = "https://data.zagreb.hr";

type ProxyReq = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  headers: { accept?: string };
};

type ProxyRes = {
  status: (n: number) => ProxyRes;
  end: (s?: string) => void;
  setHeader: (k: string, v: string) => void;
  json: (o: object) => void;
  send: (b: Buffer) => void;
};

/** CKAN-style GeoJSON paths only (SSRF guard). */
function allowedZagrebPath(p: string): boolean {
  return /^\/dataset\/[^/]+\/resource\/[^/]+\/download\/data\.geojson$/i.test(p);
}

export default async function handler(req: ProxyReq, res: ProxyRes): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  const raw = req.query.p;
  const p = Array.isArray(raw) ? raw[0] : raw;
  if (typeof p !== "string" || !allowedZagrebPath(p)) {
    res.status(400).end("Invalid path");
    return;
  }

  const target = `${UPSTREAM}${p}`;

  try {
    const r = await fetch(target, {
      headers: {
        Accept: String(req.headers.accept || "application/geo+json, application/json, */*"),
        "User-Agent": "EcoMap-Zagreb/1.0",
      },
      redirect: "follow",
    });

    res.status(r.status);
    const ct = r.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    const buf = await r.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch (e) {
    console.error("[api/zagreb-proxy]", e);
    res.status(502).json({ error: "Upstream fetch failed" });
  }
}
