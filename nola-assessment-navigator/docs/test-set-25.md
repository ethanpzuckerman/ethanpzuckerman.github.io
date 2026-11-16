# Test set: 25 real-world owner questions

**What this is.** Twenty-five questions phrased the way New Orleans owners ask them, each with the answer I expected
**before** running it, what the chatbot actually said, and what I fixed. Run in the real page by
`node tests/owner_questions.js`; a question passes only if every expected fact appears in the answer.

**Where the questions came from.** Each row names its origin: topics owners raise in the City's and the Assessor's own
notices and in local news, questions and an address the instructor used in class, the instructor's feedback, and
the failures an outside QA pass found. Questions from my five outside testers will be added to this set when user
testing is finished (see the human backup and user testing plan).

**Results.** First run: **19 of 25** fully correct. After fixes: **25 of 25**. Mix: 11 general (Layer 1), 9 about a
selected property (Layer 2), 4 market context (Layer 3), 1 refusal with hand-off.

## Summary

| # | Layer | Question | Expected answer | First run | Final |
|---|---|---|---|---|---|
| 1 | 1 General | My assessment went up but I didn't do anything to the house. Why? | Mass appraisal follows sales of similar homes; values are reset every four years (as of Jan. 1, 2023 for 2024–27); a higher value doesn't raise the bill by the same percent. Cites the auditor's report. | ✅ Correct | ✅ Correct |
| 2 | 1 General | what is the homestead exemption and how much does it save me | $7,500 of assessed value = first $75,000 of market value; own and occupy; doesn't reduce the police and fire mills. A dollar figure for the savings ($903.60 a year in the $300,000 East Bank example). | ❌ Missed | ✅ Correct |
| 3 | 1 General | I got a letter saying my homestead exemption was cancelled. What do I do? | Says plainly it doesn't know why this one was cancelled; explains the own-and-occupy rule and when an exemption ends (sale, move, death, deed change); sends the owner to the Assessor's Office quickly, with contacts. | ❌ Partly | ✅ Correct |
| 4 | 1 General | I'm 67 and on a fixed income. Is there any break for seniors? | The Special Assessment Level freeze: 65+, homestead, income limit $100,000 rising to $150,000 on Jan. 1, 2027; freezes assessed value, not the bill. | ❌ Wrong | ✅ Correct |
| 5 | 1 General | When are property taxes due in New Orleans? | Treasury usually says Jan. 31; 2026 bills were due Feb. 28, 2026; the 2027 date isn't announced; 1% a month interest. Contacts. | ✅ Correct | ✅ Correct |
| 6 | 1 General | I can't afford my tax bill. Can I pay monthly? | No formal installment plan; partial payments in person or by mail, not online; 1% a month on the balance. Treasury contact. | ✅ Correct | ✅ Correct |
| 7 | 1 General | My mom passed away and I live in her house. Do I keep her homestead exemption? | Heirs who live in the home get the exemption on their ownership share; a succession may be needed; says it doesn't know what the Assessor requires; legal aid contact. | ❌ Wrong | ✅ Correct |
| 8 | 1 General | I rent out one side of my shotgun double and live in the other. Do I still get homestead? | Yes on the home you own and occupy, one per person; plainly says it doesn't know how the rented half is treated; Assessor contact. | ✅ Correct | ✅ Correct |
| 9 | 1 General | What's the deadline to appeal my assessment? | Today's status first: the 2027-roll window closed 4 p.m. Aug. 20, 2026; next window summer 2027; then the steps. | ✅ Correct | ✅ Correct |
| 10 | 1 General | Do I have to let the assessor inside my house? | The sources don't answer this, so: a plain "I don't know" and the Assessor's contact. It must not answer a different question as if it were this one. | ✅ Correct | ✅ Correct |
| 11 | 1 General | Is the 2027 reassessment going to raise my taxes? | The 2027 roll isn't a reappraisal (values as of Jan. 1, 2023 through 2027); 2027 bills rise mainly from millage (levee, Council roll-forward of 4.039 mills); next reappraisal expected for 2028, labeled as inferred. | ❌ Missed | ✅ Correct |
| 12 | 2 My property | (search) 1726 St. Charles Ave | One record, 1726 ST CHARLES AV, commercial, market value $773,900; asks the owner to confirm. | ✅ Correct | ✅ Correct |
| 13 | 2 My property | Why is my assessment what it is? *(property: 1726 St. Charles Ave)* | Recorded assessed $92,510 on $773,900 market = 12%; explains the 10% land + 15% building rule for non-residential buildings; labeled recorded / calculated. | ❌ Wrong | ✅ Correct |
| 14 | 2 My property | What will my tax bill be in January? *(property: 1332 Magazine St)* | Leads with the 2027 roll ($5,077) as the next bill, then 2026 ($5,021); the Council roll-forward as a calculated range ($151 to $181); special districts not included. | ✅ Correct | ✅ Correct |
| 15 | 2 My property | Why did my taxes go up $900? *(property: 212 12th St)* | $3,473 → $4,426 (+$953) because the homestead exemption is gone on the 2027 roll, plus the millage change; says the roll doesn't say why and to contact the Assessor. | ✅ Correct | ✅ Correct |
| 16 | 2 My property | Does the assessor have my condo down as 2 bathrooms? *(property: 1205 St. Charles Ave Apt 607)* | "I don't know": the roll has no bathrooms, bedrooms or square footage; points to the Assessor's property search. | ✅ Correct | ✅ Correct |
| 17 | 2 My property | Why do I suddenly owe taxes on this property? *(property: 39W305216)* | Exempt on the 2026 roll ($0); status changes to taxable on the 2027 roll ($15,616); the roll doesn't say why; Assessor contact. | ✅ Correct | ✅ Correct |
| 18 | 2 My property | Who owns the house next door? *(property: 1332 Magazine St)* | Doesn't show owner names; points to the Assessor's property search. (Also: it can only describe the selected property.) | ✅ Correct | ✅ Correct |
| 19 | 2 My property | what's the tax on 2216 Claiborne Ave? | Finds 2 records at 2216 Claiborne Av, asks which one; after the pick, answers the tax question for that record. | ✅ Correct | ✅ Correct |
| 20 | 2 My property | Is my homestead exemption still on file? *(property: 1205 St. Charles Ave Apt 607)* | Recorded homestead $7,500 on the 2026 roll; removed $904 of tax; stays on unless something changes. | ✅ Correct | ✅ Correct |
| 21 | 3 Market context | Have home prices in my area dropped since my value was set? *(property: 1332 Magazine St)* | ZIP 70130 (from the census tract): Zillow typical value $471,065 (Jan. 2023) → $440,771 (Sept. 2026), −6.4%; roll values stay at Jan. 1, 2023 through 2027; about the ZIP, not this home. | ✅ Correct | ✅ Correct |
| 22 | 3 Market context | Is my value high compared to my neighbors? *(property: 1205 St. Charles Ave Apt 607)* | Area distribution: 271 residential parcels in Carondelet Corridor, middle half $133,400 to $202,400; this parcel $145,700, in the lower half; explicitly not a judgment of the value. | ✅ Correct | ✅ Correct |
| 23 | 3 Market context | What kind of neighborhood is this, income wise? *(property: 1332 Magazine St)* | Census block group profile (Block Group 2, Tract 77): median household income $72,273 vs. the middle block group; describes the area, not the owner. | ✅ Correct | ✅ Correct |
| 24 | 3 Market context | Are houses in poor neighborhoods over-assessed? | Both pieces of evidence: the auditor found no systematic bias; the 2026 roll shows the cheapest tenth of sales valued at 118% of price vs. 92–94%; the caveats; no conclusion about any one home. | ✅ Correct | ✅ Correct |
| 25 | Refuse / hand off | Should I appeal? Zillow says my house is worth way less. *(property: 1332 Magazine St)* | Refuses the advice ("That's a decision for you…"), then shows the ZIP market figures with the caution that they aren't about this home, the contacts, and the hand-off note button. | ✅ Correct | ✅ Correct |

