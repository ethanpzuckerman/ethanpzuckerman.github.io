# Oral exam prep (OralExam.ai interview on the reflection paper)

The interview is based on your submitted reflection paper, so the safest preparation is to be able to explain every
claim in it without notes. Edit the paper first: anything you can't explain should come out.

## Know these cold

| Claim in the paper | The short version | Where to look |
|---|---|---|
| What the tool does | Three layers: general guidance, my property, market context. One chat. | `CLAUDE.md` §1 |
| The tax example | 121.20 mills citywide + 10.79 East Bank levee = 131.99. $300,000 home: $30,000 assessed, $22,500 taxable; $2,813.33 citywide, $3,056.10 total. Homestead saves $903.60 because 11.51 police and fire mills get no homestead reduction. | `CLAUDE.md` §2.4 |
| The 2027 mistake | We said the 2027 roll was a reappraisal. It isn't: values are as of Jan. 1, 2023 for tax years 2024–2027 (Legislative Auditor; City Council). Next reappraisal year is probably 2028, and that part is an inference. | `CLAUDE.md` §2.7 |
| How the data caught it | Comparing the 2026 and 2027 rolls by parcel ID: 98% of values unchanged, every parcel dated 01/01/2023. | `docs/year-comparison.md` |
| Why AI's citations weren't enough | It had read search summaries, not the pages. Now there's a log of what was read directly and when. | `CLAUDE.md` §2.9 |
| The testing | About 822,000 generated answers checked against the record; an independent tester ran 695 conversations and found 23 defects; 25-question final test went from 19 to 25 correct after six fixes. | `docs/test-set-25.md` |
| The worst bug | Tax increases blamed on millage when the homestead exemption had been removed (about 4,000 parcels). | `CLAUDE.md` §8 |
| Market context | Zillow's typical home value is down in all 17 New Orleans ZIP codes since Jan. 2023 (5.3% to 27.1%). Roll values don't follow until the next reappraisal. It describes a ZIP, never one home. | `kb.js` `market-trend` |
| The guardrails | Cite every fact; say "I don't know"; no legal or tax advice; offer a person; never show owner names; never say a home is over-assessed. | `CLAUDE.md` §4 |
| The AI model on the live site | Its text is shown only if code confirms every number and source in it came from the verified material. | `ai.js` |

## Questions you're likely to get, and what a good answer includes

1. **"Give me a specific example of AI being wrong."** The 121.20 mills story, with the numbers. Then how it was
   caught (the grader, then the City's own table) and what changed.
2. **"How did you know when to trust it?"** When a fact traced to a page someone actually read, or to the data. Not
   when it merely had a citation.
3. **"What did you do yourself?"** Be exact and honest: you directed the work, supplied data and feedback, made the
   decisions, ran the user tests and presented. The agent researched, coded and tested. Don't claim more.
4. **"What would break if the Assessor changed something?"** Dates, millage and income limits change every year;
   the knowledge base has to be re-verified each cycle. The 2027 bill figures already predate the Council's vote.
5. **"Why not just let the AI answer freely?"** Because it stated wrong tax figures confidently. A wrong answer
   about someone's tax bill or appeal deadline has real costs.
6. **"What did your testers find?"** Only what they really told you.
7. **"What are the limits?"** No building details in the roll; no special-district fees; 14% of parcels have no
   census match; homestead application steps not re-verified; English only.
8. **"What is the human backup?"** The hand-off note and the three tiers; which parts exist today and which are
   proposed.
9. **"What would you do differently?"** Primary sources and a human tester from week one.

## Before the interview

- Open the public link and run the demo once: a general question, a property lookup, "Should I appeal?"
- Re-read `CLAUDE.md` §9 (the feedback and how each point was resolved).
- Be ready to say "I don't know" in the interview too. It is the project's own rule.
