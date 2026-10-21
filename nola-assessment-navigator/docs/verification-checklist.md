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
| 1 | 2026 combined millage ≈ **121.20 mills** (worked example) | City Treasury millage table [S11]. **Better:** download any 2026 East Bank homestead tax bill from taxbills.nola.gov and read the millage lines | Came from third-party sites. It drives the dollar figures in the worked example |
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
| 12 | Homestead in Orleans covers state, general city, school, levee and levee-district taxes, but **not police and fire millages** | Const. Art. VII §20 [S2]; a real tax bill's homestead lines | Affects how simplified the worked example is |
| 13 | Heirs get a pro-rata homestead share; some assessors wait for a judgment of possession | Ask OPAO; read S29 in full | Undated practice manual |

## B. Things only you can do

- [ ] **Get the 2025 and 2026 roll files.** Put them in `data/raw/` (git-ignored) and fill in `data/README.md`.
- [ ] **Re-read your full project description** and compare it with CLAUDE.md: required file name (AGENTS.md or CLAUDE.md), sections, format, and how the layers are defined.
- [ ] **Call the Assessor's Office** with the questions that have no online source (items 2, 3, 5, 8 and 13). Write down who you talked to, the date, and the answer. You can cite "Phone call with OPAO staff, [date]" as a source.
- [ ] **Share the artifact link** and test it in a private browser window.
- [ ] **After the Nov. 3, 2026 election:** update the three amendments (1, 6 and 9) in `CLAUDE.md` §2.5 and in the `amendments-2026`, `sal` and `veteran` entries in `kb.js`.
- [ ] **Check the contacts:**
  - Find a sourced main phone number for the Assessor.
  - Get a Board of Review contact beyond the website.
  - Confirm Southeast Louisiana Legal Services handles property-tax and succession questions.
- [ ] **Each summer:** add the new roll to `APPEAL_WINDOWS` in `app.js` once the Assessor announces its dates.
