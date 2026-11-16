/* NOLA Assessment Navigator — Layer 1 knowledge base.
   Every fact here must trace to an ID in SOURCES (mirrors CLAUDE.md §2.9).
   {{APPEAL_STATUS}} is filled in by app.js based on today's date. */

const SOURCES = {
  S1:  { label: "La. Const. Art. VII §18 (ratios, reappraisal every four years, phase-in, special assessment level)", url: "https://www.legis.la.gov/Legis/Law.aspx?d=206545", official: true },
  S2:  { label: "La. Const. Art. VII §20 (homestead exemption)", url: "https://legis.la.gov/legis/law.aspx?d=206550", official: true },
  S3:  { label: "La. R.S. 47:1703 (homestead statute)", url: "https://legis.la.gov/legis/law.aspx?d=101333", official: true },
  S4:  { label: "Orleans Parish Assessor — 2027 Assessment Rolls Open July 15 to Aug. 17 (July 13, 2026)", url: "https://www.nolaassessor.com/2026/07/13/2027-assessment-rolls-open-for-public-inspection-july-15-to-august-17/", official: true },
  S5:  { label: "Orleans Parish Assessor — 2026 Assessment Rolls Open July 15 to Aug. 15 (July 14, 2025)", url: "https://www.nolaassessor.com/2025/07/14/2026-assessment-rolls-open-for-public-inspection-july-15-to-august-15/", official: true },
  S6:  { label: "Orleans Parish Assessor — New Online Assessment Appeal System (July 22, 2025)", url: "https://www.nolaassessor.com/2025/07/22/opao-rolls-out-new-online-assessment-appeal-system/", official: true },
  S7:  { label: "Orleans Parish Assessor — Homestead & SAL", url: "https://www.nolaassessor.com/homestead-sal/", official: true },
  S8:  { label: "Orleans Parish Assessor — Homestead flyer: Once Gained, Permanently Applied", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/2021-homestead-exempt-flyer_071221.pdf", official: true },
  S9:  { label: "Orleans Parish Assessor — Homestead Exemption application", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2024/02/OPAO-HE-Appl.pdf", official: true },
  S10: { label: "Orleans Parish Assessor — Mass appraisal process flyer", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/mass_process_flyer2021.pdf", official: true },
  S11: { label: "City of New Orleans Treasury — Millages: How Taxes are Calculated (2026 millage table: 121.20 mills citywide)", url: "https://nola.gov/next/treasury/topics/how-taxes-are-calculated/", official: true },
  S12: { label: "City of New Orleans Treasury — FAQ", url: "https://nola.gov/next/treasury/topics/faq/", official: true },
  S13: { label: "New Orleans City Council — Property Tax Assessments and Appeals", url: "https://council.nola.gov/resources/property-tax-assessments-and-appeals/", official: true },
  S14: { label: "La. Admin. Code tit. 61 §V-3103 — Appeals to the Louisiana Tax Commission", url: "https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-61-SS-V-3103", official: true },
  S15: { label: "La. Legislative Auditor — Tax Year 2024 Quadrennial Reappraisal, Orleans Parish Assessor (Dec. 2023)", url: "https://lla.la.gov/publicreports.nsf/0/f74bf8c6ffebdf7f86258a8d00657f6c/$file/000037d0b.pdf", official: true },
  S16: { label: "The Center Square — Audit: Orleans Parish used prohibited 'sales chasing'", url: "https://www.thecentersquare.com/louisiana/article_29aad166-a5cc-11ee-97ed-8324ed068b6d.html", official: false },
  S17: { label: "Bureau of Governmental Research — About Your Property Taxes", url: "https://www.bgr.org/about-your-property-taxes/", official: false },
  S18: { label: "Bureau of Governmental Research — 2026 Property Tax Dashboard", url: "https://www.bgr.org/report-index/2026-property-tax-dashboard-update/", official: false },
  S19: { label: "Fox 8 — Property owners could pay more under proposed 2027 tax increase (Sept. 28, 2026)", url: "https://www.fox8live.com/2026/09/28/new-orleans-property-owners-could-pay-more-under-proposed-2027-tax-increase/", official: false },
  S20: { label: "PAR Louisiana — Guide to the Fall 2026 Constitutional Amendments", url: "https://parlouisiana.org/wp-content/uploads/2026/10/PAR-Guide-to-the-Fall-2026-Constitutional-Amendments-FINAL.pdf", official: false },
  S21: { label: "Verite News — Assessor race guide", url: "https://veritenews.org/guides/2025-new-orleans-election-guide/assessor-race/", official: false },
  S22: { label: "Biz New Orleans — 2025 Assessment Rolls Open July 15 to Aug. 15", url: "https://bizneworleans.com/2025-assessment-rolls-open-july-15-to-aug-15/", official: false },
  S23: { label: "USA Today Network — Louisiana voters changed the state Constitution (Nov. 2022)", url: "https://news.yahoo.com/louisiana-voters-changed-state-constitution-142759103.html", official: false },
  S24: { label: "AARP Foundation — Louisiana property tax relief", url: "https://my.aarpfoundation.org/property-taxes/taxpayer-states/louisiana/", official: false },
  S25: { label: "Jefferson Parish Assessor — Homestead Exemption (disabled-veteran amendment)", url: "https://www.jpassessor.net/Resources/HomesteadExemption", official: false },
  S26: { label: "Bureau of Governmental Research — PolicyWatch: Revisiting Assessment Issues", url: "https://www.bgr.org/report-index/policywatch-revisiting-assessment-issues-in-new-orleans/", official: false },
  S27: { label: "City of New Orleans — Pay Property Tax", url: "https://nola.gov/property-tax/", official: true },
  S28: { label: "LouisianaLawHelp — Homestead Exemption for Property Taxes in Louisiana", url: "https://louisianalawhelp.org/resource/homestead-exemption-for-property-taxes-in-louisiana", official: false },
  S29: { label: "Loyola Law Pro Bono Desk Manual §6.5 — Considerations with Immovable Property", url: "https://probonodeskmanual.loyno.edu/node/1044", official: false },
  S30: { label: "Louisiana Tax Commission — Orleans 2026 tax roll files, incl. millage by parcel (posted Nov. 2025)", url: "https://stax.latax.la.gov/TaxRollsFolder/2025/", official: true },
  S31: { label: "Louisiana Tax Commission — Orleans 2027 tax roll files (filed Sept. 4, 2026)", url: "https://stax.latax.la.gov/TaxRollsFolder/2026/", official: true },
  S32: { label: "New Orleans City Council — Councilmember Green on assessments vs. taxes: 2024–27 values as of Jan. 1, 2023 (July 2023)", url: "https://council.nola.gov/news/july-2023/councilmember-eugene-green-clarifies-the-differenc/", official: true },
  S33: { label: "Fox 8 — City Council approves millage roll-forward (Nov. 5, 2026)", url: "https://www.fox8live.com/2026/11/05/new-orleans-city-council-approves-millage-roll-forward-raising-taxes-slashing-budget-deficit/", official: false },
  S34: { label: "City of New Orleans Treasury — Paying taxes (payment plans, interest)", url: "https://nola.gov/next/treasury/topics/paying-taxes/", official: true },
  S35: { label: "City of New Orleans — 2026 property tax bills available, due Feb. 28, 2026 (Jan. 25, 2026)", url: "https://nola.gov/next/mayors-office/news/articles/january-2026/2026-01-25-city-of-new-orleans-2026-property-tax/", official: true },
  S36: { label: "WAFB / Fox 8 — Louisiana voters pass 7 of 10 constitutional amendments (Nov. 3, 2026; unofficial results)", url: "https://www.wafb.com/2026/11/04/louisiana-voters-pass-7-10-constitutional-amendments-ballot/", official: false },
  S37: { label: "La. Const. Art. VII §21 (other exemptions, incl. disabled veterans, §21(K))", url: "https://www.legis.la.gov/Legis/Law.aspx?d=206551", official: true },
  S38: { label: "U.S. Census Bureau Geocoder — roll addresses matched to 2020 block groups (course crosswalk, 140,850 parcels)", url: "https://geocoding.geo.census.gov/geocoder/", official: true },
  S39: { label: "U.S. Census Bureau — American Community Survey 2020–2024 5-year estimates, block groups (course data)", url: "https://www.census.gov/programs-surveys/acs", official: true }
};

/* keywords: single words (weight 1). core: the entry's main subject words (weight 2 more).
   phrases: multi-word strings (weight 3). */
const ENTRIES = [
  /* ---------- 5.1 How values are set ---------- */
  {
    id: "how-value-set", topic: "How values are set",
    title: "How the Assessor decides what a property is worth",
    core: ["appraisal"],
    keywords: ["decide", "worth", "value", "determine", "mass", "appraisal", "cama", "model", "comparable", "sales", "estimate", "calculate", "figure"],
    phrases: ["assessment based on", "value based on", "how does the assessor", "what my house is worth", "how is my value", "mass appraisal", "how are values set", "how is value determined", "market value determined"],
    answer: `<p>The Orleans Parish Assessor must value property at <strong>fair market value</strong>, roughly what it would sell for between a willing buyer and seller <cite>S1</cite>.</p>
<p>Because there are far too many parcels to appraise one by one, the office uses <strong>mass appraisal</strong>: a computer model estimates each value from sales of similar properties, the property's features (such as building size, land size, condition and grade) and its neighborhood <cite>S15</cite>. The Assessor's own flyer (2021) describes the process and says sales comparison is the main method, with cost and income approaches for some property types <cite>S10</cite>.</p>
<p><strong>Values are set for four years at a time.</strong> State law requires a reappraisal at least every four years <cite>S1</cite>. The last one was for tax year 2024, and it values every property as of <strong>Jan. 1, 2023</strong> for tax years 2024 through 2027 <cite>S15</cite><cite>S32</cite>. In between, the Assessor can still update a parcel for a sale, construction, demolition, damage or remodeling <cite>S15</cite>.</p>
<p><strong>Tip:</strong> check the property features listed for your parcel on the Assessor's site. A wrong square footage or condition is one of the easiest things to get corrected.</p>`,
    sources: ["S1", "S15", "S10", "S32"]
  },
  {
    id: "value-up-no-change", topic: "How values are set",
    title: "Why your value can change when you didn't change anything",
    keywords: ["inspect", "inspection", "visit", "nothing", "didn't", "changed", "went", "increase", "jump", "why", "higher"],
    phrases: ["why did my value go up", "didn't change anything", "come inspect", "value went up", "assessment went up", "why is my assessment higher"],
    answer: `<p>Mass appraisal values property from sales data. So your value can rise because <strong>similar homes near you sold for more</strong>, even if no one visited your house and you made no changes <cite>S15</cite>.</p>
<p>Values move most in a <strong>reappraisal year</strong>, because they have to catch up with four years of price changes. In the tax year 2024 reappraisal, the total appraised value of single- and two-family homes was 23.2% higher than at the 2020 reappraisal <cite>S15</cite>. Those values (the market as of Jan. 1, 2023) are used through tax year 2027 <cite>S15</cite><cite>S32</cite>, which is why the 2027 roll filed with the state keeps 98% of values the same as 2026 <cite>S31</cite>.</p>
<p>Between reappraisals, the Assessor can update a parcel for a sale, construction, demolition, damage or remodeling <cite>S15</cite>.</p>
<p>A higher value does <em>not</em> automatically raise your bill by the same percent. In a reappraisal year each millage is rolled back <cite>S15</cite>. Ask me "Will my taxes go up the same amount?" for more.</p>`,
    sources: ["S15", "S32", "S31"]
  },
  {
    id: "assessed-vs-market", topic: "How values are set",
    title: "Assessed value vs. market value",
    core: ["assessed"],
    keywords: ["assessed", "market", "same", "difference", "sell", "ratio", "percent", "10", "15", "fmv"],
    phrases: ["assessed value", "market value", "same as what i could sell", "fair market value", "what is assessed value", "difference between assessed"],
    answer: `<p>They are different numbers.</p>
<ul><li><strong>Fair market value (FMV)</strong> is the Assessor's estimate of what the property would sell for <cite>S1</cite>.</li>
<li><strong>Assessed value</strong> is a fixed share of FMV set by the Louisiana Constitution: <strong>10%</strong> for land and residential buildings, <strong>15%</strong> for other property such as commercial buildings, and <strong>25%</strong> for public service property <cite>S1</cite>.</li></ul>
<p>Example: a home with an FMV of $300,000 has an assessed value of <strong>$30,000</strong>. Taxes are calculated on assessed value, minus any exemptions <cite>S11</cite>.</p>
<p>The FMV is a mass-appraisal estimate, not a promise of what you could sell for <cite>S10</cite>.</p>`,
    sources: ["S1", "S11", "S10"]
  },
  {
    id: "audit", topic: "How values are set",
    title: "The state audit of the 2024 reappraisal",
    core: ["audit", "fair"],
    keywords: ["audit", "auditor", "chasing", "fair", "accurate", "accuracy", "dispersion", "bgr", "criticism", "legislative"],
    phrases: ["sales chasing", "legislative auditor", "are assessments fair", "is the assessor accurate", "coefficient of dispersion", "assessment accuracy", "uniform"],
    answer: `<p>At the City Council's request, the Louisiana Legislative Auditor reviewed the tax year 2024 reappraisal. Its December 2023 report found <cite>S15</cite>:</p>
<ul><li><strong>Overall accuracy was within accepted ranges.</strong> Assessments "were not in the aggregate too high or too low." The median value was 91.6% to 97.3% of sale price (accepted range: 90% to 110%), and the <strong>coefficient of dispersion</strong>, a measure of how uneven values are, was 6.0% to 17.6% (accepted range: 5% to 20%), depending on the sample.</li>
<li><strong>Likely "sales chasing."</strong> The office likely set some values from the home's own recent sale price, which Tax Commission rules prohibit. The auditor identified <strong>3,803</strong> single- and two-family homes as potentially sales chased. They were valued 13.3% higher than similar unsold homes, about $611 in extra tax per house.</li>
<li><strong>The Assessor disagrees</strong> with that finding. His office's response says a verified arm's-length sale is the best indicator of market value.</li></ul>
<p>The Bureau of Governmental Research has raised related concerns <cite>S26</cite>. I'm presenting these views neutrally and can't say whether any one home's value is right. Read the full report for details.</p>`,
    sources: ["S15", "S26"]
  },

  /* ---------- 5.2 Assessed value + millage → bill ---------- */
  {
    id: "bill-calc", topic: "From value to tax bill",
    title: "How your property tax bill is calculated (worked example)",
    core: ["calculate"],
    keywords: ["bill", "calculate", "calculated", "compute", "formula", "how", "much", "owe", "pay", "taxes", "example", "estimate"],
    phrases: ["how is my tax bill calculated", "how is my property tax calculated", "how much tax", "worked example", "tax bill calculated", "how are taxes calculated", "calculate my taxes"],
    answer: `<p><strong>Tax = (assessed value − exemptions) × millage ÷ 1,000</strong>, added up across every millage that applies to the property <cite>S11</cite>.</p>
<p>The City's 2026 table lists <strong>121.20 mills citywide</strong>. Levee district millage is added on top: 10.79 mills on the East Bank, 10.81 in Algiers <cite>S11</cite>. Example: a $300,000 home on the East Bank with a homestead exemption, 2026 rates.</p>
<table><tr><th>Step</th><th>Math</th><th>Result</th></tr>
<tr><td>Fair market value</td><td>set by Assessor</td><td>$300,000</td></tr>
<tr><td>× 10% residential ratio</td><td>$300,000 × 0.10</td><td>$30,000 assessed</td></tr>
<tr><td>− Homestead exemption</td><td>$30,000 − $7,500</td><td>$22,500 taxable</td></tr>
<tr><td>× 121.20 citywide mills</td><td>$22,500 × 0.12120</td><td>$2,727.00</td></tr>
<tr><td>+ police &amp; fire mills that get no homestead reduction (11.51)</td><td>$7,500 × 0.01151</td><td>$86.33</td></tr>
<tr><td><strong>Citywide subtotal</strong></td><td></td><td><strong>$2,813.33</strong></td></tr>
<tr><td>+ East Bank levee district (10.79)</td><td>$22,500 × 0.01079</td><td>$242.78</td></tr>
<tr><td><strong>Total, East Bank (131.99 mills)</strong></td><td></td><td><strong>$3,056.10 / year</strong></td></tr>
<tr><td>Same home, no homestead</td><td>$30,000 × 0.13199</td><td>$3,959.70 / year</td></tr></table>
<p><strong>What homestead saves here:</strong> $903.60 a year ($822.68 of it on the citywide millages). That's less than $7,500 × the full rate, because the 11.51 police and fire mills "without applying homestead exemption" are charged on the whole assessed value <cite>S11</cite><cite>S30</cite>.</p>
<p>Sources: ratio <cite>S1</cite>, homestead amount <cite>S2</cite>, rates <cite>S11</cite>. The state roll files show the same totals on every parcel: 131.99 mills on the East Bank and 132.01 in Algiers <cite>S30</cite>. Line amounts are rounded to the cent.</p>
<p><strong>Not included:</strong> special districts. The Downtown Development District adds 13.73 mills, some security districts add about 7 mills, and others charge flat fees, mostly a few hundred dollars a year <cite>S11</cite>. Find your property above to see its own recorded tax.</p>`,
    sources: ["S11", "S1", "S2", "S30"]
  },
  {
    id: "mill", topic: "From value to tax bill",
    title: "What a mill (millage rate) is",
    core: ["mill","millage"],
    keywords: ["mill", "mills", "millage", "rate", "rates", "who", "sets", "levy"],
    phrases: ["what is a mill", "what is millage", "millage rate", "who sets the millage", "tax rate"],
    answer: `<p>A <strong>mill</strong> is one-tenth of one percent: <strong>$1 of tax per $1,000 of taxable assessed value</strong> <cite>S13</cite><cite>S11</cite>.</p>
<p>Each taxing body sets its own millage. The City's 2026 table adds up to <strong>121.20 mills citywide</strong>: the City (including police, fire and libraries), the School Board (45.31), the Sewerage &amp; Water Board, debt service, parks and the Law Enforcement District. On top of that, every parcel pays a <strong>levee district</strong> millage: 10.79 mills on the East Bank or 10.81 in Algiers, for totals of <strong>131.99</strong> and <strong>132.01</strong> <cite>S11</cite><cite>S30</cite>.</p>
<p>In the 2027 roll filed with the state, the citywide total is still 121.20, but the East Bank levee millage rises from 10.79 to 12.28, so the East Bank total becomes <strong>133.48</strong> <cite>S31</cite>. That file predates the City Council's Nov. 5, 2026 roll-forward <cite>S33</cite>.</p>
<p>You can't appeal a millage. Rates change through public hearings and elections <cite>S13</cite>.</p>`,
    sources: ["S13", "S11", "S30", "S31", "S33"]
  },
  {
    id: "rollback", topic: "From value to tax bill",
    title: "Rollback and roll-forward",
    core: ["rollback"],
    keywords: ["rollback", "roll", "forward", "back", "neutral", "revenue", "reduce", "lower"],
    phrases: ["roll back", "roll forward", "rollback", "revenue neutral"],
    answer: `<p>In a reappraisal year, if assessed values rise, the Louisiana Constitution automatically <strong>rolls back</strong> each millage so it raises the same total tax as before. Each taxing body may then <strong>roll forward</strong>, up to its previous rate, by a two-thirds vote at a public meeting <cite>S15</cite>.</p>
<p><strong>For 2027:</strong> the City proposed rolling forward a list of city millages by about 7.44 mills in total, for example General Alimony from 12.23 to 13.91 <cite>S11</cite>. Fox 8 estimated that at about $178 a year on a $300,000 homesteaded home <cite>S19</cite>. On <strong>Nov. 5, 2026</strong> the City Council unanimously approved a smaller, partial roll-forward totaling <strong>4.039 mills</strong> <cite>S33</cite>. I don't know the final rate for each millage yet.</p>
<p>The 2027 roll the Assessor filed with the state on Sept. 4, 2026 came before that vote: it still lists General Alimony at 12.23 mills <cite>S31</cite>. So the 2027 tax figures in that file are probably <strong>lower than the bills will be</strong>.</p>`,
    sources: ["S15", "S11", "S19", "S33", "S31"]
  },
  {
    id: "bill-due", topic: "From value to tax bill",
    title: "When the bill comes and how to pay",
    core: ["due","pay"],
    keywords: ["due", "when", "pay", "payment", "mailed", "late", "interest", "penalty", "treasury", "online", "january"],
    phrases: ["when is my tax bill due", "who do i pay", "how do i pay", "pay my property tax", "when are taxes due", "late payment", "next bill", "get my bill", "when will i get", "tax bill come", "due date"],
    answer: `<p>The City of New Orleans <strong>Bureau of the Treasury</strong> sends bills and collects payment. The Assessor sets values but doesn't collect taxes <cite>S12</cite><cite>S27</cite>.</p>
<ul><li>The Treasury's FAQ says bills usually go out in <strong>late December</strong> and are due <strong>January 31</strong> <cite>S12</cite>, but recent years ran later: 2026 bills reached owners by the end of January and were due <strong>Feb. 28, 2026</strong> <cite>S35</cite>. {{NEXT_BILL}}</li>
<li>After the due date, interest accrues at <strong>1% per month</strong> <cite>S34</cite><cite>S35</cite>, and not receiving a bill doesn't excuse a late payment <cite>S12</cite>.</li>
<li>Pay online, by mail, or in person; options are at nola.gov/property-tax <cite>S27</cite>. Bills can be looked up online at nola.gov/find-tax-bill <cite>S35</cite>.</li></ul>`,
    sources: ["S12", "S35", "S34", "S27"], contact: true
  },
  {
    id: "payment-plan", topic: "From value to tax bill",
    title: "Payment plans and partial payments",
    core: ["installment", "plan", "partial"],
    keywords: ["installment", "installments", "plan", "plans", "partial", "afford", "split", "monthly", "payments", "behind", "hardship"],
    phrases: ["payment plan", "in installments", "installment", "partial payment", "can't afford", "cannot afford", "pay monthly", "pay over time", "pay part"],
    answer: `<p><strong>The City doesn't offer a formal installment plan</strong> for property taxes. You can make <strong>partial payments in person or by mail</strong>, but not online. Any unpaid balance is charged interest at <strong>1% per month</strong>, plus other fees <cite>S34</cite>.</p>
<p>For help with a bill you can't pay, contact the Bureau of the Treasury <cite>S27</cite>. If the problem is the value itself, that's a question for the Assessor's Office, and an appeal is only possible during the summer appeal window.</p>`,
    sources: ["S34", "S27"], contact: true
  },
  {
    id: "special-districts", topic: "From value to tax bill",
    title: "Why neighbors can have different tax rates",
    keywords: ["district", "districts", "downtown", "ddd", "security", "levee", "west", "bank", "algiers", "different", "neighbor", "fee"],
    phrases: ["special district", "security district", "downtown development district", "west bank", "different rate"],
    answer: `<p>Not every charge applies everywhere. The City's 2026 table lists, on top of the 121.20 citywide mills <cite>S11</cite>:</p>
<ul><li><strong>Levee districts:</strong> 10.79 mills on the East Bank, 10.81 in Algiers</li>
<li><strong>Downtown Development District:</strong> 13.73 mills</li>
<li><strong>Security districts charged by millage:</strong> Garden District 7.13, Touro Bouligny 7.10</li>
<li><strong>Neighborhood districts charged as flat fees:</strong> for example Broadmoor $100, Lakeview $150, Mid-City $195 for a home, Upper Audubon $700</li></ul>
<p>That's why two homes with the same value can get different bills. BGR's dashboard estimates bills by area <cite>S18</cite>.</p>
<p>The state roll files record the citywide millages and the levee district for every parcel, but <strong>not</strong> the special districts, so I can't tell you which ones apply to a property <cite>S30</cite>.</p>`,
    sources: ["S11", "S18", "S30"]
  },
  {
    id: "commercial", topic: "From value to tax bill",
    title: "Commercial and rental property",
    core: ["commercial","rental"],
    keywords: ["commercial", "business", "rental", "landlord", "income", "apartment", "investment", "office", "store"],
    phrases: ["commercial building", "commercial property", "rental property", "income property", "business property", "homestead on my rental", "rent out", "rental house"],
    answer: `<p>Land is assessed at <strong>10%</strong> of FMV. Commercial buildings and other non-residential property are assessed at <strong>15%</strong> <cite>S1</cite>. For income-producing property the Assessor may use the income approach as well as sales and cost <cite>S10</cite>.</p>
<p>A rental you don't live in <strong>can't get the homestead exemption</strong>, because homestead requires that you own and occupy the home <cite>S2</cite><cite>S7</cite>. How residential rentals are classified in the roll is something I don't know for certain. Ask the Assessor's Office.</p>`,
    sources: ["S1", "S10", "S2", "S7"], contact: true
  },

  /* ---------- 5.3 Exemptions ---------- */
  {
    id: "homestead-apply", topic: "Exemptions",
    title: "How to apply for the homestead exemption",
    core: ["homestead"],
    keywords: ["homestead", "apply", "application", "bring", "documents", "file", "sign", "need", "proof", "register", "claim", "condo", "condominium", "townhouse"],
    phrases: ["apply for homestead", "homestead exemption", "what do i bring", "how do i get homestead", "file for homestead", "sign up for homestead"],
    answer: `<p>The <strong>homestead exemption</strong> takes <strong>$7,500 off your assessed value</strong>, which equals the first <strong>$75,000 of market value</strong>. It applies only to the home you <strong>own and live in</strong>, and you must own and occupy it by <strong>December 31</strong> of the year you claim it <cite>S2</cite><cite>S3</cite>. A person or married couple can have only one <cite>S2</cite>.</p>
<p><strong>How to apply:</strong> you apply with the Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01 <cite>S9</cite>. The Assessor's application form and flyer ask for <cite>S8</cite><cite>S9</cite>:</p>
<ul><li>Proof of ownership: act of sale or deed</li>
<li>A Louisiana driver's license or state ID showing the property address</li>
<li>A current Entergy (or cable) bill for the property, with matching name, service address and mailing address</li></ul>
<p>Those documents say every owner who lives in the home applies in person, and that a mailing address different from the property needs a recorded power of attorney <cite>S8</cite><cite>S9</cite>. <strong>They date from 2021 and 2024, and I can't check the Assessor's website myself, so please confirm the current steps</strong> (including whether you can apply online or by appointment) at nolaassessor.com or by phone before you go.</p>
<p>Homestead lowers most of your bill but not all of it: the police and fire millages "without applying homestead exemption" (11.51 mills) are charged on your full assessed value <cite>S11</cite>.</p>`,
    sources: ["S2", "S3", "S9", "S8", "S11"], contact: true
  },
  {
    id: "double", topic: "Exemptions",
    title: "Homestead when you live in half of a double",
    core: ["double", "duplex"],
    keywords: ["double", "duplex", "half", "side", "shotgun", "two-family", "fourplex", "units", "tenant", "rent", "renting", "upstairs", "downstairs", "multi-family"],
    phrases: ["half of a double", "one side of a double", "live in one side", "live in half", "rent out the other", "rent the other side", "other half", "owner occupied double", "two family", "shotgun double", "live in one unit"],
    answer: `<p><strong>Short answer: you can get a homestead exemption on a double you own and live in, but I don't know exactly how the Assessor applies it to the rented half.</strong> That is a question for the Assessor's Office.</p>
<p>What the law says:</p>
<ul><li>The exemption covers the home that is <strong>owned and occupied</strong> by the owner, up to $7,500 of assessed value <cite>S2</cite>. A rental you don't live in can't get it.</li>
<li>One person or couple can have only <strong>one</strong> homestead exemption, so you can't claim both sides <cite>S2</cite>.</li>
<li>When a home has several owners, the exemption is limited to the <strong>ownership share of the owners who live there</strong> <cite>S2</cite>. In the 2026 roll, 1,358 parcels have a homestead recorded at 50% of ownership, and each gets $3,750 instead of $7,500 <cite>S30</cite>.</li></ul>
<p><strong>What I don't know:</strong> whether the Assessor treats the rented side of an owner-occupied double differently, for example by applying the exemption only to your side's share of the value. The roll doesn't record which parcels are doubles. If you find your property above, I can show you the homestead amount and percentage on your record.</p>`,
    sources: ["S2", "S30"], contact: true
  },
  {
    id: "homestead-renew", topic: "Exemptions",
    title: "Do you need to reapply every year?",
    core: ["reapply","renew"],
    keywords: ["reapply", "renew", "every", "year", "annual", "annually", "permanent", "again", "keep"],
    phrases: ["reapply every year", "renew my homestead", "do i have to reapply", "every year"],
    answer: `<p><strong>No.</strong> Once your homestead exemption is granted, it stays on. The Assessor's Office says you don't need to reapply every year <cite>S8</cite>.</p>
<p>You do need to act if something changes: you sell or move out, an owner dies, or the deed changes. In those cases contact the Assessor's Office. Owners under 65 who have the <strong>Special Assessment Level</strong> certify their income each year <cite>S1</cite>.</p>
<p>It's worth checking each summer, during the open-roll period, that your exemptions still show on your parcel <cite>S4</cite>.</p>`,
    sources: ["S8", "S1", "S4"], contact: true
  },
  {
    id: "sal", topic: "Exemptions",
    title: "Special Assessment Level (\"the freeze\") for seniors, disabled owners, and veterans",
    core: ["freeze","sal"],
    keywords: ["freeze", "frozen", "senior", "65", "older", "elderly", "age", "disabled", "disability", "sal", "special", "level", "income", "limit"],
    phrases: ["special assessment level", "over 65", "freeze my assessment", "senior freeze", "assessment frozen", "income limit", "have the freeze", "with the freeze", "frozen but", "freeze but"],
    answer: `<p>The <strong>Special Assessment Level (SAL)</strong> freezes your home's <strong>assessed value</strong> at the level of the first year you qualify <cite>S1</cite>.</p>
<p><strong>Who qualifies</strong> under the Louisiana Constitution <cite>S1</cite>: your home must have the homestead exemption, and you must be (a) 65 or older, (b) permanently and totally disabled, (c) a veteran with a service-connected disability rating of 50% or more, or (d) the owner's family in certain military cases (killed or missing in action, or a prisoner of war).</p>
<p><strong>Income limit</strong> <cite>S1</cite>: your adjusted gross income on last year's federal return can't be over <strong>$100,000</strong>, a figure that is adjusted for inflation starting with tax year 2026. A change voters approved on Nov. 3, 2026 raises the limit to <strong>$150,000</strong> effective Jan. 1, 2027, with inflation adjustments from tax year 2028 <cite>S1</cite><cite>S36</cite>. I don't have the exact inflation-adjusted figure for this year, so please confirm it with the Assessor.</p>
<p><strong>Important:</strong> the freeze locks your <em>assessed value</em>, not your bill. Millage rates still apply in full, so your taxes can go up if rates rise <cite>S1</cite>. Owners who qualified at 65 or older, or as permanently disabled, don't re-certify income each year; owners under 65 who qualified another way do <cite>S1</cite>.</p>
<p>Apply through the Assessor's Office with proof of age or disability and income <cite>S7</cite>.</p>`,
    sources: ["S1", "S36", "S7"], contact: true
  },
  {
    id: "veteran", topic: "Exemptions",
    title: "Disabled veteran exemptions",
    core: ["veteran"],
    keywords: ["veteran", "veterans", "vet", "vets", "va", "military", "service", "disabled", "rating", "100"],
    phrases: ["disabled veteran", "disabled vet", "100 percent disabled", "100% disabled", "veteran exemption", "service connected"],
    answer: `<p>Veterans with a VA service-connected disability rating of <strong>50% or more</strong> get an additional exemption on top of the $7,500 homestead exemption, set by the Louisiana Constitution <cite>S37</cite>:</p>
<ul><li><strong>50% to under 70%:</strong> the next <strong>$2,500</strong> of assessed value</li>
<li><strong>70% to under 100%:</strong> the next <strong>$4,500</strong> of assessed value</li>
<li><strong>100% unemployability or totally disabled:</strong> the <strong>rest of the home's assessed value</strong></li></ul>
<p>Even a fully exempted home still pays two levies that homestead and these exemptions don't reduce: the police and fire millages "without homestead exemption," 11.51 mills in total <cite>S30</cite>. A surviving spouse who keeps owning and living in the home can keep the exemption <cite>S37</cite>. Apply at the Assessor's Office <cite>S7</cite>.</p>
<p>Veterans with a 50% or higher rating can also qualify for the Special Assessment Level freeze <cite>S1</cite>. Bring your VA rating letter along with your homestead documents <cite>S7</cite>.</p>
<p>On Nov. 3, 2026 voters approved <strong>Amendment 1</strong>, letting a disabled veteran's surviving spouse move the exemption to a new home once (unofficial results) <cite>S36</cite>.</p>`,
    sources: ["S37", "S30", "S7", "S1", "S36"], contact: true
  },
  {
    id: "first-responder", topic: "Exemptions",
    title: "First responder exemption",
    core: ["responder"],
    keywords: ["first", "responder", "firefighter", "police", "officer", "emt", "paramedic"],
    phrases: ["first responder", "firefighter exemption", "police officer exemption"],
    answer: `<p>The Assessor's Office lists an additional <strong>first responder exemption</strong> of about <strong>$25,000 of market value</strong> (about $2,500 of assessed value) on top of homestead. To apply, bring an <strong>employment verification letter on your agency's letterhead</strong> <cite>S7</cite>. Ask the office which positions qualify.</p>`,
    sources: ["S7"], contact: true
  },
  {
    id: "amendments-2026", topic: "Exemptions",
    title: "Property tax amendments on the November 2026 ballot: results",
    core: ["amendment"],
    keywords: ["amendment", "amendments", "ballot", "vote", "voted", "election", "november", "proposed", "pass", "passed", "fail", "failed", "result", "results", "approved"],
    phrases: ["constitutional amendment", "on the ballot", "november election", "amendment 9", "amendment 6", "amendment 1", "amendment 2", "amendment 10", "did it pass", "election results"],
    answer: `<p>On <strong>Nov. 3, 2026</strong>, Louisiana voters decided several property tax amendments <cite>S36</cite><cite>S20</cite>:</p>
<ul><li><strong>Amendment 1, approved (about 75%):</strong> a disabled veteran's surviving spouse can move the exemption to a new home once.</li>
<li><strong>Amendment 6, approved (about 65%):</strong> parishes and cities <em>may choose</em> to give owners 65 and older extra relief, with local approval. It does nothing in New Orleans unless the City adopts it, and I don't know of any such step.</li>
<li><strong>Amendment 9, approved (about 60%):</strong> raises the Special Assessment Level ("freeze") income limit to below $150,000.</li>
<li><strong>Amendment 2, rejected:</strong> would have let local governments keep lower millages after a reassessment without losing the right to raise them later.</li>
<li><strong>Amendment 10, rejected:</strong> a local-option exemption for rehabilitated blighted property.</li></ul>
<p>These are <strong>unofficial election-night results</strong>; confirm the certified results with the Secretary of State. I don't know exactly when each change takes effect, so ask the Assessor's Office. I don't take positions on ballot measures.</p>`,
    sources: ["S36", "S20"], contact: true
  },

  /* ---------- 5.4 2027 reassessment ---------- */
  {
    id: "reassess-taxes", topic: "2027 reassessment",
    title: "Will my taxes rise as much as my value?",
    keywords: ["taxes", "go", "up", "same", "amount", "rise", "increase", "percent", "reassessment", "2027", "2028", "higher"],
    phrases: ["will my taxes go up", "same amount", "taxes go up the same", "value went up a lot", "how much will my taxes", "why did my taxes go up", "taxes going up", "bill so high", "taxes so high", "why is my bill", "bill went up"],
    answer: `<p><strong>Not necessarily.</strong> In a reappraisal year, if assessed values rise, each millage is automatically <strong>rolled back</strong> so it raises the same total tax as before. That means a 20% value increase usually doesn't produce a 20% tax increase <cite>S15</cite><cite>S32</cite>.</p>
<p>Two things can still raise your bill:</p>
<ul><li>If your value rose <strong>more than the citywide average</strong>, you carry a larger share of the total.</li>
<li>Taxing bodies may vote to <strong>roll forward</strong> <cite>S15</cite>. For 2027, the City Council approved a partial roll-forward of <strong>4.039 mills</strong> on Nov. 5, 2026 <cite>S33</cite>. The City's first proposal was larger, about 7.44 mills <cite>S11</cite>.</li></ul>
<p>For the <strong>2027 bills</strong>, values mostly didn't change, because the 2024 reappraisal's values run through tax year 2027 <cite>S15</cite>. In the 2027 roll filed with the state, the East Bank rate goes from 131.99 to 133.48 mills because the levee district's millage rises from 10.79 to 12.28; Algiers stays at 132.01. In that file, 84% of homes' computed taxes go up, by a median of $25 <cite>S30</cite><cite>S31</cite>. The file predates the Council's roll-forward, so actual 2027 bills will likely be higher <cite>S33</cite>. Find your property above to see your own numbers.</p>`,
    sources: ["S15", "S32", "S33", "S11", "S30", "S31"]
  },
  {
    id: "why-2027", topic: "2027 reassessment",
    title: "What the 2027 reassessment is",
    core: ["reassessment", "reappraisal"],
    keywords: ["2027", "2028", "reassessment", "reappraisal", "why", "quadrennial", "new", "values", "what", "next", "cycle"],
    phrases: ["why is there a reassessment", "2027 reassessment", "what is the reassessment", "what does the 2027", "reassessment mean", "next reappraisal", "next reassessment", "when will values change", "four year cycle", "reappraisal year", "reassessment year", "a reappraisal", "2027 roll"],
    answer: `<p><strong>What's established:</strong> Louisiana reappraises all property on a four-year cycle <cite>S1</cite>. Tax year 2024 was a reappraisal year. The Legislative Auditor's report says property is valued as of <strong>Jan. 1, 2023 "for tax years 2024 through 2027"</strong> <cite>S15</cite>, and the City Council said the same in 2023 <cite>S32</cite>.</p>
<p>So <strong>the 2027 roll is not a new reappraisal.</strong> It was open for inspection July 15 – Aug. 17, 2026 <cite>S4</cite>, and the copy the Assessor filed with the state keeps 98% of values the same as 2026, every one still dated 01/01/2023 <cite>S31</cite>. Between reappraisals the Assessor can still change a value for a sale, construction, demolition, damage or remodeling <cite>S15</cite>.</p>
<p><strong>What comes next:</strong> the four-year pattern (2020, 2024) points to <strong>tax year 2028</strong> as the next reappraisal year, with property valued as of Jan. 1, 2027. That means the reappraisal work happens during 2027 and the new values appear on the 2028 roll, posted in summer 2027. I'm inferring that from the cycle <cite>S15</cite><cite>S1</cite>; I haven't found an official announcement, so please confirm with the Assessor's Office.</p>
<p><strong>What it means for owners:</strong> (1) your value may change in the next reappraisal even if you change nothing; (2) in a reappraisal year each millage is rolled back so it raises the same total, though taxing bodies can vote to roll forward <cite>S15</cite>; (3) the open-roll period in summer 2027 is the time to check a new value and appeal if you disagree; (4) make sure your homestead or freeze is on file before then. {{APPEAL_STATUS}}</p>`,
    sources: ["S1", "S15", "S32", "S4", "S31"], contact: true
  },
  {
    id: "cap", topic: "2027 reassessment",
    title: "Is there a cap on assessment increases?",
    core: ["cap"],
    keywords: ["cap", "limit", "maximum", "capped", "10%", "percent", "limited", "phase", "phased"],
    phrases: ["is there a cap", "cap on assessment", "limit on how much", "10 percent cap", "how much can my assessment", "phase in", "phased in"],
    answer: `<p><strong>There's no general yearly cap in Orleans Parish.</strong> In 2022 voters narrowly <strong>rejected</strong> that year's Amendment 6, which would have capped yearly increases on Orleans homesteads at 10% (642,462 against, 635,559 for) <cite>S23</cite>.</p>
<p>Two rules in the Louisiana Constitution do limit increases for some owners <cite>S1</cite>:</p>
<ul><li><strong>Four-year phase-in.</strong> If a reappraisal raises a homesteaded home's assessed value by <strong>more than 50%</strong>, the extra tax is phased in: one-fourth of the increase counts in the first year, half in the second, three-fourths in the third, and all of it in the fourth. It ends if the home is sold, and it doesn't cover increases from construction or improvements.</li>
<li><strong>Special Assessment Level ("the freeze")</strong> for eligible seniors, disabled owners and veterans, which locks assessed value but not millage.</li></ul>`,
    sources: ["S23", "S1"]
  },
  {
    id: "roll-years", topic: "2027 reassessment",
    title: "How roll years are named (2025, 2026, 2027)",
    keywords: ["roll", "rolls", "year", "naming", "2025", "2026", "confusing", "which"],
    phrases: ["2025 roll", "2026 roll", "which year", "tax year", "roll year"],
    answer: `<p>Orleans names each roll for the <strong>tax year the bill comes due</strong>:</p>
<table><tr><th>Roll</th><th>Values posted</th><th>Bill due</th></tr>
<tr><td>2025</td><td>July 15 – Aug. 15, 2024 <cite>S22</cite></td><td>early 2025</td></tr>
<tr><td>2026</td><td>July 15 – Aug. 15, 2025 <cite>S5</cite></td><td>early 2026</td></tr>
<tr><td>2027</td><td>July 15 – Aug. 17, 2026 <cite>S4</cite></td><td>early 2027 (date not announced)</td></tr>
<tr><td>2028 (next reappraisal, expected)</td><td>summer 2027</td><td>early 2028</td></tr></table>
<p>Rolls 2024 through 2027 all use the same values, the market as of Jan. 1, 2023 <cite>S32</cite>. The Treasury says bills are usually due January 31 <cite>S12</cite>, but 2026 bills were due Feb. 28 <cite>S35</cite>.</p>`,
    sources: ["S22", "S5", "S4", "S32", "S12", "S35"]
  },

  /* ---------- 5.5 Appeals ---------- */
  {
    id: "appeal-how", topic: "Appeals",
    title: "How to appeal your assessment, and the deadlines",
    core: ["appeal"],
    keywords: ["appeal", "appeals", "contest", "dispute", "challenge", "deadline", "protest", "lower", "file", "board", "review", "online", "system", "efile"],
    phrases: ["how do i appeal", "appeal my assessment", "appeal deadline", "board of review", "dispute my assessment", "challenge my value", "contest my assessment", "appeal online", "online appeal"],
    answer: `<p>{{APPEAL_STATUS}}</p>
<ol><li><strong>Check the roll</strong> during the open-roll period, usually mid-July to mid-August. For the 2027 roll it ran July 15 – Aug. 17, 2026 <cite>S4</cite>.</li>
<li><strong>Informal review with the Assessor.</strong> Book an appraiser at <strong>(504) 754-8811</strong> or online, at least 24 hours ahead <cite>S4</cite>. Appeals filed online go first to Assessor staff, who may ask for documents or offer a settlement <cite>S6</cite>.</li>
<li><strong>Board of Review</strong>, the City Council sitting as an independent body. Unresolved appeals get a hearing <cite>S6</cite><cite>S13</cite>. For the 2027 roll the filing deadline was <strong>4 p.m., Aug. 20, 2026</strong>. Paper filings need four copies <cite>S4</cite>.</li>
<li><strong>Louisiana Tax Commission</strong>, within <strong>30 calendar days</strong> of the Board's decision <cite>S14</cite>.</li>
<li><strong>Court</strong> after that. I don't know that deadline. Ask a lawyer.</li></ol>
<p>You can appeal the <em>value</em>, not the millage <cite>S13</cite>.</p>`,
    sources: ["S4", "S6", "S13", "S14"], contact: true
  },
  {
    id: "appeal-where", topic: "Appeals",
    title: "Where to review the roll or file in person",
    keywords: ["where", "location", "locations", "office", "city", "hall", "address", "in", "person", "go", "algiers", "lakeview", "hours"],
    phrases: ["where do i go", "where can i appeal", "in person", "city hall", "office hours", "open roll"],
    answer: `<p>During the open-roll period (weekdays 8:30 a.m. – 4 p.m.), the 2027 rolls could be reviewed at <cite>S4</cite>:</p>
<ul><li><strong>City Hall</strong>, 1300 Perdido St., 4th floor</li>
<li><strong>Algiers Courthouse</strong>, 225 Morgan St., 1st floor</li>
<li><strong>Lakeview Christian Center</strong>, 5885 Fleur De Lis Dr., 2nd floor</li></ul>
<p>The Assessor's main office is in City Hall, Room 4E01 <cite>S9</cite>. Appraiser appointments: <strong>(504) 754-8811</strong> <cite>S4</cite>. You can also file online at nolaassessor.com during the appeal window <cite>S6</cite>.</p>`,
    sources: ["S4", "S9", "S6"], contact: true
  },
  {
    id: "appeal-evidence", topic: "Appeals",
    title: "What evidence helps an appeal",
    core: ["evidence"],
    keywords: ["evidence", "proof", "documents", "support", "appraisal", "photos", "comps", "comparable", "win", "case"],
    phrases: ["what evidence", "what do i need to appeal", "documents for appeal", "support my appeal", "comparable sales"],
    answer: `<p>The Assessor's staff may ask for documents when they review an online appeal <cite>S6</cite>. Paper Board of Review filings must include <strong>four copies</strong> of the form and every supporting document <cite>S4</cite><cite>S22</cite>.</p>
<p>Evidence owners commonly submit includes a recent independent appraisal, a closing statement from a recent purchase, photos of condition problems, repair estimates, and sales of truly comparable nearby homes. Also check that the property features on record (size, condition, building type) are correct <cite>S10</cite>.</p>
<p>I can't tell you whether your evidence is strong enough or whether you'd win. The Assessor's appraisal staff or a professional can.</p>`,
    sources: ["S6", "S4", "S22", "S10"], contact: true
  },
  {
    id: "appeal-missed", topic: "Appeals",
    title: "If you missed the appeal deadline",
    core: ["missed"],
    keywords: ["missed", "late", "passed", "too", "after", "now", "closed", "over", "next"],
    phrases: ["missed the deadline", "too late", "deadline passed", "what can i do now", "after the deadline"],
    answer: `<p>{{APPEAL_STATUS}}</p>
<p>I don't know of a late-filing option. Contact the Assessor's Office to ask whether a correction is possible, for example for a factual error in your property's description.</p>
<p>What you can still do:</p><ul><li>Make sure your <strong>homestead and other exemptions</strong> are on file. Homestead requires you to own and occupy the home by Dec. 31 of the tax year <cite>S3</cite>.</li>
<li>Prepare for the next open-roll period, which is usually <strong>mid-July to mid-August</strong> <cite>S4</cite><cite>S5</cite>. The summer 2027 period should carry the new reappraisal values <cite>S32</cite>.</li>
<li>If you already got a Board of Review decision, the Tax Commission deadline is 30 calendar days <cite>S14</cite>.</li></ul>`,
    sources: ["S3", "S4", "S5", "S32", "S14"], contact: true
  },
  {
    id: "ltc", topic: "Appeals",
    title: "Appealing to the Louisiana Tax Commission",
    core: ["commission"],
    keywords: ["tax", "commission", "ltc", "state", "after", "decision", "disagree", "next", "level", "court"],
    phrases: ["louisiana tax commission", "tax commission", "disagree with the board", "after the board of review", "go to court", "what happens after", "lose at the board"],
    answer: `<p>If you disagree with the Board of Review's decision, you can appeal to the <strong>Louisiana Tax Commission</strong>. File within <strong>30 calendar days</strong> of the earlier of (a) when the Board's written decision was properly sent to you or (b) when you actually received it <cite>S14</cite>. The Constitution provides for this review <cite>S1</cite>.</p>
<p>Some websites say "10 business days," but that conflicts with the regulation, so confirm with the Commission. After the Tax Commission, review is in court. I don't know that deadline and can't advise on litigation, so talk to a lawyer.</p>`,
    sources: ["S14", "S1"], contact: true
  },
  {
    id: "contacts", topic: "Contacts",
    title: "Who to contact",
    core: ["contact"],
    keywords: ["contact", "phone", "call", "number", "talk", "human", "person", "help", "email", "who", "assessor", "office"],
    phrases: ["who do i call", "talk to a person", "phone number", "contact the assessor", "speak to someone", "real person", "who is the assessor", "assessor's name", "who runs"],
    answer: `<p>The Orleans Parish Assessor is <strong>Erroll G. Williams</strong>, who starts a fifth term in January 2027 <cite>S21</cite>.</p>
<ul><li><strong>Orleans Parish Assessor's Office</strong> (values, exemptions, informal appeals): City Hall, 1300 Perdido St., Room 4E01 <cite>S9</cite>. Appraiser appointments: <strong>(504) 754-8811</strong>. Website: nolaassessor.com <cite>S4</cite>.</li>
<li><strong>Board of Review / City Council</strong> (formal appeals): council.nola.gov <cite>S13</cite></li>
<li><strong>Bureau of the Treasury</strong> (bills and payments): nola.gov/property-tax <cite>S27</cite></li>
<li><strong>Louisiana Tax Commission</strong> (appeals after the Board) <cite>S14</cite></li>
<li>For legal help: Southeast Louisiana Legal Services (slls.org) or a licensed attorney.</li></ul>`,
    sources: ["S21", "S9", "S4", "S13", "S27", "S14"]
  },
  {
    id: "sold-moved", topic: "Exemptions",
    title: "Buying, selling, or moving and the homestead",
    keywords: ["bought", "buy", "new", "home", "sold", "sell", "moved", "move", "purchase", "transfer", "closing"],
    phrases: ["just bought", "new home", "i moved", "sold my house", "first time buyer", "bought a house"],
    answer: `<p>The homestead exemption doesn't move with you. It's tied to the home you own and occupy <cite>S2</cite>. After buying, apply <strong>in person</strong> at the Assessor's Office with your act of sale, a Louisiana ID showing the new address, and a current Entergy bill <cite>S8</cite>. You must own and occupy the home by <strong>Dec. 31</strong> of the tax year <cite>S3</cite>.</p>
<p>Only one homestead is allowed per person or married couple <cite>S9</cite>. Tell the Assessor if you leave a home that has your homestead on it.</p>`,
    sources: ["S2", "S8", "S3", "S9"], contact: true
  },
  {
    id: "heirs", topic: "Exemptions",
    title: "When an owner dies: heirs, surviving spouses, and the homestead",
    core: ["heir", "inherit", "died", "death", "succession"],
    keywords: ["heir", "heirs", "inherit", "inherited", "died", "dies", "death", "passed", "away", "succession", "estate", "spouse", "widow", "widower", "mother", "father", "parent", "family"],
    phrases: ["passed away", "inherited a house", "inherited property", "surviving spouse", "owner died", "heir property", "my mother died", "my father died", "usufruct", "succession"],
    answer: `<p>The Louisiana Constitution extends the homestead exemption to a <strong>surviving spouse who keeps living in the home</strong>, whether the spouse owns an interest, holds a usufruct (the right to use the property), or the home is in a qualifying trust <cite>S2</cite>.</p>
<p>For <strong>heirs</strong>, the Constitution says the exemption on a home with several owners is limited to the ownership share of the owners who live there <cite>S2</cite>. A Loyola Law practice manual gives the example of two of three heirs living in the home getting two-thirds of the benefit <cite>S29</cite>. If you live in an inherited home but the title isn't in your name, you may need to open a <strong>succession</strong>, the court process that transfers a deceased person's property <cite>S28</cite>.</p>
<p><strong>What I don't know:</strong> exactly what the Orleans Parish Assessor asks heirs to bring, or whether they'll grant the exemption before a succession is finished. The manual says some assessors wrongly wait for a court judgment <cite>S29</cite>. Ask the Assessor's Office, and for the succession itself, talk to a lawyer or a legal aid office.</p>`,
    sources: ["S2", "S29", "S28"], contact: true
  }
];
