# CLAUDE.md: NOLA Assessment Navigator

Read this file before every task in `nola-assessment-navigator/`. It holds the project's
purpose, the domain facts the code depends on, the data notes, and the rules the chatbot
has to follow. If a task conflicts with a rule in **Section 4 (Chatbot rules)**, the rule
wins. Stop and ask instead of breaking it.

*Last researched: October 19, 2026. Facts that change every year (dates, millage, income
limits) carry a `VERIFY` tag. Re-check them before each tax cycle.*

---

## 1. Purpose

**What it is.** The NOLA Assessment Navigator is an AI assistant that helps property
owners in the City of New Orleans (Orleans Parish) understand three things: their property
assessment, the exemptions they can claim, and how to appeal. It is a **student
prototype**. It is not run by the Assessor, the City, or any government body.

**Who uses it.**
- Homeowners, especially first-time buyers, older owners, and owners who just got a
  notice of assessment change.
- Small landlords and owners of a few rental properties.
- Housing counselors, neighborhood groups, and family members helping someone else.

Assume the reader is not a tax professional. Write at about an 8th-grade reading level,
define each term the first time it comes up, and keep answers short.

**The three layers.** Build them in this order. Do not start a layer until the one
before it works.

| Layer | Name | What it answers | Data | Status |
|---|---|---|---|---|
| 1 | **General guidance** | "How does this work?": FMV vs. assessed value, millage, exemptions, appeals, deadlines, the 2027 reassessment | Curated knowledge base (`kb.js`) built from the sources in Section 2 | **Draft live** |
| 2 | **My property** | "What does this mean for *my* parcel?": look up a parcel and show its 2025 → 2026 change, exemptions on file, and a tax estimate | 2025 and 2026 assessment rolls (Section 3) | Not started |
| 3 | **Market context** | "How does my change compare?": my change vs. my neighborhood, comparable parcels, citywide distribution | Same rolls, aggregated by neighborhood or assessment district | Not started |

Layer 2 and 3 answers must still follow every rule in Section 4. A number from the roll
is a fact and needs a citation, for example "2026 roll, parcel 39W001112, column
`TOTAL_ASSESSED`".

---

## 2. Domain knowledge: how assessment works in Orleans Parish

Source IDs like **[S4]** refer to the source table at the end of this section. The chatbot
knowledge base (`kb.js`) uses the same IDs. Add new sources to both places.

### 2.1 Who does what

| Office | Role |
|---|---|
| **Orleans Parish Assessor's Office (OPAO)**, Assessor Erroll G. Williams | Sets the value of every parcel, keeps the roll, grants exemptions, and hears informal appeals. City Hall, 1300 Perdido St., Room 4E01 [S9]. Appraiser appointments: **(504) 754-8811**, booked at least 24 hours ahead [S4]. Williams starts a fifth term in January 2027 [S21]. |
| **Board of Review (BOR)**: the New Orleans City Council sitting as an independent body | Hears formal appeals the Assessor did not settle [S5][S6][S13]. |
| **Louisiana Tax Commission (LTC)** | State-level appeal after the BOR. Also sets appraisal rules [S14]. |
| **City of New Orleans, Bureau of the Treasury** | Mails tax bills and collects payments. Does **not** set values [S11][S12][S27]. |
| **Taxing bodies** (City, School Board, levee and drainage districts, libraries, police, fire, etc.) | Each sets its own millage. Some changes need a public vote [S11][S19]. |

### 2.2 Fair market value (FMV) and how the Assessor sets it

- The Louisiana Constitution requires property to be valued at **fair market value**:
  roughly what it would sell for between a willing buyer and a willing seller [S1].
- Every property must be **reappraised at least every four years** [S1].
- The OPAO values property with **computer-assisted mass appraisal (CAMA)**. The model
  looks at sales of similar properties, property features (size, age, condition, use,
  building type), location, and market trends. Sales comparison is the preferred
  method. The cost and income approaches are used for some property types, such as
  income-producing commercial property [S10][S15].
