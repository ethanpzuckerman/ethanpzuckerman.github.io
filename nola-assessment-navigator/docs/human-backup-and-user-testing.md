# Human backup plan and user testing

Ethan Zuckerman · NOLA Assessment Navigator · Final submission

## Part A. Human backup plan

**The principle.** The Navigator explains; it does not decide. Any question that needs judgment, a legal reading, an
official action or a fact the sources don't cover goes to a person, and the owner should arrive there prepared.

**When the bot hands off.** These triggers are built into the code and tested (`tests/final_eval.js`,
`tests/owner_questions.js`):

| Trigger | Example | What the bot does |
|---|---|---|
| Advice request | "Should I appeal?" "Will I win?" | Says "That's a decision for you, and I can't give legal or tax advice," shows the record and the process, then the contacts |
| "I don't know" | "Do I have to let the assessor inside?" | Says so plainly and names who would know |
| Deadline, exemption application, appeal or dispute | "My homestead was cancelled" | Answers what the sources support, then the contacts |
| The record can't explain something | A homestead that disappears on the 2027 roll | Shows the recorded change, says the roll doesn't give the reason, sends the owner to the Assessor |
| Legal questions | Heirs, successions, title | Refers to free legal aid |
| Private information typed in | A Social Security number | Stops, asks the owner not to share it, and doesn't repeat it |

**What the owner gets at the hand-off.** Every answer with contacts has a button, *Prepare a note to hand this to a
person*. It picks the right office for the question and writes a short note: the question, the property and parcel
ID, what the Navigator said, and the date. The owner copies it into an email, reads it over the phone or brings it
in. Nothing is sent automatically, and the note tells the owner not to add private details.

**Who the person is.**

| Tier | Who | Handles | Status |
|---|---|---|---|
| 1. The office that owns the answer | Orleans Parish Assessor's staff (values, exemptions, informal review); Bureau of the Treasury (bills, payments); Board of Review (formal appeals) | Anything that changes a record or a bill | **Exists today.** This is where the prototype's hand-off note goes |
| 2. Navigator help desk (proposed) | Trained student volunteers from Tulane's real estate program, supervised by a housing counselor at a HUD-approved counseling agency | "I don't understand my notice," help using the tool, getting documents ready, deciding which office to call | **Proposed.** Would need a partner agency, a shared inbox and volunteer training before launch |
| 3. Legal help | Southeast Louisiana Legal Services, or a licensed attorney | Successions and heir property, title problems, tax sales, court appeals | **Exists today** (referral only; the Navigator has no agreement with them) |

Tier 2 volunteers would follow the bot's rules: explain, cite, never advise, pass legal questions to tier 3.

**How fast owners hear back.** These are targets for a deployed version. They have not been measured, and the
prototype itself promises nothing:

| Situation | Target |
|---|---|
| Bot answer or hand-off note | Immediate |
| Help-desk message received | Automatic acknowledgment at once, with the official phone numbers |
| Ordinary question to the help desk | Reply within 2 business days |
| A deadline within 10 days (appeal window, exemption cut-off, tax sale notice) | Same or next business day, by phone, and the owner is told to contact the office directly without waiting |
| Legal referral | Passed to the legal aid partner within 1 business day; their intake sets the timing after that |

The Navigator tells owners the truth about speed today: it doesn't know how quickly each office answers, and for
anything with a deadline it says to call or go in person.

**What would be tracked.** Hand-offs by trigger, time to first human reply, whether the question was resolved,
and the most handed-off questions, which become new knowledge-base entries.

## Part B. User testing

**Who.** At least five people outside this class: two New Orleans homeowners, one owner of rental property, one
owner aged 65 or older, and one housing counselor or real estate professional.

**How.** Each tester opens the public link on their own device and follows the test page (`tester.html`, about 15
minutes): ask a real question in their own words, find a property, ask about its tax, ask anything else, then ask
"Should I appeal?" and use the hand-off note. They answer nine short questions (usefulness, ease of finding the
property, understanding, trust, the hand-off note, one change, a 1–5 score) and send the text back. I watch at least
two sessions live and stay silent unless the tester is stuck for more than a minute.

**Results.**

> **TO COMPLETE BEFORE SUBMITTING. These rows must come from real testers. Do not fill them in from memory or
> guesswork.**

| Tester | Who they are (no names) | First question they asked | Found property? | Score (1–5) | What they told me |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

**What the testers told me** (3–5 sentences: the patterns across testers, in their words where possible):

> TO COMPLETE.

**What I changed because of it** (each change tied to a tester's comment; add their questions to
`tests/owner_questions.js`):

> TO COMPLETE.
