import { adsConfig, adsTxtBody } from "../../lib/ads";
export const dynamic = "force-dynamic";
export function GET() {
  const body = adsTxtBody(adsConfig.client);
  if (!body) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