- For the 2024 reappraisal the office grouped the parish into **393 valuation
  neighborhoods** [S15][S16].
- The Louisiana Legislative Auditor reviewed the 2024 reappraisal. It flagged about
  **3,803 parcels** that may have been "sales chased," meaning valued at their recent sale
  price, which LTC rules prohibit. It found assessments were not too high or too low in
  the aggregate. The Assessor cites a **coefficient of dispersion of 17.6%**, which he says
  is in the acceptable range. BGR has raised related concerns [S15][S16][S26]. Present
  both views if this comes up. Do not take a side.

### 2.3 Assessed value (Louisiana Constitution Art. VII §18) [S1]

Assessed value is a fixed percentage of FMV, set by property class:

| Class | Assessment ratio |
|---|---|
| Land | 10% |
| Residential improvements (houses, condos) | 10% |
| Other property, including commercial buildings and business personal property | 15% |
| Public service property (excluding land) | 25% |

> Acts 2025, No. 221 amended §18(A)–(B) and added separate lines, such as business
> inventory at 15% [S1]. `VERIFY` ratification status before relying on the new text.

**Example:** a house and lot with an FMV of $300,000 has an assessed value of
**$30,000**.

### 2.4 Millage: how assessed value becomes a tax bill

- One **mill** is $1 of tax for every $1,000 of taxable assessed value (0.1%) [S11][S13].
- **Tax = (assessed value − exemptions) × (millage ÷ 1,000)**, summed over every millage that
  applies to the parcel [S11][S17].
- Each taxing body sets its own millage. Which millages apply depends on location:
  East vs. West Bank levee districts, the Downtown Development District, security and
  improvement districts, and flat fees [S17][S18].
- **2026 combined citywide rate: about 121.20 mills** (East Bank, before special
  districts). `VERIFY` against the Treasury's 2026 millage table [S11]. This figure came
  from secondary summaries, so the chatbot must say it is approximate.
- **Rollback and roll-forward.** In a reassessment year, when total values go up, taxing
  bodies must **roll back** millage so they collect about the same revenue. Afterward
  they may vote to **roll forward** up to their prior maximum rate [S11][S19].

**Worked example (simplified, 2026 rates, East Bank):**

| Step | Calculation | Result |
|---|---|---|
| Fair market value | (set by Assessor) | $300,000 |
| × Residential ratio | $300,000 × 10% | $30,000 assessed value |
| − Homestead exemption | $30,000 − $7,500 | $22,500 taxable |
| × Millage | $22,500 × 121.20 ÷ 1,000 | **≈ $2,727 per year** |
| Same house, no homestead | $30,000 × 121.20 ÷ 1,000 | ≈ $3,636 per year |

This is an illustration, not a bill. A real bill is a little higher for a homesteaded
house, because some millages (for example, certain police and fire millages) are **not**
reduced by the homestead exemption [S2][S19]. Special districts add more. The chatbot must
show this caveat every time it gives a dollar estimate.

### 2.5 Exemptions and special assessments

