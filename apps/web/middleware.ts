import { NextResponse, type NextRequest } from "next/server";
import { LOCALES } from "@hxsl/tool-registry";
import { LOCALE_COOKIE, preferredLocale } from "./lib/locale-preference";
import { contentSecurityPolicy } from "./lib/ads";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/" && ["GET", "HEAD"].includes(request.method)) {
    const target = request.nextUrl.clone();
    target.pathname = `/${preferredLocale(request.cookies.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language"))}`;
    // Next middleware requires absolute redirects. Use the requested Host,
    // never the process's 0.0.0.0 bind; forwarded protocol needs explicit trust.
    const forwarded = process.env.TRUSTED_PROXY === "true" ? request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() : undefined;
    const protocol = forwarded === "https" || forwarded === "http" ? forwarded + ":" : target.protocol;
    const origin = new URL(`${protocol}//${request.headers.get("host") || target.host}`);
    const response = NextResponse.redirect(new URL(target.pathname + target.search, origin), 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Accept-Language, Cookie");
    response.headers.set("Content-Security-Policy", contentSecurityPolicy());
    return response;
  }
  const locale = request.nextUrl.pathname.split("/")[1];
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hxsl-path", request.nextUrl.pathname);
  requestHeaders.delete("x-hxsl-locale");
  if (LOCALES.includes(locale as (typeof LOCALES)[number])) requestHeaders.set("x-hxsl-locale", locale);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
