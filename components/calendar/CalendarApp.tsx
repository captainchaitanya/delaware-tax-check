"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/app/AppState";
import { Badge, VerificationBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectInput, TextArea, TextInput } from "@/components/ui/Input";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import {
  addMonths,
  civilDateInTimeZone,
  daysInMonth,
  deadlinesToIcs,
  formatCivilDate,
  customToGenerated,
  generateDeadlines,
  weekday,
  type CivilDate,
  type CustomDeadline,
  type DeadlineStatus,
  type GeneratedDeadline,
  type Jurisdiction,
} from "@/lib/deadlines";
import { ANALYTICS_EVENTS, capture } from "@/lib/analytics";
import { newId } from "@/lib/ids";

const STATUS_LABEL: Record<DeadlineStatus, string> = {
  overdue: "Overdue",
  thisWeek: "This week",
  thisMonth: "This month",
  later: "Later",
};

export function CalendarApp() {
  const {
    state,
    setDeadlineProgress,
    upsertCustomDeadline,
    removeCustomDeadline,
    removeDeadlineOverride,
  } = useAppState();
  const { notify } = useToast();
  const profile = state.profile;
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | "all">("all");
  const [selected, setSelected] = useState<GeneratedDeadline | null>(null);
  const [adding, setAdding] = useState(false);
  const [monthCursor, setMonthCursor] = useState<CivilDate>(() =>
    civilDateInTimeZone(new Date(), "America/New_York"),
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = useMemo(
    () => civilDateInTimeZone(new Date(), "America/New_York"),
    [],
  );

  const items = useMemo(() => {
    if (!profile) {
      return [];
    }
    return generateDeadlines(profile, today, {
      lookbackDays: 90,
      customDeadlines: state.customDeadlines,
      overrides: state.deadlineOverrides,
    });
  }, [profile, state.customDeadlines, state.deadlineOverrides, today]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (jurisdiction !== "all" && item.jurisdiction !== jurisdiction) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        item.title.toLowerCase().includes(needle) ||
        item.whatThisIs.toLowerCase().includes(needle)
      );
    });
  }, [items, jurisdiction, query]);

  if (!profile) {
    return null;
  }

  function exportIcs() {
    if (!profile) {
      return;
    }
    const ics = deadlinesToIcs(filtered, `${profile.companyName} filings`);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "founder-desk-deadlines.ics";
    link.click();
    URL.revokeObjectURL(url);
    notify("Calendar file downloaded");
    capture(ANALYTICS_EVENTS.icsExported);
  }

  const grouped = groupByMonth(filtered);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            Calendar
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Candidate dates for the next 12 months. Check the badge on each
            item before you treat a date as final.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setAdding((open) => !open)}>
            Add deadline
          </Button>
          <Button variant="secondary" onClick={exportIcs}>
            Export .ics
          </Button>
        </div>
      </div>

      {adding ? (
        <AddDeadlineForm
          onCancel={() => setAdding(false)}
          onSave={(deadline) => {
            upsertCustomDeadline(deadline);
            setAdding(false);
            notify("Deadline added");
          }}
        />
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <TextInput
          id="deadline-search"
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Franchise tax, GST, 1120…"
        />
        <fieldset>
          <legend className="text-sm font-medium">Jurisdiction</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(["all", "US-Delaware", "US-Federal", "India"] as const).map(
              (option) => (
                <label
                  key={option}
                  className={`flex h-11 cursor-pointer items-center rounded-md border px-3 text-sm ${
                    jurisdiction === option
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-card hover:bg-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="jurisdiction"
                    className="sr-only"
                    checked={jurisdiction === option}
                    onChange={() => setJurisdiction(option)}
                  />
                  {option === "all" ? "All" : option}
                </label>
              ),
            )}
          </div>
        </fieldset>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            { id: "list", label: "List" },
            { id: "month", label: "Month" },
          ]}
          value={view}
          onChange={setView}
        >
          <TabPanel id="list" active={view === "list"}>
            <div className="mt-5 flex flex-col gap-6">
              {grouped.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No filings in this view"
                    body="Try clearing the search or showing every jurisdiction."
                  />
                </Card>
              ) : (
                grouped.map((group) => (
                  <section key={group.label}>
                    <h2 className="font-serif text-xl font-medium">
                      {group.label}
                    </h2>
                    <ul className="mt-3 flex flex-col gap-2">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <DeadlineRow
                            item={item}
                            done={Boolean(
                              state.deadlineProgress[item.id]?.done,
                            )}
                            onOpen={() => setSelected(item)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </TabPanel>
          <TabPanel id="month" active={view === "month"}>
            <MonthGrid
              month={monthCursor}
              items={filtered}
              selectedDay={selectedDay}
              onMonthChange={setMonthCursor}
              onSelectDay={(iso, dayItems) => {
                setSelectedDay(iso);
                if (dayItems[0]) {
                  setSelected(dayItems[0]);
                }
              }}
            />
          </TabPanel>
        </Tabs>
      </div>

      {selected ? (
        <DeadlineDrawer
          key={selected.id}
          item={selected}
          stored={state.customDeadlines.find((item) => item.id === selected.id)}
          done={Boolean(state.deadlineProgress[selected.id]?.done)}
          notes={state.deadlineProgress[selected.id]?.notes ?? ""}
          onClose={() => setSelected(null)}
          onSave={(progress) => {
            setDeadlineProgress(selected.id, progress);
            notify(progress.done ? "Marked as done" : "Saved");
            if (progress.done) {
              capture(ANALYTICS_EVENTS.deadlineMarkedDone);
            }
          }}
          onSaveCustom={(deadline) => {
            upsertCustomDeadline(deadline);
            setSelected(customToGenerated(deadline, today));
            notify("Deadline updated");
          }}
          onRemoveCustom={() => {
            removeCustomDeadline(selected.id);
            setSelected(null);
            notify("Deadline removed");
          }}
          onRevertOverride={
            selected.standardIsoDate
              ? () => {
                  const override = state.deadlineOverrides.find(
                    (entry) =>
                      entry.ruleId === selected.ruleId &&
                      entry.originalIsoDate === selected.standardIsoDate,
                  );
                  if (override) {
                    removeDeadlineOverride(override.id);
                  }
                  setSelected(null);
                  notify("Reverted to the standard date");
                }
              : undefined
          }
        />
      ) : null}
    </main>
  );
}

function DeadlineRow({
  item,
  done,
  onOpen,
}: {
  item: GeneratedDeadline;
  done: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start justify-between gap-3 rounded-md border border-line bg-card px-3 py-3 text-left hover:bg-paper"
    >
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="mt-1 font-mono text-sm tabular-nums text-muted">
          {formatCivilDate(item.date)}
        </p>
        {item.effectiveDate ? (
          <p className="mt-0.5 text-sm text-muted">
            Effective date: {formatCivilDate(item.effectiveDate)}, next business
            day
          </p>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusChip status={item.status} done={done} />
        {item.origin === "document" ? <Badge>From your document</Badge> : null}
        <VerificationBadge status={item.verificationStatus} />
      </div>
    </button>
  );
}

function StatusChip({
  status,
  done,
}: {
  status: DeadlineStatus;
  done: boolean;
}) {
  if (done) {
    return <Badge>Done</Badge>;
  }
  return (
    <Badge tone={status === "overdue" ? "warn" : "neutral"}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function MonthGrid({
  month,
  items,
  selectedDay,
  onMonthChange,
  onSelectDay,
}: {
  month: CivilDate;
  items: GeneratedDeadline[];
  selectedDay: string | null;
  onMonthChange: (next: CivilDate) => void;
  onSelectDay: (iso: string, items: GeneratedDeadline[]) => void;
}) {
  const first = { year: month.year, month: month.month, day: 1 };
  const startPad = weekday(first);
  const length = daysInMonth(month.year, month.month);
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length }, (_, index) => index + 1),
  ];

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => onMonthChange(addMonths(first, -1))}
        >
          Previous
        </Button>
        <p className="font-serif text-lg">
          {formatCivilDate(first).replace(/\s\d+,/, "")}
        </p>
        <Button
          variant="secondary"
          onClick={() => onMonthChange(addMonths(first, 1))}
        >
          Next
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`pad-${index}`} />;
          }
          const iso = `${month.year}-${String(month.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayItems = items.filter((item) => item.isoDate === iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(iso, dayItems)}
              className={`min-h-16 rounded-md border px-1 py-1 text-left ${
                selectedDay === iso
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-card hover:bg-paper"
              }`}
            >
              <span className="font-mono text-xs tabular-nums">{day}</span>
              {dayItems.length > 0 ? (
                <span className="mt-1 flex gap-0.5">
                  {dayItems.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                      title={item.title}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddDeadlineForm({
  onSave,
  onCancel,
}: {
  onSave: (deadline: CustomDeadline) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isoDate, setIsoDate] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("US-Delaware");
  const [whatThisIs, setWhatThisIs] = useState("");

  return (
    <Card className="mt-6">
      <h2 className="font-serif text-xl font-medium">Add a deadline</h2>
      <p className="mt-1 text-sm text-muted">
        Custom dates stay on the statutory day. They are not shifted for weekends.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextInput
          id="manual-title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextInput
          id="manual-date"
          label="Statutory date"
          type="date"
          value={isoDate}
          onChange={(event) => setIsoDate(event.target.value)}
        />
      </div>
      <div className="mt-3">
        <SelectInput
          id="manual-jurisdiction"
          label="Jurisdiction"
          value={jurisdiction}
          onChange={(event) =>
            setJurisdiction(event.target.value as Jurisdiction)
          }
        >
          <option value="US-Delaware">US-Delaware</option>
          <option value="US-Federal">US-Federal</option>
          <option value="India">India</option>
        </SelectInput>
      </div>
      <div className="mt-3">
        <TextArea
          id="manual-what"
          label="What this is"
          className="min-h-24"
          value={whatThisIs}
          onChange={(event) => setWhatThisIs(event.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            if (!title.trim() || !isoDate) {
              return;
            }
            onSave({
              id: newId("custom"),
              title: title.trim(),
              isoDate,
              jurisdiction,
              whatThisIs: whatThisIs.trim() || "Added by you.",
              ifMissed: "Confirm the official source before you treat this as final.",
              source: "manual",
              documentId: null,
            });
          }}
          disabled={!title.trim() || !isoDate}
        >
          Save deadline
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function DeadlineDrawer({
  item,
  stored,
  done,
  notes,
  onClose,
  onSave,
  onSaveCustom,
  onRemoveCustom,
  onRevertOverride,
}: {
  item: GeneratedDeadline;
  stored?: CustomDeadline;
  done: boolean;
  notes: string;
  onClose: () => void;
  onSave: (progress: { done: boolean; notes: string }) => void;
  onSaveCustom: (deadline: CustomDeadline) => void;
  onRemoveCustom: () => void;
  onRevertOverride?: () => void;
}) {
  const [draftNotes, setDraftNotes] = useState(notes);
  const [draftDone, setDraftDone] = useState(done);
  const [draftTitle, setDraftTitle] = useState(item.title);
  const [draftDate, setDraftDate] = useState(item.isoDate);
  const [draftWhat, setDraftWhat] = useState(item.whatThisIs);
  const custom = Boolean(stored);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/30"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-labelledby="deadline-drawer-title"
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-line bg-card p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="deadline-drawer-title"
            className="font-serif text-2xl font-medium"
          >
            {custom ? draftTitle : item.title}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="mt-2 font-mono tabular-nums text-muted">
          {formatCivilDate(item.date)} · {item.jurisdiction}
        </p>
        {item.effectiveDate ? (
          <p className="mt-1 text-sm text-muted">
            Effective date: {formatCivilDate(item.effectiveDate)}, next business
            day
          </p>
        ) : null}
        {item.rollConvention === "unknown" ? (
          <p className="mt-2 text-sm text-muted">
            Weekend/holiday handling not yet verified. Plan for the stated date.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusChip status={item.status} done={draftDone} />
          {item.origin === "document" ? <Badge>From your document</Badge> : null}
          <VerificationBadge status={item.verificationStatus} />
        </div>
        {custom ? (
          <div className="mt-5 flex flex-col gap-3">
            <TextInput
              id="edit-custom-title"
              label="Title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
            />
            <TextInput
              id="edit-custom-date"
              label="Statutory date"
              type="date"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
            <TextArea
              id="edit-custom-what"
              label="What this is"
              className="min-h-24"
              value={draftWhat}
              onChange={(event) => setDraftWhat(event.target.value)}
            />
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-4 text-sm leading-6">
          {custom ? null : <p>{item.whatThisIs}</p>}
          <p>
            <span className="font-medium">Who it applies to. </span>
            {item.appliesLabel}
          </p>
          <p>
            <span className="font-medium">If missed. </span>
            {item.ifMissed}
          </p>
          {item.standardIsoDate ? (
            <p>
              This date came from your document. The standard date is{" "}
              {item.standardIsoDate}.{" "}
              {onRevertOverride ? (
                <button
                  type="button"
                  onClick={onRevertOverride}
                  className="font-medium text-accent underline underline-offset-4"
                >
                  Revert to standard date
                </button>
              ) : null}
            </p>
          ) : null}
          {item.notes ? (
            <p>
              <span className="font-medium">Note. </span>
              {item.notes}
            </p>
          ) : null}
          {item.sources.length > 0 ? (
            <p>
              {item.sources.map((href, index) => (
                <span key={href}>
                  {index > 0 ? " · " : null}
                  <a
                    href={href}
                    className="text-accent underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {index === 0 ? "Official source" : `Source ${index + 1}`}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draftDone}
            onChange={(event) => setDraftDone(event.target.checked)}
          />
          Mark as done
        </label>
        <label className="mt-4 text-sm font-medium" htmlFor="deadline-notes">
          Notes
        </label>
        <textarea
          id="deadline-notes"
          value={draftNotes}
          onChange={(event) => setDraftNotes(event.target.value)}
          className="mt-1 min-h-28 rounded-md border border-line bg-background px-3 py-2 text-sm"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (stored) {
                onSaveCustom({
                  ...stored,
                  title: draftTitle.trim() || stored.title,
                  isoDate: draftDate || stored.isoDate,
                  whatThisIs: draftWhat.trim() || stored.whatThisIs,
                });
              }
              onSave({ done: draftDone, notes: draftNotes });
            }}
          >
            Save
          </Button>
          {custom ? (
            <Button variant="secondary" onClick={onRemoveCustom}>
              Remove
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function groupByMonth(items: GeneratedDeadline[]) {
  const groups: Array<{ label: string; items: GeneratedDeadline[] }> = [];
  for (const item of items) {
    const label = formatCivilDate({
      year: item.date.year,
      month: item.date.month,
      day: 1,
    }).replace(/\s\d+,/, "");
    const existing = groups.find((group) => group.label === label);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}
