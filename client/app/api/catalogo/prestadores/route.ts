/**
 * Proxy for /catalogo/prestadores -> backend /catalogo/prestadores
 *
 * PUBLIC endpoint — the backend does NOT require auth for the catalog search
 * (UC-04). We use a plain fetch instead of backendFetch because backendFetch
 * short-circuits with 401 when no session cookie is present, which breaks
 * anonymous catalog browsing.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const path = `/catalogo/prestadores${qs ? `?${qs}` : ""}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}