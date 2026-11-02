"""Compare two parsed LTC rolls parcel by parcel (default: 2026 vs 2027).

Run from nola-assessment-navigator/ after pipeline/ltc_roll.py:
  python3 pipeline/compare_rolls.py 2026 2027
Joins on parcel ID (never address). Writes docs/year-comparison.md, docs/eda/figC1_value_change.png
and data/processed/change_<a>_<b>.csv.
"""
import json
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
BLUE, ORANGE, INK, INK2, MUTED, SURFACE, GRID = "#2a78d6", "#eb6834", "#0b0b0b", "#52514e", "#898781", "#fcfcfb", "#e8e7e3"


def load(year):
    return pd.read_csv(ROOT / f"data/processed/ltc{year}_parcels.csv", dtype={"id": str, "ward": str})


def main(y0, y1):
    a, b = load(y0), load(y1)
    j = a.merge(b, on="id", how="outer", suffixes=("_0", "_1"), indicator=True)
    both = j[j["_merge"] == "both"].copy()
    both["d_market"] = both["market_1"] - both["market_0"]
    both["d_taxable"] = both["taxable_1"] - both["taxable_0"]
    both["d_tax"] = both["tax_net_1"] - both["tax_net_0"]
    both["pct_market"] = both["d_market"] / both["market_0"].where(both["market_0"] > 0)
    changed = both[both["d_market"] != 0]
    res = both[both["occupancy_0"] == "RESIDENTIAL"]
    # Did a changed value land at ~92% of a recent sale price (the reset-on-sale pattern)?
    recent = changed["transfer_date_1"].fillna("").str[-4:].isin([str(int(y0) - 1), str(y0), str(y1)]) & (changed["price_1"] > 10000)
    at92 = recent & ((changed["market_1"] / changed["price_1"]).round(2) == 0.92)
    homestead_tax = res[res["homestead_0"] > 0]
    s = {
        "parcels_both": int(len(both)), f"only_{y0}": int((j["_merge"] == "left_only").sum()),
        f"only_{y1}": int((j["_merge"] == "right_only").sum()),
        "market_unchanged_share": round(float((both["d_market"] == 0).mean()), 4),
        "market_up": int((both["d_market"] > 0).sum()), "market_down": int((both["d_market"] < 0).sum()),
        "total_market": [float(both["market_0"].sum()), float(both["market_1"].sum())],
        "total_taxable": [float(both["taxable_0"].sum()), float(both["taxable_1"].sum())],
        "total_net_tax": [float(both["tax_net_0"].sum()), float(both["tax_net_1"].sum())],
        "assessment_dates": sorted(set(a["assessment_date"].dropna()) | set(b["assessment_date"].dropna())),
        "residential_median_mills": [float(res["mills_0"].median()), float(res["mills_1"].median())],
        "residential_median_tax_change": float(res["d_tax"].median()),
        "residential_share_tax_up": round(float((res["d_tax"] > 0.5).mean()), 4),
        "homestead_median_tax": [float(homestead_tax["tax_net_0"].median()), float(homestead_tax["tax_net_1"].median())],
        "changed_up_recent_sale_share": round(float(recent[changed["d_market"] > 0].mean()), 4),
        "changed_at_92pct_of_recent_sale": int(at92.sum()),
        "changed_by_occupancy": changed["occupancy_0"].value_counts().head(6).to_dict(),
        "pct_change_quantiles_changed": changed["pct_market"].quantile([.1, .25, .5, .75, .9]).round(3).to_dict(),
    }
    out = ROOT / f"data/processed/change_{y0}_{y1}.csv"
    both[["id", "address_0", "occupancy_0", "market_0", "market_1", "taxable_0", "taxable_1", "tax_net_0", "tax_net_1",
          "mills_0", "mills_1"]].to_csv(out, index=False)

    # Figure C1: where the money changed. Left: share of parcels by change type. Right: tax change on homes.
    kinds = pd.Series({"No change": int((both["d_market"] == 0).sum()), "Value up": s["market_up"], "Value down": s["market_down"]})
    plt.rcParams.update({"figure.facecolor": SURFACE, "axes.facecolor": SURFACE, "savefig.facecolor": SURFACE,
                         "axes.edgecolor": MUTED, "xtick.color": INK2, "ytick.color": INK2, "axes.spines.top": False,
                         "axes.spines.right": False, "font.size": 10, "text.parse_math": False})
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(8.6, 3.8), gridspec_kw={"width_ratios": [1, 1.3]})
    y = np.arange(len(kinds))[::-1]
    a1.barh(y, kinds.values, color=[MUTED, BLUE, ORANGE], height=0.55)
    for yi, v in zip(y, kinds.values):
        a1.text(v + kinds.max() * 0.02, yi, f"{v:,} ({v / len(both):.1%})", va="center", fontsize=8.5, color=INK2)
    a1.set_yticks(y, kinds.index)
    a1.set_xlim(0, kinds.max() * 1.55)
    a1.set_xticks([])
    a1.spines["bottom"].set_visible(False)
    a1.set_title(f"Market value, {y0} → {y1} roll", loc="left", fontsize=10, color=INK)
    dt = res["d_tax"].clip(-200, 400)
    a2.hist(dt, bins=np.arange(-200, 401, 10), color=BLUE, edgecolor=SURFACE, linewidth=0.6)
    med = float(res["d_tax"].median())
    a2.axvline(med, color=INK, linestyle="--", linewidth=1)
    a2.text(med + 8, a2.get_ylim()[1] * 0.9, f"Median {'+' if med >= 0 else '−'}${abs(med):,.0f}", fontsize=8.5, color=INK)
    a2.set_title("Change in computed property tax, homes", loc="left", fontsize=10, color=INK)
    a2.set_xlabel("Dollars per year (clipped at −$200 / +$400)", color=INK2)
    a2.grid(axis="y", color=GRID)
    fig.suptitle(f"The {y1} roll keeps 98% of values; taxes rise mostly from millage", x=0.01, ha="left",
                 fontsize=12, fontweight="bold", color=INK)
    fig.text(0.01, 0.01, f"Source: Louisiana Tax Commission Orleans tax rolls {y0} and {y1} (stax.latax.la.gov), parsed by pipeline/ltc_roll.py.\n"
             f"{len(both):,} parcels in both rolls. Tax = sum of the roll's computed levies; excludes special-district fees.",
             fontsize=7.5, color=MUTED, va="bottom")
    fig.tight_layout(rect=(0, 0.08, 1, 0.93))
    fig.savefig(ROOT / "docs/eda/figC1_value_change.png", dpi=160)
    plt.close(fig)

    q = s["pct_change_quantiles_changed"]
    md = f"""# {y0} vs {y1} Orleans roll comparison

Generated by `pipeline/compare_rolls.py` from the Louisiana Tax Commission downloads (`pipeline/ltc_roll.py`).
Joined on **parcel ID**. Sources: `stax.latax.la.gov/TaxRollsFolder/2025/ORLEANSDISTRICT*_2026_TAXROLL.zip`
(posted Nov. 2025) and `.../2026/ORLEANS*_2027_*_TAXROLL.zip` (posted Sept. 4, 2026).

> **Why 2026 vs 2027 and not 2025 vs 2026:** the assignment asks for 2025 vs 2026, but the LTC site only keeps the two
> most recent upload years, and the course Box folder has only 2026. The 2025 Orleans roll isn't available to download
> there. The newest pair is 2026 vs 2027, the comparison owners need now. The parser was checked first: the 2026
> download reproduces the course's Box file **exactly** (market, land and taxable values match on all 163,135 parcels).

![Value and tax change](eda/figC1_value_change.png)

| | {y0} roll | {y1} roll |
|---|---|---|
| Parcels (real estate) | {len(a):,} | {len(b):,} |
| In both rolls | {s['parcels_both']:,} | |
| Only in one roll (new, split, merged or retired IDs) | {s[f'only_{y0}']:,} | {s[f'only_{y1}']:,} |
| Total market value | ${s['total_market'][0]/1e9:.2f}B | ${s['total_market'][1]/1e9:.2f}B |
| Total taxable assessed value | ${s['total_taxable'][0]/1e9:.2f}B | ${s['total_taxable'][1]/1e9:.2f}B |
| Total computed net tax (all levies in the file) | ${s['total_net_tax'][0]/1e6:.1f}M | ${s['total_net_tax'][1]/1e6:.1f}M |
| Median total millage, residential parcels | {s['residential_median_mills'][0]:.2f} | {s['residential_median_mills'][1]:.2f} |
| Median computed tax, homesteaded homes | ${s['homestead_median_tax'][0]:,.0f} | ${s['homestead_median_tax'][1]:,.0f} |
| Valuation date on every parcel | {', '.join(s['assessment_dates'])} | |

**What changed**
- **{s['market_unchanged_share']:.1%} of parcels have exactly the same market value** in both rolls. {s['market_up']:,} went
  up and {s['market_down']:,} went down. Among those that changed, the middle half moved between {q[0.25]:+.0%} and
  {q[0.75]:+.0%}.
- Changes are concentrated in parcels that recently sold. The rest are likely construction, demolition or corrections (not checked).
  - {s['changed_up_recent_sale_share']:.0%} of increases are on parcels with a recorded sale in {int(y0)-1}–{y1}.
  - {s['changed_at_92pct_of_recent_sale']:,} changed parcels now sit at about 92% of their recent sale price, the
    same reset-on-sale pattern seen in the 2026 sales study.
- **Taxes move mostly because the millage went up**: the median residential rate rose from
  {s['residential_median_mills'][0]:.2f} to {s['residential_median_mills'][1]:.2f} mills. The median home's computed
  tax changed by ${s['residential_median_tax_change']:+,.0f}, and {s['residential_share_tax_up']:.0%} of homes see an
  increase.

**What this means for the "2027 reassessment"**
Our sources said the 2027 roll would carry new reappraised values. **The roll the Assessor filed with the LTC doesn't
show that.** Values are unchanged for 98% of parcels and the valuation date is still 01/01/2023. Either the
reappraisal hasn't been applied to this filing, or it changed very few values. **Ask the Assessor's Office**
(`docs/verification-checklist.md`). The chatbot now says what the filed roll shows and that the reason is unknown.

**Limits**
- "Tax" here is the sum of the levies listed in the roll file: parish-wide millages plus the East Bank or Algiers levee
  district. It doesn't include special-district fees (Downtown Development District, security districts), which are
  billed separately, so a real bill can be higher.
- Parcels whose ID changed can't be matched, by design.
"""
    (ROOT / "docs/year-comparison.md").write_text(md)
    (ROOT / f"data/processed/change_{y0}_{y1}_summary.json").write_text(json.dumps(s, indent=2, default=str))
    print(json.dumps(s, indent=2, default=str))


if __name__ == "__main__":
    main(*(sys.argv[1:3] if len(sys.argv) == 3 else ("2026", "2027")))
