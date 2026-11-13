# CLAUDE.md: NOLA Assessment Navigator

Read this file before every task in `nola-assessment-navigator/`. It holds the project's
purpose, the domain facts the code depends on, the data notes, and the rules the chatbot
has to follow. If a task conflicts with a rule in **Section 4 (Chatbot rules)**, the rule
wins. Stop and ask instead of breaking it.

*First researched Oct. 19, 2026. Data section added Nov. 2, 2026. **Re-verified Nov. 13, 2026** for the
final draft: the reappraisal cycle, the Nov. 3 election, the City's 2027 roll-forward, bill dates, payment plans and
veteran tiers were checked against the sources in §2.9. Facts that change every year (dates, millage, income limits)
carry a `VERIFY` tag. Re-check them before each tax cycle.*

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
| 1 | **General guidance** | "How does this work?": FMV vs. assessed value, millage, exemptions, appeals, deadlines, payment, the 2027 reassessment | Curated knowledge base (`kb.js`, 29 entries) built from the sources in Section 2 | **Live** |
| 2 | **My property** | "What does this mean for *my* parcel?": find and confirm a parcel, then show its values, exemptions, freeze, recorded 2026/2027 tax, the next bill, the 2026 → 2027 change, and its census neighborhood | 2026 and 2027 LTC rolls (Section 3); the course's parcel → census block group crosswalk and ACS block-group data; the 2025 roll isn't available | **Live**: lookup + 20 question types, and general answers show the selected record |
| 3 | **Market context** | "How does my parcel compare?": its value and 2026 → 2027 change vs. similar parcels in its area | Same rolls, aggregated by Subdivision × property type (`areas.json`) | **First version live**: distributions only (data rule 6) |

**How the layers come together (final draft, Nov. 15):** one chat. The owner can ask a general question, look up
a property (in the Find box or by typing an address in the chat), and ask about it. With a property selected, a
general answer (e.g. "How do I apply for homestead?") also shows what that record says on the topic; a property
question asked before a lookup is remembered and answered right after the owner picks the record. On claude.ai the
page can also ask **Claude** for a short plain-language "AI explanation" built only from the knowledge base and the
selected record; it is checked before it's shown and the deterministic answer always stays underneath (§6).

Layer 2 and 3 answers must still follow every rule in Section 4. A number from the roll
is a fact and needs a citation, for example "2026 roll, parcel 102000079, field
`Total Assessed Value`".

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
- **Total millage, from the state roll files (verified Nov. 2, 2026):**
  - **2026 roll: 131.99 mills** on the East Bank and **132.01** in Algiers (District 5), which is in a different levee
    district.
  - **2027 roll: 133.48** (East Bank) and 132.01 (Algiers).
  - Each parcel's millage rows list every levy and its computed tax, so the chatbot shows the **recorded** tax, not an
    estimate [S30][S31].
  - The earlier 121.20 figure from secondary sites was wrong. Don't use it.
- **Homestead doesn't reduce two levies, 11.51 mills together:** the 2026 file calls them "POLICE W/O H.E." (9.29)
  and "FIRE W/O H.E." (2.22) [S30]; the 2027 file splits them as "FIRE – WITHOUT HOMESTEAD EXEMPTION" (6.84) and
  "POLICE – WITHOUT HOMESTEAD EXEMPTION" (4.67) [S31]. Even a fully exempted home (100% disabled veteran) pays these on
  its full assessed value.
- **Special-district fees aren't in the state files:** the Downtown Development District and security districts are
  billed separately, so the recorded tax can be lower than the real bill.
- **Rollback and roll-forward.** In a reassessment year, when total values go up, taxing
  bodies must **roll back** millage so they collect about the same revenue. Afterward
  they may vote to **roll forward** up to their prior maximum rate [S11][S19][S32].
- **2027 roll-forward (decided):** on **Nov. 5, 2026** the City Council unanimously approved a partial roll-forward
  totaling **4.039 mills** (about $23.3 million) [S33]. The September proposal had been about 7.44 mills, from 44.67 to
  52.11 mills across a group of city millages, about $178 a year on a $300,000 homesteaded home [S19]. The 2027 state
  file (filed Sept. 4) still lists the pre-vote rates, e.g. the City's general levy at 12.23 mills [S31], so its
  computed 2027 taxes are probably **below the actual bills**. The final rate for each millage isn't known yet. The
  Navigator shows the possible effect as a calculated range: 4.039 × taxable ÷ 1,000 to 4.039 × assessed ÷ 1,000.

**Worked example (2026 roll, East Bank) [S1][S2][S30]:**

