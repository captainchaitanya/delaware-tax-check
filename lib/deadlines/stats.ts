import { sameQuarter, type CivilDate } from "./civilDate";
import type { GeneratedDeadline } from "./generate";
import type { DeadlineProgress } from "../storage";

export function upcomingDeadlines(
  items: GeneratedDeadline[],
  limit = 5,
): GeneratedDeadline[] {
  return items
    .filter((item) => item.status !== "overdue")
    .slice(0, limit);
}

export function overdueCount(
  items: GeneratedDeadline[],
  progress: Record<string, DeadlineProgress>,
): number {
  return items.filter(
    (item) => item.status === "overdue" && !progress[item.id]?.done,
  ).length;
}

export function quarterCompletion(
  items: GeneratedDeadline[],
  today: CivilDate,
  progress: Record<string, DeadlineProgress>,
): { done: number; total: number } {
  const dueThisQuarter = items.filter((item) => sameQuarter(item.date, today));
  const done = dueThisQuarter.filter((item) => progress[item.id]?.done).length;
  return { done, total: dueThisQuarter.length };
}

