"""Build docs/data-dictionary.md for the 2026 roll.

Run from nola-assessment-navigator/:  python3 pipeline/data_dictionary.py
Meanings are written by hand. Each is tagged:
  Verified  - checked against the data (an identity that holds on every row, or an obvious code)
  Inferred  - our best reading of the data pattern; not confirmed by the Assessor or LTC
  Unknown   - we could not work out what it means (listed again at the end)
Fill rates and examples are computed. Examples are omitted for fields that hold
owner names or mailing addresses (privacy rule, CLAUDE.md §3).
"""
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv"
OUT = ROOT / "docs/data-dictionary.md"

PRIVATE = {"Owner(s)", "Primary Owner(s)", "Assessment Contact Name(s)", "Owner Contact Name(s)",
           "Assessment Mailing Address 1", "Assessment Mailing Address 2", "Assessment Mailing Address 3",
           "Owner Mailing Address 1", "Owner Mailing Address 2", "Owner Mailing Address 3"}

V, I, U = "Verified", "Inferred", "Unknown"
MEANING = {
    "Tax Year": (V, "Tax year of the roll. Always 2026 (bills due early 2026)."),
    "Municipal District": (V, "Orleans Parish assessment district 1–7. Each district maps to specific wards (see Ward(s))."),
    "FIPS Code": (I, "LTC code for the district's tax roll (22171–22177, one per municipal district), not a county FIPS code."),
    "Tax Bill #": (V, "Tax bill number. Identical to Parcel ID on every row."),
    "Parcel ID(s)": (V, "Unique parcel identifier (163,135 unique values). Use this to join years and other data."),
    "Property Address(es)": (V, "Situs (property) address, roll format: no N/S direction, short suffixes (AV, BL, HW, PW, CR, WY), units after the suffix (\"ST CHARLES AV 607\"), \"HF\" for half addresses. 820 parcels list several addresses joined with \" | \"."),
    "Owner(s)": (V, "Owner name(s) as recorded. Not used in the app (privacy)."),
    "Primary Owner(s)": (V, "First-listed owner. Not used in the app."),
    "Assessment Status(es)": (I, "AC = active/taxable; EX = exempt (10,109 parcels, all vacant land or exempt occupancy)."),
    "Ward(s)": (V, "Ward number (01–17, with 7W/8W/9W). Wards nest inside municipal districts."),
    "Subdivision(s)": (V, "Subdivision or area name used by the Assessor (611 values). Blank on 1,831 parcels."),
    "Block(s)": (U, "Always blank in this file."),
    "Lot(s)": (U, "Always blank in this file. Square/lot appear inside Legal Description instead."),
    "Occupancy Type(s)": (V, "Use class: RESIDENTIAL, VACANT LAND, COMMERCIAL, EXEMPT; multi-record parcels list several joined by \" | \"."),
    "Vacant Lot Indicator(s)": (V, "Y if the parcel is vacant land. Matches Occupancy = VACANT LAND exactly (31,608)."),
    "Transfer Date(s)": (I, "Date of the last recorded transfer. 12/31/1994 on 8,112 parcels looks like a placeholder for \"before records were digitized\"."),
    "Purchase Price(s)": (I, "Price on the last transfer document. 0 on 50,933 parcels and nominal amounts ($10, $100) are common, and none are marked verified. Usable for a sales-ratio study only with filters (document type SALE, recent years, price over $10K, outlier ratios dropped). See Figure 5 in docs/week2-report.md."),
    "Verified Sale Indicator(s)": (I, "Whether the sale was verified as arm's-length. N on every row, so none are verified in this file."),
    "Conveyance Book(s)": (U, "Always blank."),
    "Conveyance Folio(s)": (U, "Always blank."),
    "Instrument Number(s)": (U, "Always blank."),
    "Instrument Type(s)": (I, "Type of the last transfer document: SALE, QUIT (quitclaim), SUCC (succession), SALW (sale with warranty?), etc. 434 codes; many are not explained."),
    "Lender ID(s)": (U, "Always blank."),
    "Tax Sale Indicator(s)": (U, "Always blank. Tax-sale status is not in this file."),
    "Tax Sale Date(s)": (U, "Always blank."),
    "Assessment Date(s)": (I, "01/01/2023 on every row. Likely the valuation date of the 2024 reappraisal that 2026 values carry forward from."),
    "Subdivision Phase(s)": (U, "Always blank."),
    "Legal Description(s)": (V, "Legal description (square, lot, bounding streets). Useful to tell apart parcels that share an address."),
    "Building Use(s)": (I, "R = residential, C = commercial building use."),
    "Structure Number(s)": (U, "Always blank."),
    "Auxiliary Square Feet": (U, "Always 0. No building-size data in this file."),
    "Garage Square Feet": (U, "Always 0."),
    "Living Square Feet": (V, "Despite the name, NOT square footage: it equals Assessment Record Count on 99.999% of rows (values 1–14)."),
    "Nonliving Square Feet": (U, "Always 0."),
    "Total Structure Square Feet": (U, "Always 0."),
    "Bathroom Count": (U, "Always 0. Not provided."),
    "Bedroom Count": (U, "Always 0. Not provided."),
    "Year(s) Built": (I, "Year built as recorded. 1994 is a placeholder on 42,390 parcels (mostly vacant land and commercial); residential years are rounded (79% end in 0 or 5)."),
    "Year(s) Renovated": (U, "Always blank."),
    "Life Expectancy Value(s)": (U, "Always blank."),
    "Condition(s)": (U, "Always \"NOT AVAILABLE\"."),
    "Construction Quality(s)": (U, "Always \"NOT AVAILABLE\"."),
    "Wall Code(s)": (U, "Always blank."),
    "Roof Code(s)": (U, "Always blank."),
    "Land Market Value": (V, "Assessor's fair market value of the land, in dollars."),
    "Improvement Market Value": (V, "Fair market value of buildings and other improvements."),
    "Other Market Value": (U, "Always 0."),
    "Total Market Value": (V, "Land + Improvement Market Value (holds on every row)."),
    "Land Assessed Value": (V, "Assessed value of land: 10% of land market value on 89% of rows; lower where a freeze applies."),
    "Improvement Assessed Value": (V, "Assessed value of improvements: 10% residential, 15% commercial (La. Const. Art. VII §18)."),
    "Other Assessed Value": (U, "Always 0."),
    "Total Assessed Value": (V, "Land + Improvement Assessed Value (holds on every row)."),
    "Homestead Exemption": (V, "Yes/No: homestead exemption on the parcel (64,873 Yes)."),
    "Homestead Exemption Amount": (V, "Assessed value removed by homestead. Max $7,500; partial amounts (e.g. $3,750) when only part of the ownership qualifies."),
    "Other Exemption Amount": (V, "Assessed value removed by other exemptions (e.g. government, religious, nonprofit). Equals full assessed value on exempt parcels."),
    "Veteran Exemption Amount": (V, "Assessed value removed by the disabled-veteran exemption ($2,500 and $4,500 are most common, matching the 50–69% and 70–99% tiers)."),
    "First Responder Exemption Amount": (V, "Assessed value removed by the first responder exemption ($2,500 most common)."),
    "Taxable Assessed Value": (V, "Total Assessed Value − (homestead + other + veteran + first responder), floored at 0. Holds on every row. This is what millage is applied to."),
    "Non-taxable Assessed Value": (U, "Always 0."),
    "Freeze Code(s)": (I, "Special Assessment Level (\"freeze\") code. 0 = none; 1–4 appear only with homestead. Frozen parcels are assessed below 10% (median 7.6%). What 1, 2, 3 and 4 each mean (age, disability, veteran…) is unknown."),
    "Usufruct Indicator(s)": (I, "Usufruct (right of use, often a surviving spouse). N on every row, so not usable."),
    "Other Exemption Indicator(s)": (V, "1 if the parcel has an \"other\" exemption. Matches Assessment Status = EX (10,109)."),
    "Veteran Exemption Indicator(s)": (I, "1 if a veteran exemption applies; 2 on 7 parcels (meaning unknown)."),
    "Tax Exemption Program Contract(s)": (I, "Contract number for a tax exemption program (57 parcels): likely the Industrial Tax Exemption Program (ITEP) or Restoration Tax Abatement."),
    "Assessment Record Count": (I, "Number of assessment records combined into this row (1 on 99.5% of parcels)."),
    "Value Item Count": (I, "Number of value line items (land + improvement per record; 2 × Assessment Record Count)."),
    "Parcel Record Count": (I, "Number of parcel records combined into this row."),
    "Owner Record Count": (I, "Number of owner records combined into this row."),
    "Improvement Record Count": (I, "Number of improvement records combined into this row."),
    "Legal Description Record Count": (I, "Number of legal description records combined into this row."),
    "Tax Exemption Program Record Count": (I, "1 if the parcel has a tax exemption program contract."),
    "Assessment Parcel Number(s)": (V, "Identical to Parcel ID on every row."),
    "Homestead Percentage(s)": (U, "Always 0. The real share is in Value Homestead Percentage(s)."),
    "Restoration Tax Exemption Indicator(s)": (U, "Always blank, even though Restoration Tax Abatement exists in New Orleans."),
    "Tax Account Number(s)": (U, "Always 0."),
    "Assessment Place FIPS Code(s)": (I, "LTC place code that tracks the ward (e.g. 96009 = ward 9W)."),
    "Assessment Taxpayer ID(s)": (U, "Always 0."),
    "Assessment Contact Name(s)": (I, "Contact person for the assessment (1,012 parcels). Not used in the app."),
    "Assessment Mailing Address 1": (V, "Tax-bill mailing address line 1 (often \"ET AL\" or \"C/O …\" overflow from the owner name). Not used in the app."),
    "Assessment Mailing Address 2": (V, "Mailing address line 2; \"NOT AVAILABLE\" when empty. Not used in the app."),
    "Assessment Mailing Address 3": (V, "City, state and ZIP of the mailing address. Not used in the app."),
    "Value Quantity Value(s)": (U, "Always 0."),
    "Value Unit Code(s)": (I, "Which value lines exist: L = land, I = improvement."),
    "LTC Subclass Code(s)": (U, "Louisiana Tax Commission property subclass codes (187 combinations, e.g. 3400 | 4000). Likely land vs. improvement classes, but the code table isn't in the file."),
    "Value Other Exemption Code(s)": (U, "Code for the type of \"other\" exemption (0, 4, 5, 6, …). Meanings unknown."),
    "Homestead Type Code(s)": (I, "1 = homestead applies, 0 = none."),
    "Value Homestead Percentage(s)": (V, "Share of the property covered by homestead (100.00, 050.00, 033.33…). Explains partial homestead amounts."),
    "Veteran Exemption Type Code(s)": (I, "Disabled-veteran tier. 1 ↔ $2,500 (155 of 173), 2 ↔ $4,500 (all 289 with an amount), 3 ↔ the rest of the assessed value, i.e. full exemption (likely 100% disabled). Inferred from amounts; not confirmed."),
    "First Responder Exemption Type Code(s)": (I, "1 if the first responder exemption applies."),
    "Town-Range Value(s)": (U, "Always blank (township/range is not used in Orleans)."),
    "Section Number(s)": (U, "Always blank."),
    "Parcel Place FIPS Code(s)": (I, "Same as Assessment Place FIPS Code, at the parcel level."),
    "Tax District Number(s)": (U, "Always blank, so special taxing districts (DDD, security districts) can't be identified from this file."),
    "Owner Taxpayer ID(s)": (U, "Always 0."),
    "Ownership Percentage(s)": (I, "Each owner's percentage share, joined with \" | \" when several."),
    "Owner Contact Name(s)": (I, "Owner contact person. Not used in the app."),
    "Owner Mailing Address 1": (V, "Owner mailing address line 1. Not used in the app."),
    "Owner Mailing Address 2": (V, "Owner mailing address line 2. Not used in the app."),
    "Owner Mailing Address 3": (V, "Owner mailing city/state/ZIP. Not used in the app."),
    "TEP Business Name(s)": (I, "Business holding a tax exemption program contract (57 parcels)."),
    "TEP Contract Start Date(s)": (I, "Exemption contract start date."),
    "TEP Contract End Date(s)": (I, "Exemption contract end date."),
    "TEP Contract Status Type(s)": (U, "Always blank."),
    "TEP Original Contract Amount(s)": (I, "Original investment amount in the exemption contract."),
    "TEP Revised Contract Amount(s)": (I, "Revised contract amount."),
    "TEP Exemption Percentage(s)": (I, "Percent of value exempted under the contract."),
    "TEP Fair Market Value(s)": (I, "Market value covered by the contract."),
    "TEP Assessed Value(s)": (I, "Assessed value covered by the contract."),
    "TEP Exempt Taxes(s)": (U, "Always 0."),
    "TEP Renewed Contract Start Date(s)": (U, "Always blank."),
    "TEP Renewed Contract End Date(s)": (U, "Always blank."),
    "TEP Penalty Year(s)": (U, "Always 0."),
    "TEP Industrial Exemption Type(s)": (U, "Exemption program type 0/1/3. Meanings unknown."),
    "LTC Source Archive": (V, "Which LTC zip file the row came from (one per municipal district)."),
    "LTC Source URL": (V, "Where the LTC publishes the rolls: https://stax.latax.la.gov/TaxRollsFolder."),
}


