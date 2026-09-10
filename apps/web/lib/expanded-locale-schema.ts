// Compact source groups are expanded with strict key/count checks, never English fallbacks.
export const fields = {
  nav: "tools|guides|privacy|about",
  home: "eyebrow|title|description|primary|secondary|featured|featuredDescription|workflow|workflowDescription|privacyTitle|privacyDescription|browse",
  workspace: "dropTitle|dropDescription|choose|process|clear|remove|waiting|working|ready|failed|local|server|hybrid|format|size|output|consent|serverConsent|download|noFiles",
  categories: "pdf|image|svg|icons",
  common: "steps|limits|privacy|related|faq|input|output|honest|notFound",
  about: "title|intro|whatTitle|whatBody|limitsTitle|limitsBody",
  privacy: "title|intro|serverTitle|serverBody|retainedTitle|retainedBody|limitsTitle|limitsBody",
  terms: "title|intro|boundaryTitle|boundaryBody|fairTitle|fairBody",
  contact: "title|intro|missing",
  toolPage: "intro|stepsTitle|addTitle|addBody|optionsTitle|optionsBody|checkTitle|checkBody|limitsTitle|privacyTitle|localPrivacy|serverPrivacy|relatedIntro",
  categoryDescriptions: "pdf|image|svg|icons",
  directory: "title|subtitle|featured|all|browse|local|server|consent|help|announcement",
  footer: "tagline|guideOne|guideTwo|terms|contact|legal",
  faq: "formats|mode|options|noOptions|local|server",
  navigation: "search|menu|more|close",
  search: "placeholder|command|noResults|noResultsBody|clear|browse|hint|inputLabel",
  shortcuts: "title|description|recent|favorites|clear|empty|remove",
  filter: "filterLabel|allFormats|clear|showing|noMatches|noMatchesBody|browseAll|favorite|unfavorite",
  tool: "home|favorite|unfavorite|local|server|consent|files|options|presets|presetName|savePreset|apply|deletePreset|reset|stale|retry|results|downloadAll|continue|choose|review|process|download",
  language: "title|search|empty|warning|skip",
  checks: "unsupported|tooLarge|empty|saved|larger|preview|order|error",
  status: "cancel|cancelled",
  accessibility: "light|dark|outline|stitches|mask",
  dynamic: "description|limits|pages|formats|options|compress|convert|text|favicon",
  signature: "title|hint|clear|upload|uploadError",
  thumbnails: "title|loading|selection|reorder|page|selected|limited|failed",
  names: "Merge PDF|Split PDF|Rotate PDF|Reorder Pages|Extract Pages|Delete Pages|Reverse PDF|Duplicate Pages|Compress PDF|Add Watermark|Add Page Numbers|Edit Metadata|Crop PDF|Flatten PDF|Header & Footer|Resize PDF|Sign PDF|Unlock PDF|Protect PDF|Compare PDF|Redact PDF|PDF OCR|Sanitize PDF|Verify PDF|SVG Color Editor|SVG Palette Swapper|SVG Optimizer|SVG Pattern Maker|SVG QR Code|Image Compressor|Resize Image|Crop Image|Rotate Image|Image Background|Remove EXIF|Icon Resource Pack",
  options: "Page range|Page order (for example 2,1,3)|Pages to duplicate|Repeats|Insert position|Quality|Resolution (DPI)|Create one long image|Paper|Orientation|Margin (pt)|Fit|Background color|Frame (1 = first)|Compression mode|Watermark text|Text size|Position|Rotation|Opacity|Start number|Page number format ({page} supported)|Title|Author|Subject|Keywords|Crop inset (pt)|Header ({page} supported)|Footer ({page} supported)|Page preset|Page width (pt)|Page height (pt)|Signature text|PDF password|New PDF password|Visual page diff|Terms to remove (comma separated)|OCR language(s)|Replacement color|Palette|Width|Height|Scale|QR content|Error correction|Flip|Padding",
  choices: "image|portrait|landscape|contain|cover|structural|lossy|top-left|top-center|top-right|center|bottom-left|bottom-center|bottom-right|custom|original|none|horizontal|vertical",
  trust: "account|browser|formats|retention",
  guideImage: "title|intro|formatTitle|formatBody|resizeTitle|resizeBody|checkTitle|checkBody",
  guidePdf: "title|intro|taskTitle|taskBody|checkTitle|checkBody|modeTitle|modeBody",
} as const;
type Split<S extends string> = S extends `${infer H}|${infer T}` ? H | Split<T> : S;
export type LocaleSource = { name: string } & Record<keyof typeof fields, string>;
export type ExpandedCopy = { name: string } & { [K in keyof typeof fields]: Record<Split<(typeof fields)[K]>, string> };
export function expandLocale(source: LocaleSource): ExpandedCopy {
  const result: Record<string, unknown> = { name: source.name };
  for (const group of Object.keys(fields) as Array<keyof typeof fields>) {
    const keys = fields[group].split("|"), values = source[group].split("|");
    if (keys.length !== values.length || values.some(value => !value.trim())) throw new Error(`${source.name}.${group}: expected ${keys.length} translations, received ${values.length}`);
    result[group] = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
  }
  return result as ExpandedCopy;
}
export function formatLocale(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (token, name: string) => values[name] === undefined ? token : String(values[name]));
}
