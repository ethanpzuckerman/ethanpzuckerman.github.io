"""Neighborhood census profile for each 2020 block group, for Layer 2's "what neighborhood is this in?" answers.

Run from nola-assessment-navigator/, after shard.js (which clears data/web/2026/):
  python3 pipeline/census_bg.py
Input: data/raw/box/bg_merged.csv, from the course Box folder "Census Block Group Analysis/output" (ACS 2020–2024
5-year estimates by block group, exported from Social Explorer, joined to roll medians by the course's build.py).
Output: data/web/2026/bg.json

Per CLAUDE.md §3 data rule 7, these numbers describe the area's residents and housing, never a parcel's owner,
and they play no part in how the Assessor values a property.
"""
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data/raw/box/bg_merged.csv"
OUT = ROOT / "data/web/2026/bg.json"
FIELDS = {  # short key: (column, decimals)
    "pop": ("pop", 0), "inc": ("med_income", 0), "hv": ("acs_home_value", 0), "rent": ("med_rent", 0),
    "own": ("pct_owner", 1), "vac": ("pct_hu_vacant", 1), "pov": ("pct_poverty", 1), "age": ("med_age", 1),
    "yb": ("med_yrbuilt_acs", 0), "ba": ("pct_ba", 1), "wh": ("pct_white", 1), "bl": ("pct_black", 1),
    "hi": ("pct_hisp", 1), "nres": ("n_res", 0), "mrv": ("med_res_value", 0), "hs": ("pct_homestead", 1),
}


def main():
    bg = pd.read_csv(SRC, dtype={"FIPS": str})
    out = {}
    for r in bg.to_dict(orient="records"):
        rec = {"name": str(r["name"]).replace(", Orleans Parish, Louisiana", "")}
        for k, (col, d) in FIELDS.items():
            v = r.get(col)
            if pd.notna(v):
                rec[k] = round(float(v), d) if d else int(round(float(v)))
        out[r["FIPS"]] = rec
    # The middle block group on each measure, so an owner can see whether their area is typical.
    mid = {k: (round(float(bg[col].median()), d) if d else int(round(float(bg[col].median())))) for k, (col, d) in FIELDS.items()}
    doc = {"source": "U.S. Census Bureau, American Community Survey 2020–2024 5-year estimates, block groups "
                     "(Social Explorer export in the course data); parcels matched to block groups with the Census geocoder",
           "count": len(out), "middle": mid, "bg": out}
    OUT.write_text(json.dumps(doc, separators=(",", ":")))
    print(f"wrote {OUT}: {len(out)} block groups ({OUT.stat().st_size / 1e3:.0f} KB)")


if __name__ == "__main__":
    main()
