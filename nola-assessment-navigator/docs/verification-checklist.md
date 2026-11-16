# Verification checklist (owner's due diligence)

**Status, Nov. 16, 2026.** The first draft's facts came from web search summaries. Since then the central facts have
been read directly from official pages and the state's own data, and the instruction file (`CLAUDE.md`) and knowledge
base (`kb.js`) were corrected to match. The table below shows what was resolved, with the source that settled it, and
what is still open. Open items are the ones the chatbot answers with "I don't know" or "please confirm."

**How to check a fact**
1. Open the official page. Note the date you accessed it and copy the exact sentence that supports the fact.
2. If the fact matches, remove its `VERIFY` tag in `CLAUDE.md` and add "verified [date]" to the source row in §2.9.
3. If it doesn't match, fix it in **both** `CLAUDE.md` §2 and `kb.js`. They share source IDs.
4. If a secondary source (news, nonprofit, another parish) supports a fact you confirmed on an official page, swap the citation to the official source.
5. Re-run `docs/sample-questions.md` and retake any screenshot whose answer changed.

## A. Facts: resolved and still open

| # | Fact | Status (Nov. 16, 2026) | Source that settled it |
|---|---|---|---|
| 1 | 2026 millage | ✅ **Resolved.** The City's table lists **121.20 mills citywide**, with the levee district on top: 10.79 East Bank, 10.81 Algiers. Totals 131.99 and 132.01, which match the state roll files on every parcel. Part 1 used 121.20 as the whole rate; the example now shows the breakdown ($2,813.33 citywide subtotal, $3,056.10 with the East Bank levee). | City Treasury millage table [S11]; LTC millage files [S30] |
| 1b | Is the 2027 roll a reappraisal? | ✅ **Resolved: no.** Property is valued as of Jan. 1, 2023 "for tax years 2024 through 2027." The filed 2027 roll keeps 98% of values. The Part 1 claim that the cycle moved to 2027 is withdrawn. | Legislative Auditor [S15]; City Council [S32]; 2027 roll [S31] |
| 2 | Disabled veteran tiers | ✅ **Resolved.** Next $2,500 (50–69%), next $4,500 (70–99%), rest of the home's value (100%). | La. Const. Art. VII §21(K) [S37] |
| 3 | Freeze (SAL) income limit | ✅ **Resolved**, one detail open. $100,000, CPI-adjusted from tax year 2026; $150,000 effective Jan. 1, 2027, CPI-adjusted from 2028. *Open:* the exact CPI-adjusted figure for 2026 (the unsourced $102,700 was removed). | La. Const. Art. VII §18(G) [S1] |
| 4 | 2026-roll appeal deadline (Aug. 18 vs. 20, 2025) | ⏳ **Open.** The chatbot gives Aug. 20 and says "please confirm." It only matters for history: that window is closed. | OPAO notices [S5][S6] conflict |
| 5 | Homestead application steps (in person? online?) | ⏳ **Open.** The Assessor's website refuses automated access, so the 2021 flyer and 2024 form couldn't be re-read. The chatbot now names those dates and tells owners to confirm the current steps. **Open the page in a browser or call.** | [S7][S8][S9] |
| 6 | First responder exemption amount | ⏳ **Open** (same reason as 5). The chatbot says "about" and refers to the office. | [S7] |
| 7 | Bill timing and interest | ✅ **Resolved.** 2026 bills were due Feb. 28, 2026; interest is 1% a month. *Open:* the 2027 due date isn't announced. | City release [S35]; Treasury [S34] |
| 8 | "Why 2027 rather than 2028?" | ✅ **Resolved: it isn't.** See 1b. The next reappraisal year is expected to be 2028 (inferred from the 2020/2024 pattern; no official schedule found). | [S15][S32] |
| 9 | Size of the 2024 reappraisal | ✅ **Resolved.** Single- and two-family appraised value grew 23.2% from the 2020 to the 2024 reappraisal. The "~20%" from a secondary source was replaced. | Legislative Auditor [S15] |
| 10 | Legislative Auditor report | ✅ **Resolved.** All 44 pages read; the audit entry now quotes the report itself (3,803 homes, 13.3%, $611; ratio and dispersion ranges), not news coverage. "393 valuation neighborhoods" isn't in the report and was removed. | [S15] |
| 11 | Assessment ratios | ✅ **Resolved.** Land 10%, residential improvements 10%, electric cooperative 15%, public service 25%, other 15%, as the Constitution reads today. The note about "Acts 2025 No. 221" was removed. | La. Const. Art. VII §18(B) [S1] |
| 12 | Homestead and police/fire millages | ✅ **Resolved.** 11.51 mills "without applying homestead exemption" in the City's table and in both roll files. | [S11][S30][S31] |
| 13 | Heirs and homestead | ✅ **Partly resolved.** The Constitution limits the exemption to the ownership share of the owners who live there. *Open:* what paperwork the Assessor requires before a succession is finished. | La. Const. Art. VII §20(A)(6) [S2] |
| 14 | Homestead when you live in half of a double | ⏳ **Open**, and now answered honestly. The law covers the home "owned and occupied" and allows one exemption per person; how the Assessor treats the rented half isn't in any source read. The chatbot says so and refers to the office. | [S2] |
| 15 | Payment plans | ✅ **Resolved.** No formal installment plan; partial payments in person or by mail. | Treasury [S34] |
| 16 | Nov. 3, 2026 amendments | ✅ **Resolved** (unofficial results): 1, 6 and 9 passed; 2 and 10 failed. *Open:* certification. | [S36]; effective-date notes in [S1] |

## B. Things only you can do

- [x] **Get the 2025 and 2026 roll files.** Done as far as possible: the **2026** roll is loaded from the Box file and the LTC state files (`data/raw/`, git-ignored). The **2025** roll isn't available: it's not in Box, and the LTC site keeps only its two latest upload years. The **2027** roll (filed Sept. 4, 2026) was loaded instead and compared with 2026 (`docs/year-comparison.md`).
- [ ] **Re-read your full project description** and compare it with CLAUDE.md: required file name (AGENTS.md or CLAUDE.md), sections, format, and how the layers are defined.
- [ ] **Call the Assessor's Office** with the questions that have no online source (items 2, 3, 5, 8 and 13). Write down who you talked to, the date, and the answer. You can cite "Phone call with OPAO staff, [date]" as a source.
- [ ] **Publish the public link.** The Claude artifact link needs a sign-in, which is why a grader couldn't test it. The site files and data are now in the repo so GitHub Pages can serve them with no sign-in; after it's merged, test the public link in a private browser window.
- [ ] **Open the Assessor's pages in a browser** (items 5 and 6): nolaassessor.com/homestead-sal and the homestead application form. Update the homestead entry in `kb.js` and `CLAUDE.md` §2.5 if the steps changed.
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
