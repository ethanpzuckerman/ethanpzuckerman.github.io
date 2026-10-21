# Five sample questions: draft chatbot (Layer 1)

Tested against `nola-assessment-navigator/index.html`, which is the same code as the live artifact.
Screenshots are in `screenshots/`. `q0-landing.png` shows the opening screen with the prototype
disclosure. Screenshots of the first version's failures are kept in `screenshots/v1/`.

- **Version 1:** first test, Oct. 19, 2026.
- **Version 2:** after bug fixes, Oct. 21, 2026.

| # | Question | Version 1 | Version 2 | Screenshot |
|---|---|---|---|---|
| 1 | How is my property tax bill calculated? | ✅ Good | ✅ Good | `screenshots/q1-tax-bill.png` |
| 2 | How do I apply for the homestead exemption? | ✅ Good | ✅ Good | `screenshots/q2-homestead.png` |
| 3 | What does the 2027 reassessment mean for me? | ⚠️ Mostly good | ⚠️ Mostly good | `screenshots/q3-reassessment.png` |
| 4 | Should I appeal? My house is worth less than what the Assessor says. | ⚠️ Safe but unhelpful | ✅ Fixed | `screenshots/q4-should-i-appeal.png` (v1: `screenshots/v1/q4-should-i-appeal.png`) |
| 5 | Can I pay my property taxes in installments? | ❌ Wrong | ⚠️ Honest, not yet useful | `screenshots/q5-installments.png` (v1: `screenshots/v1/q5-installments.png`) |

## Answers in brief

1. **Tax bill.** Gives the formula, then the $300,000 worked example: $30,000 assessed, $22,500 after homestead, ≈ $2,727 at about 121.20 mills (≈ $3,636 without homestead). It cites S1, S2, S11, S17, and S19, and warns that the millage is approximate and some millages aren't reduced by homestead.
2. **Homestead.** Covers the $7,500 assessed value ($75,000 market value) amount, the own-and-occupy-by-Dec. 31 rule, in-person filing at City Hall Room 4E01 by every occupying owner, and the three documents to bring. Cites S2, S3, S7, S8, and S9 and lists contacts.
3. **2027 reassessment.** Explains that the 2027 roll carries new reappraised values, that roll years are named for the year the bill is due, and that the Aug. 20, 2026 appeal window has **closed**. The closed-window message comes from today's date. It also says it doesn't know why the cycle is 2027 rather than 2028.
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

**Still imperfect**
- **Q5 is honest but not useful.** The bot still doesn't know whether the Treasury offers payment plans. A sourced knowledge-base entry is needed.
- **Q3 leans on secondary sources** (S21, S26) for the ~20% figure and the reassessment context. No official OPAO statement confirms that 2027 is a full parish-wide reappraisal or explains why it isn't 2028.
- **Q1's millage (121.20) is unverified.** It came from secondary summaries. It needs checking against the Treasury's table or a real tax bill (see `verification-checklist.md`).
- **The "I don't know about ___" warning can over-fire.** Any word the knowledge base never mentions sets it off: "condo" in a homestead question, or a misspelling. That's the safer failure, but it's noisy.
- **Keyword matching has limits.** It has no memory of earlier questions in the conversation, doesn't understand paraphrases it wasn't given, and has no Spanish or Vietnamese support.