| Program | What it does | Who qualifies | How to apply | Sources |
|---|---|---|---|---|
| **Homestead exemption** | Removes **$7,500 of assessed value** (= the first **$75,000 of FMV**). In Orleans it applies to state, general city, school, levee, and levee-district taxes, but not every millage. | Owner who **owns and occupies** the home as a primary residence by **Dec. 31** of the tax year. One per person or married couple. | **In person** at OPAO, City Hall Room 4E01. **All occupying owners** must appear. Bring: proof of ownership (act of sale or deed); Louisiana driver's license or ID showing the property address; a current Entergy or cable bill for the property with matching name, service address, and mailing address. A mailing address that differs from the property needs a recorded power of attorney. **Once granted, it stays on**: no yearly re-filing. | [S2][S3][S7][S8][S9] |
| **Special Assessment Level ("the freeze")** | Freezes the **assessed value** (not the bill) at the level when you qualified. Millage can still rise. | Has homestead **and** is (a) 65 or older, (b) permanently and totally disabled, (c) a veteran with a service-connected disability rating of **50% or more**, or (d) certain surviving spouses or military families. Household adjusted gross income at or below the limit: base **$100,000**, indexed. One source reports **$102,700 for 2026**. `VERIFY` | Apply at OPAO with proof of age or disability and an income document (tax return). Some under-65 owners must re-certify income each year. | [S1][S7][S24] |
| **Disabled veteran additional exemption** | On top of homestead. **50–69% rating: +$2,500 AV. 70–99%: +$4,500 AV. 100% total and permanent: full exemption** of the homestead. `VERIFY` tiers with OPAO. | Veteran with a VA service-connected rating of 50% or more. A qualifying surviving spouse may keep it. | OPAO, with VA rating letter, proof of homestead, ID, and utility bill. | [S7][S25] |
| **First responder additional exemption** | About **+$25,000 of FMV** (+$2,500 AV) on a homestead. | Qualifying first responders. | OPAO, with an employment verification letter on agency letterhead. | [S7] |
| **Heirs and surviving spouses** | A surviving spouse who keeps living in the home keeps the exemption (as owner, usufructuary, or through a qualifying trust). An heir who lives in the home gets a share of the exemption matching their ownership share. | Surviving spouse, or heirs who occupy the home. | Contact OPAO. A **succession** may be needed if title isn't in the heir's name. `VERIFY` what OPAO requires and whether it grants the exemption before a judgment of possession. | [S2][S28][S29] |
| **Other** (nonprofit or religious use, Restoration Tax Abatement, ITEP, etc.) | Varies. | Mostly non-homestead property. | Out of scope for Layer 1. Say "I don't know the details" and refer to OPAO. | — |

**On the ballot, November 3, 2026 (outcome unknown as of this file):** PAR's guide lists
Amendment 1 (a disabled veteran's surviving spouse could move the exemption to a new home
once), Amendment 6 (local option for an extra exemption for SAL-eligible owners 65+), and
Amendment 9 (raise the SAL income limit to **$150,000**) [S20]. The chatbot must say these
are *proposed* until results are certified. Update this file after the election.

**History worth knowing:** a 2022 amendment that would have capped yearly assessment
increases on Orleans homesteads at 10% **failed** narrowly (642,462 no to 635,559 yes)
[S23]. Owners sometimes believe there is a cap. There is not. The only cap-like program
is the SAL freeze.

### 2.6 How Orleans names roll years (common source of confusion)

The roll is named for the **tax year in which the bill comes due**, not the year the
values are posted:

| Roll | Values posted / open-roll inspection | Appeal (BOR) deadline | Bill mailed | Bill due |
|---|---|---|---|---|
| **2025** | July 15 – Aug. 15, **2024** | 4 p.m., Aug. 20, 2024 [S22] | ~Dec. 2024 | Jan. 31, 2025, extended to Feb. 28 that year [S12] |
| **2026** | July 15 – Aug. 15, **2025** | Aug. 20, 2025 per [S6]; one OPAO notice says Aug. 18 [S5]. `VERIFY` | ~Dec. 2025 | ~Jan. 31, 2026 [S12] |
| **2027** (reassessment) | July 15 – Aug. 17, **2026** | Online system July 22 → **4 p.m., Thu. Aug. 20, 2026** [S4] | ~Dec. 2026 | ~Jan. 31, 2027 `VERIFY` |

Late payment: interest accrues at **1% per month** after the due date, and not receiving a
bill is not an excuse [S12]. `VERIFY` the current rate.

### 2.7 The 2027 reassessment: what it means

- The **2027 roll** (posted July 2026) carries **new market values** from a parish-wide
  reappraisal. The previous one, for **tax year 2024**, raised total assessed value about
  **20%** [S4][S21][S26]. Values for tax years 2025 and 2026 were mostly carried forward
  from 2024, apart from sales, new construction, demolitions, and corrections.
