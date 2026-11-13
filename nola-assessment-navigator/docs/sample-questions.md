# Five sample questions: draft chatbot (Layer 1)

Tested against `nola-assessment-navigator/index.html`, which is the same code as the live artifact.
Screenshots are in `screenshots/`. `q0-landing.png` shows the opening screen with the prototype
disclosure. Screenshots of the first version's failures are kept in `screenshots/v1/`.

- **Version 1:** first test, Oct. 19, 2026.
- **Version 2:** after bug fixes, Oct. 21, 2026.
- **Version 3:** final draft, Nov. 13, 2026, after re-verifying the facts. New screenshots are in `screenshots/final/`.

> **Update, Nov. 2, 2026:** the Part 2 data work changed two answers below. The worked example now uses the recorded
> 2026 rate of **131.99 mills** from the state roll files, giving $3,056 for the $300,000 homesteaded home instead of
> the earlier ~$2,727 at 121.20 mills. The 2027 answer now says the filed 2027 roll keeps 98% of values unchanged.
> See `week2-report.md`.

| # | Question | Version 1 | Version 2 | Version 3 (final draft) | Screenshot |
|---|---|---|---|---|---|
| 1 | How is my property tax bill calculated? | ✅ Good | ✅ Good (unverified 121.20 mills) | ✅ Verified 131.99 mills | `screenshots/final/q1-tax-bill-v3.png` (v2: `screenshots/q1-tax-bill.png`) |
| 2 | How do I apply for the homestead exemption? | ✅ Good | ✅ Good | ✅ Good, plus the record panel when a property is selected | `screenshots/q2-homestead.png` |
| 3 | What does the 2027 reassessment mean for me? | ⚠️ Mostly good | ⚠️ Mostly good | ✅ Fixed with an official source | `screenshots/final/q3-reassessment-v3.png` (v2: `screenshots/q3-reassessment.png`) |
| 4 | Should I appeal? My house is worth less than what the Assessor says. | ⚠️ Safe but unhelpful | ✅ Fixed | ✅ Also works with a property selected | `screenshots/q4-should-i-appeal.png` (v1: `screenshots/v1/q4-should-i-appeal.png`) |
| 5 | Can I pay my property taxes in installments? | ❌ Wrong | ⚠️ Honest, not yet useful | ✅ Sourced answer | `screenshots/final/q5-installments-v3.png` (v2: `screenshots/q5-installments.png`) |

## Version 3 (Nov. 13, 2026)

1. **Tax bill.** The worked example now uses the recorded 2026 rate of **131.99 mills** from the state roll files:
   $30,000 assessed, $22,500 after homestead, $2,969.78, plus $86.33 for the police and fire millages homestead
   doesn't reduce, for **$3,056.10** ($3,959.70 without homestead). Cites S1, S2, S11, S17 and S30.
3. **2027 reassessment.** Version 2 said the 2027 roll carried new reappraised values. That was wrong. The City
   Council's own notice says tax years 2024–27 all use market values as of Jan. 1, 2023 [S32], which matches the data
   (98% of 2027 values unchanged, every parcel dated 01/01/2023). The answer now explains that the 2027 reassessment
   is the reappraisal done during 2027 for the 2028 roll, says that timing is inferred and should be confirmed, and
   gives the appeal-window status for today.
5. **Installments.** Now a real, sourced answer: the Treasury has **no formal installment plan**, but owners can make
   partial payments in person or by mail (not online), and the unpaid balance accrues 1% a month [S34].

Answers in brief below describe versions 1 and 2.

## Answers in brief

1. **Tax bill (version 2).** Gave the formula, then the $300,000 worked example: $30,000 assessed, $22,500 after homestead, ≈ $2,727 at about 121.20 mills (≈ $3,636 without homestead). It cites S1, S2, S11, S17, and S19, and warns that the millage is approximate and some millages aren't reduced by homestead.
2. **Homestead.** Covers the $7,500 assessed value ($75,000 market value) amount, the own-and-occupy-by-Dec. 31 rule, in-person filing at City Hall Room 4E01 by every occupying owner, and the three documents to bring. Cites S2, S3, S7, S8, and S9 and lists contacts.
3. **2027 reassessment (version 2).** Said that the 2027 roll carries new reappraised values (corrected in version 3), that roll years are named for the year the bill is due, and that the Aug. 20, 2026 appeal window has **closed**. The closed-window message comes from today's date. It also says it doesn't know why the cycle is 2027 rather than 2028.
4. **Should I appeal?**
   - **Version 1** refused the advice and stopped.
   - **Version 2** still refuses ("That's a decision for you…"), then shows the general appeal steps, the deadline status, and contacts, as it promises to.
5. **Installments.**
   - **Version 1** answered with due dates, as if it had been asked when the bill is due.
   - **Version 2** says first: "I don't know about installments. My sources don't cover it, so this may not answer your question." Then it shows the closest topic and contacts.

## What it got wrong or missed

**Fixed in version 2**
- **Q5 answered a different question.** Now any question word the knowledge base never mentions gets an "I don't know about ___" warning before the closest entry.
- **Q4 promised but didn't deliver.** Now the matching general entry is still shown after an advice or property-lookup refusal.
- **Retrieval misses found in later testing:**
  - "Why did my bill go up if I have the freeze?" returned "I don't know." It now returns the freeze entry.
  - "Can I appeal online?" returned "I don't know." It now returns the appeal entry.
  - "What is my assessment based on?" was refused as a property lookup. It now returns how values are set.
- **New Orleans street names were blocked.** "Jefferson Davis Parkway" and "Lafayette St." triggered the "I only cover Orleans Parish" refusal. The other-parish filter now needs the word "Parish" for those names.
- **Heirs.** "My mother passed away…" now has a sourced entry on surviving spouses and heirs (S2, S28, S29). It still says it doesn't know the Assessor's exact requirements.
- **Dates were hard-coded to 2026.** Deadline and bill dates now come from today's date and a table of known appeal windows, so the bot won't present the 2026 window as the latest one after summer 2027.

**Still imperfect (after version 3, Nov. 13)**
- ~~**Q5 is honest but not useful.**~~ Resolved: sourced payment-plan entry [S34].
- ~~**Q3 leans on secondary sources.**~~ Resolved: the City Council's notice [S32] explains the 2024–27 cycle. The ~20% figure
  for the 2024 reappraisal is still from BGR [S26], and the 2028 timing is inferred, so the answer asks owners to confirm.
- ~~**Q1's millage (121.20) is unverified.**~~ Resolved Nov. 2: the state roll files give 131.99 mills (East Bank, 2026 roll),
  and the worked example matches a real parcel's recorded tax to the cent.
- **The "I don't know about ___" warning over-fired** on words like "condo" and misspellings. Now misspelled words are
  read as the closest knowledge-base word, and common words ("husband", "whats") never trigger it.
- **Keyword matching has limits.** It still doesn't understand paraphrases it wasn't given, and it answers only in
  English (it now says so in Spanish and Vietnamese). On claude.ai, the optional AI explanation covers more phrasings
  and follow-ups; it can only restate checked material.
