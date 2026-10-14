/** Select homepage cards by their next occurrence without changing the source list. */
export function selectCategoryPreview<T extends {
  nextDate: string | null;
  recurrence_start_date: string | null;
  nextStartTime?: string;
}>(markets: readonly T[]): T[] {
  return [...markets].sort((a, b) => {
    const aDate = a.nextDate ?? a.recurrence_start_date;
    const bDate = b.nextDate ?? b.recurrence_start_date;
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate) || (a.nextStartTime ?? "").localeCompare(b.nextStartTime ?? "");
  }).slice(0, 3);
}