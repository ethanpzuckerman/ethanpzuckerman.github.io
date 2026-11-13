# NOLA Assessment Navigator: Final Draft Summary

Ethan Zuckerman · AI and Real Estate · Nov. 15, 2026 · Live prototype: https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB

**What it does.** A chatbot for New Orleans property owners, in one conversation:
- **Layer 1, general guidance:** how assessments, millage, exemptions, appeals and tax bills work.
- **Layer 2, my property:** find your property by address or parcel ID, confirm it, then ask about it. Answers cover its values, exemptions and freeze, its recorded 2026 tax and next (2027) bill, what changed and why, and its census neighborhood.
- **Layer 3, market context (first version):** how the property compares with similar parcels in its area.

Every answer:
- cites its sources
- labels what is *recorded* in the roll, *calculated* by the tool, or *explained*
- refuses legal and tax advice
- offers a human contact

On claude.ai it adds a short **AI explanation by Claude**, which is shown only if code confirms it uses no numbers or sources beyond the checked material.

**What works (tested Nov. 13)**
- **Knowledge base:** 29 entries and 39 sources. It covers all 15 owner questions in the education outline and tolerates typos.
- **Facts re-verified this week:**
  - Tax years 2024–27 all use market values as of Jan. 1, 2023. So the "2027 reassessment" is the reappraisal done in 2027 for the 2028 roll.
  - The Nov. 3 amendment results.
  - The Council's 4.039-mill roll-forward, approved Nov. 5.
  - The Feb. 28 due date for 2026 bills.
  - The City offers no installment plan.
- **Lookup:** all 163,135 parcels; 19 of 19 test addresses behave as expected. It handles:
  - abbreviations, unit numbers and ½ addresses
  - renamed streets and typos
  - N/S streets
  - parcel IDs with letters
- **Property answers:** 20 question types. Every number comes from the state's 2026 and 2027 roll files, and the recorded tax matches the formula to the cent. An automated sweep checked about 822,000 generated answers, covering every parcel, with 0 problems.
- **Layers together:**
  - A general answer also shows the selected property's record.
  - A property question asked before a lookup is answered right after the owner picks the property.
  - An address typed into the chat is looked up.
- **Census neighborhood:** uses the course's parcel-to-block-group crosswalk (86% of parcels) and ACS data. The figures describe the area, never the owner.
- **Guardrails:** privacy, advice requests, out-of-scope topics and other parishes are handled, and deadlines are checked against today's date.
- **Tests:** 29/29 end-to-end checks and 10/10 Part 2 questions pass. An outside QA pass of 695 interactions found 23 defects, all fixed.

**What doesn't work yet**
- **Next bill:** the 2027 state file was filed before the Nov. 5 roll-forward, and the final rates aren't published. The tool shows the 2027 bill as recorded, plus a calculated range for the increase.
- **Not in the roll data:**
  - building size, condition and features
  - special-district fees
  - the 2025 roll, so changes are compared 2026 vs. 2027 instead
- **Census:** 14% of parcels have no census match.
- **Matching limits:** keyword matching misses some phrasings (the AI layer helps, but only on claude.ai), and answers are in English only.
- **Still to confirm:** the 2027 due date, the 2026 appeal deadline (Aug. 18 vs. 20), and the start year of the $150,000 freeze limit. The Assessor's website blocks automated checking.

**Plan for the final (Dec. 1)**
- **Feedback:** apply the feedback from Monday's demo, and test with 3–5 real owners.
- **Facts:** update with the final 2027 millages, bill dates and certified amendment results.
- **Layer 3:**
  - a map of the parcel and its neighbors (coordinates are already loaded)
  - the course's Zillow data for ZIP-level price trends
  - the citywide sales-ratio pattern, with its caveats
- **Owner tools:** address autocomplete and a downloadable one-page summary of a property's answers.
- **Public hosting:** GitHub Pages, with a small server-side Claude endpoint so anyone can use the AI explanation.
