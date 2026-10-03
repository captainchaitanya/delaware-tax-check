import { addMonths, formatCivilDate, type CivilDate } from "./civilDate";
import type { GeneratedDeadline } from "./generate";

export type MonthBucket = {
  year: number;
  month: number;
  label: string;
  count: number;
};

export function deadlinesByMonth(
  items: GeneratedDeadline[],
  today: CivilDate,
  months = 12,
): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let offset = 0; offset < months; offset += 1) {
    const cursor = addMonths({ year: today.year, month: today.month, day: 1 }, offset);
    buckets.push({
      year: cursor.year,
      month: cursor.month,
      label: formatCivilDate(cursor).replace(/\s\d+,/, ""),
      count: items.filter(
        (item) => item.date.year === cursor.year && item.date.month === cursor.month,
      ).length,
    });
  }
  return buckets;
}
