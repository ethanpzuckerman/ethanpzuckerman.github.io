# NOLA Assessment Navigator: Final Draft Summary

Ethan Zuckerman · AI and Real Estate · Nov. 17, 2026 · **Live prototype (public, no sign-in): https://ethanpzuckerman.github.io/nola-assessment-navigator/**

**What it does.** A chatbot for New Orleans property owners. In one conversation, an owner can:
- **Layer 1, general guidance:** ask how assessments, millage, exemptions, appeals and tax bills work.
- **Layer 2, my property:** find their property by address or parcel ID, confirm it, and ask about it: values, exemptions and freeze, the recorded 2026 tax and the next (2027) bill, what changed and why.
- **Layer 3, market context:** see how the property compares with similar parcels in its area, its census neighborhood, and how Zillow's typical home value in its ZIP has moved since the roll's Jan. 1, 2023 valuation date.

Every answer cites its sources, labels what is *recorded* in the roll, *calculated* by the tool, or *explained*, refuses legal and tax advice, and offers a person, with a button that writes a hand-off note for the right office.

**What works (tested Nov. 16)**
- **Knowledge base:** 33 entries and 41 sources, covering every owner question in the education outline, including living in half of a double. Facts were re-read from official sources: the 121.20-mill citywide rate plus the levee district (131.99 total), the 2024–27 valuation cycle (so the 2027 roll is not a reappraisal), the Nov. 5 roll-forward, the Nov. 3 amendments, bill dates, and payment plans.
- **Lookup:** all 163,135 parcels. It handles abbreviations, units, ½ addresses, renamed streets, typos, N/S streets and parcel IDs with letters, and suggests street names as you type. 19 of 19 test addresses behave as expected.
- **Property answers:** 21 question types. Every number comes from the state's 2026 and 2027 roll files; the recorded tax matches the formula to the cent. An automated sweep of about 822,000 answers, covering every parcel, found 0 problems.
- **Layers together:** a general answer also shows the selected property's record; a property question asked before a lookup is answered right after the pick; an address typed in the chat is looked up. Owners can download a one-page summary of their property.
- **Tests:** 25 real-world owner questions (19 right on the first run, 25 after six fixes); 32/32 end-to-end checks; 10/10 Part 2 questions. Every answer is in the test log, word for word.

**What doesn't work yet**
- **Next bill:** the 2027 state file predates the Council's Nov. 5 roll-forward, and final rates aren't published, so the increase is shown as a calculated range.
- **Not in the data:** building size, condition and features; special-district fees; the 2025 roll (changes are compared 2026 vs. 2027 instead). 14% of parcels have no census or ZIP match.
- **Wording:** keyword matching still misses some everyday phrasings, and answers are in English only. The AI explanation that helps with this runs only on the claude.ai copy.
- **Still to confirm:** the 2027 due date, the homestead application steps, and how homestead applies to the rented half of a double. The Assessor's website blocks automated checking, so those answers say "please confirm."

**Plan for the final (Dec. 1)**
- **User testing:** five testers outside the class, using the test page on the live site; fix what they find.
- **Demo feedback:** apply the comments from the Nov. 16 demo.
- **Facts:** update with the final 2027 millages, bill dates and certified amendment results.
- **Layer 3:** a map of the parcel and its neighbors (coordinates are already loaded).
- **Public AI:** a small server-side Claude endpoint, so everyone on the public link gets the checked AI explanation.
