"""Pull the expected values for the chatbot test questions straight from the raw roll CSV
(independent of the web export). Writes tests/chatbot_expected.json. No owner names."""
import json
from collections import Counter
from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv"
KEEP = ["Parcel ID(s)", "Property Address(es)", "Occupancy Type(s)", "Land Market Value", "Improvement Market Value",
        "Total Market Value", "Total Assessed Value", "Homestead Exemption Amount", "Veteran Exemption Amount",
        "Other Exemption Amount", "Taxable Assessed Value", "Freeze Code(s)", "Veteran Exemption Type Code(s)",
        "Assessment Status(es)"]

rows = list(csv.DictReader(open(RAW, encoding="utf-8-sig", newline="")))
addr_count = Counter(r["Property Address(es)"] for r in rows)
unique = [r for r in rows if addr_count[r["Property Address(es)"]] == 1 and "|" not in r["Property Address(es)"]]
pick = lambda f: next(r for r in unique if f(r))
chosen = {
    "condo": next(r for r in rows if r["Parcel ID(s)"] == "102000079"),
    "gravier": next(r for r in rows if r["Parcel ID(s)"] == "105100749"),
    "frozen": pick(lambda r: r["Occupancy Type(s)"] == "RESIDENTIAL" and r["Freeze Code(s)"] == "1"
                   and 0.06 < int(r["Total Assessed Value"]) / max(1, int(r["Total Market Value"])) < 0.08),
    "veteran100": pick(lambda r: r["Veteran Exemption Type Code(s)"] == "3" and r["Taxable Assessed Value"] == "0"
                       and r["Occupancy Type(s)"] == "RESIDENTIAL"),
    "exempt": pick(lambda r: r["Assessment Status(es)"] == "EX" and r["Occupancy Type(s)"] == "EXEMPT"
                   and int(r["Total Market Value"]) > 100000),
}
out = {k: {f: v[f] for f in KEEP} for k, v in chosen.items()}

# Recorded taxes, summed straight from the raw LTC millage rows (independent of pipeline/ltc_roll.py),
# and the 2027 market value straight from the raw 2027 AVALUE rows.
import glob
ids = {v["Parcel ID(s)"]: k for k, v in out.items()}
def raw(year, name):
    for f in glob.glob(str(ROOT / f"data/raw/ltc{year}/x/*/{name}.TXT")):
        for r in csv.reader(open(f, encoding="latin-1", newline=""), quotechar="~"):
            if len(r) > 3 and r[2].strip() in ids:
                yield r
for year in (2026, 2027):
    for k in out:
        out[k][f"tax_{year}"] = 0.0
    for r in raw(year, "AMILLAGE"):
        out[ids[r[2].strip()]][f"tax_{year}"] += float(r[11] or 0)
for k in out:
    out[k]["market_2027"] = 0
for r in raw(2027, "AVALUE"):
    out[ids[r[2].strip()]]["market_2027"] += int(float(r[3] or 0))
for k in out:
    for y in (2026, 2027):
        out[k][f"tax_{y}"] = round(out[k][f"tax_{y}"], 2)
(ROOT / "tests/chatbot_expected.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
