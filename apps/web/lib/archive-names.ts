/** Flat, portable ZIP entry names. Preserve every result, including naming collisions. */
export function archiveEntryNames(names: readonly string[]): string[] {
  const encoder = new TextEncoder();
  const cleaned = names.map(name => {
    let safe = name.normalize("NFC").split(/[\\/]/).pop()!.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "_").replace(/[. ]+$/g, "").trim();
    if (!safe || safe === "." || safe === "..") safe = "result";
    if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(safe)) safe = `_${safe}`;
    // Leave room for collision suffixes, preserve the output extension and keep code points intact.
    const dot = safe.lastIndexOf(".");
    const extension = dot > 0 && encoder.encode(safe.slice(dot)).length <= 20 ? safe.slice(dot) : "";
    const stem = extension ? safe.slice(0, dot) : safe;
    let bounded = "";
    for (const character of stem) { if (encoder.encode(bounded + character + extension).length > 200) break; bounded += character; }
    return (bounded.replace(/[. ]+$/g, "") || "result") + extension;
  });
  const reserved = new Set(cleaned.map(name => name.toLowerCase())), used = new Set<string>();
  return cleaned.map(name => {
    const dot = name.lastIndexOf("."), stem = dot > 0 ? name.slice(0, dot) : name, extension = dot > 0 ? name.slice(dot) : "";
    let candidate = name, number = 2;
    while (used.has(candidate.toLowerCase())) {
      do { candidate = `${stem} (${number++})${extension}`; } while (reserved.has(candidate.toLowerCase()));
    }
    used.add(candidate.toLowerCase()); return candidate;
  });
}
