"""Write docs/test-set-25.md from the first and final runs of tests/owner_questions.js."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
first = json.loads((ROOT / "tests/owner_questions_first-run.json").read_text())
final = json.loads((ROOT / "tests/owner_questions_final.json").read_text())

# What went wrong on the first run and what was changed. Question 3 passed its checks but read badly, so it's
# graded "partly" by hand.
FIXES = {
    2: ("Missed", "Gave the exemption amount but no dollar figure for what it saves.",
        "Added the savings to the homestead answer: about $903.60 a year on the East Bank at 2026 rates, and why it isn't more (police and fire mills). `kb.js` `homestead-apply`."),
    3: ("Partly", "Opened with \"I don't know about cancelled\" and then showed how to apply, which doesn't help someone who already had the exemption.",
        "New entry for a cancelled or missing exemption: says only the Assessor knows why, lists when an exemption ends, notes that 2,165 parcels lose theirs on the 2027 roll, and says what to bring. `kb.js` `homestead-lost`."),
    4: ("Wrong", "\"I don't know\": it didn't connect \"67\", \"fixed income\" or \"seniors\" to the freeze.",
        "Added the words owners use (seniors, retired, fixed income, \"I'm 67\") to the freeze entry. `kb.js` `sal`."),
    7: ("Wrong", "Answered with how to apply for homestead instead of the rules for heirs.",
        "Made the heirs entry win on \"mom passed away\", \"her house\", \"keep her homestead\". `kb.js` `heirs`."),
    11: ("Missed", "Explained the cycle correctly but never answered the question asked: will the 2027 bills go up?",
         "Added a direct answer: mostly yes, a little, from rates (levee millage 10.79 → 12.28; Council roll-forward of 4.039 mills), not values. `kb.js` `why-2027`."),
    13: ("Wrong", "Said the ratio \"doesn't match either usual rule, and I don't know why.\" The building is mixed-use: land at 10%, building at 12.5%.",
         "The assessed-value answer now checks land and building separately and explains a building rate between 10% and 15% as part residential, part commercial, while saying the roll doesn't show the split. `property.js` `ratioRule`."),
}
LAYER = {1: "1 General", 2: "2 My property", 3: "3 Market context", "refuse": "Refuse / hand off"}

out = ["""# Test set: 25 real-world owner questions

**What this is.** Twenty-five questions phrased the way New Orleans owners ask them, each with the answer I expected
**before** running it, what the chatbot actually said, and what I fixed. Run in the real page by
`node tests/owner_questions.js`; a question passes only if every expected fact appears in the answer.

**Where the questions came from.** Each row names its origin: topics owners raise in the City's and the Assessor's own
notices and in local news, questions and an address the instructor used in class, the instructor's feedback, and
the failures an outside QA pass found. Questions from my five outside testers will be added to this set when user
testing is finished (see the human backup and user testing plan).

**Results.** First run: **{f} of 25** fully correct. After fixes: **{l} of 25**. Mix: 11 general (Layer 1), 9 about a
selected property (Layer 2), 4 market context (Layer 3), 1 refusal with hand-off.

## Summary

| # | Layer | Question | Expected answer | First run | Final |
|---|---|---|---|---|---|""".format(f=sum(1 for r in first["rows"] if r["ok"] and r["n"] not in FIXES), l=final["passed"])]
for a, b in zip(first["rows"], final["rows"]):
    n = a["n"]
    q = b["q"] + (f" *(property: {b['setup']})*" if b["setup"] and not b["q"].startswith("(search)") else "")
    fr = f"❌ {FIXES[n][0]}" if n in FIXES else ("✅ Correct" if a["ok"] else "❌")
    out.append(f"| {n} | {LAYER[b['layer']]} | {q} | {b['expect']} | {fr} | {'✅ Correct' if b['ok'] else '❌'} |")

out.append("\n## What went wrong and what I fixed\n\n| # | Question | What the first run did | Fix |\n|---|---|---|---|")
for n, (grade, wrong, fix) in FIXES.items():
    out.append(f"| {n} | {final['rows'][n-1]['q']} | {wrong} | {fix} |")
out.append("""
**Patterns in the failures.** Four of the six were the same weakness: the keyword matcher didn't recognize everyday
wording (\"seniors\", \"mom passed away\", \"cancelled\"), so it either said \"I don't know\" or answered a nearby
question. One was a real gap in the data logic (mixed-use buildings). One answered around the question instead of
answering it. None was a wrong number: every dollar figure in the 25 answers matches the roll files.

**What still isn't right.**
- Question 10 (\"Do I have to let the assessor inside my house?\") gets an honest \"I don't know\" with contacts. That
  is the correct behavior for a question no source answers, but an owner would rather have an answer.
- Questions 12–13 use an apartment building the roll classes as commercial. The answer explains the mixed rate but
  can't say how the building was split.
- The 2027 bill figures come from a state file that predates the Council's roll-forward, so they're shown with a
  calculated range, not a final amount.
""")
out.append("## Complete final answers\n\nWord for word, as the page shows them. Source tags like [S15] are links in the page.\n")
for b in final["rows"]:
    setup = f"Property selected first: {b['setup']}. " if b["setup"] and not b["q"].startswith("(search)") else ""
    out.append(f"### {b['n']}. {b['q']}\n\n*Origin: {b['origin']}. {setup}*\n\n**Expected:** {b['expect']}\n\n**Answer:**\n\n" + "\n".join("> " + l for l in b["answer"].split("\n")) + "\n")
(ROOT / "docs/test-set-25.md").write_text("\n".join(out))
print("wrote docs/test-set-25.md;", "first run fully correct:", sum(1 for r in first["rows"] if r["ok"] and r["n"] not in FIXES), "final:", final["passed"])