## What went wrong and what I fixed

| # | Question | What the first run did | Fix |
|---|---|---|---|
| 2 | what is the homestead exemption and how much does it save me | Gave the exemption amount but no dollar figure for what it saves. | Added the savings to the homestead answer: about $903.60 a year on the East Bank at 2026 rates, and why it isn't more (police and fire mills). `kb.js` `homestead-apply`. |
| 3 | I got a letter saying my homestead exemption was cancelled. What do I do? | Opened with "I don't know about cancelled" and then showed how to apply, which doesn't help someone who already had the exemption. | New entry for a cancelled or missing exemption: says only the Assessor knows why, lists when an exemption ends, notes that 2,165 parcels lose theirs on the 2027 roll, and says what to bring. `kb.js` `homestead-lost`. |
| 4 | I'm 67 and on a fixed income. Is there any break for seniors? | "I don't know": it didn't connect "67", "fixed income" or "seniors" to the freeze. | Added the words owners use (seniors, retired, fixed income, "I'm 67") to the freeze entry. `kb.js` `sal`. |
| 7 | My mom passed away and I live in her house. Do I keep her homestead exemption? | Answered with how to apply for homestead instead of the rules for heirs. | Made the heirs entry win on "mom passed away", "her house", "keep her homestead". `kb.js` `heirs`. |
| 11 | Is the 2027 reassessment going to raise my taxes? | Explained the cycle correctly but never answered the question asked: will the 2027 bills go up? | Added a direct answer: mostly yes, a little, from rates (levee millage 10.79 → 12.28; Council roll-forward of 4.039 mills), not values. `kb.js` `why-2027`. |
| 13 | Why is my assessment what it is? | Said the ratio "doesn't match either usual rule, and I don't know why." The building is mixed-use: land at 10%, building at 12.5%. | The assessed-value answer now checks land and building separately and explains a building rate between 10% and 15% as part residential, part commercial, while saying the roll doesn't show the split. `property.js` `ratioRule`. |

**Patterns in the failures.** Four of the six were the same weakness: the keyword matcher didn't recognize everyday
wording ("seniors", "mom passed away", "cancelled"), so it either said "I don't know" or answered a nearby
question. One was a real gap in the data logic (mixed-use buildings). One answered around the question instead of
answering it. None was a wrong number: every dollar figure in the 25 answers matches the roll files.

**What still isn't right.**
- Question 10 ("Do I have to let the assessor inside my house?") gets an honest "I don't know" with contacts. That
  is the correct behavior for a question no source answers, but an owner would rather have an answer.
- Questions 12–13 use an apartment building the roll classes as commercial. The answer explains the mixed rate but
  can't say how the building was split.
- The 2027 bill figures come from a state file that predates the Council's roll-forward, so they're shown with a
  calculated range, not a final amount.

## Complete final answers

Word for word, as the page shows them. Source tags like [S15] are links in the page.

### 1. My assessment went up but I didn't do anything to the house. Why?

*Origin: City Council notice on rising 2024 assessments; WWL explainer. *

**Expected:** Mass appraisal follows sales of similar homes; values are reset every four years (as of Jan. 1, 2023 for 2024–27); a higher value doesn't raise the bill by the same percent. Cites the auditor's report.

**Answer:**

> Why your value can change when you didn't change anything
> 
> Mass appraisal values property from sales data. So your value can rise because similar homes near you sold for more, even if no one visited your house and you made no changes [S15].
> 
> Values move most in a reappraisal year, because they have to catch up with four years of price changes. In the tax year 2024 reappraisal, the total appraised value of single- and two-family homes was 23.2% higher than at the 2020 reappraisal [S15]. Those values (the market as of Jan. 1, 2023) are used through tax year 2027 [S15][S32], which is why the 2027 roll filed with the state keeps 98% of values the same as 2026 [S31].
> 
> Between reappraisals, the Assessor can update a parcel for a sale, construction, demolition, damage or remodeling [S15].
> 
> A higher value does not automatically raise your bill by the same percent. In a reappraisal year each millage is rolled back [S15]. Ask me "Will my taxes go up the same amount?" for more.
> 
> SOURCES
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S32 New Orleans City Council — Councilmember Green on assessments vs. taxes: 2024–27 values as of Jan. 1, 2023 (July 2023)
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.

### 2. what is the homestead exemption and how much does it save me

*Origin: Assessor's homestead reminders (Biz New Orleans). *

**Expected:** $7,500 of assessed value = first $75,000 of market value; own and occupy; doesn't reduce the police and fire mills. A dollar figure for the savings ($903.60 a year in the $300,000 East Bank example).

**Answer:**

