export const limits = {
  localImageConcurrency: 2,
  mobileImageConcurrency: 1,
  serverJobConcurrency: 1,
  maxInputImageBytes: 8 * 1024 * 1024,
  maxInputPdfBytes: 50 * 1024 * 1024,
  maxOutputBytes: 200 * 1024 * 1024,
  maxJobSeconds: 120,
} as const;
