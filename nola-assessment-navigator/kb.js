/* NOLA Assessment Navigator — Layer 1 knowledge base.
   Every fact here must trace to an ID in SOURCES (mirrors CLAUDE.md §2.9).
   {{APPEAL_STATUS}} is filled in by app.js based on today's date. */

const SOURCES = {
  S1:  { label: "La. Const. Art. VII §18 (classification, ratios, reappraisal)", url: "https://www.legis.la.gov/Legis/Law.aspx?d=206545", official: true },
  S2:  { label: "La. Const. Art. VII §20 (homestead exemption)", url: "https://legis.la.gov/legis/law.aspx?d=206550", official: true },
  S3:  { label: "La. R.S. 47:1703 (homestead statute)", url: "https://legis.la.gov/legis/law.aspx?d=101333", official: true },
  S4:  { label: "Orleans Parish Assessor — 2027 Assessment Rolls Open July 15 to Aug. 17 (July 13, 2026)", url: "https://www.nolaassessor.com/2026/07/13/2027-assessment-rolls-open-for-public-inspection-july-15-to-august-17/", official: true },
  S5:  { label: "Orleans Parish Assessor — 2026 Assessment Rolls Open July 15 to Aug. 15 (July 14, 2025)", url: "https://www.nolaassessor.com/2025/07/14/2026-assessment-rolls-open-for-public-inspection-july-15-to-august-15/", official: true },
  S6:  { label: "Orleans Parish Assessor — New Online Assessment Appeal System (July 22, 2025)", url: "https://www.nolaassessor.com/2025/07/22/opao-rolls-out-new-online-assessment-appeal-system/", official: true },
  S7:  { label: "Orleans Parish Assessor — Homestead & SAL", url: "https://www.nolaassessor.com/homestead-sal/", official: true },
  S8:  { label: "Orleans Parish Assessor — Homestead flyer: Once Gained, Permanently Applied", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/2021-homestead-exempt-flyer_071221.pdf", official: true },
  S9:  { label: "Orleans Parish Assessor — Homestead Exemption application", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2024/02/OPAO-HE-Appl.pdf", official: true },
  S10: { label: "Orleans Parish Assessor — Mass appraisal process flyer", url: "https://www.nolaassessor.com/wp-content/uploads/sites/80/2023/01/mass_process_flyer2021.pdf", official: true },
  S11: { label: "City of New Orleans Treasury — Millages: How Taxes are Calculated", url: "https://nola.gov/next/treasury/topics/how-taxes-are-calculated/", official: true },
  S12: { label: "City of New Orleans Treasury — FAQ", url: "https://nola.gov/next/treasury/topics/faq/", official: true },
  S13: { label: "New Orleans City Council — Property Tax Assessments and Appeals", url: "https://council.nola.gov/resources/property-tax-assessments-and-appeals/", official: true },
  S14: { label: "La. Admin. Code tit. 61 §V-3103 — Appeals to the Louisiana Tax Commission", url: "https://www.law.cornell.edu/regulations/louisiana/La-Admin-Code-tit-61-SS-V-3103", official: true },
  S15: { label: "La. Legislative Auditor — Evaluation of OPAO's 2024 quadrennial reappraisal", url: "https://lla.la.gov/publicreports.nsf/0/f74bf8c6ffebdf7f86258a8d00657f6c/$file/000037d0b.pdf", official: true },
  S16: { label: "The Center Square — Audit: Orleans Parish used prohibited 'sales chasing'", url: "https://www.thecentersquare.com/louisiana/article_29aad166-a5cc-11ee-97ed-8324ed068b6d.html", official: false },
  S17: { label: "Bureau of Governmental Research — About Your Property Taxes", url: "https://www.bgr.org/about-your-property-taxes/", official: false },
  S18: { label: "Bureau of Governmental Research — 2026 Property Tax Dashboard", url: "https://www.bgr.org/report-index/2026-property-tax-dashboard-update/", official: false },
  S19: { label: "Fox 8 — Property owners could pay more under proposed 2027 tax increase (Sept. 28, 2026)", url: "https://www.fox8live.com/2026/09/28/new-orleans-property-owners-could-pay-more-under-proposed-2027-tax-increase/", official: false },
  S20: { label: "PAR Louisiana — Guide to the Fall 2026 Constitutional Amendments", url: "https://parlouisiana.org/wp-content/uploads/2026/10/PAR-Guide-to-the-Fall-2026-Constitutional-Amendments-FINAL.pdf", official: false },
  S21: { label: "Verite News — Assessor race guide", url: "https://veritenews.org/guides/2025-new-orleans-election-guide/assessor-race/", official: false },
  S22: { label: "Biz New Orleans — 2025 Assessment Rolls Open July 15 to Aug. 15", url: "https://bizneworleans.com/2025-assessment-rolls-open-july-15-to-aug-15/", official: false },
  S23: { label: "USA Today Network — Louisiana voters changed the state Constitution (Nov. 2022)", url: "https://news.yahoo.com/louisiana-voters-changed-state-constitution-142759103.html", official: false },
  S24: { label: "AARP Foundation — Louisiana property tax relief", url: "https://my.aarpfoundation.org/property-taxes/taxpayer-states/louisiana/", official: false },
  S25: { label: "Jefferson Parish Assessor — Homestead Exemption (disabled-veteran amendment)", url: "https://www.jpassessor.net/Resources/HomesteadExemption", official: true },
  S26: { label: "Bureau of Governmental Research — PolicyWatch: Revisiting Assessment Issues", url: "https://www.bgr.org/report-index/policywatch-revisiting-assessment-issues-in-new-orleans/", official: false },
  S27: { label: "City of New Orleans — Pay Property Tax", url: "https://nola.gov/property-tax/", official: true }
};

/* keywords: single stemmed-ish words (weight 1). phrases: multi-word strings (weight 3). */
const ENTRIES = [
  /* ---------- 5.1 How values are set ---------- */
  {
    id: "how-value-set", topic: "How values are set",
    title: "How the Assessor decides what a property is worth",
    keywords: ["decide", "worth", "value", "determine", "mass", "appraisal", "cama", "model", "comparable", "sales", "estimate", "calculate", "figure"],
    phrases: ["how does the assessor", "what my house is worth", "how is my value", "mass appraisal", "how are values set", "how is value determined", "market value determined"],
    answer: `<p>The Orleans Parish Assessor must value property at <strong>fair market value</strong>, roughly what it would sell for between a willing buyer and seller <cite>S1</cite>.</p>
<p>Because there are far too many parcels to appraise one by one, the office uses <strong>computer-assisted mass appraisal (CAMA)</strong>. The model looks at sales of similar properties nearby, your property's features (size, age, condition, use, building type), location, and market trends. Sales comparison is the preferred method. The cost and income approaches are used for some property types <cite>S10</cite><cite>S15</cite>.</p>
<p>For the 2024 reappraisal the office split the parish into <strong>393 valuation neighborhoods</strong> <cite>S15</cite><cite>S16</cite>. The Constitution requires a full reappraisal at least every four years <cite>S1</cite>.</p>
<p><strong>Tip:</strong> check the property features listed for your parcel on the Assessor's site. A wrong square footage or condition is one of the easiest things to get corrected.</p>`,
    sources: ["S1", "S10", "S15", "S16"]
  },
  {
    id: "value-up-no-change", topic: "How values are set",
    title: "Why your value can change when you didn't change anything",
    keywords: ["inspect", "inspection", "visit", "nothing", "didn't", "changed", "went", "increase", "jump", "why", "higher"],
    phrases: ["why did my value go up", "didn't change anything", "come inspect", "value went up", "assessment went up", "why is my assessment higher"],
    answer: `<p>Mass appraisal values whole neighborhoods from sales data. So your value can rise because <strong>similar homes near you sold for more</strong>, even if no one visited your house and you made no changes <cite>S10</cite><cite>S15</cite>.</p>
<p>Values move most in a <strong>reappraisal year</strong>. The 2024 reappraisal raised total assessed value about 20% <cite>S26</cite>, and the <strong>2027 roll</strong> (posted July 2026) carries new reappraised values <cite>S4</cite>. In other years, changes usually come from a sale, a permit or renovation, new construction, a demolition, or a correction.</p>
<p>A higher value does <em>not</em> automatically raise your bill by the same percent. In reassessment years taxing bodies must roll back millage <cite>S11</cite>. Ask me "Will my taxes go up the same amount?" for more.</p>`,
    sources: ["S10", "S15", "S26", "S4", "S11"]
  },
  {
    id: "assessed-vs-market", topic: "How values are set",
    title: "Assessed value vs. market value",
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
    keywords: ["audit", "auditor", "chasing", "fair", "accurate", "accuracy", "dispersion", "bgr", "criticism", "legislative"],
    phrases: ["sales chasing", "legislative auditor", "are assessments fair", "is the assessor accurate"],
    answer: `<p>At the City Council's request, the Louisiana Legislative Auditor reviewed the tax year 2024 reappraisal <cite>S15</cite>. Reported findings:</p>
<ul><li>About <strong>3,803 parcels</strong> may have been "sales chased," meaning set at their recent sale price, which Tax Commission rules prohibit <cite>S16</cite>.</li>
<li>Assessments were <strong>not too high or too low in the aggregate</strong> <cite>S16</cite>.</li>
<li>The Assessor disputes the sales-chasing claim and cites a <strong>coefficient of dispersion of 17.6%</strong>, which he says is in the acceptable range <cite>S16</cite>. The Bureau of Governmental Research has raised related concerns <cite>S26</cite>.</li></ul>
<p>I'm presenting these views neutrally. Read the full report for details.</p>`,
    sources: ["S15", "S16", "S26"]
  },

  /* ---------- 5.2 Assessed value + millage → bill ---------- */
  {
    id: "bill-calc", topic: "From value to tax bill",
    title: "How your property tax bill is calculated (worked example)",
    keywords: ["bill", "calculate", "calculated", "compute", "formula", "how", "much", "owe", "pay", "taxes", "example", "estimate"],
    phrases: ["how is my tax bill calculated", "how is my property tax calculated", "how much tax", "worked example", "tax bill calculated", "how are taxes calculated", "calculate my taxes"],
    answer: `<p><strong>Tax = (assessed value − exemptions) × millage ÷ 1,000</strong>, added up across every millage that applies to the property <cite>S11</cite><cite>S17</cite>.</p>
<table><tr><th>Step</th><th>Math</th><th>Result</th></tr>
<tr><td>Fair market value</td><td>set by Assessor</td><td>$300,000</td></tr>
<tr><td>× 10% residential ratio</td><td>$300,000 × 0.10</td><td>$30,000 assessed</td></tr>
<tr><td>− Homestead exemption</td><td>$30,000 − $7,500</td><td>$22,500 taxable</td></tr>
<tr><td>× millage (~121.20 mills, 2026)</td><td>$22,500 × 0.12120</td><td><strong>≈ $2,727 / year</strong></td></tr>
<tr><td>Same home, no homestead</td><td>$30,000 × 0.12120</td><td>≈ $3,636 / year</td></tr></table>
<p>Sources: ratio <cite>S1</cite>, homestead amount <cite>S2</cite>, millage concept <cite>S11</cite>.</p>
<p><strong>Caveats:</strong> the ~121.20-mill combined rate is approximate and should be confirmed on the Treasury's millage table <cite>S11</cite>. Some millages, such as certain police and fire taxes, are <em>not</em> reduced by homestead <cite>S19</cite>, and special districts like the Downtown Development District add more <cite>S17</cite>. This is an illustration, not your bill.</p>`,
    sources: ["S11", "S17", "S1", "S2", "S19"]
  },
  {
    id: "mill", topic: "From value to tax bill",
    title: "What a mill (millage rate) is",
    keywords: ["mill", "mills", "millage", "rate", "rates", "who", "sets", "levy"],
    phrases: ["what is a mill", "what is millage", "millage rate", "who sets the millage", "tax rate"],
    answer: `<p>A <strong>mill</strong> is one-tenth of one percent: <strong>$1 of tax per $1,000 of taxable assessed value</strong> <cite>S13</cite><cite>S11</cite>.</p>
<p>Each taxing body (the City, School Board, levee and drainage districts, libraries, police, fire, and others) sets its own millage, and some changes need voter approval. They add up to your total rate <cite>S11</cite>. BGR reports which rates apply where <cite>S18</cite>. The 2026 combined East Bank rate is roughly 121 mills, but confirm the official table <cite>S11</cite>.</p>
<p>You can't appeal a millage. Rates change through public hearings and elections <cite>S13</cite>.</p>`,
    sources: ["S13", "S11", "S18"]
  },
  {
    id: "rollback", topic: "From value to tax bill",
    title: "Rollback and roll-forward",
    keywords: ["rollback", "roll", "forward", "back", "neutral", "revenue", "reduce", "lower"],
    phrases: ["roll back", "roll forward", "rollback", "revenue neutral"],
    answer: `<p>When a reassessment raises total property values, Louisiana law requires each taxing body to <strong>roll back</strong> its millage so it collects about the same revenue. It may then vote to <strong>roll forward</strong>, raising the rate back up toward its prior maximum <cite>S11</cite>.</p>
<p>For 2027, the City filed two versions of its levy. The general municipal tax would be <strong>12.23 mills</strong> (rolled back) or <strong>13.91 mills</strong> (rolled forward). Fox 8 reported the proposed changes across a group of city millages would add about <strong>$178 a year</strong> on a $300,000 homesteaded home <cite>S19</cite>. These were proposals as of late September 2026, not the final levy.</p>`,
    sources: ["S11", "S19"]
  },
  {
    id: "bill-due", topic: "From value to tax bill",
    title: "When the bill comes and how to pay",
    keywords: ["due", "when", "pay", "payment", "mailed", "late", "interest", "penalty", "treasury", "online", "january"],
    phrases: ["when is my tax bill due", "who do i pay", "how do i pay", "pay my property tax", "when are taxes due", "late payment"],
    answer: `<p>The City of New Orleans <strong>Bureau of the Treasury</strong> sends bills and collects payment. The Assessor sets values but doesn't collect taxes <cite>S12</cite><cite>S27</cite>.</p>
<ul><li>Bills usually go out in <strong>late December</strong>, and payment is usually due <strong>January 31</strong>. For example, the bill for the 2027 roll should arrive about December 2026 and be due about January 31, 2027 <cite>S12</cite>. The City has extended the deadline in some years (to Feb. 28 in 2025), so check the current notice.</li>
<li>After the due date, interest accrues (1% per month in the City's 2022 notice), and not receiving a bill doesn't excuse a late payment <cite>S12</cite>.</li>
<li>Pay online or find payment options at nola.gov/property-tax <cite>S27</cite>.</li></ul>`,
    sources: ["S12", "S27"]
  },
  {
    id: "special-districts", topic: "From value to tax bill",
    title: "Why neighbors can have different tax rates",
    keywords: ["district", "districts", "downtown", "ddd", "security", "levee", "west", "bank", "algiers", "different", "neighbor", "fee"],
    phrases: ["special district", "security district", "downtown development district", "west bank", "different rate"],
    answer: `<p>Not every millage applies everywhere. East Bank and West Bank parcels fall in different levee districts, and some areas also pay the <strong>Downtown Development District</strong>, a neighborhood <strong>security or improvement district</strong>, or a flat fee <cite>S17</cite><cite>S18</cite>. That's why two homes with the same value can get different bills.</p>
<p>BGR's dashboard estimates bills by area <cite>S18</cite>, and the Treasury lists rates by taxing body <cite>S11</cite>.</p>`,
    sources: ["S17", "S18", "S11"]
  },
  {
    id: "commercial", topic: "From value to tax bill",
    title: "Commercial and rental property",
    keywords: ["commercial", "business", "rental", "landlord", "income", "apartment", "investment", "office", "store"],
    phrases: ["commercial property", "rental property", "income property", "business property", "homestead on my rental", "rent out", "rental house"],
    answer: `<p>Land is assessed at <strong>10%</strong> of FMV. Commercial buildings and other non-residential property are assessed at <strong>15%</strong> <cite>S1</cite>. For income-producing property the Assessor may use the income approach as well as sales and cost <cite>S10</cite>.</p>
<p>A rental you don't live in <strong>can't get the homestead exemption</strong>, because homestead requires that you own and occupy the home <cite>S2</cite><cite>S7</cite>. How residential rentals are classified in the roll is something I don't know for certain. Ask the Assessor's Office.</p>`,
    sources: ["S1", "S10", "S2", "S7"], contact: true
  },

  /* ---------- 5.3 Exemptions ---------- */
  {
    id: "homestead-apply", topic: "Exemptions",
    title: "How to apply for the homestead exemption",
    keywords: ["homestead", "apply", "application", "bring", "documents", "file", "sign", "need", "proof", "register", "claim"],
    phrases: ["apply for homestead", "homestead exemption", "what do i bring", "how do i get homestead", "file for homestead", "sign up for homestead"],
    answer: `<p>The <strong>homestead exemption</strong> takes <strong>$7,500 off your assessed value</strong>, which equals the first <strong>$75,000 of market value</strong>. It applies only to the home you <strong>own and live in</strong> as your primary residence, and you must own and occupy it by <strong>December 31</strong> of the tax year <cite>S2</cite><cite>S3</cite><cite>S7</cite>.</p>
<p><strong>How to apply:</strong> <strong>All owners who live in the home must go in person</strong> to the Assessor's Office, City Hall, 1300 Perdido St., Room 4E01 <cite>S8</cite><cite>S9</cite>. Bring:</p>
<ul><li>Proof of ownership: act of sale or deed</li>
<li>A Louisiana driver's license or state ID showing the property address</li>
<li>A current Entergy (or cable) bill for the property. The name, service address, and mailing address must match <cite>S7</cite><cite>S8</cite>.</li></ul>
<p>If your mailing address differs from the property, you'll need a recorded power of attorney. A married couple gets only one homestead <cite>S9</cite>.</p>
<p>In Orleans the exemption reduces state, general city, school, levee, and levee-district taxes <cite>S2</cite>, but not every millage.</p>`,
    sources: ["S2", "S3", "S7", "S8", "S9"], contact: true
  },
  {
    id: "homestead-renew", topic: "Exemptions",
    title: "Do you need to reapply every year?",
    keywords: ["reapply", "renew", "every", "year", "annual", "annually", "permanent", "again", "keep"],
    phrases: ["reapply every year", "renew my homestead", "do i have to reapply", "every year"],
    answer: `<p><strong>No.</strong> Once your homestead exemption is granted, it stays on. The Assessor's Office says you don't need to reapply every year <cite>S8</cite>.</p>
<p>You do need to act if something changes: you sell or move out, an owner dies, or the deed changes. In those cases contact the Assessor's Office. Owners who qualified for the <strong>Special Assessment Level</strong> under 65 may need to re-certify their income each year <cite>S24</cite>.</p>
<p>It's worth checking each summer, during the open-roll period, that your exemptions still show on your parcel <cite>S4</cite>.</p>`,
    sources: ["S8", "S24", "S4"], contact: true
  },
  {
    id: "sal", topic: "Exemptions",
    title: "Special Assessment Level (\"the freeze\") for seniors, disabled owners, and veterans",
    keywords: ["freeze", "frozen", "senior", "65", "older", "elderly", "age", "disabled", "disability", "sal", "special", "level", "income", "limit"],
    phrases: ["special assessment level", "over 65", "freeze my assessment", "senior freeze", "assessment frozen", "income limit"],
    answer: `<p>The <strong>Special Assessment Level (SAL)</strong> freezes your home's <strong>assessed value</strong> at the level when you qualified <cite>S1</cite><cite>S7</cite>.</p>
<p><strong>Who qualifies:</strong> you must already have the homestead exemption and be (a) 65 or older, (b) permanently and totally disabled, (c) a veteran with a service-connected disability rating of 50% or more, or (d) certain surviving spouses or military families <cite>S1</cite><cite>S24</cite>. Your household adjusted gross income must be at or below a limit: a <strong>$100,000 base, indexed for inflation</strong>. One source reports about $102,700 for 2026, so <strong>please confirm the current figure</strong> with the Assessor <cite>S24</cite>.</p>
<p><strong>Important:</strong> the freeze locks your <em>assessed value</em>, not your bill. If millage rates rise, your taxes can still go up <cite>S24</cite>.</p>
<p>Apply at the Assessor's Office with proof of age or disability and income <cite>S7</cite>. The November 3, 2026 ballot has a <em>proposed</em> amendment (Amendment 9) to raise the income limit to $150,000 <cite>S20</cite>. I don't know the outcome yet.</p>`,
    sources: ["S1", "S7", "S24", "S20"], contact: true
  },
  {
    id: "veteran", topic: "Exemptions",
    title: "Disabled veteran exemptions",
    keywords: ["veteran", "veterans", "va", "military", "service", "disabled", "rating", "100"],
    phrases: ["disabled veteran", "100 percent disabled", "veteran exemption", "service connected"],
    answer: `<p>Veterans with a VA service-connected disability rating of <strong>50% or more</strong> can get an additional exemption on top of homestead. Reported tiers: <strong>50–69%: +$2,500</strong> of assessed value; <strong>70–99%: +$4,500</strong>; <strong>100% total and permanent: full exemption</strong> of the homestead <cite>S25</cite><cite>S7</cite>. Confirm the exact amounts with the Assessor's Office, because I took the tiers from a secondary source.</p>
<p>Qualifying veterans may also be eligible for the Special Assessment Level freeze <cite>S24</cite>. Bring your VA rating letter, proof of homestead, ID, and an Entergy bill <cite>S7</cite>.</p>
<p>A <em>proposed</em> November 3, 2026 amendment (Amendment 1) would let a disabled veteran's surviving spouse move the exemption to a new home once <cite>S20</cite>.</p>`,
    sources: ["S25", "S7", "S24", "S20"], contact: true
  },
  {
    id: "first-responder", topic: "Exemptions",
    title: "First responder exemption",
    keywords: ["first", "responder", "firefighter", "police", "officer", "emt", "paramedic"],
    phrases: ["first responder", "firefighter exemption", "police officer exemption"],
    answer: `<p>The Assessor's Office lists an additional <strong>first responder exemption</strong> of about <strong>$25,000 of market value</strong> (about $2,500 of assessed value) on top of homestead. To apply, bring an <strong>employment verification letter on your agency's letterhead</strong> <cite>S7</cite>. Ask the office which positions qualify.</p>`,
    sources: ["S7"], contact: true
  },
  {
    id: "amendments-2026", topic: "Exemptions",
    title: "Property tax amendments on the November 2026 ballot",
    keywords: ["amendment", "amendments", "ballot", "vote", "election", "november", "proposed"],
    phrases: ["constitutional amendment", "on the ballot", "november election", "amendment 9", "amendment 6", "amendment 1"],
    answer: `<p>PAR Louisiana's guide to the fall 2026 ballot lists several property tax measures <cite>S20</cite>:</p>
<ul><li><strong>Amendment 1:</strong> a disabled veteran's surviving spouse could move the exemption to a new home once.</li>
<li><strong>Amendment 6:</strong> parishes and cities could offer an extra exemption to SAL-eligible owners 65 and older.</li>
<li><strong>Amendment 9:</strong> raise the SAL income limit to $150,000.</li></ul>
<p>These are <strong>proposals</strong>. I don't know the results, so check certified results after the election. I don't take positions on ballot measures.</p>`,
    sources: ["S20"]
  },

  /* ---------- 5.4 2027 reassessment ---------- */
  {
    id: "reassess-taxes", topic: "2027 reassessment",
    title: "Will my taxes rise as much as my value?",
    keywords: ["taxes", "go", "up", "same", "amount", "rise", "increase", "percent", "reassessment", "2027", "higher"],
    phrases: ["will my taxes go up", "same amount", "taxes go up the same", "value went up a lot", "how much will my taxes"],
    answer: `<p><strong>Not necessarily.</strong> In a reassessment year, when total values go up, each taxing body must <strong>roll back</strong> its millage so it collects about the same total revenue. That means a 20% value increase usually doesn't produce a 20% tax increase <cite>S11</cite>.</p>
<p>Two things can still raise your bill:</p>
<ul><li>If your value rose <strong>more than the citywide average</strong>, you carry a larger share of the total.</li>
<li>Taxing bodies may <strong>roll forward</strong>. For 2027 the City proposed raising its general municipal tax from 12.23 to 13.91 mills, which Fox 8 estimated at about <strong>$178 more a year</strong> on a $300,000 homesteaded home <cite>S19</cite>. That was a proposal, not the final rate.</li></ul>
<p>I can't estimate your bill yet. Parcel lookup (Layer 2) isn't built.</p>`,
    sources: ["S11", "S19"]
  },
  {
    id: "why-2027", topic: "2027 reassessment",
    title: "What the 2027 reassessment is",
    keywords: ["2027", "reassessment", "reappraisal", "why", "quadrennial", "new", "values", "what"],
    phrases: ["why is there a reassessment", "2027 reassessment", "what is the reassessment", "what does the 2027", "reassessment mean"],
    answer: `<p>The <strong>2027 assessment roll</strong>, posted for inspection July 15 – Aug. 17, 2026, carries <strong>new market values</strong> from a parish-wide reappraisal <cite>S4</cite><cite>S21</cite>. The last one, for tax year 2024, raised total assessed value about 20% <cite>S26</cite>. The Louisiana Constitution requires reappraisal <strong>at least every four years</strong> <cite>S1</cite>.</p>
<p>Orleans names each roll for the year the bill is due. So the "2027 roll" was posted in 2026, and its bills arrive around December 2026, due around January 31, 2027 <cite>S4</cite><cite>S12</cite>.</p>
<p><strong>What I don't know:</strong> why this cycle falls on 2027 rather than 2028 (three years is allowed, but I found no official explanation). The Assessor's Office can answer that.</p>
<p><strong>What to do:</strong> check your new value and make sure your homestead or SAL still shows. {{APPEAL_STATUS}}</p>`,
    sources: ["S4", "S21", "S26", "S1", "S12"], contact: true
  },
  {
    id: "cap", topic: "2027 reassessment",
    title: "Is there a cap on assessment increases?",
    keywords: ["cap", "limit", "maximum", "capped", "10%", "percent", "limited"],
    phrases: ["is there a cap", "cap on assessment", "limit on how much", "10 percent cap", "how much can my assessment"],
    answer: `<p><strong>There's no general yearly cap in Orleans Parish.</strong> In 2022 voters narrowly <strong>rejected</strong> Amendment 6, which would have capped yearly increases on Orleans homesteads at 10% (642,462 against, 635,559 for) <cite>S23</cite>.</p>
<p>The closest thing to a cap is the <strong>Special Assessment Level freeze</strong> for eligible seniors, disabled owners, and veterans, which locks assessed value but not millage <cite>S1</cite><cite>S24</cite>.</p>`,
    sources: ["S23", "S1", "S24"]
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
<tr><td>2027 (reassessment)</td><td>July 15 – Aug. 17, 2026 <cite>S4</cite></td><td>about Jan. 31, 2027</td></tr></table>
<p>Bills usually go out in late December and are due January 31 <cite>S12</cite>.</p>`,
    sources: ["S22", "S5", "S4", "S12"]
  },

  /* ---------- 5.5 Appeals ---------- */
  {
    id: "appeal-how", topic: "Appeals",
    title: "How to appeal your assessment, and the deadlines",
    keywords: ["appeal", "appeals", "contest", "dispute", "challenge", "deadline", "protest", "lower", "file", "board", "review"],
    phrases: ["how do i appeal", "appeal my assessment", "appeal deadline", "board of review", "dispute my assessment", "challenge my value", "contest my assessment"],
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
    keywords: ["missed", "late", "passed", "too", "after", "now", "closed", "over", "next"],
    phrases: ["missed the deadline", "too late", "deadline passed", "what can i do now", "after the deadline"],
    answer: `<p>{{APPEAL_STATUS}}</p>
<p>I don't know of a late-filing option. Contact the Assessor's Office to ask whether a correction is possible, for example for a factual error in your property's description.</p>
<p>What you can still do:</p><ul><li>Make sure your <strong>homestead and other exemptions</strong> are on file. Homestead requires you to own and occupy the home by Dec. 31 of the tax year <cite>S3</cite>.</li>
<li>Prepare for the next open-roll period, which is usually <strong>mid-July to mid-August</strong> <cite>S4</cite><cite>S5</cite>.</li>
<li>If you already got a Board of Review decision, the Tax Commission deadline is 30 calendar days <cite>S14</cite>.</li></ul>`,
    sources: ["S3", "S4", "S5", "S14"], contact: true
  },
  {
    id: "ltc", topic: "Appeals",
    title: "Appealing to the Louisiana Tax Commission",
    keywords: ["tax", "commission", "ltc", "state", "after", "decision", "disagree", "next", "level", "court"],
    phrases: ["louisiana tax commission", "tax commission", "disagree with the board", "after the board of review", "go to court", "what happens after", "lose at the board"],
    answer: `<p>If you disagree with the Board of Review's decision, you can appeal to the <strong>Louisiana Tax Commission</strong>. File within <strong>30 calendar days</strong> of the earlier of (a) when the Board's written decision was properly sent to you or (b) when you actually received it <cite>S14</cite>. The Constitution provides for this review <cite>S1</cite>.</p>
<p>Some websites say "10 business days," but that conflicts with the regulation, so confirm with the Commission. After the Tax Commission, review is in court. I don't know that deadline and can't advise on litigation, so talk to a lawyer.</p>`,
    sources: ["S14", "S1"], contact: true
  },
  {
    id: "contacts", topic: "Contacts",
    title: "Who to contact",
    keywords: ["contact", "phone", "call", "number", "talk", "human", "person", "help", "email", "who", "assessor", "office"],
    phrases: ["who do i call", "talk to a person", "phone number", "contact the assessor", "speak to someone", "real person"],
    answer: `<ul><li><strong>Orleans Parish Assessor's Office</strong> (values, exemptions, informal appeals): City Hall, 1300 Perdido St., Room 4E01 <cite>S9</cite>. Appraiser appointments: <strong>(504) 754-8811</strong>. Website: nolaassessor.com <cite>S4</cite>.</li>
<li><strong>Board of Review / City Council</strong> (formal appeals): council.nola.gov <cite>S13</cite></li>
<li><strong>Bureau of the Treasury</strong> (bills and payments): nola.gov/property-tax <cite>S27</cite></li>
<li><strong>Louisiana Tax Commission</strong> (appeals after the Board) <cite>S14</cite></li>
<li>For legal help: Southeast Louisiana Legal Services (slls.org) or a licensed attorney.</li></ul>`,
    sources: ["S9", "S4", "S13", "S27", "S14"]
  },
  {
    id: "sold-moved", topic: "Exemptions",
    title: "Buying, selling, or moving and the homestead",
    keywords: ["bought", "buy", "new", "home", "sold", "sell", "moved", "move", "purchase", "transfer", "closing"],
    phrases: ["just bought", "new home", "i moved", "sold my house", "first time buyer", "bought a house"],
    answer: `<p>The homestead exemption doesn't move with you. It's tied to the home you own and occupy <cite>S2</cite>. After buying, apply <strong>in person</strong> at the Assessor's Office with your act of sale, a Louisiana ID showing the new address, and a current Entergy bill <cite>S8</cite>. You must own and occupy the home by <strong>Dec. 31</strong> of the tax year <cite>S3</cite>.</p>
<p>Only one homestead is allowed per person or married couple <cite>S9</cite>. Tell the Assessor if you leave a home that has your homestead on it.</p>`,
    sources: ["S2", "S8", "S3", "S9"], contact: true
  }
];
