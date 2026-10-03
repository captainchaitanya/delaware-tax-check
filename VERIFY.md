# Verify these candidate dates before launch

Every rule has `status`: verified, reviewed, or unverified. Recheck official pages before you file.

| ID | Rule | Logic | Status | lastChecked | Sources | Notes |
|---|---|---|---|---|---|---|
| de-franchise-annual | Delaware annual franchise tax and report | March 1 | verified | 2026-10-03 | https://corp.delaware.gov/paytaxes/ | Large Corporate Filers may have a $250,000 maximum. Weekend/holiday handling is still unknown. |
| de-franchise-q-jun | Delaware franchise tax estimate — June | June 1 | verified | 2026-10-03 | https://corp.delaware.gov/frtaxcalc/ | — |
| de-franchise-q-sep | Delaware franchise tax estimate — September | September 1 | verified | 2026-10-03 | https://corp.delaware.gov/frtaxcalc/ | — |
| de-franchise-q-dec | Delaware franchise tax estimate — December | December 1 | verified | 2026-10-03 | https://corp.delaware.gov/frtaxcalc/ | — |
| us-1120 | Federal corporate income tax return (Form 1120) | 15th day of the 4th month after US tax year end; June 30 year ends use the 3rd month | verified | 2026-10-03 | https://www.irs.gov/instructions/i1120 | rollConvention next_business_day is verified. |
| us-5472 | Form 5472 (25%+ foreign-owned reporting) | 15th day of the 4th month after US tax year end; June 30 year ends use the 3rd month | verified | 2026-10-03 | https://www.irs.gov/instructions/i5472 | — |
| us-1099-nec | Form 1099-NEC to contractors | January 31 | verified | 2026-10-03 | https://www.irs.gov/businesses/small-businesses-self-employed/information-return-reporting | — |
| in-agm | Annual general meeting | 183 days after India FY end | unverified | — | https://www.mca.gov.in | First AGM is due within 9 months of the end of the first financial year. |
| in-aoc4 | AOC-4 financial statements | 30 days after in-agm | unverified | — | https://www.mca.gov.in | — |
| in-mgt7 | MGT-7 annual return | 60 days after in-agm | unverified | — | https://www.mca.gov.in | — |
| in-itr | Indian company income tax return | 31 October, or 30 November if Form 3CEB is required | reviewed | 2026-10-03 | https://www.incometax.gov.in | India's new Income-tax Act may rename forms; recheck before filing season. |
| in-3ceb | Form 3CEB transfer pricing report | October 31 | reviewed | 2026-10-03 | https://www.incometax.gov.in | India's new Income-tax Act may rename forms; recheck before filing season. |
| in-dir3-kyc | DIR-3 KYC | 30 June of the year after the 3rd FY, from DIN allotment year (default on/before 31 Mar 2025 → 30 Jun 2028) | reviewed | 2026-10-03 | https://www.mca.gov.in | Changes to address, email or phone must be filed within 30 days, separately. Source: G.S.R. 943(E) dated 31 Dec 2025. |
| in-fla | FLA return to RBI | July 15 | reviewed | 2026-10-03 | https://www.rbi.org.in | — |
| in-tds | TDS quarterly return | July 31 / October 31 / January 31 / May 31 | unverified | — | https://www.incometax.gov.in | India's new Income-tax Act may rename forms; recheck before filing season. |
| in-gstr1 | GSTR-1 | 11th of the following month | unverified | — | https://www.gst.gov.in | Dates shown are for monthly filers; quarterly (QRMP) filers have different dates. |
| in-gstr3b | GSTR-3B | 20th of the following month | unverified | — | https://www.gst.gov.in | Dates shown are for monthly filers; quarterly (QRMP) filers have different dates. |
| in-odi-apr | ODI annual performance report | December 31 | reviewed | 2026-10-03 | https://www.rbi.org.in | Applies if the Indian resident's holding counts as overseas direct investment (generally 10%+ or control); filed through the authorised dealer bank. |

## Tax config

Delaware franchise tax rates, $50 annual report fee (non-exempt), $200 late penalty, and 1.5% monthly interest are **verified** (2026-10-03). Sources: https://corp.delaware.gov/paytaxes/ https://corp.delaware.gov/frtaxcalc/.

Large Corporate Filers may have a $250,000 maximum. This checker still uses the $200,000 cap and does not compute the Large Corporate Filer amount.

If annual tax is $5,000 or more: 40% June 1, 20% September 1, 20% December 1, remainder March 1.

## Weekend / holiday policy

The statutory date is always stored, sorted on, and shown as the primary due date. Countdown chips use that date.

- `next_business_day` (IRS rules, verified): if the statutory date is a Saturday, Sunday, or a US federal holiday (or its observed weekday), a secondary line shows the next business day. The later date is never used for sorting or chips.
- `none` (India rules): no shifting.
- `unknown` (Delaware): no shifting. The drawer says weekend/holiday handling is not yet verified.

## Holidays

US federal holidays are computed by rule. India holidays are not modeled.
