import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getTool, type Tool } from "@hxsl/tool-registry";
import { PDFDocument } from "pdf-lib";
import { extractPdfText, inspectImage, processImage, processPdf, rasterImageToSvg, renderPdf, runQpdf, type OutputFile } from "@hxsl/processing-shared";
import { siteConfig } from "../../../config/site";
import { getEffectiveToolLimits } from "./public-config";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "expired";
export type JobPhase = "waiting" | "validating" | "loading" | "processing" | "generating" | "completed" | "failed" | "cancelled" | "expired";
export type Job = { id: string; tokenHash: string; status: JobStatus; phase: JobPhase; toolId: string; inputPath: string; inputPaths: string[]; names: string[]; options: Record<string, string>; outputPath?: string; outputName?: string; outputMime?: string; error?: string; createdAt: number; expiresAt: number; retryCount: number; configurationVersion: number; cleanupState: "pending" | "cleaned" };

const root = path.join(process.env.HXSL_JOB_DIR ?? path.join(os.tmpdir(), "hxsl-tools"), "jobs");
const jobs = new Map<string, Job>();
const activeControllers = new Map<string, AbortController>();
const persistenceChains = new Map<string, Promise<void>>();
const admissionBuckets = new Map<string, { startedAt: number; count: number }>();
let activeReservations = 0;
let recovered = false;

export class JobAdmissionError extends Error {
  constructor(public readonly statusCode: 429 | 503, message: string) { super(message); this.name = "JobAdmissionError"; }
}

function hash(value: string) { const secret = process.env.JOB_TOKEN_SECRET; return secret ? createHmac("sha256", secret).update(value).digest("hex") : createHash("sha256").update(value).digest("hex"); }
function safeName(name: string) { return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.+/g, ".").slice(0, 100) || "input.bin"; }
function tokenMatches(job: Job, token: string | null) { if (!token) return false; const left = Buffer.from(job.tokenHash); const right = Buffer.from(hash(token)); return left.length === right.length && timingSafeEqual(left, right); }
async function ensureRoot() { await mkdir(root, { recursive: true, mode: 0o700 }); }

function manifestPath(job: Job) { return path.join(path.dirname(job.inputPath), "job.json"); }
function safeOptions(options: Record<string, string>) { const allowed = new Set(["pages", "order", "times", "position", "format", "width", "height", "paper", "orientation", "margin", "fit", "background", "quality", "dpi", "longImage", "language", "inset", "start", "size", "opacity", "rotation", "angle", "signature", "x", "y", "header", "footer", "title", "author", "subject", "keywords", "terms", "color", "palette", "text", "errorCorrection", "visual", "mode", "frame"]); return Object.fromEntries(Object.entries(options).filter(([key]) => allowed.has(key)).map(([key, value]) => [key, value.slice(0, 200)])); }
async function persistJob(job: Job) {
  const filename = manifestPath(job); const temporary = `${filename}.tmp`;
  const snapshot = JSON.stringify({ id: job.id, tokenHash: job.tokenHash, status: job.status, phase: job.phase, toolId: job.toolId, inputPath: job.inputPath, inputPaths: job.inputPaths, names: job.names, options: safeOptions(job.options), outputPath: job.outputPath, outputName: job.outputName, outputMime: job.outputMime, error: job.error, createdAt: job.createdAt, expiresAt: job.expiresAt, retryCount: job.retryCount, configurationVersion: job.configurationVersion, cleanupState: job.cleanupState });
  const previous = persistenceChains.get(job.id) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(async () => { await writeFile(temporary, snapshot, { mode: 0o600 }); await rename(temporary, filename); });
  persistenceChains.set(job.id, next);
  try { await next; } finally { if (persistenceChains.get(job.id) === next) persistenceChains.delete(job.id); }
}
function within(folder: string, candidate: string) { const relative = path.relative(folder, candidate); return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)); }
function assertJobActive(job: Job, controller: AbortController) {
  if (jobs.get(job.id) === job && job.status === "running" && !controller.signal.aborted) return;
  if (controller.signal.reason instanceof Error) throw controller.signal.reason;
  throw new Error("The task is no longer active.");
}

