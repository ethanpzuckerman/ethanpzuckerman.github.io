"""Parse a Louisiana Tax Commission (LTC) Orleans tax-roll download into one row per parcel.

Run from nola-assessment-navigator/:
  python3 pipeline/ltc_roll.py data/raw/ltc2026 2026
  python3 pipeline/ltc_roll.py data/raw/ltc2027 2027
Input: <dir>/x/<district folder>/*.TXT, unzipped from stax.latax.la.gov/TaxRollsFolder/<upload year>/ORLEANS*_<roll>_TAXROLL.zip
Output: data/processed/ltc<roll>_parcels.csv (public fields only, no owner names or mailing addresses).

File format: comma-separated, "~" as the quote character, Windows line endings, every table keyed by
(tax year, district FIPS, parcel ID). Column positions below were confirmed against the course's 2026 Box
file, which was built from the same 2026 download: every value matched on all 163,135 parcels.
Real estate only (assessment type RE); business personal property rows (IDs ending in P) are skipped.
"""
import csv
import glob
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def rows(base, name):
    for f in sorted(glob.glob(f"{base}/x/*/{name}.TXT")):
        with open(f, encoding="latin-1", newline="") as fh:
            for r in csv.reader(fh, quotechar="~"):
                if len(r) > 3:
                    yield [c.strip() for c in r]


def num(v):
    try:
        return float(v) if v not in ("", None) else 0.0
    except ValueError:
        return 0.0


def parse(base):
    real = {}
    for r in rows(base, "ASSMT"):  # 0 year, 1 fips, 2 assessment no., 3 parcel, 4 type RE/PP, 5 status AC/EX
        if r[4] == "RE":
            real[r[3]] = {"status": r[5]}
    p = {}
    for r in rows(base, "PARCEL"):  # 6 ward, 7 subdivision, 12 address, 13 occupancy, 15 transfer date, 21 instrument, 25 assessment date
        if r[2] in real:
            p[r[2]] = {"id": r[2], "district": int(r[1]) - 22170, "ward": r[6], "subdivision": r[7], "address": r[12],
                       "occupancy": r[13], "transfer_date": r[15], "price": num(r[16]), "instrument": r[21],
                       "assessment_date": r[25], **real[r[2]]}
    v = defaultdict(lambda: defaultdict(float))
    for r in rows(base, "AVALUE"):  # 3 market, 4 assessed, 5 homestead, 6 taxable, 8 L/I, 11 other exempt, 15 veteran, 17 first responder
        if r[2] not in p:
            continue
        d = v[r[2]]
        kind = "land" if r[8] == "L" else "impr"
        d[f"{kind}_market"] += num(r[3])
        d[f"{kind}_assessed"] += num(r[4])
        for key, i in (("market", 3), ("assessed", 4), ("homestead", 5), ("taxable", 6), ("other_exempt", 11),
                       ("veteran", 15), ("first_responder", 17)):
            d[key] += num(r[i])
    t = defaultdict(lambda: defaultdict(float))
    for r in rows(base, "AMILLAGE"):  # 3 tax name, 4 mills, 9 gross tax, 10 homestead reduction, 11 net tax
        if r[2] not in p:
            continue
        d = t[r[2]]
        d["mills"] += num(r[4])
        d["tax_gross"] += num(r[9])
        d["tax_homestead_reduction"] += num(r[10])
        d["tax_net"] += num(r[11])
        d["levies"] += 1
    out = []
    for pid, rec in p.items():
        rec.update({k: round(x, 2) for k, x in v[pid].items()})
        rec.update({k: round(x, 2) for k, x in t[pid].items()})
        out.append(rec)
    return out


def main(base, year):
    recs = parse(base)
    cols = ["id", "district", "ward", "subdivision", "address", "occupancy", "status", "land_market", "impr_market",
            "market", "land_assessed", "impr_assessed", "assessed", "homestead", "other_exempt", "veteran",
            "first_responder", "taxable", "mills", "levies", "tax_gross", "tax_homestead_reduction", "tax_net",
            "transfer_date", "price", "instrument", "assessment_date"]
    out = ROOT / f"data/processed/ltc{year}_parcels.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in recs:
            w.writerow({c: r.get(c, 0) for c in cols})
    print(f"wrote {out}: {len(recs):,} real-estate parcels")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
