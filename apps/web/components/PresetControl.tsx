"use client";

import { Check, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@hxsl/tool-registry";
import { presetStorageKey } from "../lib/preferences";
import { getUpgradeCopy } from "../lib/upgrade-copy";

type PresetOption = { key: string; label: string; sensitive?: boolean };
type Preset = { name: string; values: Record<string, string> };

export function PresetControl({ toolId, locale, options, values, onApply }: { toolId: string; locale: Locale; options: PresetOption[]; values: Record<string, string>; onApply: (values: Record<string, string>) => void }) {
  const copy = getUpgradeCopy(locale);
  const safeOptions = options.filter((option) => !option.sensitive && option.key !== "signatureImage");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");
  useEffect(() => { try { const stored = JSON.parse(window.localStorage.getItem(presetStorageKey(toolId)) ?? "[]"); if (Array.isArray(stored)) setPresets(stored.filter((item): item is Preset => Boolean(item && typeof item.name === "string" && item.values && typeof item.values === "object"))); } catch { setPresets([]); } }, [toolId]);
  if (!safeOptions.length) return null;
  function persist(next: Preset[]) { setPresets(next); try { window.localStorage.setItem(presetStorageKey(toolId), JSON.stringify(next.slice(0, 12))); } catch { /* storage is optional */ } }
  function save() { const trimmed = name.trim(); if (!trimmed) return; const preset = { name: trimmed, values: Object.fromEntries(safeOptions.map((option) => [option.key, values[option.key] ?? ""])) }; persist([preset, ...presets.filter((item) => item.name !== trimmed)]); setSelected(trimmed); setName(""); }
  function apply() { const preset = presets.find((item) => item.name === selected); if (preset) onApply(preset.values); }
  function remove() { if (!selected) return; persist(presets.filter((item) => item.name !== selected)); setSelected(""); }
  return <details className="preset-control"><summary><Save size={15} aria-hidden="true" />{copy.tool.presets}<span className="preset-count">{presets.length}</span></summary><div className="preset-body"><div className="preset-save-row"><label className="sr-only" htmlFor={`${toolId}-preset-name`}>{copy.tool.presetName}</label><input id={`${toolId}-preset-name`} value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.tool.presetName} /><button type="button" className="button button-secondary" onClick={save} disabled={!name.trim()}><Save size={14} aria-hidden="true" />{copy.tool.savePreset}</button></div>{presets.length > 0 && <div className="preset-apply-row"><select aria-label={copy.tool.presets} value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">{copy.tool.presets}</option>{presets.map((preset) => <option value={preset.name} key={preset.name}>{preset.name}</option>)}</select><button type="button" className="button button-primary" onClick={apply} disabled={!selected}><Check size={14} aria-hidden="true" />{copy.tool.apply}</button><button type="button" className="icon-button" onClick={remove} disabled={!selected} aria-label={copy.tool.deletePreset}><Trash2 size={15} aria-hidden="true" /></button></div>}</div></details>;
}
