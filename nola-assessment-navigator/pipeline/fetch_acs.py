"""Pull neighborhood demographics for every Orleans Parish census tract (outside data).

Run from nola-assessment-navigator/:  python3 pipeline/fetch_acs.py
Source: American Community Survey (ACS) 5-year estimates, U.S. Census Bureau: the same tables PolicyMap and
Social Explorer repackage for race/ethnicity, income and housing.
  - Default: Census Reporter's public API (api.censusreporter.org), which serves the latest ACS release with no key.
  - With CENSUS_API_KEY set: the Census Bureau's own API (api.census.gov), which now requires a free key.
Writes data/outside/acs_orleans_tracts.csv (estimate + margin of error per variable) and a .meta.json.
"""
import csv
import json
import os
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data/outside"

# ACS variable → plain-English column. B03002 = Hispanic or Latino origin by race.
VARS = {
    "B03002001": "total_population", "B03002003": "white_non_hispanic", "B03002004": "black_non_hispanic",
    "B03002006": "asian_non_hispanic", "B03002012": "hispanic_any_race",
    "B19013001": "median_household_income",
    "B25003001": "occupied_units", "B25003002": "owner_occupied_units", "B25003003": "renter_occupied_units",
    "B25077001": "median_home_value", "B25064001": "median_gross_rent",
    "B25002001": "housing_units", "B25002003": "vacant_units",
    # Population 65+: men B01001020–025, women B01001044–049, summed into age65_plus.
    **{f"B01001{i:03d}": f"age65_{i}" for i in [*range(20, 26), *range(44, 50)]},
}
TABLES = sorted({v[:6] for v in VARS})


def get(url):
    try:
        # Census Reporter's firewall rejects Python's default user agent, so identify the script.
        req = urllib.request.Request(url, headers={"User-Agent": "NOLA-Assessment-Navigator/1.0 (student project; pipeline/fetch_acs.py)"})
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode("utf-8"))
    except (OSError, ValueError) as e:
        raise SystemExit(f"Couldn't get {url.split('?')[0]} ({e.__class__.__name__}). Check network access.")


def from_censusreporter():
    # Commas must stay literal: the API rejects table lists encoded as %2C.
    url = "https://api.censusreporter.org/1.0/data/show/latest?" + urllib.parse.urlencode(
        {"table_ids": ",".join(TABLES), "geo_ids": "140|05000US22071"}, safe=",")
    d = get(url)
    rows = {}
    for geo, tables in d["data"].items():
        row = {"geoid": geo.replace("14000US", ""), "tract_name": d["geography"][geo]["name"]}
        for var in VARS:
            t = tables.get(var[:6], {})
            row[var + "E"] = t.get("estimate", {}).get(var)
            row[var + "M"] = t.get("error", {}).get(var)
        rows[row["geoid"]] = row
    return rows, url.split("?")[0], d["release"]["name"] + f" ({d['release']['years']})"


def from_census_api(key, year="2024"):
    names = [f"{v[:6]}_{v[6:]}" for v in VARS]
    rows = {}
    for i in range(0, len(names), 24):
        chunk = names[i:i + 24]
        q = {"get": "NAME," + ",".join(f"{n}E,{n}M" for n in chunk), "for": "tract:*", "in": "state:22 county:071", "key": key}
        url = f"https://api.census.gov/data/{year}/acs/acs5?" + urllib.parse.urlencode(q)
        data = get(url)
        head = data[0]
        for x in data[1:]:
            r = dict(zip(head, x))
            geoid = r["state"] + r["county"] + r["tract"]
            row = rows.setdefault(geoid, {"geoid": geoid, "tract_name": r["NAME"]})
            for n in chunk:
                row[n.replace("_", "") + "E"] = r.get(n + "E")
                row[n.replace("_", "") + "M"] = r.get(n + "M")
    return rows, f"https://api.census.gov/data/{year}/acs/acs5", f"ACS {year} 5-year"


def clean(v):
    # Census uses large negative sentinels (e.g. -666666666) for "not available".
    try:
        f = float(v)
    except (TypeError, ValueError):
        return ""
    return "" if f < -999 else (int(f) if f.is_integer() else f)


def main():
    key = os.environ.get("CENSUS_API_KEY")
    rows, endpoint, release = from_census_api(key) if key else from_censusreporter()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "acs_orleans_tracts.csv"
    labels = [lab for lab in VARS.values() if not lab.startswith("age65")]
    fields = ["geoid", "tract_name", *labels, "age65_plus", *[f"{lab}_moe" for lab in labels]]
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for geoid, r in sorted(rows.items()):
            row = {"geoid": geoid, "tract_name": r["tract_name"]}
            for var, lab in VARS.items():
                if not lab.startswith("age65"):
                    row[lab] = clean(r.get(var + "E"))
                    row[f"{lab}_moe"] = clean(r.get(var + "M"))
            ages = [clean(r.get(v + "E")) for v, lab in VARS.items() if lab.startswith("age65")]
            row["age65_plus"] = sum(a for a in ages if a != "") if any(a != "" for a in ages) else ""
            w.writerow(row)
    meta = {"source": f"U.S. Census Bureau, American Community Survey: {release}", "endpoint": endpoint,
            "via": "Census Bureau API" if key else "Census Reporter API (no key needed)",
            "geography": "census tracts, Orleans Parish, LA (state 22, county 071)", "tables": TABLES,
            "variables": VARS, "pulled": date.today().isoformat(), "rows": len(rows),
            "notes": "Blank = estimate not available for that tract. *_moe = margin of error (90%). "
                     "Estimates describe tract residents, not any one property owner."}
    (OUT_DIR / "acs_orleans_tracts.meta.json").write_text(json.dumps(meta, indent=2))
    print(f"wrote {out} ({len(rows)} tracts, {release}, via {meta['via']})")


if __name__ == "__main__":
    main()
