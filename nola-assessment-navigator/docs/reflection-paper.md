# Reflection: where AI helped me and where it failed

Ethan Zuckerman · AI and Real Estate · NOLA Assessment Navigator, final submission

## What I built

The NOLA Assessment Navigator is a chatbot for New Orleans property owners. It answers general questions about
assessments, exemptions and appeals; it finds an owner's property among 163,135 parcels and answers from that
record; and it gives market context from Census and Zillow data. I built it with an AI coding agent (Claude Code)
over six weeks. I directed the work, supplied the course data and the instructor's feedback, and decided what went
in. The agent did the research, wrote the code and ran the tests.

## Where AI helped

**Speed on work I couldn't have done alone.** The agent read the state's raw tax-roll files, worked out their
undocumented format, and reproduced the course's 2026 file exactly on all 163,135 parcels. It then compared the 2026
and 2027 rolls by parcel ID. That comparison produced the project's most useful finding: 98% of values didn't
change, which contradicted what we had been telling owners.

**Testing at a scale no person would do.** One test asks five questions about every parcel in the city, about
822,000 answers, and checks each against the record. An independent AI tester ran 695 conversations and found 23
real defects, including answers that blamed a tax increase on millage when the owner had actually lost a homestead
exemption. That one affected about 4,000 parcels and I would never have found it by hand.

**Catching its own mistakes when it was made to check.** The agent's first draft said the 2027 roll was a
parish-wide reappraisal. The data didn't show one. When it went back to the Legislative Auditor's report and read
all 44 pages, the answer was there in plain words: values are as of Jan. 1, 2023 for tax years 2024 through 2027.

**Turning feedback into fixes quickly.** When the grader said the tax example understated the bill, the agent
pulled the City's own millage table and rebuilt the example in an afternoon: 121.20 mills citywide plus the levee
district, $2,813.33 before the levee, $3,056.10 with it.

## Where AI failed

**It stated wrong facts with complete confidence.** These were in my first submission:
- It used 121.20 mills as the whole tax rate. That is only the citywide part; the levee district adds 10.79 more.
- It applied the homestead exemption to the police and fire millages, which don't get it, so it overstated the
  savings ($909 instead of $903.60) and understated the bill.
- It taught that the reappraisal cycle had "moved" to 2027, based on a notice that only said the roll was open.
- It cited a figure of "393 valuation neighborhoods" that isn't in the report it was credited to.

None of these looked like guesses. They were written in the same confident voice as the correct facts, with
citations. The citations were the problem: the agent had read search-result summaries, not the pages.

**It over-corrected.** After the state files showed a total of 131.99 mills, the agent wrote in my instruction file
that the 121.20 figure was "wrong, don't use it." It wasn't wrong; it was a subtotal. The grader caught that. An AI
that has just been corrected can swing too far the other way.

**Its own tests passed while the product was wrong.** The agent wrote tests, ran them, and reported "all passing"
while the bot was telling owners their taxes rose "all from the millage change" when a homestead had been removed.
The tests checked what the agent thought to check. It took a separate tester with no knowledge of the code to find
what was actually broken.

**It can't reach everything, and it doesn't always say so.** The Assessor's website blocks automated readers. The
homestead application steps in my bot still rest on a 2021 flyer that the agent could not re-read. The honest
version of that answer, which names the date and tells the owner to confirm, only appeared after the grader pointed
out that known weak spots were still in the source of truth.

**It doesn't understand ordinary speech as well as it seems to.** In my final 25-question test, the bot answered "I
don't know" to "I'm 67 and on a fixed income. Is there any break for seniors?" because the word "freeze" wasn't in
the question. Four of the six failures in that test were like this.

**Things it could not do at all.** It could not test with real people. It can simulate an owner, and its simulated
owners found real bugs, but it cannot tell me whether a 70-year-old on a phone understands the answer or trusts it.
That is why the user testing in this submission had to be mine, with people outside the class. It also could not
decide what mattered: which questions an owner in New Orleans actually loses sleep over, or when an honest "I don't
know" serves someone better than a longer answer. Those were judgment calls, and they stayed with me.

## What I learned about working with AI

1. **A citation is not verification.** I now ask one question of every fact: did someone open the page and read
   the sentence? My instruction file keeps a log of which sources were actually read and on what date.
2. **Data beats sources, and sources beat memory.** The roll files settled arguments that web research could not.
   Where the data and a source disagreed, the data was right both times.
3. **Separate what is recorded, what is calculated and what is explained.** Labeling every answer this way made
   errors visible. A wrong "explanation" is much easier to spot when it sits next to the recorded number.
4. **Let the AI write, but don't let it grade itself.** The most valuable testing came from an independent
   tester, a grader and real users.
5. **Tell it what it may not do.** The rules in my instruction file (no advice, say "I don't know", never judge
   whether one home is over-assessed) mattered more than any prompt. When I added a real AI model to the live
   site, I only let its words through after code checks that every number it uses appears in the verified material.
6. **"I don't know" is a feature.** The best answer my bot gives about living in half of a double is that it
   doesn't know how the rented half is treated, and who does.

## If I did it again

I would have the agent read primary sources from the first day, keep the verification log from the start, and put
a human tester in front of the bot in week one instead of week six. I would also ask the Assessor's Office for a
conversation early: the questions my bot still can't answer are ones a ten-minute phone call would settle.
