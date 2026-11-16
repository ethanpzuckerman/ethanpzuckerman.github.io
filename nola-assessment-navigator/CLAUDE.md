# CLAUDE.md: NOLA Assessment Navigator

Read this file before every task in `nola-assessment-navigator/`. It holds the project's
purpose, the domain facts the code depends on, the data notes, and the rules the chatbot
has to follow. If a task conflicts with a rule in **Section 4 (Chatbot rules)**, the rule
wins. Stop and ask instead of breaking it.

*First researched Oct. 19, 2026. Data section added Nov. 2, 2026. **Re-verified Nov. 13 and 16, 2026** for the
final draft and in response to instructor feedback (§9): the millage table, the reappraisal cycle, the freeze rules,
the audit findings, the Nov. 3 election, the City's 2027 roll-forward, bill dates, payment plans and veteran tiers
were read directly from the official sources in §2.9. Facts that change every year (dates, millage, income limits)
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
| 1 | **General guidance** | "How does this work?": FMV vs. assessed value, millage, exemptions, appeals, deadlines, payment, the 2027 reassessment | Curated knowledge base (`kb.js`, 33 entries) built from the sources in Section 2 | **Live** |
| 2 | **My property** | "What does this mean for *my* parcel?": find and confirm a parcel, then show its values, exemptions, freeze, recorded 2026/2027 tax, the next bill, the 2026 → 2027 change, and its census neighborhood | 2026 and 2027 LTC rolls (Section 3); the course's parcel → census block group crosswalk and ACS block-group data; the 2025 roll isn't available | **Live**: lookup + 20 question types, and general answers show the selected record |
| 3 | **Market context** | "How does my parcel compare, and what has the market done?": (a) its value and 2026 → 2027 change vs. similar parcels in its area; (b) its census neighborhood; (c) Zillow's typical home value for its ZIP since the Jan. 1, 2023 valuation date; (d) the citywide sales-ratio pattern | Rolls aggregated by Subdivision × property type (`areas.json`); **outside data:** Census ACS block groups (`bg.json`) and Zillow ZHVI by ZIP (`zhvi.json`) | **Live (final)**: distributions and area figures only, never a judgment of one parcel (data rule 6) |

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
| **Taxing bodies** (City, School Board, Sewerage & Water Board, levee districts, Law Enforcement District, etc.) | Each sets its own millage; a roll-forward takes a two-thirds vote at a public meeting [S11][S15]. |

### 2.2 Fair market value (FMV) and how the Assessor sets it

- The Louisiana Constitution requires property to be valued at **fair market value**:
  roughly what it would sell for between a willing buyer and a willing seller [S1].
