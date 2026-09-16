/**
 * Visible fill for the GENOSYS Rewards spend bar.
 *
 * The labels show current spend against the next-tier threshold. When Silver
 * (or Gold) was earned by order count, spend can sit below that tier's floor
 * and the API percent used to go negative, then clamp to an invisible bar.
 */
export function visibleTierProgressPercent(progress = {}) {
  const spent = Number(progress.currentSpent || 0);
  const target = Number(progress.nextTierAt || 0);
  const reported = Number(progress.progressPercent);
  const fromLabels = target > 0 ? (spent / target) * 100 : 0;
  const raw = Number.isFinite(reported) && reported > 0 ? reported : fromLabels;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, raw));
}

export function visibleTierProgressFill(progress = {}) {
  const pct = visibleTierProgressPercent(progress);
  const spent = Number(progress.currentSpent || 0);
  if (spent > 0 && pct > 0 && pct < 8) return 8;
  if (spent > 0 && pct === 0) return 8;
  return pct;
}