> How to apply for the homestead exemption
> 
> The homestead exemption takes $7,500 off your assessed value, which equals the first $75,000 of market value. It applies only to the home you own and live in, and you must own and occupy it by December 31 of the year you claim it [S2][S3]. A person or married couple can have only one [S2].
> 
> How to apply: you apply with the Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01 [S9]. The Assessor's application form and flyer ask for [S8][S9]:
> 
> Proof of ownership: act of sale or deed
> A Louisiana driver's license or state ID showing the property address
> A current Entergy (or cable) bill for the property, with matching name, service address and mailing address
> 
> Those documents say every owner who lives in the home applies in person, and that a mailing address different from the property needs a recorded power of attorney [S8][S9]. They date from 2021 and 2024, and I can't check the Assessor's website myself, so please confirm the current steps (including whether you can apply online or by appointment) at nolaassessor.com or by phone before you go.
> 
> What it saves: about $903.60 a year on the East Bank at 2026 rates ($7,500 × 120.48 mills). It lowers most of your bill but not all of it: the police and fire millages "without applying homestead exemption" (11.51 of the 131.99 mills) are charged on your full assessed value [S11][S30].
> 
> SOURCES
> S2 La. Const. Art. VII §20 (homestead exemption)
> S3 La. R.S. 47:1703 (homestead statute)
> S9 Orleans Parish Assessor — Homestead Exemption application
> S8 Orleans Parish Assessor — Homestead flyer: Once Gained, Permanently Applied
> S11 City of New Orleans Treasury — Millages: How Taxes are Calculated (2026 millage table: 121.20 mills citywide)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 3. I got a letter saying my homestead exemption was cancelled. What do I do?

*Origin: News: Assessor cancelled thousands of homestead exemptions (Biz New Orleans, 2023). *

**Expected:** Says plainly it doesn't know why this one was cancelled; explains the own-and-occupy rule and when an exemption ends (sale, move, death, deed change); sends the owner to the Assessor's Office quickly, with contacts.

**Answer:**

> If your homestead exemption was cancelled or is missing
> 
> I don't know why a particular exemption was cancelled. Only the Assessor's Office can tell you, and it's worth contacting them right away, before the next bill is set.
> 
> What the rules say:
> 
> The exemption belongs to a home that is owned and occupied by the owner, and one person or couple can have only one [S2]. You must own and occupy the home by Dec. 31 of the year you claim it [S3].
> Once granted it normally stays on without reapplying [S8]. It can end when the home is sold, the owner moves out or dies, or the ownership on the deed changes.
> Exemptions do come off the roll: between the 2026 and 2027 rolls, 2,165 parcels that had a homestead exemption no longer have one [S31]. The roll doesn't record the reason for any of them.
> 
> If you still own and live in the home, ask the Assessor what they need to put it back; bring the same documents as a new application (proof of ownership, Louisiana ID with the property address, a current utility bill) [S9]. Find your property above and I can show whether a homestead is on your 2026 and 2027 records.
> 
> SOURCES
> S2 La. Const. Art. VII §20 (homestead exemption)
> S3 La. R.S. 47:1703 (homestead statute)
> S8 Orleans Parish Assessor — Homestead flyer: Once Gained, Permanently Applied
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> S9 Orleans Parish Assessor — Homestead Exemption application
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 4. I'm 67 and on a fixed income. Is there any break for seniors?

*Origin: Part 1 outline question; Nov. 3, 2026 Amendment 9. *

**Expected:** The Special Assessment Level freeze: 65+, homestead, income limit $100,000 rising to $150,000 on Jan. 1, 2027; freezes assessed value, not the bill.

**Answer:**

> Special Assessment Level ("the freeze") for seniors, disabled owners, and veterans
> 
> The Special Assessment Level (SAL) freezes your home's assessed value at the level of the first year you qualify [S1].
> 
> Who qualifies under the Louisiana Constitution [S1]: your home must have the homestead exemption, and you must be (a) 65 or older, (b) permanently and totally disabled, (c) a veteran with a service-connected disability rating of 50% or more, or (d) the owner's family in certain military cases (killed or missing in action, or a prisoner of war).
> 
> Income limit [S1]: your adjusted gross income on last year's federal return can't be over $100,000, a figure that is adjusted for inflation starting with tax year 2026. A change voters approved on Nov. 3, 2026 raises the limit to $150,000 effective Jan. 1, 2027, with inflation adjustments from tax year 2028 [S1][S36]. I don't have the exact inflation-adjusted figure for this year, so please confirm it with the Assessor.
> 
> Important: the freeze locks your assessed value, not your bill. Millage rates still apply in full, so your taxes can go up if rates rise [S1]. Owners who qualified at 65 or older, or as permanently disabled, don't re-certify income each year; owners under 65 who qualified another way do [S1].
> 
> Apply through the Assessor's Office with proof of age or disability and income [S7].
> 
> SOURCES
> S1 La. Const. Art. VII §18 (ratios, reappraisal every four years, phase-in, special assessment level)
> S36 WAFB / Fox 8 — Louisiana voters pass 7 of 10 constitutional amendments (Nov. 3, 2026; unofficial results) secondary
> S7 Orleans Parish Assessor — Homestead & SAL
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 5. When are property taxes due in New Orleans?

*Origin: City Treasury FAQ. *

**Expected:** Treasury usually says Jan. 31; 2026 bills were due Feb. 28, 2026; the 2027 date isn't announced; 1% a month interest. Contacts.

**Answer:**

> When the bill comes and how to pay
> 
> The City of New Orleans Bureau of the Treasury sends bills and collects payment. The Assessor sets values but doesn't collect taxes [S12][S27].
> 
> The Treasury's FAQ says bills usually go out in late December and are due January 31 [S12], but recent years ran later: 2026 bills reached owners by the end of January and were due Feb. 28, 2026 [S35]. The next bills, for the 2027 roll, are expected around late 2026 or January 2027; the City hasn't announced the due date yet.
> After the due date, interest accrues at 1% per month [S34][S35], and not receiving a bill doesn't excuse a late payment [S12].
> Pay online, by mail, or in person; options are at nola.gov/property-tax [S27]. Bills can be looked up online at nola.gov/find-tax-bill [S35].
> SOURCES
> S12 City of New Orleans Treasury — FAQ
> S27 City of New Orleans — Pay Property Tax
> S35 City of New Orleans — 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026)
> S34 City of New Orleans Treasury — Paying taxes (payment plans, interest)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 6. I can't afford my tax bill. Can I pay monthly?

*Origin: Part 1 sample question (the bot failed it then). *

**Expected:** No formal installment plan; partial payments in person or by mail, not online; 1% a month on the balance. Treasury contact.

**Answer:**

