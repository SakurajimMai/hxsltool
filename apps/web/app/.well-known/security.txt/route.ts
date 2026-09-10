import { siteConfig } from "../../../../../config/site";
export const dynamic = "force-dynamic";
export function GET() {
  const email = siteConfig.contactEmail;
  const body = [
    ...(email ? [`Contact: mailto:${email}`] : []),
    "Expires: 2027-09-10T00:00:00.000Z",
    "Preferred-Languages: en",
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
  ].join("\n");
  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