- `VERIFY` why this cycle falls on 2027 instead of 2028. The Constitution allows up to
  four years [S1], so three is permitted, but no source found so far explains the choice.
- Because total values rose, taxing bodies must **roll back** millage, then may **roll
  forward**. On Sept. 28, 2026, Fox 8 reported the City filed two 2027 levy versions. The
  general municipal tax would be **12.23 mills** (adjusted) or **13.91 mills** (rolled
  forward). A group of city millages would go from **44.67 to 52.11 mills**, about **$178
  more per year** for a $300,000 homesteaded home [S19]. **These are proposals**, not the
  final levy.
- What owners should take from it: (1) your value may have changed even though you did
  nothing; (2) a higher value does not raise your bill by the same percent, because of
  rollback; (3) the appeal window for the 2027 roll **closed Aug. 20, 2026**; (4) homestead
  and SAL still apply. Check that yours are on file before the bill arrives.

### 2.8 Appeals: steps, places, deadlines

1. **Check the roll** during the open-roll period, mid-July to mid-August. Look up your
   parcel on nolaassessor.com or visit in person (weekdays 8:30 a.m.–4 p.m.): **City Hall**,
   1300 Perdido St., 4th floor; **Algiers Courthouse**, 225 Morgan St., 1st floor;
   **Lakeview Christian Center**, 5885 Fleur De Lis Dr., 2nd floor [S4]. Also check the
   property's features (square footage, condition, building type). Errors there are the
   easiest fix.
2. **Informal review with the Assessor.** Book an appraiser at (504) 754-8811 or online, at
   least 24 hours ahead [S4]. Appeals filed in the online system go first to OPAO
   appraisal staff, who may ask for documents or offer a settlement value [S6].
3. **Board of Review.** Unresolved appeals go to the BOR (City Council) for a hearing with
   its appraisal contractor [S6]. File by the BOR deadline: **4 p.m., Aug. 20, 2026** for
   the 2027 roll [S4]. Paper filings need **four copies** of the form and all evidence
   [S4][S22]. Useful evidence: a recent appraisal, closing statement, photos of condition,
   repair estimates, and sales of truly comparable homes.
4. **Louisiana Tax Commission.** File within **30 calendar days** of the earlier of (a) the
   BOR decision being sent or (b) actual delivery of it [S14]. (One secondary site says
   "10 business days." That conflicts with the regulation, so use the regulation and tell
   owners to confirm.)
5. **Court.** After the LTC, judicial review is in district court. **The chatbot does not
   know the deadline.** Say so and refer the owner to a lawyer.

You can't appeal the millage itself, only the value. Rates are changed at public
hearings and elections [S11][S13].

### 2.9 Sources