> Payment plans and partial payments
> 
> The City doesn't offer a formal installment plan for property taxes. You can make partial payments in person or by mail, but not online. Any unpaid balance is charged interest at 1% per month, plus other fees [S34].
> 
> For help with a bill you can't pay, contact the Bureau of the Treasury [S27]. If the problem is the value itself, that's a question for the Assessor's Office, and an appeal is only possible during the summer appeal window.
> 
> SOURCES
> S34 City of New Orleans Treasury — Paying taxes (payment plans, interest)
> S27 City of New Orleans — Pay Property Tax
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 7. My mom passed away and I live in her house. Do I keep her homestead exemption?

*Origin: Outside QA pass (695 interactions). *

**Expected:** Heirs who live in the home get the exemption on their ownership share; a succession may be needed; says it doesn't know what the Assessor requires; legal aid contact.

**Answer:**

> When an owner dies: heirs, surviving spouses, and the homestead
> 
> The Louisiana Constitution extends the homestead exemption to a surviving spouse who keeps living in the home, whether the spouse owns an interest, holds a usufruct (the right to use the property), or the home is in a qualifying trust [S2].
> 
> For heirs, the Constitution says the exemption on a home with several owners is limited to the ownership share of the owners who live there [S2]. A Loyola Law practice manual gives the example of two of three heirs living in the home getting two-thirds of the benefit [S29]. If you live in an inherited home but the title isn't in your name, you may need to open a succession, the court process that transfers a deceased person's property [S28].
> 
> What I don't know: exactly what the Orleans Parish Assessor asks heirs to bring, or whether they'll grant the exemption before a succession is finished. The manual says some assessors wrongly wait for a court judgment [S29]. Ask the Assessor's Office, and for the succession itself, talk to a lawyer or a legal aid office.
> 
> SOURCES
> S2 La. Const. Art. VII §20 (homestead exemption)
> S29 Loyola Law Pro Bono Desk Manual §6.5 — Considerations with Immovable Property secondary
> S28 LouisianaLawHelp — Homestead Exemption for Property Taxes in Louisiana secondary
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 8. I rent out one side of my shotgun double and live in the other. Do I still get homestead?

*Origin: Instructor feedback on Part 1. *

**Expected:** Yes on the home you own and occupy, one per person; plainly says it doesn't know how the rented half is treated; Assessor contact.

**Answer:**

> Homestead when you live in half of a double
> 
> Short answer: you can get a homestead exemption on a double you own and live in, but I don't know exactly how the Assessor applies it to the rented half. That is a question for the Assessor's Office.
> 
> What the law says:
> 
> The exemption covers the home that is owned and occupied by the owner, up to $7,500 of assessed value [S2]. A rental you don't live in can't get it.
> One person or couple can have only one homestead exemption, so you can't claim both sides [S2].
> When a home has several owners, the exemption is limited to the ownership share of the owners who live there [S2]. In the 2026 roll, 1,358 parcels have a homestead recorded at 50% of ownership, and each gets $3,750 instead of $7,500 [S30].
> 
> What I don't know: whether the Assessor treats the rented side of an owner-occupied double differently, for example by applying the exemption only to your side's share of the value. The roll doesn't record which parcels are doubles. If you find your property above, I can show you the homestead amount and percentage on your record.
> 
> SOURCES
> S2 La. Const. Art. VII §20 (homestead exemption)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 9. What's the deadline to appeal my assessment?

*Origin: Part 1 outline question. *

**Expected:** Today's status first: the 2027-roll window closed 4 p.m. Aug. 20, 2026; next window summer 2027; then the steps.

**Answer:**

> How to appeal your assessment, and the deadlines
> 
> Status: the appeal window for the 2027 roll closed at 4 p.m. on Thursday, Aug. 20, 2026 [S4]. The next window, for the 2028 roll, should open in summer 2027 (it usually runs mid-July to mid-August) [S4][S5]. The exact dates haven't been announced, so I don't know them yet.
> 
> Check the roll during the open-roll period, usually mid-July to mid-August. For the 2027 roll it ran July 15 – Aug. 17, 2026 [S4].
> Informal review with the Assessor. Book an appraiser at (504) 754-8811 or online, at least 24 hours ahead [S4]. Appeals filed online go first to Assessor staff, who may ask for documents or offer a settlement [S6].
> Board of Review, the City Council sitting as an independent body. Unresolved appeals get a hearing [S6][S13]. For the 2027 roll the filing deadline was 4 p.m., Aug. 20, 2026. Paper filings need four copies [S4].
> Louisiana Tax Commission, within 30 calendar days of the Board's decision [S14].
> Court after that. I don't know that deadline. Ask a lawyer.
> 
> You can appeal the value, not the millage [S13].
> 
> SOURCES
> S4 Orleans Parish Assessor — 2027 Assessment Rolls Open July 15 to Aug. 17 (July 13, 2026)
> S5 Orleans Parish Assessor — 2026 Assessment Rolls Open July 15 to Aug. 15 (July 14, 2025)
> S6 Orleans Parish Assessor — New Online Assessment Appeal System (July 22, 2025)
> S13 New Orleans City Council — Property Tax Assessments and Appeals
> S14 La. Admin. Code tit. 61 §V-3103 — Appeals to the Louisiana Tax Commission
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 10. Do I have to let the assessor inside my house?

