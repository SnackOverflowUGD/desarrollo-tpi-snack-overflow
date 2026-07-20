import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone with a minimal server.js for a small Docker runtime image.
  output: "standalone",

  // Next 16 dev-server blocks cross-origin requests from unknown hosts. When the demo
  // runs behind an ephemeral cloudflared tunnel (random *.trycloudflare.com host), the
  // launcher injects that host via ALLOWED_DEV_ORIGIN so the dev server accepts it.
  // No env set (normal local dev) -> empty list -> behaves exactly as before.
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGIN
    ? [process.env.ALLOWED_DEV_ORIGIN]
    : [],

  // Same-origin proxy for the NestJS backend.
  // The backend has NO CORS enabled and exposes routes without a global prefix
  // (e.g. POST /auth/register on :3000). Calling it cross-origin from the browser
  // would be blocked, so the client calls relative `/api/...` and Next rewrites it
  // to the backend. BACKEND_URL is a server-only env var (no NEXT_PUBLIC_ needed —
  // the browser only ever sees the relative path).
  //
  // CRITICAL (MI-11 integration bug, Next 16 routing): an ARRAY-form `rewrites()`
  // is an `afterFiles` rewrite. STATIC Route Handlers (e.g.
  // app/api/contrataciones/route.ts, app/api/auth/login/route.ts) are "non-dynamic
  // pages" checked BEFORE afterFiles, so they already shadow the rewrite without any
  // exclusion. But DYNAMIC nested handlers
  // (app/api/contrataciones/[id]/{proposal,confirm,start,finish,reject,cancel}) are
  // "dynamic routes" checked AFTER afterFiles, so a blanket `/api/:path*` rewrite
  // WINS and forwards them straight to the backend WITHOUT the session Bearer (the
  // rewrite can't read the httpOnly cookie) → the backend answers 401 and the whole
  // BFF auth loop is bypassed. We therefore exclude ONLY the `/api/contrataciones`
  // prefix (which owns dynamic BFF handlers) from the catch-all via a negative
  // lookahead, so those resolve to the filesystem handler that attaches the Bearer.
  // Everything else under `/api/*` still proxies straight through — crucially the
  // rewrite-only auth endpoints WITHOUT a local handler (`/api/auth/register`,
  // `/api/auth/forgot-password`, `/api/auth/reset-password`) and the public catalog.
  //
  // The SAME reasoning applies to the prestador self-management BFF
  // (`/api/prestadores/me` and, crucially, the DYNAMIC
  // `/api/prestadores/me/servicios/[id]` handler): they own the cookie→Bearer
  // loop, so the catch-all must exclude the `/api/prestadores/me` prefix too or
  // the dynamic servicio route would proxy to the backend WITHOUT the Bearer
  // and answer 401. Everything else under `/api/*` still proxies through.
  async rewrites() {
    return [
      {
        source:
          "/api/:path((?!contrataciones$|contrataciones/|prestadores/me$|prestadores/me/).*)",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:3000"}/:path`,
      },
    ];
  },
};

export default nextConfig;
