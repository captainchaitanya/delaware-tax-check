import { toIsoDate, type CivilDate } from "./civilDate";
import type { GeneratedDeadline } from "./generate";

function icsDate(date: CivilDate): string {
  return toIsoDate(date).replaceAll("-", "");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function deadlinesToIcs(
  items: GeneratedDeadline[],
  calendarName = "Founder Desk",
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Founder Desk//Compliance Calendar//EN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const item of items) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}@founder-desk`,
      `DTSTART;VALUE=DATE:${icsDate(item.date)}`,
      `SUMMARY:${escapeText(item.title)}`,
      `DESCRIPTION:${escapeText(`${item.whatThisIs} Source: ${item.sourceUrl}. Unverified candidate date.`)}`,
      `CATEGORIES:${item.jurisdiction}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
