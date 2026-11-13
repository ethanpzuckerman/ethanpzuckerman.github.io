# Verification checklist (owner's due diligence)

Every fact in the Navigator came from web search summaries. The research sandbox couldn't open
nolaassessor.com, nola.gov or council.nola.gov. Work through this list before the final
submission.

**How to check a fact**
1. Open the official page. Note the date you accessed it and copy the exact sentence that supports the fact.
2. If the fact matches, remove its `VERIFY` tag in `CLAUDE.md` and add "verified [date]" to the source row in §2.9.
3. If it doesn't match, fix it in **both** `CLAUDE.md` §2 and `kb.js`. They share source IDs.
4. If a secondary source (news, nonprofit, another parish) supports a fact you confirmed on an official page, swap the citation to the official source.
5. Re-run `docs/sample-questions.md` and retake any screenshot whose answer changed.

## A. Facts to confirm (highest risk first)

| # | Fact as written now | Where to check | Why it's risky |
|---|---|---|---|
| 1 | ~~2026 combined millage ≈ 121.20 mills~~ **Resolved Nov. 2:** the state roll files give 131.99 (East Bank) / 132.01 (Algiers) for the 2026 roll and 133.48 (East Bank) / 132.01 (Algiers) for the 2027 roll, with each parcel's computed tax | LTC millage files [S30][S31] | Done. Still worth comparing one real Treasury bill to see the special-district fees the state files leave out |
| 1b | **The 2027 roll the Assessor filed (Sept. 4, 2026) keeps 98% of 2026 values and the 01/01/2023 valuation date.** Is the 2027 reappraisal still coming? | Call the Assessor; compare your own 2027 notice with the roll | Our sources said 2027 was a reappraisal year; the filed data doesn't show it |
| 2 | Disabled veteran tiers: **+$2,500 / +$4,500 / full exemption** | OPAO Homestead & SAL page [S7], or call the Assessor | Source is the *Jefferson Parish* Assessor and an aggregator |
| 3 | Freeze (SAL) income limit **$100,000 indexed (≈ $102,700 for 2026)** | OPAO [S7]; Louisiana Tax Commission | Single secondary source |
| 4 | 2026-roll appeal deadline **Aug. 20, 2025** | OPAO notices [S5] and [S6] | OPAO's own notices conflict: Aug. 18 vs. Aug. 20 |
| 5 | Homestead: **all occupying owners must file in person**; required documents | OPAO [S7], [S8], [S9]. Ask whether online filing exists now | Based on a 2021 flyer |
| 6 | **First responder** exemption ≈ +$25,000 market value | OPAO [S7] | Only one source |
| 7 | Bill timing: mailed late December, due **Jan. 31**; **1% per month** interest | Treasury FAQ [S12] | Interest rate is from a 2022 notice |
| 8 | Why the reassessment is **2027 rather than 2028** | Ask OPAO directly | No source found. The bot says "I don't know" |
| 9 | 2024 reappraisal raised values **~20%**; the 2027 roll is a full reappraisal | OPAO press releases; Legislative Auditor report [S15] | Secondary sources (S21, S26) |
| 10 | Legislative Auditor report URL [S15] | lla.la.gov search: "Orleans Parish Assessor quadrennial reappraisal 2024" | Search returned two different PDFs |
| 11 | Acts 2025 No. 221 changes to assessment ratios | legis.la.gov [S1]; the 2025 ballot results | Ratification status unknown |
| 12 | ~~Homestead in Orleans covers state, general city, school, levee and levee-district taxes, but **not police and fire millages**~~ **Resolved Nov. 2:** the state millage files list two levies that homestead never reduces, 11.51 mills together. The 2027 roll file [S31] names them "FIRE – WITHOUT HOMESTEAD EXEMPTION" (6.84 mills) and "POLICE – WITHOUT HOMESTEAD EXEMPTION" (4.67); the 2026 roll file [S30] names them "POLICE W/O H.E." (9.29) and "FIRE W/O H.E." (2.22). No parcel gets a homestead reduction on either | LTC millage files [S30][S31] | Done. The worked example in `CLAUDE.md` §2.4 includes the 11.51 mills |
| 13 | Heirs get a pro-rata homestead share; some assessors wait for a judgment of possession | Ask OPAO; read S29 in full | Undated practice manual |

## B. Things only you can do

- [x] **Get the 2025 and 2026 roll files.** Done as far as possible: the **2026** roll is loaded from the Box file and the LTC state files (`data/raw/`, git-ignored). The **2025** roll isn't available: it's not in Box, and the LTC site keeps only its two latest upload years. The **2027** roll (filed Sept. 4, 2026) was loaded instead and compared with 2026 (`docs/year-comparison.md`).
- [ ] **Re-read your full project description** and compare it with CLAUDE.md: required file name (AGENTS.md or CLAUDE.md), sections, format, and how the layers are defined.
- [ ] **Call the Assessor's Office** with the questions that have no online source (items 2, 3, 5, 8 and 13). Write down who you talked to, the date, and the answer. You can cite "Phone call with OPAO staff, [date]" as a source.
- [ ] **Share the artifact link** and test it in a private browser window.
- [x] **After the Nov. 3, 2026 election:** done Nov. 13. Amendments 1, 6 and 9 passed and 2 and 10 failed (unofficial results, WAFB/Fox 8 [S36]); updated in `CLAUDE.md` §2.5 and the `amendments-2026`, `sal` and `veteran` entries. Still to do: confirm certification at sos.la.gov.
- [x] **2027 reassessment timing:** resolved Nov. 13. The City Council's July 2023 notice [S32] says tax years 2024–27 use market values as of Jan. 1, 2023, which matches every parcel in both rolls; the next reappraisal is during 2027 for the 2028 roll (inferred; confirm with OPAO).
- [x] **Payment plans:** resolved Nov. 13. The Treasury has no formal installment plan; partial payments in person or by mail; 1% per month interest [S34].
- [x] **Disabled veteran tiers:** confirmed Nov. 13 against La. Const. Art. VII §21(K) [S37].
- [x] **2026 bill due date and interest:** Feb. 28, 2026, then 1% per month [S35].
- [ ] **2027 bill due date and final 2027 millages** after the Council's Nov. 5 roll-forward (4.039 mills [S33]): not announced as of Nov. 13.
- [ ] **Check the contacts:**
  - Find a sourced main phone number for the Assessor.
  - Get a Board of Review contact beyond the website.
  - Confirm Southeast Louisiana Legal Services handles property-tax and succession questions.
- [ ] **Each summer:** add the new roll to `APPEAL_WINDOWS` in `app.js` once the Assessor announces its dates.
