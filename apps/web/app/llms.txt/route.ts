import { llmsTxt } from "../../lib/llms-txt";
export const dynamic = "force-dynamic";
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
