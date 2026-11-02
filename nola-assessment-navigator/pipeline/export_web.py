"""Export the public fields of the 2026 roll for the web app (step 1 of 2), plus each parcel's
computed taxes (2026) and its 2027-roll values and taxes from the parsed LTC files.

Run from nola-assessment-navigator/:
  python3 pipeline/ltc_roll.py data/raw/ltc2026 2026 && python3 pipeline/ltc_roll.py data/raw/ltc2027 2027
  python3 pipeline/export_web.py && node pipeline/shard.js
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


def ltc(year, cols):
    path = ROOT / f"data/processed/ltc{year}_parcels.csv"
    if not path.exists():
        print(f"(no {path.name}; skipping {year} LTC fields)")
        return {}
    t = pd.read_csv(path, dtype={"id": str, "ward": str})
    return t.set_index("id")[list(cols)].rename(columns=cols).to_dict(orient="index")


def main():
    df = pd.read_csv(RAW, dtype=str, encoding="utf-8-sig", low_memory=False)
    # t = computed net tax, ml = total mills, th = tax removed by homestead; 27 = 2027 roll.
    y26 = ltc(2026, {"tax_net": "t26", "mills": "ml26", "tax_homestead_reduction": "th26"})
    y27 = ltc(2027, {"market": "m27", "assessed": "a27", "homestead": "h27", "taxable": "x27",
                     "tax_net": "t27", "mills": "ml27", "tax_homestead_reduction": "th27"})
    # Usual total millage per district and year; per-parcel mills are stored only when different.
    mills = {}
    for year in (2026, 2027):
        path = ROOT / f"data/processed/ltc{year}_parcels.csv"
        if path.exists():
            t = pd.read_csv(path, dtype={"id": str, "ward": str})
            mills[str(year)] = {str(k): float(v) for k, v in t[t["mills"] > 0].groupby("district")["mills"].agg(lambda x: x.mode().iloc[0]).items()}
    (ROOT / "data/processed/mills_by_district.json").write_text(json.dumps(mills))
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
            o["legal"] = " ".join((o["legal"] or "").split())[:90] or None
            o["n"] = int(o["n"] or 1)
            for k, v in {**y26.get(o["id"], {}), **y27.get(o["id"], {})}.items():
                if v == v:  # skip NaN
                    o[k] = round(float(v), 2) if k.startswith(("t", "ml")) else int(v)
            if o["id"] not in y27:
                o["no27"] = 1
            else:
                # 98% of 2027 values equal 2026; store a 2027 value only when it differs (app falls back to 2026).
                for k27, k26 in (("m27", "tmv"), ("a27", "tav"), ("h27", "hs"), ("x27", "tx")):
                    if o.get(k27) == o.get(k26):
                        o.pop(k27, None)
            for k, year in (("ml26", "2026"), ("ml27", "2027")):
                if o.get(k) == mills.get(year, {}).get(str(o.get("d"))):
                    o.pop(k, None)
            # Drop empty and default values to keep files small; the app reads a missing number as 0,
            # a missing fz/vt as "0" and a missing n as 1.
            drop = {"fz": "0", "vt": "0", "n": 1, "st": "AC"}
            keep_zero = {"tx", "x27", "t26", "t27"}
            o = {k: v for k, v in o.items() if v not in (None, "") and not (isinstance(v, (int, float)) and v == 0 and k not in keep_zero) and drop.get(k) != v}
            f.write(json.dumps(o, separators=(",", ":")) + "\n")
    print(f"wrote {OUT} ({len(df):,} parcels)")


if __name__ == "__main__":
    main()
