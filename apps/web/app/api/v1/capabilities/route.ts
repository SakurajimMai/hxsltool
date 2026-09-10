export const runtime = "nodejs";
function retired() { return Response.json({ error: "PUBLIC_PRODUCT_RETIRED", message: "Public capability discovery has been retired." }, { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }); }
export { retired as GET, retired as POST, retired as PUT, retired as PATCH, retired as DELETE, retired as OPTIONS };
