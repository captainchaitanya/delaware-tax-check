import { TAX_CONFIG } from "../taxConfig";
import { candidateLogic, DEADLINE_RULES } from "./rules";

export function renderVerifyMarkdown(): string {
  const rows = DEADLINE_RULES.map((rule) => {
    const sources = rule.sources.join(" ");
    const notes = rule.notes.replaceAll("|", "/");
    return `| ${rule.id} | ${rule.title} | ${candidateLogic(rule)} | ${rule.status} | ${rule.lastChecked ?? "—"} | ${sources} | ${notes || "—"} |`;
  }).join("\n");

  return `# Verify these candidate dates before launch

Every rule has \`status\`: verified, reviewed, or unverified. Recheck official pages before you file.

| ID | Rule | Logic | Status | lastChecked | Sources | Notes |
|---|---|---|---|---|---|---|
${rows}

## Tax config

Delaware franchise tax rates, $50 annual report fee (non-exempt), $200 late penalty, and 1.5% monthly interest are **verified** (${TAX_CONFIG.lastChecked}). Sources: ${TAX_CONFIG.sources.join(" ")}.

${TAX_CONFIG.notes}

If annual tax is $5,000 or more: 40% June 1, 20% September 1, 20% December 1, remainder March 1.

## Weekend / holiday policy

The statutory date is always stored, sorted on, and shown as the primary due date. Countdown chips use that date.

- \`next_business_day\` (IRS rules, verified): if the statutory date is a Saturday, Sunday, or a US federal holiday (or its observed weekday), a secondary line shows the next business day. The later date is never used for sorting or chips.
- \`none\` (India rules): no shifting.
- \`unknown\` (Delaware): no shifting. The drawer says weekend/holiday handling is not yet verified.

## Holidays

US federal holidays are computed by rule. India holidays are not modeled.
`;
}
