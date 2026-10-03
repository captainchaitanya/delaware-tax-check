"use client";

import { useMemo } from "react";
import { useAppState } from "@/components/app/AppState";
import { MonthChart } from "@/components/dashboard/MonthChart";
import { QuarterRing } from "@/components/dashboard/QuarterRing";
import { UnverifiedBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextInput } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/LinkButton";
import { Stat } from "@/components/ui/Stat";
import { annualCostTotal, dollarsFromEstimate } from "@/lib/costEstimates";
import {
  civilDateInTimeZone,
  formatCivilDate,
  generateDeadlines,
} from "@/lib/deadlines";
import { deadlinesByMonth } from "@/lib/deadlines/chart";
import {
  overdueItems,
  quarterCompletion,
  upcomingDeadlines,
} from "@/lib/deadlines/stats";
import { formatUsd } from "@/lib/format";
import { franchiseEstimateFromProfile } from "@/lib/franchiseEstimate";
import { greetingFor } from "@/lib/greeting";
import { TAX_CONFIG } from "@/lib/taxConfig";

export function DashboardHome() {
  const { state, setExtraCostEstimates } = useAppState();
  const profile = state.profile;
  const today = useMemo(
    () => civilDateInTimeZone(new Date(), "America/New_York"),
    [],
  );
  const items = useMemo(
    () =>
      profile
        ? generateDeadlines(profile, today, {
            lookbackDays: 90,
            customDeadlines: state.customDeadlines,
          })
        : [],
    [profile, state.customDeadlines, today],
  );
  const next = upcomingDeadlines(items, 5);
  const overdue = overdueItems(items, state.deadlineProgress);
  const quarter = quarterCompletion(items, today, state.deadlineProgress);
  const estimate = franchiseEstimateFromProfile(profile);
  const extras = state.extraCostEstimates;
  const totalCost = annualCostTotal(estimate?.filingTotal ?? null, extras);
  const monthBuckets = useMemo(
    () => deadlinesByMonth(items, today),
    [items, today],
  );

  if (!profile) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">
      <p className="text-sm text-muted">Dashboard</p>
      <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
        {greetingFor(profile.companyName, new Date(), profile.firstName)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        A quiet place to see what Delaware, the IRS, and India may expect
        next. Nothing here files anything for you.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Next deadline"
          value={next[0] ? formatCivilDate(next[0].date) : "—"}
          hint={next[0]?.title ?? "No upcoming date in the next 12 months"}
        />
        <Stat
          label="Overdue"
          value={String(overdue.length)}
          hint={overdue.length === 0 ? "Nothing past due" : "Still open"}
        />
        <Stat
          label="Done this quarter"
          value={quarter.total === 0 ? "—" : `${quarter.done}/${quarter.total}`}
          hint="Marked complete among this quarter's filings"
        />
        <Stat
          label="Est. annual cost"
          value={totalCost === null ? "—" : formatUsd(totalCost)}
          hint={
            estimate
              ? "Delaware filing plus your other estimates"
              : "Add share data and optional estimates"
          }
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">Next deadlines</h2>
          {next.length === 0 ? (
            <EmptyState
              title="No upcoming dates yet"
              body={`Your deadlines will appear here once the calendar is set up for ${profile.companyName}.`}
              action={<LinkButton href="/calendar">Open Calendar</LinkButton>}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {next.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span>{item.title}</span>
                  <span className="font-mono tabular-nums text-muted">
                    {formatCivilDate(item.date)}
                  </span>
                </li>
              ))}
              <li>
                <LinkButton href="/calendar">Open Calendar</LinkButton>
              </li>
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">Action items</h2>
          {overdue.length === 0 ? (
            <EmptyState
              title="You're clear"
              body="Nothing needs your attention right now."
              action={<LinkButton href="/inbox">Open Inbox</LinkButton>}
            />
          ) : (
            <div>
              <p className="text-sm leading-6 text-muted">
                {overdue.length} overdue filing
                {overdue.length === 1 ? "" : "s"} still open.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {overdue.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>{item.title}</span>
                    <span className="font-mono tabular-nums text-muted">
                      {formatCivilDate(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <LinkButton href="/calendar">Review overdue</LinkButton>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">
            Quarter completion
          </h2>
          <QuarterRing done={quarter.done} total={quarter.total} />
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">
            Deadlines next 12 months
          </h2>
          <MonthChart buckets={monthBuckets} />
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">
              Estimated annual compliance cost
            </h2>
            {TAX_CONFIG.verified ? null : <UnverifiedBadge />}
          </div>
          <div className="flex flex-col gap-4">
            <Stat
              label="Delaware franchise tax + annual report"
              value={estimate ? formatUsd(estimate.filingTotal) : "—"}
              hint={
                estimate
                  ? `${formatUsd(estimate.tax)} tax and ${formatUsd(estimate.annualReportFee)} report fee from the checker.`
                  : "Add share data to estimate this line."
              }
            />
            <TextInput
              id="cost-india"
              label="India filings (your estimate)"
              hint="MCA, GST, TDS, and other India costs you expect. Not calculated."
              inputMode="decimal"
              value={extras.indiaFilings}
              onChange={(event) =>
                setExtraCostEstimates({
                  ...extras,
                  indiaFilings: event.target.value,
                })
              }
              placeholder="0"
            />
            <TextInput
              id="cost-other"
              label="Other costs (your estimate)"
              hint="Registered agent, accounting, or anything else you want in the total."
              inputMode="decimal"
              value={extras.other}
              onChange={(event) =>
                setExtraCostEstimates({
                  ...extras,
                  other: event.target.value,
                })
              }
              placeholder="0"
            />
            <Stat
              label="Combined estimate"
              value={
                totalCost === null
                  ? "—"
                  : formatUsd(totalCost)
              }
              hint={`Includes ${formatUsd(dollarsFromEstimate(extras.indiaFilings) ?? 0)} India and ${formatUsd(dollarsFromEstimate(extras.other) ?? 0)} other, as you typed.`}
            />
            <LinkButton href="/tools/franchise-tax">
              Review the Delaware calculation
            </LinkButton>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-serif text-xl font-medium">
            Recent documents
          </h2>
          {state.documents.length === 0 ? (
            <EmptyState
              title="Inbox is empty"
              body="No documents yet. Paste a notice or certificate in the Inbox and it will show up here after you review it."
              action={<LinkButton href="/inbox">Open Inbox</LinkButton>}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {[...state.documents]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 4)
                .map((document) => (
                  <li key={document.id} className="text-sm">
                    <span>{document.extraction.summary}</span>
                    <span className="mt-1 block font-mono text-xs tabular-nums text-muted">
                      {document.extraction.deadline?.isoDate ?? "No date"}
                    </span>
                  </li>
                ))}
              <li>
                <LinkButton href="/inbox">Open Inbox</LinkButton>
              </li>
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
