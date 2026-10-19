# Five sample questions: draft chatbot (Layer 1)

Tested Oct. 19, 2026 against the draft at `nola-assessment-navigator/index.html`, which is the same code as the live artifact. Screenshots are in `screenshots/`. `q0-landing.png` shows the opening screen with the prototype disclosure.

| # | Question | Result | Screenshot |
|---|---|---|---|
| 1 | How is my property tax bill calculated? | ✅ Good | `screenshots/q1-tax-bill.png` |
| 2 | How do I apply for the homestead exemption? | ✅ Good | `screenshots/q2-homestead.png` |
| 3 | What does the 2027 reassessment mean for me? | ⚠️ Mostly good | `screenshots/q3-reassessment.png` |
| 4 | Should I appeal? My house is worth less than what the Assessor says. | ⚠️ Safe but unhelpful | `screenshots/q4-should-i-appeal.png` |
| 5 | Can I pay my property taxes in installments? | ❌ Wrong | `screenshots/q5-installments.png` |

## Answers in brief

1. **Tax bill.** Gives the formula, then the $300,000 worked example: $30,000 assessed, $22,500 after homestead, ≈ $2,727 at about 121.20 mills (≈ $3,636 without homestead). It cites S1, S2, S11, S17, and S19, and warns that the millage is approximate and some millages aren't reduced by homestead.
2. **Homestead.** Covers the $7,500 assessed value ($75,000 market value) amount, the own-and-occupy-by-Dec. 31 rule, in-person filing at City Hall Room 4E01 by every occupying owner, and the three documents to bring. Cites S2, S3, S7, S8, and S9 and lists contacts.
3. **2027 reassessment.** Explains that the 2027 roll carries new reappraised values, that roll years are named for the year the bill is due, and that the Aug. 20, 2026 appeal window has **closed**. The closed-window message comes from today's date. It also says it doesn't know why the cycle is 2027 rather than 2028.
4. **Should I appeal?** The advice guardrail fires correctly ("That's a decision for you…") and lists human contacts.
5. **Installments.** Returns the "when the bill comes and how to pay" entry.

## What it got wrong or missed

- **Q5 answers a different question.** It matched "pay" and "taxes" and returned due dates and interest. It never says whether installment plans exist. The right answer is "I don't know, ask the Treasury." This is the most serious problem: a confident answer to a question it wasn't asked. **Fix:** require the main noun of the question (here "installment") to appear in the entry, or move to LLM answers grounded in retrieval and checked against the question.
- **Q4 promises but doesn't deliver.** It says "I can explain how the process works" and then doesn't, because "should I appeal" scored too low to pull in the appeal entry. It should refuse the advice *and* show the general appeal steps and deadline status. **Fix:** after the advice guard, fall back to the appeal entry whenever "appeal" appears.
- **Q3 leans on secondary sources** for the ~20% figure and the reassessment context (S21, S26). It is correctly labeled "secondary," but no official OPAO statement confirms that 2027 is a full parish-wide reappraisal or explains why it isn't 2028.
- **Q1's millage (121.20) is unverified.** It came from secondary summaries, because the research sandbox couldn't open nola.gov. The answer flags it as approximate, but it needs checking against the Treasury's table before the final version.
- **Other misses found while testing (not screenshotted):**
  - "Why did my bill go up if I have the freeze?" → **"I don't know,"** even though the SAL entry says the freeze locks assessed value, not millage. Keyword retrieval missed it.
  - "My mother passed away. Do I need to change the homestead?" → "I don't know." That's honest, but succession and heir property is a common New Orleans question with no knowledge-base entry yet.
  - No Spanish or Vietnamese support, both common languages in New Orleans.
