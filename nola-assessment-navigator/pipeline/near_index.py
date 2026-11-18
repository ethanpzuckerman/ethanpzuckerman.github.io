"""Location index for the property dashboard: nearby parcels for the map and "similar properties".

Run from nola-assessment-navigator/, after export_web.py / shard.js (reads the committed data/web/2026/s_*.json):
  python3 pipeline/near_index.py
Output: data/web/2026/n_<row>_<col>.json, one file per grid cell of CELL degrees (~2 km), each a list of
  [parcel id, address, property type, total market value, 2026 tax, lat, lon]
        data/web/2026/arealoc.json, the center of each roll subdivision and ward ("s|district|sub", "w|district|ward"
  → [lat, lon, most common block group, located parcels]) for parcels the crosswalk didn't place
Only public roll fields; no owner names. The browser loads the parcel's cell and its 8 neighbors.
"""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "data/web/2026"
CELL = 0.02


def cell(lat, lon):
    return int(lat // CELL), int(-lon // CELL)   # row, col (west longitudes are negative)


def main():
    for f in WEB.glob("n_*.json"):
        f.unlink()
    cells = defaultdict(list)
    n = 0
    for f in sorted(WEB.glob("s_*.json")):
        for r in json.loads(f.read_text()):
            lat, lon = r.get("lat"), r.get("lon")
            if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                continue
            occ = str(r.get("occ") or "").split("|")[0].strip()
            t26 = r.get("t26") if isinstance(r.get("t26"), (int, float)) else None
            cells[cell(lat, lon)].append([r["id"], " ".join(str(r.get("a", "")).split()), occ, r.get("tmv") or 0, t26,
                                          round(lat, 5), round(lon, 5)])
            n += 1
    for (i, j), rows in cells.items():
        (WEB / f"n_{i}_{j}.json").write_text(json.dumps(rows, separators=(",", ":")))
    # Area centers for parcels with no coordinates (about 15%): mean position of the located parcels in the same
    # roll subdivision (district|subdivision) or ward (district|ward), plus that area's most common block group.
    areas = defaultdict(lambda: [0.0, 0.0, 0, defaultdict(int)])
    for f in sorted(WEB.glob("s_*.json")):
        for r in json.loads(f.read_text()):
            if not isinstance(r.get("lat"), (int, float)):
                continue
            for key in (f"s|{r.get('d', '')}|{r.get('sub', '')}" if r.get("sub") else None, f"w|{r.get('d', '')}|{r.get('w', '')}"):
                if key:
                    a = areas[key]
                    a[0] += r["lat"]; a[1] += r["lon"]; a[2] += 1
                    if r.get("bg"):
                        a[3][r["bg"]] += 1
    centers = {k: [round(a[0] / a[2], 5), round(a[1] / a[2], 5), max(a[3], key=a[3].get) if a[3] else None, a[2]]
               for k, a in areas.items() if a[2] >= 5}
    (WEB / "arealoc.json").write_text(json.dumps(centers, separators=(",", ":")))
    print(f"area centers: {len(centers)} (subdivisions and wards with >= 5 located parcels)")
    sizes = [len(v) for v in cells.values()]
    print(f"{n} parcels with coordinates in {len(cells)} cells (largest {max(sizes)}); CELL={CELL}")


if __name__ == "__main__":
    main()