*Origin: Common owner worry (auditor's report discusses inspections). *

**Expected:** The sources don't answer this, so: a plain "I don't know" and the Assessor's contact. It must not answer a different question as if it were this one.

**Answer:**

> I don't know. That question isn't covered by the sources I've been given, and I'd rather not guess. The Assessor's Office can help. You can also try rephrasing, or tap one of the suggested questions.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 11. Is the 2027 reassessment going to raise my taxes?

*Origin: Project brief (2027 reassessment). *

**Expected:** The 2027 roll isn't a reappraisal (values as of Jan. 1, 2023 through 2027); 2027 bills rise mainly from millage (levee, Council roll-forward of 4.039 mills); next reappraisal expected for 2028, labeled as inferred.

**Answer:**

> What the 2027 reassessment is
> 
> What's established: Louisiana reappraises all property on a four-year cycle [S1]. Tax year 2024 was a reappraisal year. The Legislative Auditor's report says property is valued as of Jan. 1, 2023 "for tax years 2024 through 2027" [S15], and the City Council said the same in 2023 [S32].
> 
> So the 2027 roll is not a new reappraisal. It was open for inspection July 15 – Aug. 17, 2026 [S4], and the copy the Assessor filed with the state keeps 98% of values the same as 2026, every one still dated 01/01/2023 [S31]. Between reappraisals the Assessor can still change a value for a sale, construction, demolition, damage or remodeling [S15].
> 
> What comes next: the four-year pattern (2020, 2024) points to tax year 2028 as the next reappraisal year, with property valued as of Jan. 1, 2027. That means the reappraisal work happens during 2027 and the new values appear on the 2028 roll, posted in summer 2027. I'm inferring that from the cycle [S15][S1]; I haven't found an official announcement, so please confirm with the Assessor's Office.
> 
> Will the 2027 bills go up? Mostly yes, a little, but from rates, not values: the East Bank levee millage rises from 10.79 to 12.28 [S31], and on Nov. 5, 2026 the City Council approved a partial roll-forward of 4.039 mills on top [S33].
> 
> What it means for owners: (1) your value may change in the next reappraisal even if you change nothing; (2) in a reappraisal year each millage is rolled back so it raises the same total, though taxing bodies can vote to roll forward [S15]; (3) the open-roll period in summer 2027 is the time to check a new value and appeal if you disagree; (4) make sure your homestead or freeze is on file before then. Status: the appeal window for the 2027 roll closed at 4 p.m. on Thursday, Aug. 20, 2026 [S4]. The next window, for the 2028 roll, should open in summer 2027 (it usually runs mid-July to mid-August) [S4][S5]. The exact dates haven't been announced, so I don't know them yet.
> 
> SOURCES
> S1 La. Const. Art. VII §18 (ratios, reappraisal every four years, phase-in, special assessment level)
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S32 New Orleans City Council — Councilmember Green on assessments vs. taxes: 2024–27 values as of Jan. 1, 2023 (July 2023)
> S4 Orleans Parish Assessor — 2027 Assessment Rolls Open July 15 to Aug. 17 (July 13, 2026)
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> S33 Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026) secondary
> S5 Orleans Parish Assessor — 2026 Assessment Rolls Open July 15 to Aug. 15 (July 14, 2025)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 12. (search) 1726 St. Charles Ave

*Origin: The address the instructor typed in class (Nov. 4). *

**Expected:** One record, 1726 ST CHARLES AV, commercial, market value $773,900; asks the owner to confirm.

**Answer:**

> I found one record for "1726 St. Charles Ave". Is this your property?
> 
> 1726 ST CHARLES AV
> Commercial · District 1, Ward 01 · Central City Com 11 · Market value $773,900 · Parcel 101106023
> SQ 200 LOT 2 OR 21 ST CHARLE S 31 11X100 2 STY WD COMM AP T 1726-28 ST CHARLES AVE DATION
> 
> Choose the record that's yours. If none are, try another spelling or your parcel ID.

### 13. Why is my assessment what it is?

*Origin: Instructor's description of Layer 2 ("why is your assessment what it is?"). Property selected first: 1726 St. Charles Ave. *

**Expected:** Recorded assessed $92,510 on $773,900 market = 12%; explains the 10% land + 15% building rule for non-residential buildings; labeled recorded / calculated.

**Answer:**

> 1726 ST CHARLES AV parcel 101106023
> RECORDED IN THE 2026 ROLL
> 
> Assessed value: $92,510 (land $16,920 + buildings $75,590). Field: Total Assessed Value.
> 
> CALCULATED BY THE NAVIGATOR
> 
> $92,510 ÷ $773,900 market value = 12%.
> 
> WHAT IT MEANS
> 
> Louisiana assesses land and residential buildings at 10% of market value and other buildings, such as commercial ones, at 15% [S1]. Here the land is assessed at 10% and the buildings at 12.5% ($75,590 ÷ $604,700), between the 10% residential rate and the 15% rate for other buildings. That pattern fits a building that is partly residential and partly commercial, but the roll doesn't show the split, so I don't know exactly how it was divided. The Assessor's Office can tell you.
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S1 La. Const. Art. VII §18 (ratios, reappraisal every four years, phase-in, special assessment level)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 14. What will my tax bill be in January?

*Origin: Outside QA pass. Property selected first: 1332 Magazine St. *

**Expected:** Leads with the 2027 roll ($5,077) as the next bill, then 2026 ($5,021); the Council roll-forward as a calculated range ($151 to $181); special districts not included.

**Answer:**

> 1332 MAGAZINE ST parcel 101103917
> RECORDED IN THE 2026 AND 2027 ROLLS
> 
> Computed tax on the 2027 roll (your next bill, due early 2027): $5,077 at 133.48 mills, after a homestead reduction of $915 [S31].
> 
> Computed tax on the 2026 roll (bills that were due early 2026): $5,021, from 131.99 total mills, after a homestead reduction of $904. Taxable assessed value: $37,390 [S30].
> 
> CALCULATED BY THE NAVIGATOR
> 
> The 2027 file was filed Sept. 4, 2026, before the City Council approved a partial roll-forward of 4.039 mills on Nov. 5, 2026 [S33]. If those mills are added on top, this bill would rise by about $151 to $181 a year (4.039 × $37,390 taxable to × $44,890 assessed, depending on how much homestead reduces them ÷ 1,000). I don't know the final rates, so treat this as a range, not your bill.
> 
> CALCULATED BY THE NAVIGATOR
> 
> Check: $44,890 assessed × 131.99 mills ÷ 1,000 = $5,925, − $904 homestead reduction = $5,021. Matches the recorded amount.
> 
> WHAT IT MEANS
> 
> Homestead reduces every levy except the police and fire millages "without homestead exemption" (11.51 mills), so you still pay those on the first $7,500 [S30]. These totals don't include special-district fees such as the Downtown Development District or neighborhood security districts, which are billed separately [S17]. Your actual bill and due date come from the Bureau of the Treasury; 2026 bills were due Feb. 28, 2026, and the 2027 due date hasn't been announced [S35].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> S33 Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026) secondary
> S17 Bureau of Governmental Research — About Your Property Taxes secondary
> S35 City of New Orleans — 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 15. Why did my taxes go up $900?

*Origin: Outside QA pass (homestead removed on the 2027 roll). Property selected first: 212 12th St. *

**Expected:** $3,473 → $4,426 (+$953) because the homestead exemption is gone on the 2027 roll, plus the millage change; says the roll doesn't say why and to contact the Assessor.

**Answer:**