def main():
    df = pd.read_csv(RAW, dtype=str, encoding="utf-8-sig", low_memory=False)
    missing = [c for c in df.columns if c not in MEANING]
    assert not missing, f"Add meanings for: {missing}"
    rows = []
    for c in df.columns:
        s = df[c]
        filled = s.notna() & ~s.isin(["", "0", "NOT AVAILABLE"])
        status, meaning = MEANING[c]
        ex = "(private)" if c in PRIVATE else ", ".join(f"`{v[:28]}`" for v in s.dropna().value_counts().index[:3])
        cell = lambda x: str(x).replace("|", "\\|")  # a raw "|" would split the Markdown table cell
        rows.append(f"| {cell(c)} | {status} | {filled.mean():.0%} | {s.nunique():,} | {cell(ex)} | {cell(meaning)} |")
    unknown = [c for c in df.columns if MEANING[c][0] == U]
    empty = [c for c in unknown if not (df[c].notna() & ~df[c].isin(["", "0", "NOT AVAILABLE"])).any()]
    unclear = [c for c in unknown if c not in empty]
    md = f"""# Data dictionary: Orleans Parish 2026 roll

**File:** `Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv` (Box, course data folder)
**Origin:** Louisiana Tax Commission 2026 tax rolls for Orleans Parish, one archive per municipal district
(`LTC Source URL`: https://stax.latax.la.gov/TaxRollsFolder), combined into one file.
**Size:** {len(df):,} rows (one per parcel), {len(df.columns)} columns, UTF-8 with BOM.
**Generated by:** `pipeline/data_dictionary.py`. Fill % counts values other than blank, `0` and `NOT AVAILABLE`.

**Status key:**
- **Verified:** checked against the data, e.g. an identity that holds on every row.
- **Inferred:** our best reading of the pattern; not confirmed by the Assessor or the LTC.
- **Unknown:** we could not work out what it means.

Examples are hidden for owner and mailing fields (privacy).

| Field | Status | Fill % | Distinct | Most common values | Meaning |
|---|---|---|---|---|---|
""" + "\n".join(rows) + f"""

## What we could not figure out

**Fields with a value but no clear meaning ({len(unclear)}):**
""" + "\n".join(f"- **{c}**: {MEANING[c][1]}" for c in unclear) + """
- **Freeze Code(s) 1–4**: which code means age 65+, disability, veteran, etc.
- **Instrument Type(s)**: most of the 434 document-type codes.
- **Why 2026 values carry an Assessment Date of 01/01/2023**: our reading is that it's the 2024 reappraisal's valuation date, unconfirmed.

**Fields that are always empty, zero or "NOT AVAILABLE" ({n_empty}):** """.replace("{n_empty}", str(len(empty))) + ", ".join(empty) + """.

That means this file has **no building size, bedrooms, bathrooms, condition, tax-sale status, or special
taxing district**. The chatbot must say so instead of guessing.

**To resolve:** ask the Assessor's Office or the Louisiana Tax Commission for the roll's record layout and code tables
(freeze, veteran type, other-exemption, LTC subclass). See `docs/verification-checklist.md`.
"""
    OUT.write_text(md)
    print(f"wrote {OUT} ({len(df.columns)} fields, {len(unknown)} unknown)")


if __name__ == "__main__":
    main()
