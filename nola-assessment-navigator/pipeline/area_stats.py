"""Layer 3 (market context): describe each area's parcels so an owner can see how their record compares.

Run from nola-assessment-navigator/, after export_web.py:
  python3 pipeline/area_stats.py
Input: data/processed/roll2026_public.jsonl (public fields; 2027 fields only where they differ from 2026).
Output: data/web/2026/areas.json

Groups are parcels of the same occupancy type (residential, vacant land, commercial, exempt) in the same area:
  1. the roll's Subdivision within a Municipal District (513 areas; the closest thing the roll has to a neighborhood),
  2. if that group has fewer than MIN parcels, the Ward within the District,
  3. otherwise the whole city.
Only distributions are stored (counts, shares, quantiles). Per CLAUDE.md §3 data rule 6, nothing here estimates
a "fair" value or says whether any one parcel is over- or under-assessed.
"""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data/processed/roll2026_public.jsonl"
OUT = ROOT / "data/web/2026/areas.json"
MIN = 10
QS = (0.1, 0.25, 0.5, 0.75, 0.9)


def quantiles(xs):
    xs = sorted(xs)
    if not xs:
        return None
    # Nearest-rank quantiles: every reported value is a real parcel's value.
    return [round(xs[min(len(xs) - 1, int(q * len(xs)))]) for q in QS]


def median(xs):
    xs = sorted(xs)
    return round(xs[len(xs) // 2], 2) if xs else None


def summarize(rows):
    mv = [r["tmv"] for r in rows if r["tmv"] > 0]
    t26 = [r["t26"] for r in rows if isinstance(r.get("t26"), (int, float))]
    both = [r for r in rows if isinstance(r.get("t26"), (int, float)) and isinstance(r.get("t27"), (int, float))]
    in27 = [r for r in rows if not r.get("no27")]
    return {
        "n": len(rows),
        "mv": quantiles(mv),                                    # market value quantiles (10/25/50/75/90th)
        "hs": round(sum(1 for r in rows if r.get("hs", 0) > 0) / len(rows), 3),   # share with homestead
        "fz": round(sum(1 for r in rows if r.get("fz", "0") != "0") / len(rows), 3),  # share with a freeze
        "t26": median(t26),                                     # median computed tax, 2026 roll
        "t27": median([r["t27"] for r in in27 if isinstance(r.get("t27"), (int, float))]),
        "chg": round(sum(1 for r in in27 if r.get("m27", r["tmv"]) != r["tmv"]) / len(in27), 3) if in27 else None,
        "dt": median([r["t27"] - r["t26"] for r in both]),     # median change in computed tax, 2026 -> 2027
    }


def main():
    groups = {"sub": defaultdict(list), "ward": defaultdict(list), "city": defaultdict(list)}
    with SRC.open() as f:
        for line in f:
            r = json.loads(line)
            for k in ("tmv", "hs"):
                r[k] = r.get(k, 0)
            # Multi-record parcels list several types ("VACANT LAND | RESIDENTIAL"); group by the first, as property.js does.
            occ = (r.get("occ") or "UNKNOWN").split("|")[0].strip()
            d = str(r.get("d", ""))
            if r.get("sub"):
                groups["sub"][f"{d}|{r['sub']}|{occ}"].append(r)
            groups["ward"][f"{d}|{r.get('w', '')}|{occ}"].append(r)
            groups["city"][occ].append(r)
    out = {"min": MIN, "quantiles": QS, "source": "2026 and 2027 LTC rolls, by parcel ID"}
    for level, g in groups.items():
        out[level] = {k: summarize(v) for k, v in g.items() if len(v) >= (MIN if level != "city" else 1)}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(f"wrote {OUT}: {len(out['sub'])} area groups, {len(out['ward'])} ward groups, {len(out['city'])} citywide "
          f"({OUT.stat().st_size / 1e3:.0f} KB)")


if __name__ == "__main__":
    main()