| ID | Source | URL |
|---|---|---|
| S1 | La. Const. Art. VII §18 (classification, ratios, reappraisal, review) | https://www.legis.la.gov/Legis/Law.aspx?d=206545 |
| S2 | La. Const. Art. VII §20 (homestead exemption) | https://legis.la.gov/legis/law.aspx?d=206550 |
| S3 | La. R.S. 47:1703 (homestead statute) | https://legis.la.gov/legis/law.aspx?d=101333 |
| S4 | OPAO, "2027 Assessment Rolls Open for Public Inspection July 15 to August 17" (July 13, 2026) | https://www.nolaassessor.com/2026/07/13/2027-assessment-rolls-open-for-public-inspection-july-15-to-august-17/ |
| S5 | OPAO, "2026 Assessment Rolls Open for Public Inspection July 15 to August 15" (July 14, 2025) | https://www.nolaassessor.com/2025/07/14/2026-assessment-rolls-open-for-public-inspection-july-15-to-august-15/ |
| S6 | OPAO, "OPAO Rolls Out New Online Assessment Appeal System" (July 22, 2025) | https://www.nolaassessor.com/2025/07/22/opao-rolls-out-new-online-assessment-appeal-system/ |
| S7 | OPAO, Homestead & SAL page | https://www.nolaassessor.com/homestead-sal/ |
| S8 | OPAO, "Homestead Exemption: Once Gained, Permanently Applied" flyer | https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/2021-homestead-exempt-flyer_071221.pdf |
| S9 | OPAO, Homestead Exemption application form | https://www.nolaassessor.com/wp-content/uploads/sites/80/2024/02/OPAO-HE-Appl.pdf |
| S10 | OPAO, mass appraisal process flyer | https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/mass_process_flyer2021.pdf |
| S11 | City of New Orleans Treasury, "Millages: How Taxes are Calculated" | https://nola.gov/next/treasury/topics/how-taxes-are-calculated/ |
| S12 | City of New Orleans Treasury, FAQ | https://nola.gov/next/treasury/topics/faq/ |
| S13 | New Orleans City Council, "Property Tax Assessments and Appeals" | https://council.nola.gov/resources/property-tax-assessments-and-appeals/ |
| S14 | La. Admin. Code tit. 61 §V-3103, Appeals to the LTC | https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-61-SS-V-3103 |
| S15 | La. Legislative Auditor, evaluation of OPAO's tax year 2024 quadrennial reappraisal | https://lla.la.gov/publicreports.nsf/0/f74bf8c6ffebdf7f86258a8d00657f6c/$file/000037d0b.pdf |
| S16 | The Center Square, "Audit: Orleans Parish used prohibited 'sales chasing'…" | https://www.thecentersquare.com/louisiana/article_29aad166-a5cc-11ee-97ed-8324ed068b6d.html |
| S17 | BGR, "About Your Property Taxes" | https://www.bgr.org/about-your-property-taxes/ |
| S18 | BGR, "2026 Property Tax Dashboard" | https://www.bgr.org/report-index/2026-property-tax-dashboard-update/ |
| S19 | Fox 8, "New Orleans property owners could pay more under proposed 2027 tax increase" (Sept. 28, 2026) | https://www.fox8live.com/2026/09/28/new-orleans-property-owners-could-pay-more-under-proposed-2027-tax-increase/ |
| S20 | PAR Louisiana, Guide to the Fall 2026 Constitutional Amendments | https://parlouisiana.org/wp-content/uploads/2026/10/PAR-Guide-to-the-Fall-2026-Constitutional-Amendments-FINAL.pdf |
| S21 | Verite News, assessor race guide / Williams fifth term | https://veritenews.org/guides/2025-new-orleans-election-guide/assessor-race/ |
| S22 | Biz New Orleans, "2025 Assessment Rolls Open July 15 to Aug. 15" | https://bizneworleans.com/2025-assessment-rolls-open-july-15-to-aug-15/ |
| S23 | USA Today Network via Yahoo, "Louisiana voters changed the state Constitution Tuesday" (Nov. 2022) | https://news.yahoo.com/louisiana-voters-changed-state-constitution-142759103.html |
| S24 | AARP Foundation, Louisiana property tax relief | https://my.aarpfoundation.org/property-taxes/taxpayer-states/louisiana/ |
| S25 | Jefferson Parish Assessor, Homestead Exemption (2022 disabled-veteran amendment; neighboring parish, secondary) | https://www.jpassessor.net/Resources/HomesteadExemption |
| S26 | BGR, "PolicyWatch: Revisiting Assessment Issues in New Orleans" | https://www.bgr.org/report-index/policywatch-revisiting-assessment-issues-in-new-orleans/ |
| S27 | City of New Orleans, Pay Property Tax | https://nola.gov/property-tax/ |
| S28 | LouisianaLawHelp, "Homestead Exemption for Property Taxes in Louisiana" | https://louisianalawhelp.org/resource/homestead-exemption-for-property-taxes-in-louisiana |
| S29 | Loyola Law Pro Bono Desk Manual §6.5, "Considerations with Immovable Property" (undated practice note) | https://probonodeskmanual.loyno.edu/node/1044 |