const mimeFormats: Record<string, string> = { "application/pdf": "PDF", "image/svg+xml": "SVG", "image/png": "PNG", "image/jpeg": "JPG", "image/jpg": "JPG", "image/webp": "WEBP", "image/avif": "AVIF", "image/bmp": "BMP", "image/gif": "GIF", "image/tiff": "TIFF", "application/msword": "DOC", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX", "application/vnd.ms-excel": "XLS", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX", "application/vnd.ms-powerpoint": "PPT", "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX" };
function extensionFormat(name: string) { const dot = name.lastIndexOf("."); if (dot <= 0 || dot === name.length - 1) return ""; const extension = name.slice(dot + 1).toLowerCase(); return extension === "jpeg" ? "JPG" : extension.toUpperCase(); }
function isPasswordUnlock(tool: { slug: string }) { return tool.slug === "unlock-pdf"; }
async function validateInput(file: File, tool: Pick<Tool, "id" | "category" | "limits" | "inputFormats" | "slug">) {
  const limits = getEffectiveToolLimits(tool); if (file.size > (limits.maxMb ?? 50) * 1024 * 1024) throw new Error(`Each input must be smaller than the ${limits.maxMb ?? 50} MB limit.`);
  const accepted = new Set(tool.inputFormats.map((format) => format.toUpperCase())); if (accepted.has("TEXT")) return;
  const extension = extensionFormat(file.name); const declared = mimeFormats[file.type.toLowerCase()]; if (extension && !accepted.has(extension)) throw new Error(`The file extension .${extension.toLowerCase()} is not accepted for this task.`); if (declared && !accepted.has(declared)) throw new Error(`The declared MIME type ${file.type} is not accepted for this task.`); if (extension && declared && extension !== declared) throw new Error("The file extension and MIME type do not agree.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (accepted.has("PDF")) { if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("The input does not have a valid PDF signature."); if (!isPasswordUnlock(tool)) { try { const pdf = await PDFDocument.load(buffer, { ignoreEncryption: false }); if (pdf.getPageCount() > (limits.maxPages ?? siteConfig.maxPdfPages)) throw new Error(`The PDF exceeds the ${limits.maxPages ?? siteConfig.maxPdfPages}-page limit.`); } catch (error) { if (error instanceof Error && /exceeds the .*page limit/.test(error.message)) throw error; if (!buffer.toString("latin1").includes("/Encrypt")) throw new Error("The input is not a readable PDF."); } } return; }
  const raster = ["PNG", "JPG", "WEBP", "AVIF", "BMP", "GIF", "TIFF"].some((format) => accepted.has(format));
  if (raster) { const image = await inspectImage(buffer); const actual = image.format === "jpeg" ? "JPG" : image.format.toUpperCase(); if (!accepted.has(actual)) throw new Error(`The decoded image format ${actual} is not accepted for this task.`); if (image.width * image.height > (limits.maxPixels ?? siteConfig.maxDecodedPixels)) throw new Error("Decoded pixel limit exceeded."); if (image.pages && image.pages > (limits.maxPages ?? 300)) throw new Error(`The image exceeds the ${limits.maxPages ?? 300}-frame limit.`); return; }
  if (accepted.has("SVG") && !/^\s*<svg\b/i.test(buffer.toString("utf8"))) throw new Error("The input does not have an SVG root element.");
}

async function recover() {
  if (recovered) return; recovered = true; await ensureRoot();
  for (const entry of await readdir(root, { withFileTypes: true })) if (entry.isDirectory()) { const folder = path.join(root, entry.name); const info = await stat(folder).catch(() => null); if (!info) continue; if (Date.now() - info.mtimeMs > 60 * 60 * 1000) { await rm(folder, { recursive: true, force: true }); continue; } const manifest = await readFile(path.join(folder, "job.json"), "utf8").catch(() => null); if (!manifest) continue; try { const parsed = JSON.parse(manifest) as Job; if (parsed.id !== entry.name || parsed.expiresAt < Date.now() || !within(folder, parsed.inputPath) || parsed.inputPaths.some((inputPath) => !within(folder, inputPath)) || (parsed.outputPath && !within(folder, parsed.outputPath))) { await rm(folder, { recursive: true, force: true }); continue; } parsed.names = Array.isArray(parsed.names) ? parsed.names.map((name) => safeName(name)) : [safeName(path.basename(parsed.inputPath))]; parsed.options = parsed.options && typeof parsed.options === "object" ? safeOptions(parsed.options) : {}; parsed.phase = parsed.phase ?? (parsed.status === "completed" ? "completed" : "waiting"); parsed.retryCount = Number.isFinite(parsed.retryCount) ? parsed.retryCount : 0; parsed.configurationVersion = Number.isFinite(parsed.configurationVersion) ? parsed.configurationVersion : 1; parsed.cleanupState = parsed.cleanupState === "cleaned" ? "cleaned" : "pending"; jobs.set(parsed.id, parsed); if (parsed.status === "queued" || parsed.status === "running") { parsed.status = "queued"; void runJob(parsed, parsed.names, parsed.options); } } catch { await rm(folder, { recursive: true, force: true }); } }
}

function admit(clientKey: string): () => void {
  const now = Date.now(); const windowMs = 60_000; const limit = Math.max(1, Number(process.env.JOB_RATE_LIMIT_PER_MINUTE ?? 30)); const maxActive = Math.max(1, Number(process.env.MAX_ACTIVE_JOBS ?? 4));
  const active = [...jobs.values()].filter((job) => job.status === "queued" || job.status === "running").length;
  if (active + activeReservations >= maxActive) throw new JobAdmissionError(503, "The server is busy. Please retry after an active task finishes.");
  const current = admissionBuckets.get(clientKey); const bucket = !current || now - current.startedAt >= windowMs ? { startedAt: now, count: 0 } : current;
  if (bucket.count >= limit) throw new JobAdmissionError(429, "Too many tasks from this client. Please retry in a minute.");
  bucket.count += 1; admissionBuckets.set(clientKey, bucket);
  if (admissionBuckets.size > 10_000) for (const [key, value] of admissionBuckets) if (now - value.startedAt >= windowMs) admissionBuckets.delete(key);
  activeReservations += 1;
  return () => { activeReservations = Math.max(0, activeReservations - 1); };
}

export async function createJob(files: File[], toolId: string, options: Record<string, string>, consent: boolean, clientKey = "anonymous"): Promise<{ job: Job; token: string }> {
  await recover(); const tool = getTool(toolId.split(".")[0], toolId.split(".").slice(1).join(".")); if (!tool || !tool.enabled) throw new Error("Unknown tool."); const limits = getEffectiveToolLimits(tool); if (!files.length) throw new Error("At least one file is required."); if (files.length > (limits.maxFiles ?? 1)) throw new Error(`This task accepts at most ${limits.maxFiles ?? 1} file(s).`); for (const file of files) await validateInput(file, tool);
  if (tool.processingMode !== "local" && !consent) throw new Error("Explicit upload consent is required.");
  const release = admit(clientKey);
  try {
    const id = randomUUID(); const token = randomBytes(32).toString("base64url"); const folder = path.join(root, id); await mkdir(folder, { recursive: true, mode: 0o700 }); const inputPaths: string[] = []; for (const [index, file] of files.entries()) { const inputPath = path.join(folder, `${String(index).padStart(3, "0")}-${safeName(file.name)}`); await writeFile(inputPath, Buffer.from(await file.arrayBuffer()), { mode: 0o600 }); inputPaths.push(inputPath); }
    const job: Job = { id, tokenHash: hash(token), status: "queued", phase: "waiting", toolId, inputPath: inputPaths[0], inputPaths, names: files.map((file) => safeName(file.name)), options: { ...options }, createdAt: Date.now(), expiresAt: Date.now() + siteConfig.resultTtlSeconds * 1000, retryCount: 0, configurationVersion: 1, cleanupState: "pending" }; jobs.set(id, job); await persistJob(job); release(); void runJob(job, job.names, job.options); return { job, token };
  } catch (error) { release(); throw error; }
}

async function runJob(job: Job, names: string[], options: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`The task exceeded the ${siteConfig.maxJobSeconds}-second limit.`)), siteConfig.maxJobSeconds * 1000);
  activeControllers.set(job.id, controller);
  job.status = "running"; job.phase = "loading"; await persistJob(job).catch(() => undefined);
  try {
    assertJobActive(job, controller);
    const tool = getTool(job.toolId.split(".")[0], job.toolId.split(".").slice(1).join(".")); if (!tool) throw new Error("Unknown tool."); const inputs = await Promise.all(job.inputPaths.map((inputPath) => readFile(inputPath))); const input = inputs[0]; let result: OutputFile;
    assertJobActive(job, controller);
    if (tool.category === "image") { job.phase = "processing"; result = await processImage(input, names[0], { quality: Number(options.quality ?? 82), width: Number(options.width) || undefined, height: Number(options.height) || undefined, format: tool.slug === "image-compressor" ? (await inspectImage(input)).format : tool.outputFormats[0].toLowerCase() }); }
    else if (tool.category === "svg" && tool.adapterId.endsWith("-to-svg")) result = await rasterImageToSvg(input, names[0], Number(options.frame ?? 1), controller.signal);
    else if (["pdf-to-png", "pdf-to-jpg", "pdf-to-webp"].includes(tool.adapterId)) result = await renderPdf(input, names[0], tool.adapterId.endsWith("png") ? "png" : tool.adapterId.endsWith("jpg") ? "jpg" : "webp", Number(options.quality ?? 82), controller.signal, options);
    else if (tool.adapterId === "pdf-to-text") result = await extractPdfText(input, names[0], controller.signal);
    else if (job.toolId.endsWith("unlock-pdf")) result = await runQpdf(input, names[0], "decrypt", options.password ?? "", controller.signal);
    else if (job.toolId.endsWith("protect-pdf")) result = await runQpdf(input, names[0], "encrypt", options.password ?? "", controller.signal);
    else result = await processPdf(inputs, names, tool.adapterId, options, controller.signal);
    assertJobActive(job, controller);
    if ((tool.slug === "image-compressor" || tool.slug.startsWith("compress-")) && result.buffer.byteLength >= input.byteLength) result = { ...result, buffer: input, filename: names[0] };
    const maxOutputBytes = Math.max(1, siteConfig.maxOutputBytes); if (result.buffer.byteLength > maxOutputBytes) throw new Error("The generated result exceeds the configured output limit.");
    job.phase = "generating"; await persistJob(job).catch(() => undefined); assertJobActive(job, controller);
    job.outputPath = path.join(path.dirname(job.inputPath), `result-${safeName(result.filename)}`); job.outputName = result.filename; job.outputMime = result.mime; await writeFile(job.outputPath, result.buffer, { mode: 0o600 }); assertJobActive(job, controller);
    job.status = "completed"; job.phase = "completed"; await persistJob(job);
  } catch (error) { if (jobs.get(job.id) === job && job.status === "running") { job.status = "failed"; job.phase = "failed"; job.error = error instanceof Error ? error.message : "Processing failed."; await persistJob(job).catch(() => undefined); } }
  finally { clearTimeout(timeout); if (activeControllers.get(job.id) === controller) activeControllers.delete(job.id); const finalStatus = job.status as JobStatus; const removeInputs = finalStatus === "completed" || finalStatus === "cancelled"; if (removeInputs) { const cleanupPaths = finalStatus === "cancelled" ? [...job.inputPaths, job.outputPath] : job.inputPaths; await Promise.all(cleanupPaths.filter((value): value is string => Boolean(value)).map((inputPath) => rm(inputPath, { force: true }).catch(() => undefined))); job.cleanupState = "cleaned"; await persistJob(job).catch(() => undefined); } }
}

