"""Export the public fields of the 2026 roll for the web app (step 1 of 2).

Run from nola-assessment-navigator/:  python3 pipeline/export_web.py && node pipeline/shard.js
Owner names, contacts and mailing addresses are dropped (CLAUDE.md §3 privacy rule).
Purchase price is dropped: 0 or nominal on a third of parcels and never verified.
"""
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv"
OUT = ROOT / "data/processed/roll2026_public.jsonl"

INT = {"lmv": "Land Market Value", "imv": "Improvement Market Value", "tmv": "Total Market Value",
       "lav": "Land Assessed Value", "iav": "Improvement Assessed Value", "tav": "Total Assessed Value",
       "hs": "Homestead Exemption Amount", "oe": "Other Exemption Amount", "ve": "Veteran Exemption Amount",
       "fr": "First Responder Exemption Amount", "tx": "Taxable Assessed Value"}
STR = {"id": "Parcel ID(s)", "a": "Property Address(es)", "d": "Municipal District", "w": "Ward(s)",
       "sub": "Subdivision(s)", "occ": "Occupancy Type(s)", "st": "Assessment Status(es)",
       "yb": "Year(s) Built", "td": "Transfer Date(s)", "it": "Instrument Type(s)", "fz": "Freeze Code(s)",
       "hsp": "Value Homestead Percentage(s)", "vt": "Veteran Exemption Type Code(s)", "legal": "Legal Description(s)",
       "n": "Assessment Record Count"}


def main():
    df = pd.read_csv(RAW, dtype=str, encoding="utf-8-sig", low_memory=False)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w") as f:
        for r in df.to_dict(orient="records"):
            o = {k: (r[c].strip() if isinstance(r[c], str) else None) for k, c in STR.items()}
            o.update({k: int(r[c]) for k, c in INT.items()})
            # Known placeholders become "not recorded" rather than fake facts.
            if o["yb"] == "1994" and o["occ"] != "RESIDENTIAL":
                o["yb"] = None
            if o["td"] == "12/31/1994":
                o["td"] = None
            o["legal"] = " ".join((o["legal"] or "").split())[:110] or None
            o["n"] = int(o["n"] or 1)
            # Drop empty and default values to keep files small; the app reads a missing number as 0,
            # a missing fz/vt as "0" and a missing n as 1.
            drop = {"fz": "0", "vt": "0", "n": 1, "st": "AC"}
            o = {k: v for k, v in o.items() if v not in (None, "") and not (isinstance(v, int) and v == 0 and k != "tx") and drop.get(k) != v}
            f.write(json.dumps(o, separators=(",", ":")) + "\n")
    print(f"wrote {OUT} ({len(df):,} parcels)")


if __name__ == "__main__":
    main()