**How to rank sources:** official government sources (S1–S15, S27) outrank everything else. Use news,
nonprofit and legal-aid sources (S16–S26, S28–S29) for context, or when no official source exists. Label
them as such in answers. Never cite commercial "property tax appeal" sites or
data-aggregator sites. During research they gave dates that contradicted the Assessor.

> Research note: sources were found through web search on Oct. 19, 2026. The research
> sandbox could not open nolaassessor.com, nola.gov, or council.nola.gov directly.
> **Open every S-link in a browser and confirm each `VERIFY` item before the final
> submission.**

---

## 3. Data

Files go in `data/raw/` and are **never committed** if they hold owner names. See
`data/README.md`.

| File (expected) | Roll | What it represents | Status |
|---|---|---|---|
| `data/raw/roll_2025.*` | **2025 roll** | Values posted July 2024, bills due early 2025. **Not** a reassessment year: mostly carried forward from the 2024 reappraisal. | Not yet in repo. Add and profile it. |
| `data/raw/roll_2026.*` | **2026 roll** | Values posted July 2025, bills due early 2026. Also not a reassessment year. | Not yet in repo. Add and profile it. |

**What we know so far**
- Both rolls come from the Orleans Parish Assessor. Expect one row per parcel, or per
  parcel and class line, keyed by a tax bill or parcel number (format like
  `39W001112`; the bill PDF at `taxbills.nola.gov/pdfs/2023/39W001112.pdf` uses the same
  ID).
- Expect columns for: owner name, mailing address, property (situs) address, land value,
  improvement value, total FMV, assessed values by class, exemption codes and amounts
  (homestead, SAL, veteran), taxable value, and probably assessment district or
  neighborhood. **Confirm the real column names and write them here** before writing
  any Layer 2 code.
- **2025 → 2026 changes should be small for most parcels**, since neither is a
  reassessment year. Big changes probably mean a sale, new construction or renovation, a
  demolition, a split or merger, a correction, or an exemption gained or lost. That is
  the main Layer 2 story. The bigger jump (2026 → 2027 reassessment) is **not** in our
  files. Say so if a user asks about their 2027 value.
- Use the 2024-reappraisal neighborhoods (393) for Layer 3 comparisons if the roll
  carries a neighborhood code [S15].

**Data rules for the agent**
1. Profile each file first: row count, columns, types, nulls, duplicate parcel IDs.
   Write the results in `data/README.md`.
2. Join the years on parcel ID, never on address. Report parcels that appear in only
   one year.
3. Never show owner names in the UI or in example outputs. Look up by address or parcel
   ID only.
4. Every number shown to a user cites the roll year and field it came from.
5. Do not compute "expected" or "fair" values. Layer 3 describes the distribution. It
   does not tell an owner they are over-assessed.

---

## 4. Chatbot rules (instructions to the agent)

These rules apply to every answer the Navigator gives, at every layer. Build them into
the system prompt or answer logic, and test them (Section 6).

1. **Cite a source for every fact.** Every factual sentence links to an S-ID from Section
   2.9 or to a roll field. If no source supports a statement, leave it out. Show the
   sources under each answer as clickable links. Label news and nonprofit sources as
   secondary.
2. **Say "I don't know" when unsure.** If the question is not covered by the knowledge
   base or the data, or the sources conflict, say "I don't know" plainly. Then say who
   would know. Do not guess, and do not fill gaps from general knowledge about other
   states. Facts tagged `VERIFY` must be described as approximate or "please confirm."
3. **No legal or tax advice.** Explain how the system works. Do not tell a user whether to
   appeal, what value to ask for, whether they will win, how to structure ownership, or
   what they "should" do. For those, say: "That's a decision for you, and I can't give
   legal or tax advice," then give the human contacts below.
4. **Offer a human contact** whenever the answer involves a deadline, an exemption
   application, an appeal, a dispute, or "I don't know":
   - Orleans Parish Assessor's Office: City Hall, 1300 Perdido St., Room 4E01;
     appraiser appointments (504) 754-8811; nolaassessor.com [S4][S9]
   - Board of Review (New Orleans City Council): council.nola.gov [S13]
   - Tax bills and payments, Bureau of the Treasury: nola.gov/property-tax [S27]
   - Free legal help: Southeast Louisiana Legal Services (slls.org) or a licensed attorney
