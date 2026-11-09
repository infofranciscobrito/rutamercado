/** Select homepage cards: featured markets first, then by next occurrence. */
export function selectCategoryPreview<T extends {
  nextDate: string | null;
  recurrence_start_date: string | null;
  nextStartTime?: string;
  destacado?: boolean;
}>(markets: readonly T[]): T[] {
  return [...markets].sort((a, b) => {
    const featuredDiff = Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    if (featuredDiff !== 0) return featuredDiff;
    const aDate = a.nextDate ?? a.recurrence_start_date;
    const bDate = b.nextDate ?? b.recurrence_start_date;
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate) || (a.nextStartTime ?? "").localeCompare(b.nextStartTime ?? "");
  }).slice(0, 3);
}