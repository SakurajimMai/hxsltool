import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
const exec = promisify(execFile);
async function engineVersion(command: string, args: string[] = ["--version"]): Promise<string | null> { try { const result = await exec(command, args, { timeout: 2500, maxBuffer: 4096 }); return (result.stdout || result.stderr).split("\n")[0].slice(0, 120) || "available"; } catch { return null; } }
export async function GET() { const names = ["ghostscript", "qpdf", "pdftoppm", "pdftotext", "tesseract", "libreoffice"] as const; const commands: Record<(typeof names)[number], string> = { ghostscript: "gs", qpdf: "qpdf", pdftoppm: "pdftoppm", pdftotext: "pdftotext", tesseract: "tesseract", libreoffice: "libreoffice" }; const values = await Promise.all(names.map((name) => engineVersion(commands[name], name === "pdftoppm" || name === "pdftotext" ? ["-v"] : undefined))); return NextResponse.json({ status: "ok", service: "web", version: "0.1.0", serverTools: process.env.ENABLE_SERVER_TOOLS !== "false", engines: Object.fromEntries(names.map((name, index) => [name, values[index]])) }, { headers: { "Cache-Control": "no-store" } }); }
