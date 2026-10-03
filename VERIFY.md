# Verify these candidate dates before launch

Every rule in Founder Desk ships with `verified: false`. Do not present them as authoritative until you have checked the official page for the current year.

| ID | What | Candidate date logic | Check here |
|---|---|---|---|
| de-franchise-annual | Delaware annual franchise tax + report | March 1 (rolled to next weekday if weekend/holiday) | https://corp.delaware.gov |
| de-franchise-q-jun | Delaware estimate | June 1, if tax ≥ $5,000 | https://corp.delaware.gov |
| de-franchise-q-sep | Delaware estimate | September 1, if tax ≥ $5,000 | https://corp.delaware.gov |
| de-franchise-q-dec | Delaware estimate | December 1, if tax ≥ $5,000 | https://corp.delaware.gov |
| us-1120 | Form 1120 | 15th day of the 4th month after US tax year end | https://www.irs.gov/forms-pubs/about-form-1120 |
| us-5472 | Form 5472 | Same due date as the 1120, if 25%+ foreign-owned | https://www.irs.gov/forms-pubs/about-form-5472 |
| us-1099-nec | Form 1099-NEC | January 31, if the company pays US contractors | https://www.irs.gov/forms-pubs/about-form-1099-nec |
| in-agm | AGM | 183 days after 31 March (six-month window) | https://www.mca.gov.in |
| in-aoc4 | AOC-4 | 30 days after the AGM date above | https://www.mca.gov.in |
| in-mgt7 | MGT-7 | 60 days after the AGM date above | https://www.mca.gov.in |
| in-itr | Indian company ITR | 31 October | https://www.incometax.gov.in |
| in-dir3-kyc | DIR-3 KYC | 30 September, one item per director | https://www.mca.gov.in |
| in-fla | FLA return | 15 July, if the subsidiary receives FDI | https://www.rbi.org.in |
| in-tds | TDS quarterly return | 31 Jul / 31 Oct / 31 Jan / 31 May | https://www.incometax.gov.in |
| in-gstr1 | GSTR-1 | 11th of the following month (no weekend roll) | https://www.gst.gov.in |
| in-gstr3b | GSTR-3B | 20th of the following month (no weekend roll) | https://www.gst.gov.in |
| in-odi-apr | ODI annual performance report | 30 June, if Indian-resident founders hold US shares | https://www.rbi.org.in |

Holiday lists (also unverified):

- US: https://www.federalreserve.gov/aboutthefed/k8.htm
- India: https://www.india.gov.in/calendar

Weekend/holiday policy used in code: if a due date falls on Saturday, Sunday, or a listed holiday, move it to the next weekday — except GST returns, which are left on the stated day.
