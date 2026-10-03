# Verify these candidate dates before launch

Every rule in Founder Desk ships with `verified: false`. Do not present them as authoritative until you have checked the official page for the current year.

| ID | What | Candidate date logic | `rollConvention` | Check here |
|---|---|---|---|---|
| de-franchise-annual | Delaware annual franchise tax + report | March 1 (statutory date is shown; weekend/holiday handling unknown) | `unknown` | https://corp.delaware.gov |
| de-franchise-q-jun | Delaware estimate | June 1, if tax ≥ $5,000 | `unknown` | https://corp.delaware.gov |
| de-franchise-q-sep | Delaware estimate | September 1, if tax ≥ $5,000 | `unknown` | https://corp.delaware.gov |
| de-franchise-q-dec | Delaware estimate | December 1, if tax ≥ $5,000 | `unknown` | https://corp.delaware.gov |
| us-1120 | Form 1120 | 15th day of the 4th month after US tax year end | `next_business_day` | https://www.irs.gov/forms-pubs/about-form-1120 |
| us-5472 | Form 5472 | Same due date as the 1120, if 25%+ foreign-owned | `next_business_day` | https://www.irs.gov/forms-pubs/about-form-5472 |
| us-1099-nec | Form 1099-NEC | January 31, if the company pays US contractors | `next_business_day` | https://www.irs.gov/forms-pubs/about-form-1099-nec |
| in-agm | AGM | 183 days after 31 March (six-month window) | `none` | https://www.mca.gov.in |
| in-aoc4 | AOC-4 | 30 days after the AGM date above | `none` | https://www.mca.gov.in |
| in-mgt7 | MGT-7 | 60 days after the AGM date above | `none` | https://www.mca.gov.in |
| in-itr | Indian company ITR | 31 October | `none` | https://www.incometax.gov.in |
| in-dir3-kyc | DIR-3 KYC | 30 September, one item per director | `none` | https://www.mca.gov.in |
| in-fla | FLA return | 15 July, if the subsidiary receives FDI | `none` | https://www.rbi.org.in |
| in-tds | TDS quarterly return | 31 Jul / 31 Oct / 31 Jan / 31 May | `none` | https://www.incometax.gov.in |
| in-gstr1 | GSTR-1 | 11th of the following month | `none` | https://www.gst.gov.in |
| in-gstr3b | GSTR-3B | 20th of the following month | `none` | https://www.gst.gov.in |
| in-odi-apr | ODI annual performance report | 30 June, if Indian-resident founders hold US shares | `none` | https://www.rbi.org.in |

## Weekend / holiday policy

The **statutory** date is always stored, sorted on, and shown as the primary due date. Countdown chips use that date. `rollConvention` is unverified for every rule.

- `next_business_day` (IRS rules): if the statutory date is a Saturday, Sunday, or a US federal holiday (or its observed weekday), a secondary line shows `Effective date: {date}, next business day`. The later date is never used for sorting or chips.
- `none` (all India rules: MCA, RBI, income tax, TDS, GST): no shifting, even on a weekend.
- `unknown` (Delaware): no shifting. The drawer says weekend/holiday handling is not yet verified.

## Holidays

US federal holidays are computed by rule (New Year’s Day, MLK Day, Washington’s Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas, plus Friday/Monday observed days). Cross-check against https://www.federalreserve.gov/aboutthefed/k8.htm — the generator is unverified.

India holidays are **not** modeled. There is no India holiday list. India rules use `rollConvention: none`.
