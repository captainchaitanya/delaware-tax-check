"use client";

import Link from "next/link";
import { useAppState } from "@/components/app/AppState";
import { Badge, UnverifiedBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stat } from "@/components/ui/Stat";
import { formatUsd } from "@/lib/format";
import { franchiseEstimateFromProfile } from "@/lib/franchiseEstimate";
import { greetingFor } from "@/lib/greeting";
import { TAX_CONFIG } from "@/lib/taxConfig";

export function DashboardHome() {
  const { state } = useAppState();
  const profile = state.profile;
  if (!profile) {
    return null;
  }

  const estimate = franchiseEstimateFromProfile(profile);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 lg:py-10">
      <p className="text-sm text-muted">Dashboard</p>
      <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
        {greetingFor(profile.companyName)}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        A quiet place to see what Delaware, the IRS, and India may expect
        next. Nothing here files anything for you.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">Next deadlines</h2>
            <Badge>Coming next</Badge>
          </div>
          <EmptyState
            title="The calendar is not wired yet"
            body="Phase B will list the next filings for this company. Until then, nothing is overdue on this desk."
            action={
              <Link
                href="/calendar"
                className="text-sm font-medium text-accent underline underline-offset-4"
              >
                Open Calendar
              </Link>
            }
          />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">Action items</h2>
            <Badge>Coming next</Badge>
          </div>
          <EmptyState
            title="No actions yet"
            body="Inbox documents and marked filings will land here. You are not missing a hidden list."
            action={
              <Link
                href="/inbox"
                className="text-sm font-medium text-accent underline underline-offset-4"
              >
                Open Inbox
              </Link>
            }
          />
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">
              Estimated annual compliance cost
            </h2>
            {TAX_CONFIG.verified ? null : <UnverifiedBadge />}
          </div>
          {estimate ? (
            <div className="flex flex-col gap-4">
              <Stat
                label="Delaware franchise tax + annual report"
                value={formatUsd(estimate.filingTotal)}
                hint={`${formatUsd(estimate.tax)} tax and ${formatUsd(estimate.annualReportFee)} report fee. Other costs are not estimated yet.`}
              />
              <Link
                href="/tools/franchise-tax"
                className="inline-flex h-11 items-center self-start rounded-md border border-line bg-card px-4 text-sm font-medium"
              >
                Review the calculation
              </Link>
            </div>
          ) : (
            <EmptyState
              title="No share data yet"
              body="Add authorized shares, issued shares, and assets to estimate the Delaware franchise tax. Other annual costs will stay user-editable later."
              action={
                <Link
                  href="/tools/franchise-tax"
                  className="text-sm font-medium text-accent underline underline-offset-4"
                >
                  Open Franchise Tax Checker
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">Recent documents</h2>
            <Badge>Coming next</Badge>
          </div>
          <EmptyState
            title="The inbox is empty"
            body="Paste a notice in Phase C and it will show up here after you review it. Nothing has been uploaded."
            action={
              <Link
                href="/inbox"
                className="text-sm font-medium text-accent underline underline-offset-4"
              >
                Open Inbox
              </Link>
            }
          />
        </Card>
      </div>
    </main>
  );
}