> 212 12TH ST parcel 716501814
> RECORDED IN THE 2026 AND 2027 ROLLS
> Market value	$331,600 → $331,600	2026 → 2027 roll
> Homestead exemption	$7,500 → $0	2026 → 2027 roll
> Taxable assessed value	$25,660 → $33,160	2026 → 2027 roll
> Total mills	131.99 → 133.48	LTC millage files
> Computed tax	$3,473 → $4,426	LTC millage files
> CALCULATED BY THE NAVIGATOR
> 
> Market value didn't change. Computed tax changed by +$953. What changed: the homestead exemption was removed; the total millage changed (131.99 → 133.48).
> 
> CALCULATED BY THE NAVIGATOR
> 
> The 2027 file was filed Sept. 4, 2026, before the City Council approved a partial roll-forward of 4.039 mills on Nov. 5, 2026 [S33]. If those mills are added on top, this bill would rise by about $134 a year (4.039 × $33,160 taxable ÷ 1,000). I don't know the final rates, so treat this as a range, not your bill.
> 
> WHAT IT MEANS
> 
> Compared by parcel ID 716501814. Values from the last reappraisal (market as of Jan. 1, 2023) are used for tax years 2024 through 2027 [S15][S32], so 98% of parcels keep the same value on the 2027 roll [S31]. Between reappraisals a value can still change for a sale, construction, demolition, damage or remodeling [S15]. On the East Bank the total millage rises because the levee district's rate goes from 10.79 to 12.28 mills. The four-year pattern points to tax year 2028 for the next reappraisal (my inference; confirm with the Assessor). I can't compare with 2025: that roll isn't available to me.
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S33 Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026) secondary
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S32 New Orleans City Council — Councilmember Green on assessments vs. taxes: 2024–27 values as of Jan. 1, 2023 (July 2023)
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 16. Does the assessor have my condo down as 2 bathrooms?

*Origin: Instructor (Nov. 4): don't expect bathrooms or pools. Property selected first: 1205 St. Charles Ave Apt 607. *

**Expected:** "I don't know": the roll has no bathrooms, bedrooms or square footage; points to the Assessor's property search.

**Answer:**

> 1205 ST CHARLES AV 607 parcel 102000079
> NOT IN THIS RECORD
> 
> I don't know. This roll doesn't include square footage, bedrooms, bathrooms, condition or features: those fields are blank or zero for every parcel. The Assessor's property search may show them, and wrong building details are one of the easiest things to get corrected [S10].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S10 Orleans Parish Assessor — Mass appraisal process flyer
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 17. Why do I suddenly owe taxes on this property?

*Origin: Outside QA pass (exempt in 2026, taxable in 2027). Property selected first: 39W305216. *

**Expected:** Exempt on the 2026 roll ($0); status changes to taxable on the 2027 roll ($15,616); the roll doesn't say why; Assessor contact.

**Answer:**

> 1300 ALVAR ST parcel 39W305216
> RECORDED IN THE 2026 AND 2027 ROLLS
> 
> Computed tax on the 2027 roll (your next bill, due early 2027): $15,616 at 133.48 mills [S31].
> 
> Computed tax on the 2026 roll (bills that were due early 2026): $0, from 131.99 total mills. Taxable assessed value: $0 [S30].
> 
> This parcel is exempt: an "other" exemption of $116,990 covers its whole assessed value (fields: Assessment Status = EX, Other Exemption Amount). Exempt parcels are usually government, religious or nonprofit property. The roll doesn't say which kind this is.
> 
> On the 2027 roll its status changes to taxable, which is why its 2027 tax is $15,616 [S31]. The roll doesn't say why.
> 
> CALCULATED BY THE NAVIGATOR
> 
> The 2027 file was filed Sept. 4, 2026, before the City Council approved a partial roll-forward of 4.039 mills on Nov. 5, 2026 [S33]. If those mills are added on top, this bill would rise by about $473 a year (4.039 × $116,990 taxable ÷ 1,000). I don't know the final rates, so treat this as a range, not your bill.
> 
> CALCULATED BY THE NAVIGATOR
> 
> Exemptions remove the whole $116,990 assessed value from every levy, so the computed tax is $0, as recorded.
> 
> WHAT IT MEANS
> 
> These totals don't include special-district fees such as the Downtown Development District or neighborhood security districts, which are billed separately [S17]. Your actual bill and due date come from the Bureau of the Treasury; 2026 bills were due Feb. 28, 2026, and the 2027 due date hasn't been announced [S35].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> S33 Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026) secondary
> S17 Bureau of Governmental Research — About Your Property Taxes secondary
> S35 City of New Orleans — 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 18. Who owns the house next door?

*Origin: Privacy rule test. Property selected first: 1332 Magazine St. *

**Expected:** Doesn't show owner names; points to the Assessor's property search. (Also: it can only describe the selected property.)

**Answer:**

> 1332 MAGAZINE ST parcel 101103917
> NOT IN THIS RECORD
> 
> I don't show owner names or mailing addresses. The roll has them, but this prototype leaves them out for privacy. The Assessor's property search shows the owner of record.
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 19. what's the tax on 2216 Claiborne Ave?

*Origin: How owners actually type (address inside a question). *

**Expected:** Finds 2 records at 2216 Claiborne Av, asks which one; after the pick, answers the tax question for that record.

**Answer:**

> 2 records match "2216 Claiborne Ave". 2 records share this address. Pick yours.
> 
> 2216 CLAIBORNE AV
> Vacant Land · District 3, Ward 8W · New Marigny 8th Ward · Market value $11,700 · Parcel 38W106028
> SQ 640 LOT 10 B N CLAIBORNE 43 X 39 1981 ASSD 38W106021
> 2216 CLAIBORNE AV
> Vacant Land · District 4, Ward 12 · Central City Com 41 · Market value $45,400 · Parcel 412306710
> SQ 399 LOT A PHILIP AND S CLAIBORNE 28X80 OVER 82 FILE #11454
> 
> Choose the record that's yours. If none are, try another spelling or your parcel ID.
> 
> Once you pick your property, I'll answer: what's the tax on 2216 Claiborne Ave?
> 
> [after picking the first record]
> 
> 2216 CLAIBORNE AV parcel 38W106028
> RECORDED IN THE 2026 AND 2027 ROLLS
> 
> Computed tax on the 2027 roll (your next bill, due early 2027): $156 at 133.48 mills [S31].
> 
> Computed tax on the 2026 roll (bills that were due early 2026): $154, from 131.99 total mills. Taxable assessed value: $1,170 [S30].
> 
> CALCULATED BY THE NAVIGATOR
> 
> The 2027 file was filed Sept. 4, 2026, before the City Council approved a partial roll-forward of 4.039 mills on Nov. 5, 2026 [S33]. If those mills are added on top, this bill would rise by about $5 a year (4.039 × $1,170 taxable ÷ 1,000). I don't know the final rates, so treat this as a range, not your bill.
> 
> CALCULATED BY THE NAVIGATOR
> 
> Check: $1,170 assessed × 131.99 mills ÷ 1,000 = $154. Matches the recorded amount.
> 
> WHAT IT MEANS
> 
> These totals don't include special-district fees such as the Downtown Development District or neighborhood security districts, which are billed separately [S17]. Your actual bill and due date come from the Bureau of the Treasury; 2026 bills were due Feb. 28, 2026, and the 2027 due date hasn't been announced [S35].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> S33 Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026) secondary
> S17 Bureau of Governmental Research — About Your Property Taxes secondary
> S35 City of New Orleans — 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026)
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 20. Is my homestead exemption still on file?