export async function getJob(id: string, token: string | null): Promise<Job | null> { await recover(); const job = jobs.get(id); if (!job || !tokenMatches(job, token)) return null; if (job.expiresAt < Date.now()) { await deleteJob(job); return { ...job, status: "expired" }; } return job; }
export async function deleteJob(job: Job) { activeControllers.get(job.id)?.abort(new Error("The task expired.")); activeControllers.delete(job.id); job.status = "expired"; job.phase = "expired"; job.cleanupState = "cleaned"; await rm(path.dirname(job.inputPath), { recursive: true, force: true }).catch(() => undefined); jobs.delete(job.id); }
export async function cancelJob(job: Job) { if (!["queued", "running"].includes(job.status)) return; job.status = "cancelled"; job.phase = "cancelled"; activeControllers.get(job.id)?.abort(new Error("The task was cancelled.")); activeControllers.delete(job.id); await Promise.all([...job.inputPaths, job.outputPath].filter((value): value is string => Boolean(value)).map((inputPath) => rm(inputPath, { force: true }).catch(() => undefined))); job.cleanupState = "cleaned"; await persistJob(job).catch(() => undefined); }
export async function resultBuffer(job: Job) { if (!job.outputPath || job.status !== "completed") return null; return readFile(job.outputPath).catch(() => null); }

const cleanupTimer = setInterval(() => { for (const job of jobs.values()) if (job.expiresAt < Date.now()) void deleteJob(job); }, 60_000); cleanupTimer.unref();
