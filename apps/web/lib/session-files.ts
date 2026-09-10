"use client";

const files = new Map<string, File>();
const ttlMs = 15 * 60 * 1000;

export function canContinueFile(file: Pick<File, "name">, formats: readonly string[]): boolean {
  const canonical = (format: string) => { const value = format.toLowerCase(); return value === "jpeg" ? "jpg" : value === "tif" ? "tiff" : value; };
  const extension = canonical(file.name.split(".").pop() ?? "");
  return formats.some(format => canonical(format) === extension);
}

export function createClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function storeSessionFile(file: File): string {
  const id = createClientId();
  files.set(id, file);
  window.setTimeout(() => files.delete(id), ttlMs);
  while (files.size > 12) files.delete(files.keys().next().value as string);
  return id;
}

export function takeSessionFile(id: string): File | undefined {
  const file = files.get(id);
  files.delete(id);
  return file;
}