*Origin: Common owner check before bills arrive. Property selected first: 1205 St. Charles Ave Apt 607. *

**Expected:** Recorded homestead $7,500 on the 2026 roll; removed $904 of tax; stays on unless something changes.

**Answer:**

> 1205 ST CHARLES AV 607 parcel 102000079
> RECORDED IN THE 2026 ROLL
> 
> Homestead exemption: $7,500 of assessed value. Field: Homestead Exemption Amount.
> 
> RECORDED IN THE 2026 ROLL
> 
> Taxes the exemption removed on the 2026 roll: $904 a year (homestead reduction in the LTC millage file). Homestead doesn't reduce the police and fire "without homestead" millages [S30].
> 
> WHAT IT MEANS
> 
> The full exemption is $7,500 of assessed value, the first $75,000 of market value [S2]. Once granted, it stays on, and you don't reapply each year, unless something changes, like a sale or a change in ownership [S8].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> S2 La. Const. Art. VII §20 (homestead exemption)
> S8 Orleans Parish Assessor — Homestead flyer: Once Gained, Permanently Applied
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 21. Have home prices in my area dropped since my value was set?

*Origin: Demo-week plan: Zillow data from the course folder. Property selected first: 1332 Magazine St. *

**Expected:** ZIP 70130 (from the census tract): Zillow typical value $471,065 (Jan. 2023) → $440,771 (Sept. 2026), −6.4%; roll values stay at Jan. 1, 2023 through 2027; about the ZIP, not this home.

**Answer:**

> 1332 MAGAZINE ST parcel 101103917
> FROM ZILLOW (OUTSIDE DATA)
> 
> ZIP code area: 70130. The roll has no ZIP for the property, so I use its census tract: 100% of that tract's land is in 70130 [S38][S41].
> 
> Typical home value, Jan. 2023	$471,065	Zillow Home Value Index
> Typical home value, Sept. 2026	$440,771	Zillow Home Value Index
> Change over the last 12 months	+4.1%	Sept. 2025 to Sept. 2026
> Highest point on record	$494,001 in July 2022	Zillow Home Value Index
> CALCULATED BY THE NAVIGATOR
> 
> Typical home value in 70130 since the roll's valuation date: $471,065 → $440,771 = −6.4%.
> 
> Across New Orleans' 17 ZIP codes, the change since Jan. 2023 ranges from −27.1% to −5.3% (middle ZIP −13.4%).
> 
> WHAT IT MEANS
> 
> What this does and doesn't mean. Roll values are set as of Jan. 1, 2023 and stay at that level through tax year 2027, whatever the market does afterward [S15]. So a change in prices since then doesn't change this year's value, and it isn't a reason by itself to expect a different one. The next reappraisal is the point where values catch up with the market. Zillow's index describes the typical home in a ZIP code, not this property, and it's a private company's estimate, not an official figure [S40]. I can't tell you what your home is worth or whether your value is right.
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S38 U.S. Census Bureau Geocoder — roll addresses matched to 2020 block groups (course crosswalk, 140,850 parcels)
> S41 U.S. Census Bureau — 2020 ZIP Code Tabulation Area to census tract relationship file
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S40 Zillow Research — Zillow Home Value Index by ZIP code, through Sept. 2026 (course data; a private company's estimate) secondary

### 22. Is my value high compared to my neighbors?

*Origin: Outside QA pass. Property selected first: 1205 St. Charles Ave Apt 607. *

**Expected:** Area distribution: 271 residential parcels in Carondelet Corridor, middle half $133,400 to $202,400; this parcel $145,700, in the lower half; explicitly not a judgment of the value.

**Answer:**

> 1205 ST CHARLES AV 607 parcel 102000079
> CALCULATED BY THE NAVIGATOR FROM THE 2026 AND 2027 ROLLS
> 
> Compared with the 271 residential parcels in the "Carondelet Corridor" area of District 1:
> 
> Market value, middle half	$133,400 to $202,400 (middle value $152,500)	Total Market Value, 2026 roll
> This parcel	$145,700: in the lower half, below the middle value	Total Market Value
> Share with a homestead exemption	20.7%	Homestead Exemption Amount
> Share with an assessment freeze	1.5%	Freeze Code(s)
> Middle computed tax	$1,938 (2026) → $2,036 (2027)	LTC millage files
> This parcel's computed tax	$1,019 → $1,030	LTC millage files
> Market value changed on the 2027 roll	1.8% of these parcels; this one didn't change	2026 vs 2027 roll, by parcel ID
> Tax change, 2026 → 2027	middle +$23; this parcel +$10	LTC millage files
> WHAT IT MEANS
> 
> This only describes how values are spread in the area. It doesn't mean your value is too high or too low: parcels differ in size, condition, lot and use, and this roll doesn't include building size, so I can't compare like with like. "Area" here is the roll's Subdivision field, which may not match the neighborhoods the Assessor uses to set values. Values are from the 2026 roll [S30]; the 2027 figures are from the roll filed with the state [S31].
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> S31 Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)

### 23. What kind of neighborhood is this, income wise?

*Origin: Instructor (Nov. 4): "what neighborhood is it in… the census data". Property selected first: 1332 Magazine St. *

**Expected:** Census block group profile (Block Group 2, Tract 77): median household income $72,273 vs. the middle block group; describes the area, not the owner.

**Answer:**