| Step | Calculation | Result |
|---|---|---|
| Fair market value | (set by Assessor) | $300,000 |
| × Residential ratio | $300,000 × 10% | $30,000 assessed value |
| − Homestead exemption | $30,000 − $7,500 | $22,500 taxable |
| × Total millage | $22,500 × 131.99 ÷ 1,000 | $2,969.78 |
| + Police and fire mills homestead doesn't reduce | $7,500 × 11.51 ÷ 1,000 | $86.33 |
| **Total** | | **$3,056.10 per year** |
| Same house, no homestead | $30,000 × 131.99 ÷ 1,000 | $3,959.70 per year |

Checked against a real parcel. 1205 St Charles Av #607: $14,570 × 131.99 = $1,923.07, − $903.62 homestead reduction
= **$1,019.48**, exactly the recorded tax. Special-district fees are extra.

### 2.5 Exemptions and special assessments

| Program | What it does | Who qualifies | How to apply | Sources |
|---|---|---|---|---|
| **Homestead exemption** | Removes **$7,500 of assessed value** (= the first **$75,000 of FMV**). In Orleans it applies to state, general city, school, levee, and levee-district taxes, but not every millage. | Owner who **owns and occupies** the home as a primary residence by **Dec. 31** of the tax year. One per person or married couple. | **In person** at OPAO, City Hall Room 4E01. **All occupying owners** must appear. Bring: proof of ownership (act of sale or deed); Louisiana driver's license or ID showing the property address; a current Entergy or cable bill for the property with matching name, service address, and mailing address. A mailing address that differs from the property needs a recorded power of attorney. **Once granted, it stays on**: no yearly re-filing. | [S2][S3][S7][S8][S9] |
| **Special Assessment Level ("the freeze")** | Freezes the **assessed value** (not the bill) at the level when you qualified. Millage can still rise. | Has homestead **and** is (a) 65 or older, (b) permanently and totally disabled, (c) a veteran with a service-connected disability rating of **50% or more**, or (d) certain surviving spouses or military families. Household adjusted gross income at or below the limit: base **$100,000**, indexed (no official 2026 figure found; the $102,700 figure came from a commercial site, so it isn't used). **Amendment 9 (passed Nov. 3, 2026) raises the limit to below $150,000** and delays indexing to 2028 [S36]. `VERIFY` the first tax year it applies. | Apply at OPAO with proof of age or disability and an income document (tax return). Some under-65 owners must re-certify income each year. | [S1][S7][S24][S36] |
| **Disabled veteran additional exemption** | On top of homestead: **50% to under 70%: the next $2,500 AV. 70% to under 100%: the next $4,500 AV. 100% or unemployability: the rest of the home's AV** (La. Const. Art. VII §21(K), confirmed Nov. 13). The police/fire "without homestead" levies still apply (§2.4). | Veteran with a VA service-connected rating of 50% or more. A surviving spouse who keeps owning and occupying the home keeps it; **Amendment 1 (passed Nov. 3, 2026)** lets the spouse move it to a new home once [S36]. | OPAO, with VA rating letter, proof of homestead, ID, and utility bill. | [S37][S7][S36] |
| **First responder additional exemption** | About **+$25,000 of FMV** (+$2,500 AV) on a homestead. | Qualifying first responders. | OPAO, with an employment verification letter on agency letterhead. | [S7] |
| **Heirs and surviving spouses** | A surviving spouse who keeps living in the home keeps the exemption (as owner, usufructuary, or through a qualifying trust). An heir who lives in the home gets a share of the exemption matching their ownership share. | Surviving spouse, or heirs who occupy the home. | Contact OPAO. A **succession** may be needed if title isn't in the heir's name. `VERIFY` what OPAO requires and whether it grants the exemption before a judgment of possession. | [S2][S28][S29] |
| **Other** (nonprofit or religious use, Restoration Tax Abatement, ITEP, etc.) | Varies. | Mostly non-homestead property. | Out of scope for Layer 1. Say "I don't know the details" and refer to OPAO. | — |

**November 3, 2026 election results (unofficial; re-check certification at sos.la.gov)** [S36][S20]:
- **Amendment 1, passed (~75%):** a disabled veteran's surviving spouse can move the exemption to a new home once.
- **Amendment 6, passed (~65%):** cities and parishes *may* give owners 65+ extra relief with local approval. It
  does nothing in New Orleans unless the City adopts it; no such step found as of Nov. 13.
- **Amendment 9, passed (~60%):** SAL income limit raised to below $150,000; indexing delayed to 2028.
- **Amendment 2, failed:** keep lower millages after a reassessment without losing the right to raise them.
- **Amendment 10, failed:** local-option exemption for rehabilitated blighted property.
The chatbot reports these as unofficial results, gives no opinion, and says it doesn't know exact effective dates.

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
| **2026** | July 15 – Aug. 15, **2025** | Aug. 20, 2025 per [S6]; one OPAO notice says Aug. 18 [S5]. `VERIFY` (the chatbot says "please confirm") | Late Jan. 2026 [S35] | **Feb. 28, 2026** [S35] |
| **2027** (last year of the 2024 values, §2.7) | July 15 – Aug. 17, **2026** | Online system July 22 → **4 p.m., Thu. Aug. 20, 2026** [S4] | ~Dec. 2026–Jan. 2027 | Not announced as of Nov. 13 `VERIFY` |
| **2028** (the reappraisal done in 2027) | Summer **2027** (expected) | Aug. 2027 (expected) | late 2027 | early 2028 |

Late payment: interest accrues at **1% per month** after the due date, and not receiving a
bill is not an excuse [S12][S34][S35]. **Payment plans:** the Treasury offers **no formal installment plan**; owners
may pay part of the bill in person or by mail (not online), and the unpaid balance accrues 1% a month [S34].

### 2.7 The 2027 reassessment: what it means

- **The cycle (official, confirmed Nov. 13):** Louisiana reappraises every property at least every four years [S1].
  The City Council explained in 2023: "Because 2024 is a quadrennial year, Orleans Parish assessments for tax years
  2024-27 will reflect market values as of Jan. 1, 2023" [S32]. That is exactly what the data shows: every parcel in
  the 2026 **and** 2027 rolls is dated 01/01/2023, and the 2027 roll the Assessor filed on Sept. 4, 2026 keeps
  **98% of parcels at their 2026 market value** [S31] (`docs/year-comparison.md`).
- **So "the 2027 reassessment" is the next reappraisal, done during 2027**, which should set new values for the
  **2028 roll** (posted for inspection in summer 2027, bills due early 2028). That timing is inferred from the
  four-year cycle [S32][S1]; `VERIFY` with OPAO. (Earlier drafts assumed the *2027 roll* itself was the
  reappraisal; the data and [S32] show it isn't. That resolves the old "why 2027 and not 2028?" question.)
- **The 2027 roll in numbers** (all 162,940 parcels in both rolls): total market value $75.54B → $76.55B; taxes rise
  mainly through millage, 131.99 → 133.48 mills on the East Bank; median home +$25; median homesteaded home $1,965 →
  $2,032 [S30][S31]. The Council's Nov. 5 roll-forward (4.039 mills, §2.4) comes on top [S33].
- The previous reappraisal, for **tax year 2024**, raised total assessed value about **20%** [S26].
- **What owners should take from it:** (1) values can change in the 2027 reappraisal even if the owner changes
  nothing; (2) when total values rise, taxing bodies must roll back, so bills don't rise by the same percent, but
  they may roll forward [S11]; (3) the summer 2027 open-roll period is when to check the new value and appeal; the
  window for the 2027 roll **closed Aug. 20, 2026** [S4]; (4) make sure homestead or SAL is on file before then.

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
| S30 | Louisiana Tax Commission, Orleans **2026** tax roll files (7 districts; incl. millage and computed tax by parcel), posted Nov. 2025 | https://stax.latax.la.gov/TaxRollsFolder/2025/ |
| S31 | Louisiana Tax Commission, Orleans **2027** tax roll files, filed Sept. 4, 2026 | https://stax.latax.la.gov/TaxRollsFolder/2026/ |
| S32 | New Orleans City Council, "Councilmember Eugene Green Clarifies the Difference…" (July 2023): tax years 2024–27 use market values as of Jan. 1, 2023 | https://council.nola.gov/news/july-2023/councilmember-eugene-green-clarifies-the-differenc/ |
| S33 | Fox 8, "New Orleans City Council approves millage roll-forward…" (Nov. 5, 2026) | https://www.fox8live.com/2026/11/05/new-orleans-city-council-approves-millage-roll-forward-raising-taxes-slashing-budget-deficit/ |
| S34 | City of New Orleans Treasury, "Paying taxes" (payment plans, partial payments, 1% interest) | https://nola.gov/next/treasury/topics/paying-taxes/ |
| S35 | City of New Orleans, 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026) | https://nola.gov/next/mayors-office/news/articles/january-2026/2026-01-25-city-of-new-orleans-2026-property-tax/ |
| S36 | WAFB/Fox 8 (Ken Daley), "Louisiana voters pass 7 of 10 constitutional amendments" (Nov. 3, 2026; unofficial results) | https://www.wafb.com/2026/11/04/louisiana-voters-pass-7-10-constitutional-amendments-ballot/ |
| S37 | La. Const. Art. VII §21 (other exemptions; §21(K) disabled veterans) | https://www.legis.la.gov/Legis/Law.aspx?d=206551 |
| S38 | U.S. Census Bureau Geocoder: roll addresses → 2020 block groups (course crosswalk, 140,850 parcels) | https://geocoding.geo.census.gov/geocoder/ |
| S39 | U.S. Census Bureau, American Community Survey 2020–2024 5-year, block groups (course data, Social Explorer export) | https://www.census.gov/programs-surveys/acs |

**How to rank sources:** official government sources (S1–S15, S27, S30–S32, S34–S35, S37–S39) outrank everything
else. Use news, nonprofit, legal-aid and other parishes' sources (S16–S26, S28–S29, S33, S36) for context, or when no
official source exists. Label
them as such in answers. Never cite commercial "property tax appeal" sites or
data-aggregator sites. During research they gave dates that contradicted the Assessor.

> Research note: sources were found through web search on Oct. 19, 2026. On Nov. 13, 2026 these pages were opened
> and read directly: S32, S33, S34, S35, S36, S37 and S19. nolaassessor.com still blocks automated access (403), so
> S4–S10 have not been re-read since October. **Still `VERIFY`:** the 2026-roll BOR date (Aug. 18 vs. 20, 2025), the
> 2027 bill due date, the first tax year of the $150,000 SAL limit, the 2028 reappraisal timing, heirs' paperwork,
> and certification of the Nov. 3 results.

---

## 3. Data

Raw files go in `data/raw/` and are **never committed**: they hold owner names. Full field list:
`docs/data-dictionary.md`. EDA: `docs/week2-report.md` and `docs/eda/`.

| File | Roll | Status |
|---|---|---|
| `data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv` (Box course folder, 110 MB) | **2026** (bills due early 2026) | **Loaded and profiled** |
| `data/raw/ltc2026/`: raw LTC files `ORLEANSDISTRICT1–7_2026_TAXROLL.zip` (TaxRollsFolder/2025) | **2026** | Parsed by `pipeline/ltc_roll.py`. **Reproduces the Box file exactly** (market, land and taxable values on all 163,135 parcels), and adds the per-parcel millage and computed tax |
| `data/raw/ltc2027/`: raw LTC files `ORLEANS1–7_2027_*_TAXROLL.zip` (TaxRollsFolder/2026, filed Sept. 4, 2026) | **2027** | 163,138 parcels; compared with 2026 by parcel ID (`pipeline/compare_rolls.py`) |
| 2025 roll | 2025 | **Not available.** It's not in Box, and the LTC site keeps only its two latest upload years. |
| `data/outside/acs_orleans_tracts.csv` | Census ACS 2024 5-year, 184 tracts | Pulled via the Census Reporter API (`pipeline/fetch_acs.py`). Tract matching tested: 86% of a 504-parcel sample, 94% of homes (`docs/outside-data-matching.md`) |
| `data/raw/box/parcel_blockgroup_crosswalk.csv` (course Box, "Census Block Group Analysis/output") | Census geocoder results for every roll address | **140,850 of 163,135 parcels (86.3%)** matched to a 2020 block group, with coordinates; 20,517 matches are approximate. Same rate as our own 504-parcel test. Joined **by parcel ID** in `export_web.py` |
| `data/raw/box/bg_merged.csv` (same folder) | ACS 2020–2024 5-year, 439 block groups (Social Explorer export) + roll medians | → `data/web/2026/bg.json` (`pipeline/census_bg.py`): the neighborhood profile in property answers |

**Raw LTC file format:** comma-separated with `~` quotes, keyed by (year, district FIPS, parcel). Tables:
- `ASSMT`: type RE/PP, status, owner, mailing address
- `PARCEL`: ward, subdivision, situs address, occupancy, transfer, valuation date
- `AVALUE`: market, assessed, homestead, taxable, other/veteran/first-responder exemptions, per land/improvement line
- `AMILLAGE`: one row per levy, with mills, gross tax, homestead reduction and net tax
- `LEGAL`, `IMPROVE`, `OWNER`, `TGROUP` (levy list)
- `PARISHSELFREPORT.json`: district totals; its average millage, e.g. 134.18 for District 4 in 2027, is a weighted
  average, not a parcel rate

Column positions are documented in `pipeline/ltc_roll.py`.

**What the 2026 roll is** (verified by `pipeline/eda.py`, see `docs/eda/eda_numbers.json`)
- **Source and shape:**
  - The Louisiana Tax Commission's 2026 tax rolls for Orleans, one archive per municipal district (1–7), combined.
  - **163,135 rows, one per parcel, 115 columns.**
  - Multi-record parcels join values with `" | "`.
- **Key:** `Parcel ID(s)` is unique and identical to `Tax Bill #` and `Assessment Parcel Number(s)`. Use it to join
  years and outside data. **Never join on address.**
- **Valuation date:** `Assessment Date(s)` is **01/01/2023** on every row, in the 2026 **and** the 2027 roll. That's
  the 2024 reappraisal's valuation date, used for tax years 2024–2027 (confirmed by [S32]).
- **Identities that hold on every row:**
  - market = land + improvement
  - assessed = land + improvement
  - taxable = assessed − (homestead + other + veteran + first responder), floored at 0
  - homestead amount ≤ $7,500
- **The 10% rule shows in the data:** 97% of non-frozen residential parcels are assessed at exactly 10% of market;
  frozen (SAL) parcels have a median of 7.6%.
- **Address format** (drives `address.js`):
  - no N/S directions
  - suffix codes AV, BL, HW, PW, CR, WY, TR (= Trail)
  - units written bare after the suffix (`ST CHARLES AV 607`), with `HF` = ½
  - spellings `MARTIN L KING BL` and `ORETHA C HALEY BL`
  - 2021 renames (Norman C Francis, Allen Toussaint) mostly applied
  - 820 parcels list several addresses; 1,110 addresses are shared by 2+ parcels
  - 1,004 address strings have no usable street
- **Not in the file** (blank or zero for every parcel): building size, bedrooms, bathrooms, condition, renovation year,
  tax-sale status, special taxing district, coordinates, census tract. **"Living Square Feet" is mislabeled**: it
  equals the record count.
- **Sales-ratio findings** (the client's concern; Figure 5 in `docs/week2-report.md`):
  - In 8,604 residential SALE transfers from 2023–2025, the cheapest tenth of homes ($15K–$130K) is valued at
    **1.18×** its sale price (COD 33). Every other tenth sits at 0.92–0.94×.
  - 19% of these sales, and 40% of 2023 sales, sit at almost exactly **92% of price**, a sign of values reset on
    sale.
  - Sale prices are unverified, and the cheap end mixes in non-market sales. Treat this as a pattern worth
    investigating, not a conclusion about any one home.
  - Our code reproduced the class model EDA's numbers exactly.
- **Placeholders, not facts:**
  - Year built 1994 (42,390 parcels, mostly vacant or commercial)
  - Transfer date 12/31/1994 (8,112)
  - Purchase price 0 or nominal (50,933; none verified)
- **2027 roll changes worth knowing** (by parcel ID): 2,165 parcels lose their homestead on the 2027 roll, 184 go from
  exempt to taxable, and some record a newer transfer. The export keeps these (`h27`, `st27`, `td27`) so answers
  never present a 2026 fact as current when the 2027 roll differs. 930 parcels have $0 market and assessed value
  (no value set); answers treat that as missing.
- **Parcel IDs:** 46% contain letters (`39W305216`) or have 10 digits; lookup checks the ID list directly.
- **Unknown codes:** Freeze Code 1–4, Other Exemption codes, LTC subclass codes, most instrument types. Veteran type
  1/2/3 *appears* to be $2,500 / $4,500 / full exemption (inferred).

**Pipeline** (run from `nola-assessment-navigator/`):
1. `python3 pipeline/eda.py`: charts and numbers.
2. `python3 pipeline/data_dictionary.py`: the data dictionary.
3. `python3 pipeline/export_web.py && node pipeline/shard.js && python3 pipeline/area_stats.py && python3 pipeline/census_bg.py`:
   public fields → `data/web/2026/` (241 street files + `meta.json` + `ids.json` + `areas.json` + `bg.json`, ~64 MB).
   `shard.js` clears the folder, so the last two must run after it.
   - Each parcel also gets its census block group and coordinates from the course crosswalk, when matched.
   - Owner names, mailing addresses and purchase prices are dropped.
   - Placeholders (1994 year built on non-residential parcels, 12/31/1994 transfer dates) are removed.
   - `data/web/` and `data/processed/` are git-ignored; regenerate them, or use the copy published with the live
     chatbot.
4. `python3 pipeline/compare_years.py <2025.csv> <2026.csv>`: year comparison on Parcel ID, ready for the 2025 roll.
5. `python3 pipeline/fetch_acs.py`: Census ACS by tract (outside data, via Census Reporter; uses api.census.gov when
   `CENSUS_API_KEY` is set). Then `python3 pipeline/geocode_sample.py`: tract-matching test. See
   `docs/outside-data.md`.
6. `python3 pipeline/ltc_roll.py data/raw/ltc2026 2026`, `… ltc2027 2027`, then `python3 pipeline/compare_rolls.py`:
   raw state files → parcel tables → the 2026 vs 2027 comparison. **Run these before step 3**, which adds each
   parcel's recorded 2026/2027 tax and 2027 values to the web export.

**Data rules for the agent**
1. Profile any new file first (rows, columns, types, nulls, duplicate IDs) and update this section and the data
   dictionary before writing code that uses it.
2. Join years and outside data on **Parcel ID**, never on address. Report parcels found in only one year; don't guess.
3. Never show owner names, contacts or mailing addresses in the UI, tests or docs.
4. Every number shown to a user names the roll year and the field it came from.
5. Treat placeholders as missing, not as facts. Say what's missing and where the owner can find it.
6. Don't compute "expected" or "fair" values, and don't tell an owner they're over-assessed. Layer 3 describes
   distributions only. The sales-ratio pattern can be described citywide with its caveats. It must never be applied to
   one owner's home ("your home is probably over-assessed").
7. **Outside demographics describe neighborhoods, never owners.** Never infer an owner's race, income or age from
   census data. Census figures appear only in the "What neighborhood is it in?" answer, labeled as describing the
   block group's residents, with the survey-error caution, and joined by parcel ID through the tested crosswalk.

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
7. **Find, then confirm, then answer.** Property answers only use a record the owner picked
   from the lookup results ("Is this your property?"). With several matches (condo units,
   N/S Claiborne), show them all with district, ward, area and legal description, and let
   the owner choose. With no match, say why and offer the parcel-ID search and the
   Assessor's property search. Never invent parcel data.
8. **Separate recorded, calculated and explained.** Every property answer labels:
   - **Recorded:** copied from the roll, with the field name
   - **Calculated:** arithmetic the Navigator did, with the formula shown
   - **Explanation:** general rules, cited to S-IDs

   Show the data year, source and valuation date on every property answer. If a field is
   missing or a placeholder, say so ("I don't know: this roll doesn't include square footage").
9. **Privacy.** Don't ask for or store names, Social Security numbers, income, or
   disability details. If a user shares them, don't repeat them back. Don't display owner
   names even though the roll has them.
10. **Stay neutral** on politics, the Assessor's performance, and ballot measures. Present
   documented views with sources.
11. **AI-written text is checked, labeled and optional.** An AI explanation may only restate the knowledge base and
   the selected record. Before it's shown, code checks that every number in it appears in that material, every
   [S#] it cites was given to it (at least one, unless it says "I don't know"), and it has no advice wording. It is
   labeled "AI explanation · Claude", and the deterministic answer with its recorded / calculated / explanation
   blocks is always shown underneath. If the check fails, show only the deterministic answer.

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
- Sources: S1, S11, S12, S17, S18, S19, S27, S30, S33, S34, S35
- Top questions:
  1. *How is my property tax bill calculated?*
  2. *What is a mill / millage rate?*
  3. *When is my tax bill due, and who do I pay?*

### 5.3 Exemptions owners can claim
- Content: homestead ($75,000 FMV / $7,500 AV, own and occupy by Dec. 31, in-person
  filing, documents, permanent once granted); SAL freeze; disabled veteran tiers; first
  responder; the Nov. 3, 2026 amendment results (unofficial).
- Sources: S1, S2, S3, S7, S8, S9, S20, S24, S36, S37
- Top questions:
  1. *How do I apply for the homestead exemption, and what do I bring?*
  2. *I'm over 65. Can my assessment be frozen?*
  3. *Do I have to reapply every year?*

### 5.4 What the 2027 reassessment means for owners
- Content: the four-year cycle (2024–27 values as of Jan. 1, 2023) and the reappraisal during 2027 for the 2028
  roll; what the 2027 roll shows (98% of values unchanged, millage up, median home +$25); 2024 comparison (~20%);
  rollback and roll-forward, including the Council's Nov. 5 partial roll-forward (4.039 mills); there is no 10% cap
  (2022 amendment failed); what to check before the summer 2027 open-roll period.
- Sources: S1, S4, S11, S19, S23, S26, S31, S32, S33
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

**Current files** (static site, no build step, no API key; served by GitHub Pages from this repo, and published as a
Claude artifact with the `sample` capability so it can ask Claude):

```
nola-assessment-navigator/
  CLAUDE.md          ← this file
  README.md          ← project overview, live link
  index.html         ← one chat: property search + questions
  kb.js              ← Layer 1 knowledge base: SOURCES (S1–S39) + ENTRIES (answers, keywords, source IDs)
  app.js             ← retrieval, guardrails, lookup flow, combining the layers, rendering
  address.js         ← address normalizer + matcher (browser and Node)
  lookup.js          ← loads data/web/2026 files, finds parcels by address or parcel ID
  property.js        ← Layers 2–3: answers about the selected parcel (recorded / calculated / explanation)
  ai.js              ← optional AI explanation (Claude via the claude.ai runtime) + its validator
  style.css
  pipeline/          ← eda.py, data_dictionary.py, ltc_roll.py, compare_rolls.py, export_web.py, shard.js,
                       area_stats.py, census_bg.py, compare_years.py, fetch_acs.py, geocode_sample.py,
                       build_report.py, report_pdf.js, build_standalone.py
  tests/             ← address.test.js, address_eval.js (19 addresses), chatbot_eval.js (10 Part 2 questions),
                       property_sweep.js (all parcels), final_eval.js (29 end-to-end checks), expected_from_raw.py
  data/              ← raw/ (ignored), processed/ (ignored), web/ (ignored, generated), outside/, README.md
  docs/              ← final-draft-summary.md (1-page summary), week2-report.md (+ PDF), data-dictionary.md,
                       address-matching-results.md, year-comparison.md, outside-data.md, outside-data-matching.md,
                       eda/, sample-questions.md, verification-checklist.md, screenshots/
```

**How Layer 1 works:** `app.js` scores the question against each `kb.js` entry: +1 per
keyword, +2 per `core` subject word, +3 per phrase. Guardrails run first: personal data,
advice requests, property lookups, and other parishes. After an advice or lookup
refusal, the matching general entry is still shown. Below a score threshold, the bot says
"I don't know" and gives contacts. Misspelled words are read as the closest knowledge-base word ("homstead" →
"homestead"). If the question uses a word the knowledge base never
mentions (e.g. "installments"), the bot says it doesn't know about that term **before**
showing the closest entry, so it never silently answers a different question. Deadline
and bill dates are computed from today's date and the `APPEAL_WINDOWS` table in
`app.js`; add each new roll there when the Assessor announces it. Every entry **must**
list at least one source ID. A check in `app.js` refuses to render an entry without one.

**How Layer 2 works:**
1. **Find.** The owner types an address or a parcel ID, in the Find box or inside a question ("What's the tax on 2216
   Claiborne Ave?"). `lookup.js` normalizes it with `address.js`, loads only the file for that street (plus close
   spellings if the street isn't found), and returns one of four results: exact, multiple, close (typo, missing unit,
   ½ address), or not found with a reason. Parcel IDs, including those with letters, are checked against `ids.json`.
2. **Confirm.** The owner picks the record ("Is this your property?"). Each candidate list remembers its own records.
3. **Answer.** `property.js` matches the question to one of 20 intents and builds a recorded / calculated /
   explanation answer from that record:
   - value, assessed (10% and 15% rules), taxable, tax (leads with the next bill: the 2027 roll, plus the Nov. 5
     roll-forward as a calculated range), homestead, freeze, veteran, all exemptions
   - 2026 → 2027 change, naming every cause the record shows (homestead removed, exempt status, value, millage)
   - Layer 3 "area" (distribution of similar parcels in the roll's Subdivision; ward or city when too few)
   - "place": roll location, a map link, and the census block group profile (ACS), with the neighborhood caution
   - building size (not in the roll), year built, last transfer (incl. a newer 2027 one), owner (not shown),
     property type, parcel number, special districts (not in the roll), "my value is wrong" (with appeal status)
4. **Together.** Questions that start like "how do I…", "where…" or "when will…" go to Layer 1 even with a property
   selected, and the answer adds a "Your property" panel with what the record shows on that topic
   (`NolaProperty.context`). A property question asked before a lookup is answered right after the pick.
   Guardrails (privacy, out-of-scope, other parishes, advice) run first, with or without a property.

**How the AI explanation works (`ai.js`):** on claude.ai, the page asks Claude through the artifact runtime's
`sample` capability; the API key never touches the page. The prompt holds §4's rules, today's date, the appeal
status, the whole knowledge base as text, the selected record's facts (`NolaProperty.facts`, every line tagged with
its roll and source) and the last three exchanges. `validate()` then rejects any answer with a number not in that
material, an unknown [S#], no citation (unless it says "I don't know") or advice wording; rejected answers aren't
shown. Tested with a mocked runtime (`tests/final_eval.js`) and by having a model answer eight captured real prompts:
all eight passed validation. Elsewhere (GitHub Pages, the single-file copy) there's no runtime and the page works
exactly as before.

**Tests to run before committing** (server: `python3 -m http.server 8765` in this folder):
- `node tests/address.test.js`: address normalizer unit tests
- `node tests/address_eval.js`: 19 real addresses (19/19)
- `node tests/chatbot_eval.js`: the 10 Part 2 property questions, checked against the raw files (10/10)
- `node tests/property_sweep.js`: 21 question types × 305 sampled parcels, plus 5 data-heavy questions × **every**
  parcel (about 822,000 answers); must report 0 problems
- `node tests/final_eval.js`: 29 end-to-end browser checks (demo trio, combined flows, guardrails, AI mock, phone)

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

## 7. Live prototype (final draft, Layers 1–3)

- **Live link:** https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB. This is a Claude artifact, private until the owner
  shares it from the page's Share menu. Published with the `sample` capability, so viewers signed in to claude.ai get
  the AI explanation (they're asked once to allow it).
- **Offline copy:** `python3 pipeline/build_standalone.py <out.html>` inlines the CSS, the six scripts and every
  `data/web/2026` file (gzip + base64), so the page opens by double-click with no server. `app.js` uses
  `window.NOLA_LOAD` when it exists and `fetch` otherwise. The output is generated: don't commit it.
- **Repo copy:** `nola-assessment-navigator/index.html`. Once this branch merges to `main`, GitHub Pages serves it
  at `<pages-site>/nola-assessment-navigator/`.
- **Demo script (Nov. 16):** general: "How do I apply for the homestead exemption?"; lookup: "1205 St. Charles Ave,
  Apt 607" → "How much tax will I pay?" → "How do I apply for the homestead exemption?" (shows the record panel);
  refuse / hand off: "Should I appeal my assessment?"
- **To rebuild the artifact:** inline `style.css`, `kb.js`, `address.js`, `lookup.js`, `property.js`, `ai.js` and
  `app.js` into one HTML file, publish the files in `data/web/2026/` alongside it at the same relative paths, and
  republish to the same URL with `capabilities: {sample: {}}`.

## 8. Sample questions and known gaps

Full write-up and screenshots: `docs/sample-questions.md`, `docs/screenshots/` (version 1 failures in
`docs/screenshots/v1/`).

| # | Question | Version 1 (Oct. 19) | Version 2 (Oct. 21) | Version 3 (Nov. 13, final draft) |
|---|---|---|---|---|
| 1 | How is my property tax bill calculated? | ✅ Formula + $300,000 worked example, caveats, 5 sources | ✅ Same (but 121.20 mills, unverified) | ✅ 131.99 mills from the state roll files, $3,056.10, police/fire exception |
| 2 | How do I apply for the homestead exemption? | ✅ Amount, eligibility, in-person filing, documents, 5 sources | ✅ Same | ✅ Same, plus a "Your property" panel when a property is selected |
| 3 | What does the 2027 reassessment mean for me? | ⚠️ Correct and date-aware, but leans on secondary sources | ⚠️ Same | ✅ Official source [S32]: 2024–27 values as of 1/1/2023; reappraisal during 2027 for the 2028 roll |
| 4 | Should I appeal? My house is worth less than what the Assessor says. | ⚠️ Refused advice but left out the appeal steps it promised | ✅ Refuses advice, then shows appeal steps, status and contacts | ✅ Same, also with a property selected |
| 5 | Can I pay my property taxes in installments? | ❌ Answered with due dates instead of "I don't know" | ⚠️ Says "I don't know about installments" first, then the closest topic | ✅ Sourced answer: no formal plan, partial payments in person or by mail, 1%/month [S34] |

**Week 2 (Nov. 2):** ten property-grounded test questions, all checked against the raw CSV, are in
`docs/week2-report.md` §5 (`node tests/chatbot_eval.js`, 10/10 pass). Three answers needed fixes first: the exempt
parcel's $0 wasn't explained, "Who owns…" went to the general contacts answer, and N/S Claiborne wasn't ranked.

**Final draft (Nov. 13):** an outside QA pass (695 interactions) found real defects, all fixed and now under test:
- tax changes blamed on millage when the homestead was removed (4,043 parcels) or exempt status changed
- an older candidate list selecting the wrong record
- parcel IDs with letters not found (46% of parcels)
- the next bill shown from the 2026 roll instead of 2027
- guardrails skipped once a property was selected
- $0 placeholder values presented as facts
- the wrong assessment ratio for non-residential buildings
- the $178 roll-forward estimate attributed to the wrong millage
Sample questions 1, 3 and 5 above were re-run (`docs/sample-questions.md`, version 3): Q1 now uses the verified
131.99 mills; Q3 explains the four-year cycle from an official source [S32]; Q5 has a sourced answer [S34].

**Still open:** the 2027 bill due date and final millages (not announced); official sources for heirs' paperwork;
the Assessor's pages (S4–S10) re-checked in a browser; certification of the Nov. 3 results; Layer 3 is
distribution-only by design (no "fair value" estimates, data rule 6).
