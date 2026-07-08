// Shared display formatters for the monitoring/analytics pages.

/** Format an ISO timestamp as a locale date-time, or a dash when absent. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

/** Format an ISO timestamp as a locale date, or a dash when absent. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

/** Format a millisecond duration in a compact, human-readable way. */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remSeconds}s`;
}

/** Format a number with thousands separators, or a dash when absent. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

/** Safely stringify an unknown value as pretty JSON for debug display. */
export function toPrettyJson(value: unknown): string {
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Truncate a string to a max length with an ellipsis. */
export function truncate(value: string | null | undefined, max = 60): string {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
