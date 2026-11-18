# NOLA Assessment Navigator: Final Draft Summary

Ethan Zuckerman · AI and Real Estate · Nov. 18, 2026 · **Live, no sign-in: https://ethanpzuckerman.github.io/nola-assessment-navigator/**

**Why an owner would use it.** A New Orleans owner who opens a tax bill or assessment notice today has to piece
together the Assessor's site, the City's millage table, state law and the tax roll to answer one question: *why is my
number what it is, and what can I do about it?* The Navigator answers that in one conversation, in plain language,
from the official records, and says plainly when a person needs to take over.

**Try it in 30 seconds.** Ask *"How do I apply for the homestead exemption?"* Then find *1205 St. Charles Ave, Apt 607*,
pick it, and ask *"How much tax will I pay?"* Finally ask *"Should I appeal?"* to see it refuse advice and hand off.

**What it does: three layers in one chat**
- **Layer 1, general guidance:** how values, millage, exemptions, appeals and bills work, with a source on every fact.
- **Layer 2, my property:** look up any of 163,135 parcels by address or parcel ID, confirm it, and ask about it. Example:
  for 1205 St. Charles #607 it shows the recorded 2026 tax of **$1,019** and the next (2027) bill of **$1,030**, checks
  the math against the roll to the cent, and shows that the $7,500 homestead exemption removed $904.
- **Layer 3, market context:** how the property compares with similar parcels nearby, its census neighborhood, and how
  Zillow's typical home value in its ZIP has moved since the roll's Jan. 1, 2023 valuation date.

Every answer labels what is *recorded* in the roll, *calculated* by the tool, or *explained*; refuses legal and tax
advice; and offers a person, with a button that writes a hand-off note for the right office.

**What works (tested Nov. 16)**
- **Accuracy:** every property number comes from the state's 2026 and 2027 roll files. An automated sweep of about
  822,000 answers, covering every parcel, found 0 errors. 25 real-world owner questions: 19 right on the first run,
  all 25 after six fixes. 32/32 end-to-end checks.
- **Lookup:** handles abbreviations, units, ½ addresses, renamed streets, typos and parcel IDs with letters, and suggests
  streets as you type. 19 of 19 test addresses behave as expected.
- **Layers together:** a general question also shows the selected property's record; an address typed into the chat is
  looked up; owners can download a one-page summary of their property.
- **The data corrected the research.** Comparing the 2026 and 2027 rolls showed 98% of values unchanged, which disproved
  my earlier claim that 2027 was a reappraisal year. The Legislative Auditor's report confirmed it: values are as of
  Jan. 1, 2023 through tax year 2027. Every fact was then re-checked against official sources.

**What doesn't work yet**
- **The 2027 bill isn't final:** the state file predates the Council's Nov. 5 roll-forward and final rates aren't
  published, so the tool shows the recorded 2027 tax plus a calculated range for the increase.
- **Gaps in the data:** no building size or condition, no special-district fees, no 2025 roll; 14% of parcels have no
  census or ZIP match.
- **Wording and language:** keyword matching misses some everyday phrasings; English only.
- **Not yet confirmed:** current homestead application steps and how homestead applies to the rented half of a double.
  The Assessor's site blocks automated checking, so those answers say "please confirm."

**Plan for the final (Dec. 1), in priority order**
1. **User testing:** five people outside the class (homeowners, a landlord, an owner 65+, a housing counselor) use the
   test page on the live site. Done when every problem they hit is fixed or explained.
2. **Demo feedback:** apply the comments from the Nov. 16 demo.
3. **Current facts:** final 2027 millages and due date, certified amendment results, and the Assessor's pages checked by
   hand.
4. **Layer 3 map:** show the parcel and its neighbors on a map (coordinates are already loaded).
5. **AI for everyone:** a small server-side Claude endpoint, so the public link gets the same checked AI explanation as
   the claude.ai copy.