- All property must be **reappraised at intervals of not more than four years** [S1 §18(F)].
- The OPAO values property by **mass appraisal**: a model estimates values from sales of similar properties,
  property features (building area, land area, condition, grade) and neighborhood [S15]. The Assessor's 2021 flyer
  describes the process and the sales-comparison, cost and income approaches [S10] (not re-read since October: the
  Assessor's site blocks automated access).
- **Valuation date:** property is valued as of **Jan. 1, 2023 for tax years 2024 through 2027** (and Jan. 1, 2019 for
  2020–2023). Between reappraisals the Assessor can update a parcel for a transfer, construction, demolition,
  deterioration or remodeling [S15][S32].
- **The Legislative Auditor's review of the 2024 reappraisal** (Dec. 2023; read directly Nov. 16) [S15]:
  - Assessments "were not in the aggregate too high or too low." Median sales ratio 91.6%–97.3% (accepted 90–110%);
    coefficient of dispersion 6.0%–17.6% (accepted 5–20%), depending on the sample.
  - OPAO "likely used the LTC-prohibited practice of sales chasing": **3,803** single- and two-family homes
    potentially sales chased, valued 13.3% higher than similar unsold homes, about $611 in extra tax each.
  - OPAO disagreed, saying a verified arm's-length sale is the best indicator of value.
  - Single- and two-family appraised value grew **23.2%** from the 2020 to the 2024 reappraisal.
  - BGR has raised related concerns [S26]. Present both views if this comes up. Do not take a side.
- Removed Nov. 16: "393 valuation neighborhoods" (not in the auditor's report; it came from a news story).

### 2.3 Assessed value (Louisiana Constitution Art. VII §18) [S1]

Assessed value is a fixed percentage of FMV, set by property class:

| Class | Assessment ratio |
|---|---|
| Land | 10% |
| Residential improvements (houses, condos) | 10% |
| Electric cooperative property (excluding land) | 15% |
| Public service property (excluding land) | 25% |
| Other property, including commercial buildings and business personal property | 15% |

(Table as it reads at legis.la.gov on Nov. 16, 2026.)

**Example:** a house and lot with an FMV of $300,000 has an assessed value of
**$30,000**.

### 2.4 Millage: how assessed value becomes a tax bill

- One **mill** is $1 of tax for every $1,000 of taxable assessed value (0.1%) [S11][S13].
- **Tax = (assessed value − exemptions) × (millage ÷ 1,000)**, summed over every millage that
  applies to the parcel [S11].
- **The City's 2026 millage table (official, read Nov. 16) [S11]:**
  - **TOTAL – CITYWIDE: 121.20 mills.** It includes the School Board (45.31), City Alimony (12.23), Board of
    Liquidation (14.50), Sewerage & Water Board drainage (14.26), the Law Enforcement District (2.46), libraries,
    parks, early childhood, and police and fire.
  - **Levee districts are listed separately as "special millages":** Orleans Levee District (East Bank) **10.79**;
    Algiers Levee District **10.81**. Every parcel is in one of them.
  - So the full rate is **131.99 mills on the East Bank and 132.01 in Algiers**, exactly what the state roll files
    show on every parcel [S30]. (An earlier draft of this file called 121.20 wrong. It isn't: it's the citywide
    subtotal. The mistake in Part 1 was using it as the *whole* rate and applying homestead to all of it.)
  - **Other special charges, not in the state files:** Downtown Development District 13.73 mills; Garden District
    Security District 7.13; Touro Bouligny 7.10; and neighborhood districts billed as flat fees (e.g. Broadmoor $100,
    Lakeview $150, Mid-City $195 per home, Upper Audubon $700) [S11]. The roll doesn't record which parcels are in
    them, so the chatbot says the recorded tax can be lower than the real bill.
- **Homestead doesn't reduce two kinds of levy, 11.51 mills together:** the City's table labels them "Police –
  WITHOUT applying homestead exemption" (4.67) and "Fire – WITHOUT applying homestead exemption" (4.62 and 2.22)
  [S11]. The 2026 state file names them "POLICE W/O H.E." (9.29) and "FIRE W/O H.E." (2.22) [S30]; the 2027 file
  splits them 6.84 fire and 4.67 police [S31]. Even a fully exempted home (100% disabled veteran) pays these on its
  full assessed value. Levee millage does get the homestead reduction [S30].
- **2027 roll [S31]:** citywide stays 121.20. The East Bank levee millage rises from 10.79 to **12.28**, so the East
  Bank total is **133.48**; Algiers stays 132.01. Each parcel's millage rows list every levy and its computed tax,
  so the chatbot shows the **recorded** tax, not an estimate.
- **Rollback and roll-forward.** In a reappraisal year, if assessed values rise, the Constitution automatically
  **rolls back** each millage so it raises the same total. Each taxing body may then **roll forward** by a
  two-thirds vote at a public meeting [S15].
- **2027 roll-forward (decided):** the City's proposal listed roll-forwards on 13 millages totaling about 7.44 mills
  (e.g. General Alimony 12.23 → 13.91) [S11]; Fox 8 put that at about $178 a year on a $300,000 homesteaded home
  [S19]. On **Nov. 5, 2026** the City Council unanimously approved a partial roll-forward totaling **4.039 mills**
  (about $23.3 million) [S33]. The 2027 state file (filed Sept. 4) still lists the pre-vote rates [S31], so its
  computed 2027 taxes are probably **below the actual bills**. The final rate for each millage isn't known yet. The
  Navigator shows the possible effect as a calculated range: 4.039 × taxable ÷ 1,000 to 4.039 × assessed ÷ 1,000.

**Worked example (2026 rates, East Bank) [S1][S2][S11][S30]:**

| Step | Calculation | Result |
|---|---|---|
| Fair market value | (set by Assessor) | $300,000 |
| × Residential ratio | $300,000 × 10% | $30,000 assessed value |
| − Homestead exemption | $30,000 − $7,500 | $22,500 taxable |
| × Citywide millage | $22,500 × 121.20 ÷ 1,000 | $2,727.00 |
| + Police and fire mills homestead doesn't reduce | $7,500 × 11.51 ÷ 1,000 | $86.33 |
| **Citywide subtotal** | | **$2,813.33** |
| + East Bank levee district | $22,500 × 10.79 ÷ 1,000 | $242.78 |
| **Total (131.99 mills)** | | **$3,056.10 per year** |
| Same house, no homestead | $30,000 × 131.99 ÷ 1,000 | $3,959.70 per year |

- **Homestead saves $903.60 a year** in this example ($822.68 on the citywide millages + $80.93 on the levee
  millage). Part 1 said $909, which wrongly applied homestead to the police and fire mills too.
- Checked against a real parcel. 1205 St Charles Av #607: $14,570 × 131.99 = $1,923.07, − $903.62 homestead
  reduction = **$1,019.48**, exactly the recorded tax [S30]. Special-district charges are extra.
- Line amounts are rounded to the cent; the unrounded lines sum to $3,056.10.

### 2.5 Exemptions and special assessments

| Program | What it does | Who qualifies | How to apply | Sources |
|---|---|---|---|---|
| **Homestead exemption** | Removes **$7,500 of assessed value** (= the first **$75,000 of FMV**) from state, parish and special property taxes. It doesn't reduce the police and fire millages "without applying homestead exemption" (§2.4). | Owner who **owns and occupies** the home by **Dec. 31** of the year it's claimed [S3]. One per person or married couple. With several owners, limited to the **ownership share of the owners who live there** [S2 §20(A)(6)]; the roll shows 1,358 parcels at 50% getting $3,750. | Through OPAO, City Hall Room 4E01. The Assessor's flyer (2021) and form (2024) ask for proof of ownership, a Louisiana ID showing the property address, and a current Entergy or cable bill with matching name and addresses; they say all occupying owners apply in person. **These documents couldn't be re-read (site blocks automated access), so the chatbot names their dates and tells owners to confirm the current steps, including online or appointment options.** Once granted, it stays on. | [S2][S3][S8][S9] |
| **Living in half of a double** | The law covers the home "owned and occupied" and allows one exemption per person [S2]. **Unknown:** how OPAO treats the rented half of an owner-occupied double. The roll doesn't flag doubles. The chatbot says so and refers to OPAO (kb entry `double`). | — | Ask OPAO. | [S2][S30] |
| **Special Assessment Level ("the freeze")** | Freezes the **assessed value** at the first year the owner qualifies. "Any millage rate applied to the special assessment level shall not be subject to a limitation," so the bill can still rise. | Has homestead **and** is (a) 65 or older, (b) permanently totally disabled, (c) a veteran with a service-connected disability rating of **50% or more**, or (d) military killed or missing in action or prisoner of war (family). Adjusted gross income not over **$100,000**, CPI-adjusted from tax year 2026; **$150,000 effective Jan. 1, 2027** (Acts 2025, No. 220, ratified Nov. 3, 2026), CPI-adjusted from tax year 2028. All from the Constitution's text, read Nov. 16. The exact CPI-adjusted 2026 figure isn't published there. | Signed application to the Assessor. Owners under 65 certify income each year; owners 65+ and permanently disabled owners don't. | [S1 §18(G)][S36][S7] |
| **Reappraisal phase-in** | If a reappraisal raises a homesteaded home's assessed value by **more than 50%**, the added tax is phased in over four years (¼, ½, ¾, full). Ends on sale; doesn't cover construction or improvements. | Homesteaded residential property. | Automatic (applied by the tax collector). | [S1 §18(F)(2)] |
| **Disabled veteran additional exemption** | On top of homestead: **50% to under 70%: the next $2,500 AV. 70% to under 100%: the next $4,500 AV. 100% or unemployability: the rest of the home's AV** (La. Const. Art. VII §21(K), confirmed Nov. 13). The police/fire "without homestead" levies still apply (§2.4). | Veteran with a VA service-connected rating of 50% or more. A surviving spouse who keeps owning and occupying the home keeps it; **Amendment 1 (passed Nov. 3, 2026)** lets the spouse move it to a new home once [S36]. | OPAO, with VA rating letter and homestead documents. | [S37][S7][S36] |
| **First responder additional exemption** | About **+$25,000 of FMV** (+$2,500 AV) on a homestead. | Qualifying first responders. | OPAO, with an employment verification letter on agency letterhead. | [S7] |
| **Heirs and surviving spouses** | A surviving spouse who keeps living in the home keeps the exemption (as owner, usufructuary, or through a qualifying trust) [S2 §20(A)(2)]. Heirs who live in the home get the exemption on their ownership share [S2 §20(A)(6)]. | Surviving spouse, or heirs who occupy the home. | Contact OPAO. A **succession** may be needed if title isn't in the heir's name [S28]. The chatbot says it doesn't know what OPAO requires before a judgment of possession. | [S2][S28][S29] |
| **Other** (nonprofit or religious use, Restoration Tax Abatement, ITEP, etc.) | Varies. | Mostly non-homestead property. | Out of scope for Layer 1. Say "I don't know the details" and refer to OPAO. | — |

**November 3, 2026 election results (unofficial; re-check certification at sos.la.gov)** [S36][S20]:
- **Amendment 1, passed (~75%):** a disabled veteran's surviving spouse can move the exemption to a new home once.
- **Amendment 6, passed (~65%):** cities and parishes *may* give owners 65+ extra relief with local approval. It
  does nothing in New Orleans unless the City adopts it; no such step found as of Nov. 13.
- **Amendment 9, passed (~60%):** SAL income limit raised to $150,000 effective Jan. 1, 2027; CPI indexing from tax
  year 2028 (the Constitution's text and effective-date note confirm this [S1]).
- **Amendment 2, failed:** keep lower millages after a reassessment without losing the right to raise them.
- **Amendment 10, failed:** local-option exemption for rehabilitated blighted property.
The chatbot reports these as unofficial results, gives no opinion, and says it doesn't know exact effective dates.

**History worth knowing:** a 2022 amendment that would have capped yearly assessment
increases on Orleans homesteads at 10% **failed** narrowly (642,462 no to 635,559 yes)
[S23]. Owners sometimes believe there is a yearly cap. There is not. The two rules that do limit increases are the
SAL freeze and the four-year phase-in for increases over 50% (table above) [S1].

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

**Established (two official sources, read directly):**
- Louisiana reappraises all property at intervals of not more than four years [S1 §18(F)].
- **Tax year 2024 was the reappraisal year.** The Legislative Auditor: "Tax year 2024 is a reappraisal year, which
  means that the valuation date advances to January 1, 2023, for the next four-year cycle," and property is valued
  as of "January 1, 2019 for tax years 2020 through 2023 or January 1, 2023 for tax years 2024 through 2027" [S15].
  The City Council said the same in July 2023 [S32].
- **So the 2027 roll is not a parish-wide reappraisal, and the cycle did not move from 2028 to 2027.** The notice
  opening the 2027 roll for inspection [S4] is the yearly open-roll notice, nothing more. Part 1 of this file
  claimed otherwise; that claim is withdrawn.
- **The data agrees:** every parcel in the 2026 and 2027 rolls is dated 01/01/2023, and the 2027 roll filed on
  Sept. 4, 2026 keeps **98% of parcels at their 2026 market value** [S31] (`docs/year-comparison.md`). Between
  reappraisals the Assessor can still update a parcel for a transfer, construction, demolition, deterioration or
  remodeling [S15], which fits the 2% that changed.

**Inferred (labeled as such in every answer):**
- The four-year pattern (2020, 2024) points to **tax year 2028** as the next reappraisal year, valued as of
  Jan. 1, 2027. On that reading, "the 2027 reassessment" in this project's brief is the reappraisal work done during
  2027, appearing on the 2028 roll (inspection in summer 2027, bills in early 2028). No official announcement of the
  2028 schedule was found. The chatbot says "I'm inferring that from the cycle… please confirm with the Assessor."

**The 2027 roll in numbers** (the 162,940 parcels in both rolls): total market value $75.54B → $76.55B. The citywide
millage is unchanged at 121.20; the East Bank total goes 131.99 → 133.48 because the levee millage rises from 10.79
to 12.28. Median home's computed tax +$25; median homesteaded home $1,965 → $2,032 [S30][S31]. The Council's Nov. 5
roll-forward (4.039 mills, §2.4) comes on top [S33].

**What owners should take from it:** (1) values can change in the next reappraisal even if the owner changes
nothing; (2) in a reappraisal year each millage is rolled back, so bills don't rise by the same percent, but taxing
bodies may roll forward [S15]; a homestead whose assessed value jumps more than 50% gets a four-year phase-in [S1];
(3) the summer 2027 open-roll period is when to check a new value and appeal; the window for the 2027 roll **closed
Aug. 20, 2026** [S4]; (4) make sure homestead or SAL is on file before then.

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
| S11 | City of New Orleans Treasury, "Millages: How Taxes are Calculated" (2026 millage table: 121.20 citywide, levee and special districts, 2027 roll-forward proposal) | https://nola.gov/next/treasury/topics/how-taxes-are-calculated/ |
| S12 | City of New Orleans Treasury, FAQ | https://nola.gov/next/treasury/topics/faq/ |
| S13 | New Orleans City Council, "Property Tax Assessments and Appeals" | https://council.nola.gov/resources/property-tax-assessments-and-appeals/ |
| S14 | La. Admin. Code tit. 61 §V-3103, Appeals to the LTC | https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-61-SS-V-3103 |
| S15 | La. Legislative Auditor, "Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor" (Dec. 2023) | https://lla.la.gov/publicreports.nsf/0/f74bf8c6ffebdf7f86258a8d00657f6c/$file/000037d0b.pdf |
| S16 | *(retired Nov. 16: replaced by the auditor's own report, S15)* The Center Square, "Audit: Orleans Parish used prohibited 'sales chasing'…" | https://www.thecentersquare.com/louisiana/article_29aad166-a5cc-11ee-97ed-8324ed068b6d.html |
| S17 | BGR, "About Your Property Taxes" | https://www.bgr.org/about-your-property-taxes/ |
| S18 | BGR, "2026 Property Tax Dashboard" | https://www.bgr.org/report-index/2026-property-tax-dashboard-update/ |
| S19 | Fox 8, "New Orleans property owners could pay more under proposed 2027 tax increase" (Sept. 28, 2026) | https://www.fox8live.com/2026/09/28/new-orleans-property-owners-could-pay-more-under-proposed-2027-tax-increase/ |
| S20 | PAR Louisiana, Guide to the Fall 2026 Constitutional Amendments | https://parlouisiana.org/wp-content/uploads/2026/10/PAR-Guide-to-the-Fall-2026-Constitutional-Amendments-FINAL.pdf |
| S21 | Verite News, assessor race guide / Williams fifth term | https://veritenews.org/guides/2025-new-orleans-election-guide/assessor-race/ |
| S22 | Biz New Orleans, "2025 Assessment Rolls Open July 15 to Aug. 15" | https://bizneworleans.com/2025-assessment-rolls-open-july-15-to-aug-15/ |
| S23 | USA Today Network via Yahoo, "Louisiana voters changed the state Constitution Tuesday" (Nov. 2022) | https://news.yahoo.com/louisiana-voters-changed-state-constitution-142759103.html |
| S24 | *(retired Nov. 16: replaced by the Constitution's text, S1 §18(G))* AARP Foundation, Louisiana property tax relief | https://my.aarpfoundation.org/property-taxes/taxpayer-states/louisiana/ |
| S25 | *(retired Nov. 13: replaced by the Constitution's text, S37)* Jefferson Parish Assessor, Homestead Exemption | https://www.jpassessor.net/Resources/HomesteadExemption |
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
| S40 | Zillow Research, Zillow Home Value Index (ZHVI) by ZIP code, monthly through Sept. 2026 (course Box folder "Zillow"; a private company's estimate, tagged secondary) | https://www.zillow.com/research/data/ |
| S41 | U.S. Census Bureau, 2020 ZIP Code Tabulation Area ↔ census tract relationship file | https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html |

**How to rank sources:** official government sources (S1–S15, S27, S30–S32, S34–S35, S37–S39, S41) outrank everything
else. Use news, nonprofit, legal-aid and private-data sources (S17–S23, S26, S28–S29, S33, S36, S40) for context, or when no official
source exists; the chatbot tags them "secondary." S16, S24 and S25 are retired: no answer cites them. Label
them as such in answers. Never cite commercial "property tax appeal" sites or
data-aggregator sites. During research they gave dates that contradicted the Assessor.

> **Verification log.** Read directly (page text opened and quoted, not search snippets):
> - Nov. 16, 2026: S1 (§18 ratios, reappraisal, phase-in, special assessment level and its effective-date notes),
>   S2 (§20), S3, S11 (2026 millage table), S15 (auditor's report, all 44 pages).
> - Nov. 13, 2026: S19, S32, S33, S34, S35, S36, S37. Roll data: S30, S31 (the files themselves).
> - **Not re-read since October: S4–S10 (nolaassessor.com).** The site refuses automated access, and I did not work
>   around that. Claims that rest only on those pages are dated in the chatbot's answers ("the Assessor's 2021
>   flyer…") and tell the owner to confirm. A person should open them in a browser before the final submission.
> - **Still open:** the 2026-roll BOR date (Aug. 18 vs. 20, 2025), the 2027 bill due date and final 2027 millages,
>   the official 2028 reappraisal schedule, the CPI-adjusted 2026 freeze income limit, how OPAO applies homestead to
>   a double, heirs' paperwork, and certification of the Nov. 3 results. The chatbot says "I don't know" or "please
>   confirm" on each of these.

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

**Outside data used for Layer 3 (final):**

| File | What it is | How it joins | Status |
|---|---|---|---|
| `data/raw/box/Zip_zhvi_…_month.csv` (course Box "Zillow", 124 MB) → `data/outside/zillow_zhvi_orleans_zips.csv` | Zillow Home Value Index, typical home value by ZIP, monthly 2000 – Sept. 2026; 17 Orleans ZIPs | parcel ID → block group (crosswalk) → census tract → the ZIP covering most of the tract's land (Census relationship file, `data/outside/zcta_tract_orleans.csv`) | **Used** (`pipeline/zillow_zip.py` → `zhvi.json`). 86% of parcels get a ZIP; 17 of 183 tracts are split, and the answer says so |
| Census ACS block groups (above) | Neighborhood profile | parcel ID → block group | **Used** (`bg.json`) |
| Course Box "Spatial": Spatial.ai *Proximity* and *PersonaLive* | Social-media "affinity" scores and consumer personas by block group (e.g. lifestyle and culture segments) | Would join cleanly by block group | **Evaluated and rejected.** It profiles residents' lifestyles, has nothing to do with value or tax, and would break data rule 7. Documented in `docs/outside-data.md` |

**Finding from the Zillow data:** typical home values are **lower in Sept. 2026 than in Jan. 2023 in all 17 Orleans
ZIP codes**, from −5.3% (70124) to −27.1% (70113), middle −13.4%. The roll still carries Jan. 1, 2023 values through
tax year 2027 [S15]. The chatbot reports this as market context for a ZIP and never as evidence about one home.

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
   Then `python3 pipeline/zillow_zip.py` (Zillow ZIP trends → `zhvi.json`). `shard.js` clears the folder, so the
   steps after it must be re-run.
   - Each parcel also gets its census block group and coordinates from the course crosswalk, when matched.
   - Owner names, mailing addresses and purchase prices are dropped.
   - Placeholders (1994 year built on non-residential parcels, 12/31/1994 transfer dates) are removed.
   - `data/web/2026/` **is committed** (public fields only), so GitHub Pages can serve the chatbot with no sign-in.
     Re-run this step and commit the result whenever the data changes. `data/processed/` and `data/raw/` stay
     git-ignored.
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
10. **Hand off with a note.** Every answer that shows contacts offers "Prepare a note to hand this to a person": the
   right office for the question, plus a copyable note (question, property, what the Navigator said, date). Nothing
   is sent automatically; the note tells the owner not to add private details. Never promise a response time.
11. **Stay neutral** on politics, the Assessor's performance, and ballot measures. Present
   documented views with sources.
12. **AI-written text is checked, labeled and optional.** An AI explanation may only restate the knowledge base and
   the selected record. Before it's shown, code checks that every number in it appears in that material, every
   [S#] it cites was given to it (at least one, unless it says "I don't know"), and it has no advice wording. It is
   labeled "AI explanation · Claude", and the deterministic answer with its recorded / calculated / explanation
   blocks is always shown underneath. If the check fails, show only the deterministic answer.

---

## 5. Public education outline (City of New Orleans)

Each topic lists its sources and the 2–3 questions owners ask most. Every one of these
questions must have a knowledge-base entry in `kb.js`.

### 5.1 How property values are set
- Content: FMV definition; mass appraisal from sales, property features and neighborhood; the four-year cycle and
  the Jan. 1, 2023 valuation date; what can change a value between reappraisals; the LLA audit (both views); how to
  check your property's features.
- Sources: S1, S10, S15, S26, S32
- Top questions:
  1. *How does the Assessor decide what my house is worth?*
  2. *Did someone come inspect my house? Why did my value go up when I didn't change anything?*
  3. *Is my assessed value the same as what I could sell it for?*

### 5.2 From assessed value and millage to a tax bill (worked example)
- Content: ratios (10% / 15% / 25%), what a mill is, the formula, the $300,000 example in §2.4 (121.20 citywide +
  10.79 levee; police and fire mills without homestead), rollback and roll-forward, special districts and their
  rates, who mails bills and when they're due, payment plans.
- Sources: S1, S2, S11, S12, S13, S15, S18, S19, S27, S30, S31, S33, S34, S35
- Top questions:
  1. *How is my property tax bill calculated?*
  2. *What is a mill / millage rate?*
  3. *When is my tax bill due, and who do I pay?*

### 5.3 Exemptions owners can claim
- Content: homestead ($75,000 FMV / $7,500 AV, own and occupy by Dec. 31, documents, permanent once granted,
  ownership-share rule); living in half of a double; SAL freeze and its income limit; disabled veteran tiers; first
  responder; the Nov. 3, 2026 amendment results (unofficial).
- Sources: S1, S2, S3, S7, S8, S9, S20, S30, S36, S37
- Top questions:
  1. *How do I apply for the homestead exemption, and what do I bring?*
  2. *I'm over 65. Can my assessment be frozen?*
  3. *Do I have to reapply every year?*
  4. *I live in half of a double. Do I get the homestead exemption?* (added after Part 1 testing showed the bot
     couldn't answer it)

### 5.4 What the 2027 reassessment means for owners
- Content: the four-year cycle (2024–27 values as of Jan. 1, 2023) and why the 2027 roll is not a reappraisal; the
  next reappraisal year (2028, inferred); what the 2027 roll shows (98% of values unchanged, East Bank levee millage
  up, median home +$25); the 2024 reappraisal (+23.2% for homes); rollback and roll-forward, including the Council's
  Nov. 5 partial roll-forward (4.039 mills); no yearly cap (2022 amendment failed), but a four-year phase-in for
  increases over 50%; what to check before the summer 2027 open-roll period.
- Sources: S1, S4, S11, S15, S23, S30, S31, S32, S33
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
  tester.html        ← 15-minute test script and feedback form for outside testers
  style.css
  pipeline/          ← eda.py, data_dictionary.py, ltc_roll.py, compare_rolls.py, export_web.py, shard.js,
                       area_stats.py, census_bg.py, zillow_zip.py, compare_years.py, fetch_acs.py, geocode_sample.py,
                       build_report.py, report_pdf.js, build_standalone.py
  tests/             ← address.test.js, address_eval.js (19 addresses), chatbot_eval.js (10 Part 2 questions),
                       property_sweep.js (all parcels), final_eval.js (29 end-to-end checks), test_log.js (writes
                       docs/chatbot-test-log.md with every complete answer), owner_questions.js + owner_report.py
                       (the 25-question final test set → docs/test-set-25.md), expected_from_raw.py
  data/              ← raw/ (ignored: owner names), processed/ (ignored), web/2026/ (committed: public fields,
                       served to the browser), outside/, README.md
  docs/              ← test-set-25.md, human-backup-and-user-testing.md, reflection-paper.md, oral-exam-prep.md
                       (final submission); final-draft-summary.md (1-page summary), chatbot-test-log.md (complete answers and
                       screenshots), week2-report.md (+ PDF), data-dictionary.md,
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
   - Layer 3 "market": Zillow's typical home value for the parcel's ZIP, Jan. 2023 vs. now, with the caution that
     roll values stay at Jan. 1, 2023 and that it describes the ZIP, not the home
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
- `node tests/final_eval.js`: 32 end-to-end browser checks (demo trio, combined flows, guardrails, AI mock, phone)
- `node tests/owner_questions.js`: the 25 real-world owner questions (25/25); then `python3 tests/owner_report.py`

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

- **Public link, no sign-in (use this one for grading):** https://ethanpzuckerman.github.io/nola-assessment-navigator/
  It is served by GitHub Pages from this repo's `main` branch: the same `index.html`, scripts and `data/web/2026/`
  files as in this folder. It goes live when this branch is merged to `main`. It runs the checked, deterministic
  answers (Layers 1–3). Anyone can test every answer and click every citation.
- **Claude artifact (adds the optional AI explanation):** https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB
  Viewers must be signed in to claude.ai, and the owner has to share it from the page's Share menu. Part 1's grader
  couldn't open it for that reason, so it is no longer the link of record. Published with the `sample` capability.
- **Offline copy:** `python3 pipeline/build_standalone.py <out.html>` inlines the CSS, the six scripts and every
  `data/web/2026` file (gzip + base64), so the page opens by double-click with no server. `app.js` uses
  `window.NOLA_LOAD` when it exists and `fetch` otherwise. The output is generated: don't commit it.
- **Complete test evidence:** `docs/chatbot-test-log.md` holds every test question with the chatbot's full answer,
  word for word, and a screenshot (regenerate with `node tests/chatbot_eval.js && node tests/test_log.js`).
- **Demo script (Nov. 16):** general: "How do I apply for the homestead exemption?"; lookup: "1205 St. Charles Ave,
  Apt 607" → "How much tax will I pay?" → "How do I apply for the homestead exemption?" (shows the record panel);
  refuse / hand off: "Should I appeal my assessment?"
- **To rebuild the artifact:** `python3 pipeline/build_artifact.py <out.html>`, publish the files in `data/web/2026/`
  alongside it at the same relative paths, and republish to the same URL with `capabilities: {sample: {}}`.

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

---

## 9. Instructor feedback and how it was resolved (Nov. 16, 2026)

Feedback on Parts 1 and 2 is kept here so the agent doesn't reintroduce a corrected claim.

| Feedback | What was wrong | Resolution | Where |
|---|---|---|---|
| **The tax example understates the bill.** 121.20 mills is the citywide rate, levee and district charges are additional, and 11.51 police/fire mills get no homestead treatment. Citywide subtotal ≈ $2,813.33, not $2,727; the $909 homestead savings is overstated. | Part 1 used 121.20 as the whole rate and applied homestead to all of it. A later draft over-corrected by calling 121.20 "wrong." | Read the City's 2026 millage table: 121.20 citywide + 10.79 East Bank levee (10.81 Algiers) = 131.99 (132.01), matching the state roll files. The example now shows $2,727.00 + $86.33 = **$2,813.33 citywide**, + $242.78 levee = **$3,056.10**; homestead saves **$903.60** ($822.68 citywide). Special-district rates listed. | §2.4; `kb.js` `bill-calc`, `mill`, `special-districts` |
| **The 2027 reappraisal claim isn't established.** An open-roll notice doesn't prove a parish-wide reappraisal; resolve it before teaching that the cycle moved from 2028 to 2027. | Part 1 inferred a 2027 reappraisal from the open-roll notice and news stories. | Withdrawn. The Legislative Auditor and the City Council both state values are as of Jan. 1, 2023 for tax years 2024–2027; the 2027 roll data confirms it (98% unchanged). The next reappraisal year (2028) is labeled as an inference. | §2.7; `kb.js` `why-2027`, `how-value-set`, `value-up-no-change` |
| **The chatbot can't be independently verified** (sign-in required). | The only link was a private Claude artifact. | The site and its data are in the repo for GitHub Pages: a public link with no sign-in. | §7 |
| **Provide complete test evidence**, not summaries. | `docs/sample-questions.md` summarized the answers. | `docs/chatbot-test-log.md`: every test question with the complete answer text and a screenshot (6 general, 10 property, 5-step demo). | `tests/test_log.js` |
| **Fix known errors before submission**: unverified rates, older application instructions, weak citations still in the source of truth. | The reflection listed them but §2 and `kb.js` still carried them. | Rates: verified (above). Citations: the freeze now cites the Constitution (not AARP), the audit cites the auditor's report (not a news story), veterans cite the Constitution (not another parish); S16, S24, S25 retired; unverifiable "393 neighborhoods" and "$102,700" removed. Application instructions: the Assessor's site blocks automated reading, so the answer now dates its sources (2021 flyer, 2024 form) and tells owners to confirm; this is the one item a person still has to check in a browser. | §2.2, §2.5, §2.9; `docs/verification-checklist.md` |
| **The bot couldn't answer "I live in half of a double."** (noted as a candid weakness) | No entry. | New `double` entry: what the Constitution says, what the roll shows about ownership shares, and a plain "I don't know" on how the rented half is treated, with the Assessor's contact. | `kb.js` `double`; §2.5; §5.3 |
| **Part 2: attach the charts, full data dictionary, address-match results and chatbot test log.** | The submission had notes only. | Attachments built from `docs/`: the Part 2 report PDF (charts, dictionary, address results, screenshots), plus the test log, data dictionary and address-match results as separate PDFs, and the chart images. | `docs/`, `pipeline/build_report.py` |

**Rules that follow from this feedback** (in addition to §4):
- Never present 121.20 as the full rate, and never apply homestead to the police and fire mills.
- Never call the 2027 roll a reappraisal. Say what is established (2024–27 cycle) and label the 2028 timing as inferred.
- A claim that rests on a page nobody could re-read gets its source's date in the answer and a "please confirm."
- Test evidence means the complete answer. Regenerate `docs/chatbot-test-log.md` after any change to `kb.js`,
  `property.js` or `app.js`.

---

## 10. Final submission (Dec. 1, 2026): what was added and where

| Requirement | Where | Status |
|---|---|---|
| 1. Layer 3 from outside data + final CLAUDE.md | Zillow ZIP trends (`pipeline/zillow_zip.py`, `property.js` "market", `kb.js` `market-trend`), citywide sales-ratio answer (`kb.js` `sales-ratio`), census neighborhood and area comparison (already live); this file | Done |
| 2. Test set: 25 real-world owner questions | `tests/owner_questions.js`, `docs/test-set-25.md`: expected answers written first; first run 19/25 fully correct, 25/25 after six fixes | Done |
| 3. Human backup plan and user testing (2 pages) | `docs/human-backup-and-user-testing.md`; hand-off note in the app (`app.js` `handoffHtml`); `tester.html` | Plan and tools done. **The five outside testers' results must be filled in by the owner: never invent them** |
| 4. Reflection paper | `docs/reflection-paper.md` | Draft from the project record. The owner edits it into their own words and adds the demo feedback and tester findings |
| 5. OralExam.ai interview | `docs/oral-exam-prep.md` | The owner does the interview |

**Added from instructor comments in class (Nov. 4 and 9 recordings):** address suggestions while typing; a
downloadable property summary; the census and Zillow data from the course folder; plain-language cautions on every
market answer.

**Rules that follow:**
- Tester results, demo feedback and anything else that only the owner experienced are never written by the agent.
- After changing `kb.js` or `property.js`, re-run `tests/owner_questions.js` and regenerate `docs/test-set-25.md`.
- Market figures (Zillow, census, area) are shown with their source and date and never used to say a value is
  right or wrong.
