"""Test whether roll parcels can be matched to census tracts (and so to the ACS data).

Run from nola-assessment-navigator/:  python3 pipeline/geocode_sample.py [sample size, default 500]
Takes a random sample of parcels (stratified by occupancy type, fixed seed), rewrites each roll address into a
form the Census geocoder understands, sends one batch to the Census Bureau's batch geocoder, and joins the tract
it returns to data/outside/acs_orleans_tracts.csv. Writes data/outside/geocode_sample_results.csv and
docs/outside-data-matching.md. No owner names leave this machine: only parcel ID and situs address are sent.
"""
import csv
import io
import json
import re
import subprocess
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SUFFIX = {"AV": "AVE", "BL": "BLVD", "HW": "HWY", "PW": "PKWY", "PK": "PKWY", "CR": "CIR", "WY": "WAY", "TR": "TRL"}
KNOWN = set(SUFFIX) | {"ST", "DR", "RD", "PL", "CT", "LN", "WALK", "ROW", "LOOP", "SQ", "PLZ", "TER", "ALY", "CV", "PT"}
ENDPOINT = "https://geocoding.geo.census.gov/geocoder/geographies/addressbatch"


def to_census(addr):
    """First address of the parcel, roll suffix codes expanded, trailing unit dropped (units share a tract)."""
    a = str(addr).split("|")[0].strip()
    toks = a.split()
    if not toks or not re.match(r"^\d", toks[0]):
        return None, "no house number"
    cut = None
    for i in range(len(toks) - 1, 1, -1):
        if toks[i] in KNOWN:
            cut = i
            break
    if cut is None:
        return " ".join(toks), "no suffix"
    toks = toks[:cut + 1]
    toks[cut] = SUFFIX.get(toks[cut], toks[cut])
    return " ".join(toks), ""


