"""Layer 3 market context from outside data: Zillow's typical home value by ZIP code, joined to parcels.

Run from nola-assessment-navigator/, after shard.js (which clears data/web/2026/):
  python3 pipeline/zillow_zip.py
Inputs (data/raw/box/, git-ignored because they're large):
  Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv   Zillow Home Value Index (ZHVI), all homes, mid-tier, smoothed
      and seasonally adjusted, monthly by ZIP. From the course Box folder "Zillow"; the same file is public at
      zillow.com/research/data.
  tab20_zcta520_tract20_natl.txt   Census Bureau 2020 ZIP Code Tabulation Area ↔ census tract relationship file
      (www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/).
Outputs:
  data/outside/zillow_zhvi_orleans_zips.csv   the 17 Orleans Parish ZIP rows, every month (saved copy of the source)
  data/outside/zcta_tract_orleans.csv         each Orleans census tract's ZIP areas and land-area shares
  data/web/2026/zhvi.json                     what the chatbot loads

How a parcel gets a ZIP: parcel ID → census block group (course crosswalk, export_web.py) → its census tract → the
ZIP area that covers the most of that tract's land. That's approximate, so the app says "most of this census tract
is in ZIP …" and shows the share. The roll has no ZIP for the property itself.

CLAUDE.md §3 data rule 6: these figures describe a ZIP's typical home. They are never used to estimate or judge one
parcel's value.
"""
import csv
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw/box"
ZHVI = RAW / "Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
REL = RAW / "tab20_zcta520_tract20_natl.txt"
OUT = ROOT / "data/web/2026/zhvi.json"
BASE = "2023-01-31"   # the month of the roll's valuation date, Jan. 1, 2023


def main():
    rows = [r for r in csv.DictReader(ZHVI.open(encoding="utf-8-sig")) if r["State"] == "LA" and r["CountyName"] == "Orleans Parish"]
    months = [c for c in rows[0] if c[:2] == "20"]
    latest = months[-1]
    year_ago = months[-13]
    out_csv = ROOT / "data/outside/zillow_zhvi_orleans_zips.csv"
    with out_csv.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    zips = {}
    for r in rows:
        try:
            now, base, ya = float(r[latest]), float(r[BASE]), float(r[year_ago])
        except ValueError:
            continue
        series = [(m, float(r[m])) for m in months if r[m]]
        peak_m, peak = max(series, key=lambda x: x[1])
        zips[r["RegionName"]] = {"now": round(now), "base": round(base), "chg": round(now / base - 1, 4),
                                 "yr": round(now / ya - 1, 4), "peak": round(peak), "peakMonth": peak_m[:7]}
    # Census tract → ZIP areas by share of the tract's land.
    parts = defaultdict(list)
    with REL.open(encoding="utf-8-sig") as f:
        for r in csv.DictReader(f, delimiter="|"):
            if r["GEOID_TRACT_20"].startswith("22071") and r["GEOID_ZCTA5_20"]:
                parts[r["GEOID_TRACT_20"]].append((r["GEOID_ZCTA5_20"], int(r["AREALAND_PART"] or 0), int(r["AREALAND_TRACT_20"] or 0)))
    tract = {}
    with (ROOT / "data/outside/zcta_tract_orleans.csv").open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["tract", "zip", "share_of_tract_land"])
        for t, lst in sorted(parts.items()):
            total = sum(p[1] for p in lst) or 1
            for z, a, _ in sorted(lst, key=lambda x: -x[1]):
                w.writerow([t, z, round(a / total, 4)])
            z, a, _ = max(lst, key=lambda x: x[1])
            if z in zips:
                tract[t] = [z, round(a / total, 2)]
    chg = sorted(v["chg"] for v in zips.values())
    doc = {
        "source": "Zillow Home Value Index (ZHVI), all homes, mid-tier, smoothed and seasonally adjusted, by ZIP code (Zillow Research)",
        "sourceUrl": "https://www.zillow.com/research/data/",
        "latest": latest, "base": BASE, "yearAgo": year_ago,
        "range": [chg[0], chg[len(chg) // 2], chg[-1]],   # lowest, middle, highest change since the base month, across Orleans ZIPs
        "zips": zips, "tract": tract,
    }
    OUT.write_text(json.dumps(doc, separators=(",", ":")))
    print(f"wrote {OUT}: {len(zips)} ZIPs, {len(tract)} tracts mapped; change since {BASE}: {chg[0]:+.1%} to {chg[-1]:+.1%} (middle {chg[len(chg)//2]:+.1%}); latest {latest}")


if __name__ == "__main__":
    main()
