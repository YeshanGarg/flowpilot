export function elapsedLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";

  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "less than a minute";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function isOverdue(iso: string, thresholdMinutes = 15): boolean {
  const ms = Date.now() - new Date(iso).getTime();
  return !Number.isNaN(ms) && ms > thresholdMinutes * 60000;
}
