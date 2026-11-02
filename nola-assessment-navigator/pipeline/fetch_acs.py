"""Pull neighborhood demographics for every Orleans Parish census tract from the Census Bureau API.

Run from nola-assessment-navigator/:  python3 pipeline/fetch_acs.py [--year 2023]
Needs network access to api.census.gov. No API key is needed at this volume
(one request, about 180 tracts); set CENSUS_API_KEY to use one.
Writes data/outside/acs<year>_orleans_tracts.csv and a metadata JSON next to it.

These are American Community Survey (ACS) 5-year estimates: the same Census tables that
PolicyMap repackages for race/ethnicity, income and housing. Every figure is an estimate
with a margin of error; the _M columns are saved alongside each _E estimate.
"""
import argparse
import csv
import json
import os
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE, COUNTY = "22", "071"  # Louisiana, Orleans Parish

# Variable → plain-English label. B03002 = Hispanic or Latino origin by race.
VARS = {
    "B03002_001": "total_population",
    "B03002_003": "white_non_hispanic",
    "B03002_004": "black_non_hispanic",
    "B03002_006": "asian_non_hispanic",
    "B03002_012": "hispanic_any_race",
    "B19013_001": "median_household_income",
    "B25003_001": "occupied_units",
    "B25003_002": "owner_occupied_units",
    "B25003_003": "renter_occupied_units",
    "B25077_001": "median_home_value",
    "B25064_001": "median_gross_rent",
    "B25002_001": "housing_units",
    "B25002_003": "vacant_units",
    # Population 65 and over: men B01001_020–025, women B01001_044–049 (summed below).
    **{f"B01001_{i:03d}": f"age65_m_{i}" for i in range(20, 26)},
    **{f"B01001_{i:03d}": f"age65_f_{i}" for i in range(44, 50)},
}


def fetch(year):
    cols = ["NAME"] + [f"{v}E" for v in VARS] + [f"{v}M" for v in VARS]
    rows = []
    # The API allows 50 variables per call, so request in chunks and join on tract.
    for i in range(0, len(cols), 45):
        chunk = cols[i:i + 45]
        q = {"get": ",".join(chunk), "for": "tract:*", "in": f"state:{STATE} county:{COUNTY}"}
        if os.environ.get("CENSUS_API_KEY"):
            q["key"] = os.environ["CENSUS_API_KEY"]
        url = f"https://api.census.gov/data/{year}/acs/acs5?" + urllib.parse.urlencode(q)
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                body_text = r.read().decode("utf-8", "replace")
            data = json.loads(body_text)
        except (OSError, ValueError) as e:
            raise SystemExit(f"Couldn't get data from api.census.gov ({e.__class__.__name__}). "
                             "If you're in a sandbox, allow api.census.gov in its network settings.")
        head, body = data[0], data[1:]
        rows.append({(x[head.index("state")], x[head.index("county")], x[head.index("tract")]): dict(zip(head, x)) for x in body})
    merged = {}
    for part in rows:
        for k, v in part.items():
            merged.setdefault(k, {}).update(v)
    return merged, url.split("?")[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", default="2023", help="ACS 5-year vintage (2023 = 2019–2023 estimates)")
    year = ap.parse_args().year
    merged, endpoint = fetch(year)
    out_dir = ROOT / "data/outside"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"acs{year}_orleans_tracts.csv"
    fields = ["geoid", "tract_name"] + [f"{lab}" for lab in VARS.values() if not lab.startswith("age65")] + ["age65_plus"] \
        + [f"{lab}_moe" for lab in VARS.values() if not lab.startswith("age65")]
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for (s, c, t), v in sorted(merged.items()):
            row = {"geoid": s + c + t, "tract_name": v["NAME"]}
            for var, lab in VARS.items():
                if lab.startswith("age65"):
                    continue
                row[lab] = v.get(f"{var}E")
                row[f"{lab}_moe"] = v.get(f"{var}M")
            row["age65_plus"] = sum(int(v.get(f"{var}E") or 0) for var, lab in VARS.items() if lab.startswith("age65"))
            w.writerow(row)
    meta = {
        "source": f"U.S. Census Bureau, American Community Survey {year} 5-year estimates",
        "endpoint": endpoint, "geography": "census tracts, Orleans Parish (state 22, county 071)",
        "tables": sorted({v.split("_")[0] for v in VARS}), "variables": VARS,
        "pulled": date.today().isoformat(), "rows": len(merged),
        "notes": "Census sentinel values like -666666666 mean the estimate isn't available for that tract. "
                 "Estimates describe tract residents, not any one property owner.",
    }
    (out_dir / f"acs{year}_orleans_tracts.meta.json").write_text(json.dumps(meta, indent=2))
    print(f"wrote {out} ({len(merged)} tracts)")


if __name__ == "__main__":
    main()