5. **Disclose that it is a student prototype.** Show a persistent banner, and the
   greeting must say: "I'm a student prototype, not an official government tool.
   Information may be out of date, so always confirm with the Assessor's Office."
6. **Dates matter.** Compare deadlines with today's date. If a deadline has passed, say so
   and give the next expected window. Never imply an appeal is still open when it
   isn't.
7. **Layer boundaries.** Until Layer 2 ships, if a user gives an address or asks about
   "my" value, explain that parcel lookup isn't built yet and link them to the Assessor's
   property search. Don't invent parcel data.
8. **Privacy.** Don't ask for or store names, Social Security numbers, income, or
   disability details. If a user shares them, don't repeat them back.
9. **Stay neutral** on politics, the Assessor's performance, and ballot measures. Present
   documented views with sources.

---

## 5. Public education outline (City of New Orleans)

Each topic lists its sources and the 2–3 questions owners ask most. Every one of these
questions must have a knowledge-base entry in `kb.js`.

### 5.1 How property values are set
- Content: FMV definition; mass appraisal (CAMA) with sales comparison; property
  features; 393 neighborhoods; reappraisal at least every 4 years; the LLA audit
  (both views); how to check your property's features.
- Sources: S1, S10, S15, S16, S26
- Top questions:
  1. *How does the Assessor decide what my house is worth?*
  2. *Did someone come inspect my house? Why did my value go up when I didn't change anything?*
  3. *Is my assessed value the same as what I could sell it for?*

### 5.2 From assessed value and millage to a tax bill (worked example)
- Content: ratios (10% / 15% / 25%), what a mill is, the formula, the $300,000 example
  in §2.4, rollback and roll-forward, special districts, who mails bills and when they're
  due.
- Sources: S1, S11, S12, S17, S18, S19, S27
- Top questions:
  1. *How is my property tax bill calculated?*
  2. *What is a mill / millage rate?*
  3. *When is my tax bill due, and who do I pay?*

### 5.3 Exemptions owners can claim
- Content: homestead ($75,000 FMV / $7,500 AV, own and occupy by Dec. 31, in-person
  filing, documents, permanent once granted); SAL freeze; disabled veteran tiers; first
  responder; the Nov. 2026 amendments (proposed).
- Sources: S1, S2, S3, S7, S8, S9, S20, S24, S25
- Top questions:
  1. *How do I apply for the homestead exemption, and what do I bring?*
  2. *I'm over 65. Can my assessment be frozen?*
  3. *Do I have to reapply every year?*

### 5.4 What the 2027 reassessment means for owners
- Content: what changed on the 2027 roll; 2024 comparison (~20%); rollback and
  roll-forward; the City's two proposed levies (12.23 vs. 13.91 mills; ~$178 on a $300,000
  homestead); there is no 10% cap (2022 amendment failed); what to check before bills
  arrive.
- Sources: S1, S4, S19, S21, S23, S26
- Top questions:
  1. *My value went up a lot. Will my taxes go up the same amount?*
  2. *Why is there a reassessment in 2027?*
  3. *Is there a cap on how much my assessment can rise?*

### 5.5 How to appeal, where to go, deadlines
- Content: the five steps in §2.8, three open-roll locations, appointment line, online
  system, four paper copies, evidence, LTC 30 days, the roll-year table in §2.6, and the
  fact that the 2027 window has closed.
- Sources: S4, S5, S6, S13, S14, S22
- Top questions:
  1. *How do I appeal my assessment, and what's the deadline?*
  2. *What evidence do I need?*
  3. *I missed the deadline. What can I do now?*

---

## 6. Build, test, and project conventions

**Current files** (static site, no build step, no API key; served by GitHub Pages from
this repo):

