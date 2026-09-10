import type { Tool } from "@hxsl/tool-registry";

/** Revisions are session-local counters, never serialized options (which can contain passwords). */
export type QueueRevision = {
  status: "waiting" | "working" | "ready" | "failed" | "cancelled";
  attemptRevision?: number;
  resultRevision?: number;
  preflightFailed?: boolean;
  output?: unknown;
};

export function defaultWorkspaceOptions(schema: Tool["optionSchema"]): Record<string, string> {
  return Object.fromEntries(schema.map(option => [option.key, String(option.defaultValue ?? option.choices?.[0] ?? "")]));
}

export function staleResult(item: QueueRevision, revision: number): boolean {
  return item.resultRevision !== undefined && item.resultRevision !== revision;
}

export function currentOutput(item: QueueRevision, revision: number): boolean {
  return item.status === "ready" && Boolean(item.output) && item.resultRevision === revision;
}

export function pendingInputs<T extends QueueRevision>(items: T[], revision: number, grouped: boolean): T[] {
  const valid = items.filter(item => !item.preflightFailed && item.status !== "cancelled" && item.status !== "working");
  const pending = valid.filter(item => item.status === "waiting" || item.attemptRevision !== undefined && item.attemptRevision !== revision);
  return grouped && pending.length ? valid : pending;
}

/** A combined output depends on every input, including the row owning the download. */
export function requeueGroup<T extends QueueRevision>(items: T[]): T[] {
  return items.map(item => item.preflightFailed || item.status === "cancelled" ? item : {
    ...item, status: "waiting", output: undefined, resultInput: undefined, error: undefined,
    attemptRevision: undefined, resultRevision: undefined,
  });
}