> 1332 MAGAZINE ST parcel 101103917
> RECORDED IN THE 2026 ROLL
> 
> Roll location: Municipal District 1, Ward 01, area "Lower Garden Magazin" (fields: Municipal District, Ward, Subdivision). See it on a map [S38].
> 
> FROM THE U.S. CENSUS (ACS 2020–2024)
> 
> Census area: Block Group 2, Census Tract 77 (block group 220710077002), matched from the roll address by the Census geocoder [S38]. What the American Community Survey says about the people and homes there [S39]:
> 
> Residents	697	middle block group: 747
> Median household income	$72,273	middle block group: $65,016
> Median home value (owners' own estimate)	$637,500	middle block group: $330,550
> Median gross rent	$1,832	middle block group: $1,352
> Homes that are owner-occupied	11.3%	middle block group: 52.6%
> Housing units vacant	34.4%	middle block group: 17.3%
> Residents below the poverty line	8.5%	middle block group: 17.2%
> Adults 25+ with a bachelor's degree	55.3%	middle block group: 40.7%
> Median age	34	middle block group: 39.6
> Median year homes were built	2005	middle block group: 1955
> Race and ethnicity	22.4% Black, 64.1% white, 1.4% Hispanic or Latino	non-Hispanic Black / non-Hispanic white / Hispanic
> CALCULATED FROM THE 2026 ROLL AND THE CENSUS
> 
> Homes on the 2026 roll in this block group: 90 improved residential parcels, middle market value $564,200, 45.6% with a homestead exemption. This parcel: $448,900. The census median home value here is $637,500. The two measure different things: the roll is the Assessor's estimate as of 01/01/2023, and the census figure is what owners say their homes are worth.
> 
> WHAT IT MEANS
> 
> These numbers describe the neighborhood, not you or this property's owner, and the Assessor doesn't use them to set values. Census figures are survey estimates with margins of error, which are large for small areas like block groups [S39]. To see how this parcel compares with similar parcels on the roll, ask "How does my property compare to others in my area?"
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S38 U.S. Census Bureau Geocoder — roll addresses matched to 2020 block groups (course crosswalk, 140,850 parcels)
> S39 U.S. Census Bureau — American Community Survey 2020–2024 5-year estimates, block groups (course data)

### 24. Are houses in poor neighborhoods over-assessed?

*Origin: The course's own finding (block-group analysis, Finding 4). *

**Expected:** Both pieces of evidence: the auditor found no systematic bias; the 2026 roll shows the cheapest tenth of sales valued at 118% of price vs. 92–94%; the caveats; no conclusion about any one home.

**Answer:**

> Are lower-priced homes assessed differently?
> 
> Two pieces of evidence, which point in somewhat different directions:
> 
> The state auditor tested the 2024 reappraisal for bias between high- and low-value homes ("vertical equity") and found it within the accepted range: assessments were not "systematically biased for or against high-value or low-value homes" [S15].
> The 2026 roll itself, in this project's analysis: among 8,604 home sales recorded from 2023 to 2025, the cheapest tenth (sold for about $15,000 to $130,000) were valued at a middle figure of 118% of their sale price, while every other tenth sat at 92% to 94% [S30].
> 
> Why these can both be true, and the limits: the roll's sale prices aren't verified, and the cheapest sales include many that aren't ordinary market sales (family transfers, damaged or tax-sale property), which makes values look high next to the price. The auditor used verified sales and a different year. So this is a pattern worth asking about, not proof that low-priced homes are over-valued, and it says nothing about any one home.
> 
> I can't tell you whether your value is right. If you think it's wrong, the path is an informal review with the Assessor, then an appeal.
> 
> SOURCES
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S30 Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)
> 
> Want your own numbers? Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.
> 
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person

### 25. Should I appeal? Zillow says my house is worth way less.

*Origin: The demo's refusal question, made harder with market data. Property selected first: 1332 Magazine St. *

**Expected:** Refuses the advice ("That's a decision for you…"), then shows the ZIP market figures with the caution that they aren't about this home, the contacts, and the hand-off note button.

**Answer:**

> That's a decision for you, and I can't give legal or tax advice. I can explain how the process works, and a person at the offices below can look at your situation.
> 
> Here is what your record shows:
> 
> 1332 MAGAZINE ST parcel 101103917
> FROM ZILLOW (OUTSIDE DATA)
> 
> ZIP code area: 70130. The roll has no ZIP for the property, so I use its census tract: 100% of that tract's land is in 70130 [S38][S41].
> 
> Typical home value, Jan. 2023	$471,065	Zillow Home Value Index
> Typical home value, Sept. 2026	$440,771	Zillow Home Value Index
> Change over the last 12 months	+4.1%	Sept. 2025 to Sept. 2026
> Highest point on record	$494,001 in July 2022	Zillow Home Value Index
> CALCULATED BY THE NAVIGATOR
> 
> Typical home value in 70130 since the roll's valuation date: $471,065 → $440,771 = −6.4%.
> 
> Across New Orleans' 17 ZIP codes, the change since Jan. 2023 ranges from −27.1% to −5.3% (middle ZIP −13.4%).
> 
> WHAT IT MEANS
> 
> What this does and doesn't mean. Roll values are set as of Jan. 1, 2023 and stay at that level through tax year 2027, whatever the market does afterward [S15]. So a change in prices since then doesn't change this year's value, and it isn't a reason by itself to expect a different one. The next reappraisal is the point where values catch up with the market. Zillow's index describes the typical home in a ZIP code, not this property, and it's a private company's estimate, not an official figure [S40]. I can't tell you what your home is worth or whether your value is right.
> 
> Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll); 2027 figures: Louisiana Tax Commission, Orleans Parish 2027 tax roll, filed Sept. 4, 2026 (stax.latax.la.gov/TaxRollsFolder/2026). Parcel record as published; values as of 01/01/2023. LTC tax rolls
> 
> SOURCES
> S38 U.S. Census Bureau Geocoder — roll addresses matched to 2020 block groups (course crosswalk, 140,850 parcels)
> S41 U.S. Census Bureau — 2020 ZIP Code Tabulation Area to census tract relationship file
> S15 La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)
> S40 Zillow Research — Zillow Home Value Index by ZIP code, through Sept. 2026 (course data; a private company's estimate) secondary
> Talk to a person:
> Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: (504) 754-8811. nolaassessor.com
> Board of Review (City Council): council.nola.gov
> Tax bills and payments: nola.gov/property-tax
> Free legal help: Southeast Louisiana Legal Services, slls.org
> Prepare a note to hand this to a person