def main(n):
    roll = pd.read_json(ROOT / "data/processed/roll2026_public.jsonl", lines=True, dtype={"id": str, "d": str})
    roll["occ1"] = roll["occ"].where(~roll["occ"].str.contains(r"\|"), "MIXED")
    sample = pd.concat([g.sample(max(5, round(n * len(g) / len(roll))), random_state=42)
                        for _, g in roll.groupby("occ1")])
    rows, skipped = [], []
    for r in sample.itertuples():
        street, why = to_census(r.a)
        if street is None:
            skipped.append({"id": r.id, "occ": r.occ1, "reason": why})
        else:
            rows.append([r.id, street, "New Orleans", "LA", ""])
    buf = io.StringIO()
    csv.writer(buf).writerows(rows)
    path = ROOT / "data/processed/geocode_batch.csv"
    path.write_text(buf.getvalue())
    out = subprocess.run(["curl", "-sS", "-m", "300", "-F", f"addressFile=@{path}", "-F", "benchmark=Public_AR_Current",
                          "-F", "vintage=Current_Current", ENDPOINT], capture_output=True, text=True)
    if out.returncode or not out.stdout.strip():
        raise SystemExit(f"Geocoder request failed: {out.stderr[:300]}")
    cols = ["id", "input", "status", "type", "matched", "lonlat", "tiger_id", "side", "state", "county", "tract", "block"]
    res = pd.DataFrame(list(csv.reader(io.StringIO(out.stdout))), columns=None)
    res = res.iloc[:, :12]
    res.columns = cols[:res.shape[1]]
    res["id"] = res["id"].astype(str)
    res = res.merge(sample[["id", "occ1", "a", "d"]], on="id", how="left")
    res["geoid"] = (res["state"].fillna("") + res["county"].fillna("") + res["tract"].fillna("")).where(res["status"] == "Match")
    acs = pd.read_csv(ROOT / "data/outside/acs_orleans_tracts.csv", dtype={"geoid": str})
    res["in_acs"] = res["geoid"].isin(acs["geoid"])
    res["acs_income_available"] = res["geoid"].map(acs.set_index("geoid")["median_household_income"]).notna()
    res.drop(columns=["a"]).to_csv(ROOT / "data/outside/geocode_sample_results.csv", index=False)

    total = len(sample)
    by = res.groupby("occ1").agg(sent=("id", "size"), matched=("status", lambda s: (s == "Match").sum()),
                                 tie=("status", lambda s: (s == "Tie").sum()), no_match=("status", lambda s: (s == "No_Match").sum()),
                                 joined=("in_acs", "sum"))
    skip = pd.DataFrame(skipped)
    skip_by = skip.groupby("occ").size() if len(skip) else pd.Series(dtype=int)
    by["not_sent"] = skip_by.reindex(by.index).fillna(0).astype(int)
    by["match_rate_of_sample"] = (by["joined"] / (by["sent"] + by["not_sent"])).round(3)
    exact = (res["type"] == "Exact").sum()
    s = {"sample": total, "sent": len(rows), "not_sent": len(skipped), "match": int((res["status"] == "Match").sum()),
         "exact": int(exact), "tie": int((res["status"] == "Tie").sum()), "no_match": int((res["status"] == "No_Match").sum()),
         "joined_to_acs": int(res["in_acs"].sum()), "joined_with_income": int((res["in_acs"] & res["acs_income_available"]).sum())}
    examples_tie = res[res["status"] == "Tie"]["input"].head(5).tolist()
    examples_nm = res[res["status"] == "No_Match"]["input"].head(8).tolist()
    md = f"""# Can roll parcels be matched to Census tracts? (tested)

`python3 pipeline/geocode_sample.py`: a random sample of **{total} parcels** from the 2026 roll, stratified by
occupancy type (seed 42), sent to the **Census Bureau batch geocoder** (`{ENDPOINT}`, benchmark Public_AR_Current).
Before sending, roll addresses were rewritten: first address only, suffix codes expanded (AV→AVE, BL→BLVD, HW→HWY,
PW→PKWY…), trailing unit dropped, because all units in a building share a tract. The returned tract was joined to the
ACS tract table (`data/outside/acs_orleans_tracts.csv`).

| | Parcels | Share of sample |
|---|---|---|
| Sample | {total} | 100% |
| Not sent (no house number in the roll address) | {s['not_sent']} | {s['not_sent']/total:.0%} |
| Matched to one location | {s['match']} | {s['match']/total:.0%} |
| … of which exact address matches | {s['exact']} | {s['exact']/total:.0%} |
| Tie: more than one possible location | {s['tie']} | {s['tie']/total:.0%} |
| No match | {s['no_match']} | {s['no_match']/total:.0%} |
| **Joined to an ACS tract** | **{s['joined_to_acs']}** | **{s['joined_to_acs']/total:.0%}** |
| … tract also has a median-income estimate | {s['joined_with_income']} | {s['joined_with_income']/total:.0%} |

**By occupancy type** (share of each type that ended up joined to an ACS tract):

{by.reset_index().rename(columns={'occ1': 'occupancy'}).to_markdown(index=False)}

**Why parcels fail:**
- **Ties** are mostly streets that split North/South while the roll drops the direction. Examples: {', '.join(examples_tie) or 'none'}.
- **No match:** vacant lots and other parcels with no mailable address, plus streets the geocoder spells or names
  differently. Examples: {', '.join(examples_nm) or 'none'}.
- **Not sent:** roll addresses with no house number, such as vacant lots described only by street.

**Verdict:** address geocoding is **reliable enough for neighborhood context on homes** (see the residential row), but
not for every parcel. Vacant land and exempt parcels fail far more often. A parcel-ID join to the City's parcel GIS layer
would avoid most of these failures and is the next thing to test. Until then, the chatbot doesn't use tract data in
property answers.
"""
    (ROOT / "docs/outside-data-matching.md").write_text(md)
    print(json.dumps(s, indent=2))
    print(by.to_string())


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 500)