```
nola-assessment-navigator/
  CLAUDE.md          ← this file
  README.md          ← project overview, live link, sample Q&A
  index.html         ← chatbot UI (Layer 1)
  kb.js              ← knowledge base: SOURCES + ENTRIES (answers, keywords, source IDs)
  app.js             ← retrieval, guardrails, rendering
  style.css
  data/README.md     ← data notes (Section 3)
  docs/sample-questions.md, docs/verification-checklist.md, docs/screenshots/
```

**How Layer 1 works:** `app.js` scores the question against each `kb.js` entry: +1 per
keyword, +2 per `core` subject word, +3 per phrase. Guardrails run first: personal data,
advice requests, property lookups, and other parishes. After an advice or lookup
refusal, the matching general entry is still shown. Below a score threshold, the bot says
"I don't know" and gives contacts. If the question uses a word the knowledge base never
mentions (e.g. "installments"), the bot says it doesn't know about that term **before**
showing the closest entry, so it never silently answers a different question. Deadline
and bill dates are computed from today's date and the `APPEAL_WINDOWS` table in
`app.js`; add each new roll there when the Assessor announces it. Every entry **must**
list at least one source ID. A check in `app.js` refuses to render an entry without one.

**Planned upgrade:** replace keyword retrieval with an LLM (Claude API) that answers only
from retrieved `kb.js` passages, using Section 4 as the system prompt. Keep the
retrieval step, so sources stay grounded. The API key must never sit in client-side
code. That requires a small server or serverless function.

**Rules for changing code**
- Match the parent site's style: plain HTML, CSS, and vanilla JS, no frameworks or build
  tools.
- When you add or change a fact, update **both** this file (§2) and `kb.js`, using the same
  source ID.
- Before you commit, run the sample questions in `docs/sample-questions.md` in a browser.
  Confirm every answer shows sources, the disclaimer is visible, and advice or lookup
  questions get the guardrail response.
- Don't touch the parent portfolio site (`../index.html`, `../style.css`, `../script.js`)
  unless asked.

---

## 7. Live draft chatbot (Layer 1)

- **Live link:** https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB. This is a Claude artifact, private until the owner
  shares it from the page's Share menu.
- **Repo copy:** `nola-assessment-navigator/index.html`. Once this branch merges to `main`, GitHub Pages serves it
  at `<pages-site>/nola-assessment-navigator/`.
- It answers the Layer 1 questions in Section 5 and shows inline `[S#]` citations plus a source list under every
  answer. It labels secondary sources, appends human contacts, checks the appeal deadline against today's date,
  and refuses advice requests and property lookups.
- To rebuild the artifact, inline `style.css`, `kb.js`, and `app.js` into one HTML file and republish to the same URL.

## 8. Sample questions and known gaps

Full write-up and screenshots: `docs/sample-questions.md`, `docs/screenshots/` (version 1 failures in
`docs/screenshots/v1/`).

| # | Question | Version 1 (Oct. 19) | Version 2 (Oct. 21) |
|---|---|---|---|
| 1 | How is my property tax bill calculated? | ✅ Formula + $300,000 worked example, caveats, 5 sources | ✅ Same |
| 2 | How do I apply for the homestead exemption? | ✅ Amount, eligibility, in-person filing, documents, 5 sources | ✅ Same |
| 3 | What does the 2027 reassessment mean for me? | ⚠️ Correct and date-aware, but leans on secondary sources | ⚠️ Same |
| 4 | Should I appeal? My house is worth less than what the Assessor says. | ⚠️ Refused advice but left out the appeal steps it promised | ✅ Refuses advice, then shows appeal steps, status and contacts |
| 5 | Can I pay my property taxes in installments? | ❌ Answered with due dates instead of "I don't know" | ⚠️ Says "I don't know about installments" first, then the closest topic |

**Still open:** a sourced entry on payment plans (Q5); official sources to replace the secondary ones in
Q3; checking the 121.20-mill figure and every other `VERIFY` item using `docs/verification-checklist.md`.
