import type { Locale } from "@hxsl/tool-registry";
import { getMessages } from "../lib/i18n";
import { getWorkspaceCopy } from "../lib/workspace-copy";
import { resultChange, unchangedSize, type ResultInput } from "../lib/result-summary";

export function FileResultSummary({ input, output, locale, formatBytes }: { input: ResultInput; output: File; locale: Locale; formatBytes: (size: number) => string }) {
  const m = getMessages(locale), wc = getWorkspaceCopy(locale), change = resultChange(input.inputBytes, output.size);
  return <div className="result-summary" data-input-bytes={input.inputBytes} data-output-bytes={output.size} data-input-count={input.inputCount}>
    {input.inputCount > 1 && <small className="result-group-count">{m.common.input}: {input.inputCount.toLocaleString(locale)} → {m.common.output}: 1</small>}
    <small className="result-output-name">{m.common.output}: {output.name}</small>
    <small>{m.common.input}: {formatBytes(input.inputBytes)} → {m.common.output}: {formatBytes(output.size)}</small>
    {change && <small className="result-change">{change.direction === "unchanged" ? unchangedSize(locale) : `${new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(change.ratio)} ${change.direction === "larger" ? wc.larger : wc.saved}`}</small>}
  </div>;
}
