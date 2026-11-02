"""Exploratory data analysis of the 2026 Orleans Parish roll.

Run from nola-assessment-navigator/:  python3 pipeline/eda.py
Writes charts to docs/eda/ and the numbers behind them to docs/eda/eda_numbers.json.
"""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv"
OUT = ROOT / "docs/eda"
OUT.mkdir(parents=True, exist_ok=True)

# Validated palette (dataviz skill reference palette, light mode).
BLUE, ORANGE = "#2a78d6", "#eb6834"
INK, INK2, MUTED, SURFACE, GRID = "#0b0b0b", "#52514e", "#898781", "#fcfcfb", "#e8e7e3"
SOURCE = "Source: Louisiana Tax Commission, Orleans Parish 2026 tax roll (163,135 parcels)"

plt.rcParams.update({
    "figure.facecolor": SURFACE, "axes.facecolor": SURFACE, "savefig.facecolor": SURFACE,
    "axes.edgecolor": MUTED, "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
    "axes.spines.top": False, "axes.spines.right": False, "font.size": 10,
    "axes.titlesize": 12, "axes.titleweight": "bold", "axes.titlecolor": INK,
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.8,
    "text.parse_math": False,  # "$" in labels is money, not math
})

NUM = ["Land Market Value", "Improvement Market Value", "Total Market Value",
       "Land Assessed Value", "Improvement Assessed Value", "Total Assessed Value",
       "Homestead Exemption Amount", "Other Exemption Amount", "Veteran Exemption Amount",
       "First Responder Exemption Amount", "Taxable Assessed Value"]


def load():
    df = pd.read_csv(RAW, dtype=str, encoding="utf-8-sig", low_memory=False)
    for c in NUM:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    # Multi-valued fields join several assessment records with " | ".
    df["occ"] = df["Occupancy Type(s)"].where(~df["Occupancy Type(s)"].str.contains(r"\|"), "MIXED (2+ TYPES)")
    df["frozen"] = ~df["Freeze Code(s)"].isin(["0"])
    return df


def footer(fig, extra=""):
    fig.text(0.01, 0.01, SOURCE + ("\n" + extra if extra else ""), fontsize=7.5, color=MUTED, ha="left", va="bottom")


def money(x):
    return f"${x/1e6:.1f}M" if x >= 1e6 else f"${x/1e3:.0f}K" if x >= 1e3 else f"${x:.0f}"


def chart_share(df, n):
    order = ["RESIDENTIAL", "VACANT LAND", "COMMERCIAL", "EXEMPT", "MIXED (2+ TYPES)"]
    parcels = df["occ"].value_counts(normalize=True).reindex(order)
    value = (df.groupby("occ")["Total Market Value"].sum() / df["Total Market Value"].sum()).reindex(order)
    fig, ax = plt.subplots(figsize=(8, 3.9))
    y = np.arange(len(order))[::-1]
    h = 0.36
    ax.barh(y + h / 2, parcels.values, height=h, color=BLUE, label="Share of parcels")
    ax.barh(y - h / 2, value.values, height=h, color=ORANGE, label="Share of market value")
    for yi, pv, vv in zip(y, parcels.values, value.values):
        ax.text(pv + 0.008, yi + h / 2, f"{pv:.1%}", va="center", fontsize=8.5, color=INK2)
        ax.text(vv + 0.008, yi - h / 2, f"{vv:.1%}", va="center", fontsize=8.5, color=INK2)
    ax.set_yticks(y, [o.title() for o in order])
    ax.set_xlim(0, 0.85)
    ax.xaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(1.0))
    ax.grid(axis="y", visible=False)
    ax.legend(loc="lower right", frameon=False, fontsize=9)
    ax.set_title("Exempt parcels are 2% of the roll but 21% of its market value", loc="left")
    total = df["Total Market Value"].sum()
    footer(fig, f"Total market value on the roll: ${total/1e9:.1f} billion, including exempt property")
    fig.tight_layout(rect=(0, 0.07, 1, 1))
    fig.savefig(OUT / "fig1_share_parcels_value.png", dpi=160)
    plt.close(fig)
    n["share_parcels"] = parcels.round(4).to_dict()
    n["share_market_value"] = value.round(4).to_dict()
    n["total_market_value"] = float(total)
    n["occupancy_counts"] = df["occ"].value_counts().to_dict()
    n["taxable_zero_by_occupancy"] = df[df["Taxable Assessed Value"] == 0]["occ"].value_counts().to_dict()


def chart_values(df, n):
    res = df[(df["Occupancy Type(s)"] == "RESIDENTIAL") & (df["Total Market Value"] > 0)]["Total Market Value"]
    med = float(res.median())
    bins = np.logspace(np.log10(5_000), np.log10(5_000_000), 50)
    fig, ax = plt.subplots(figsize=(8, 3.8))
    ax.hist(res.clip(5_000, 5_000_000), bins=bins, color=BLUE, edgecolor=SURFACE, linewidth=1)
    ax.set_xscale("log")
    ax.axvline(med, color=INK, linewidth=1.2, linestyle="--")
    ax.text(med * 1.06, ax.get_ylim()[1] * 0.92, f"Median {money(med)}", color=INK, fontsize=9)
    ticks = [10_000, 30_000, 100_000, 300_000, 1_000_000, 3_000_000]
    ax.set_xticks(ticks, [money(t) for t in ticks])
    ax.minorticks_off()
    ax.grid(axis="x", visible=False)
    q25, q75 = res.quantile(0.25), res.quantile(0.75)
    ax.set_title(f"Half of homes are valued between {money(q25)} and {money(q75)}", loc="left")
    ax.set_xlabel("Total market value set by the Assessor (log scale)")
    ax.set_ylabel("Residential parcels")
    footer(fig, "Values clipped to $5K–$5M for display")
    fig.tight_layout(rect=(0, 0.07, 1, 1))
    fig.savefig(OUT / "fig2_residential_values.png", dpi=160)
    plt.close(fig)
    q = res.quantile([0.1, 0.25, 0.5, 0.75, 0.9]).round(0)
    n["residential_market_value"] = {"count": int(len(res)), **{f"p{int(k*100)}": float(v) for k, v in q.items()}}


def chart_homestead(df, n):
    res = df[df["Occupancy Type(s)"] == "RESIDENTIAL"]
    g = res.groupby("Municipal District").agg(parcels=("Parcel ID(s)", "size"),
                                              homestead=("Homestead Exemption", lambda s: (s == "Yes").mean()),
                                              frozen=("frozen", "mean"))
    g = g.sort_values("homestead")
    fig, ax = plt.subplots(figsize=(8, 3.6))
    y = np.arange(len(g))
    ax.barh(y, g["homestead"], color=BLUE, height=0.55)
    for yi, (d, r) in zip(y, g.iterrows()):
        ax.text(r["homestead"] + 0.01, yi, f"{r['homestead']:.0%}  of {int(r['parcels']):,}", va="center", fontsize=9, color=INK2,
                zorder=5, bbox=dict(facecolor=SURFACE, edgecolor="none", pad=1.5))
    ax.set_yticks(y, [f"District {d}" for d in g.index])
    ax.xaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(1.0))
    ax.grid(axis="y", visible=False)
    overall = (res["Homestead Exemption"] == "Yes").mean()
    ax.axvline(overall, color=INK, linewidth=1, linestyle="--")
    ax.text(overall + 0.005, -0.75, f"Citywide {overall:.0%}", fontsize=8.5, color=INK, va="center")
    ax.set_ylim(-1, len(g) - 0.5)
    ax.set_xlim(0, 0.85)
    ax.set_title("Homestead exemption share of residential parcels, by municipal district", loc="left")
    ax.set_xlabel("Residential parcels with homestead exemption")
    footer(fig, "Low shares point to more rentals, second homes, or owners who haven't applied")
    fig.tight_layout(rect=(0, 0.07, 1, 1))
    fig.savefig(OUT / "fig3_homestead_by_district.png", dpi=160)
    plt.close(fig)
    n["homestead_by_district"] = g.round(4).to_dict(orient="index")
    n["homestead_citywide_residential"] = round(float(overall), 4)


def chart_ratio(df, n):
    res = df[(df["Occupancy Type(s)"] == "RESIDENTIAL") & (df["Total Market Value"] > 0)].copy()
    res["ratio"] = res["Total Assessed Value"] / res["Total Market Value"]
    bins = np.linspace(0, 0.16, 65)
    fig, axes = plt.subplots(2, 1, figsize=(8, 4.6), sharex=True)
    for ax, (label, sub, color) in zip(axes, [("No freeze", res[~res["frozen"]], BLUE),
                                               ("Special assessment level (freeze)", res[res["frozen"]], ORANGE)]):
        ax.hist(sub["ratio"].clip(0, 0.16), bins=bins, color=color, edgecolor=SURFACE, linewidth=0.8)
        share10 = (sub["ratio"].round(3) == 0.100).mean()
        ax.set_title(f"{label}: {len(sub):,} parcels, {share10:.0%} assessed at exactly 10%", loc="left", fontsize=10)
        ax.axvline(0.10, color=INK, linewidth=1, linestyle="--")
        ax.grid(axis="x", visible=False)
        ax.set_ylabel("Parcels")
        n.setdefault("assessment_ratio", {})[label] = {
            "parcels": int(len(sub)), "share_exactly_10pct": round(float(share10), 4),
            "median_ratio": round(float(sub["ratio"].median()), 4),
            "share_below_9_5pct": round(float((sub["ratio"] < 0.095).mean()), 4)}
    axes[1].xaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(1.0, decimals=0))
    axes[1].set_xlabel("Assessed value ÷ market value (residential parcels; dashed line = 10% legal ratio)")
    fig.suptitle("Homes are assessed at 10% of market value, unless the value is frozen", x=0.01, ha="left",
                 fontsize=12, fontweight="bold", color=INK)
    footer(fig)
    fig.tight_layout(rect=(0, 0.06, 1, 0.95))
    fig.savefig(OUT / "fig4_assessment_ratio.png", dpi=160)
    plt.close(fig)


def chart_year_built(df, n):
    yb = pd.to_numeric(df["Year(s) Built"].where(~df["Year(s) Built"].str.contains(r"\|")), errors="coerce")
    sub = df.assign(yb=yb)[yb.between(1800, 2026)]
    by = sub.groupby("yb").size()
    fig, ax = plt.subplots(figsize=(8, 3.8))
    ax.bar(by.index, by.values, width=0.8, color=BLUE)
    ax.bar([1994], [by.get(1994, 0)], width=0.8, color=ORANGE)
    c94 = sub[sub["yb"] == 1994]["occ"].value_counts()
    ax.annotate(f"1994: {int(by.get(1994, 0)):,} parcels\n{c94.get('VACANT LAND', 0):,} vacant lots and "
                f"{c94.get('COMMERCIAL', 0):,} commercial\n→ a placeholder, not a real build year",
                xy=(1993, by.get(1994, 0) * 0.97), xytext=(1900, by.get(1994, 0) * 0.78), fontsize=8.5, color=INK,
                ha="right", va="center", arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
    ax.grid(axis="x", visible=False)
    ax.set_title("“Year built” has a 1994 spike that is a data artifact", loc="left")
    ax.set_xlabel("Year built (as recorded)")
    ax.set_ylabel("Parcels")
    footer(fig, "Most residential years end in 0 or 5 (1920, 1940…), so treat them as estimates")
    fig.tight_layout(rect=(0, 0.07, 1, 1))
    fig.savefig(OUT / "figA1_year_built.png", dpi=160)
    plt.close(fig)
    res_yb = sub[sub["occ"] == "RESIDENTIAL"]["yb"]
    n["year_built"] = {"parcels_1994": int(by.get(1994, 0)), "1994_by_occupancy": c94.to_dict(),
                       "residential_share_ending_0_or_5": round(float((res_yb % 5 == 0).mean()), 4)}


def sales_ratio(df):
    """Residential arm's-length-style sales: document type SALE, 2023–2025, price over $10,000,
    ratio (roll market value ÷ sale price) between 0.3 and 3. Same filters as the class model EDA."""
    r = df[(df["Occupancy Type(s)"] == "RESIDENTIAL") & (df["Instrument Type(s)"] == "SALE")].copy()
    r["price"] = pd.to_numeric(r["Purchase Price(s)"], errors="coerce")
    r["year"] = pd.to_datetime(r["Transfer Date(s)"], format="%m/%d/%Y", errors="coerce").dt.year
    s = r[r["year"].between(2023, 2025) & (r["price"] > 10_000)].copy()
    s["ratio"] = s["Total Market Value"] / s["price"]
    return s[s["ratio"].between(0.3, 3)]


def cod(x):
    """Coefficient of dispersion: average absolute deviation from the median ratio, as % of the median."""
    m = x.median()
    return 100 * (x - m).abs().mean() / m


def chart_sales_ratio(df, n):
    s = sales_ratio(df)
    s["tenth"] = pd.qcut(s["price"], 10, labels=False)
    g = s.groupby("tenth").agg(lo=("price", "min"), hi=("price", "max"), sales=("ratio", "size"),
                                median=("ratio", "median"), cod=("ratio", cod))
    labels = [f"{money(r.lo)}–{money(r.hi)}" for r in g.itertuples()]
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(8.6, 4.2), sharey=True, gridspec_kw={"width_ratios": [1.5, 1]})
    y = np.arange(len(g))[::-1]
    colors = [ORANGE if i == 0 else BLUE for i in range(len(g))]
    a1.axvline(1.0, color=MUTED, linewidth=1, linestyle="--")
    a1.scatter(g["median"], y, s=46, color=colors, zorder=3)
    for yi, v in zip(y, g["median"]):
        a1.text(v + 0.012, yi, f"{v:.2f}", va="center", fontsize=8.5, color=INK2)
    a1.set_yticks(y, labels)
    a1.set_xlim(0.85, 1.28)
    a1.set_xlabel("Median roll value ÷ sale price (1.0 = sale price)")
    a1.grid(axis="y", visible=False)
    a2.barh(y, g["cod"], color=colors, height=0.55)
    a2.axvspan(5, 15, color=GRID, zorder=0)
    a2.text(10, len(g) - 0.35, "IAAO target 5–15", ha="center", fontsize=8, color=INK2)
    for yi, v in zip(y, g["cod"]):
        a2.text(v + 0.6, yi, f"{v:.0f}", va="center", fontsize=8.5, color=INK2)
    a2.set_xlabel("Dispersion (COD)")
    a2.set_xlim(0, 40)
    a2.grid(axis="y", visible=False)
    fig.suptitle("The cheapest tenth of homes is valued at 1.18× its sale price; the rest at about 0.93×",
                 x=0.01, ha="left", fontsize=12, fontweight="bold", color=INK)
    footer(fig, f"{len(s):,} residential SALE transfers 2023–2025 over $10K; ratios outside 0.3–3 dropped. Sale prices are unverified.")
    fig.tight_layout(rect=(0, 0.07, 1, 0.94))
    fig.savefig(OUT / "fig5_sales_ratio_by_price.png", dpi=160)
    plt.close(fig)
    band = s["ratio"].round(2) == 0.92
    n["sales_ratio"] = {
        "sales": int(len(s)), "median": round(float(s["ratio"].median()), 3), "cod": round(float(cod(s["ratio"])), 1),
        "prd": round(float(s["ratio"].mean() / (s["Total Market Value"].sum() / s["price"].sum())), 3),
        "by_tenth": g.round(3).reset_index().to_dict(orient="records"),
        "share_in_0.92_band": round(float(band.mean()), 4), "count_in_0.92_band": int(band.sum()),
        "share_exactly_92pct_rounded_100": round(float((s["Total Market Value"] == (s["price"] * 0.92 / 100).round() * 100).mean()), 4),
        "0.92_band_share_by_year": s.assign(b=band).groupby("year")["b"].mean().round(3).to_dict(),
    }


def checks(df, n):
    """Internal consistency checks that the EDA findings rely on."""
    exempt = df[["Homestead Exemption Amount", "Other Exemption Amount", "Veteran Exemption Amount",
                 "First Responder Exemption Amount"]].sum(axis=1)
    n["checks"] = {
        "parcels": int(len(df)),
        "parcel_id_unique": bool(df["Parcel ID(s)"].is_unique),
        "parcel_id_equals_tax_bill": float((df["Parcel ID(s)"] == df["Tax Bill #"]).mean()),
        "market_equals_land_plus_improvement": float((df["Total Market Value"] == df["Land Market Value"] + df["Improvement Market Value"]).mean()),
        "assessed_equals_land_plus_improvement": float((df["Total Assessed Value"] == df["Land Assessed Value"] + df["Improvement Assessed Value"]).mean()),
        "taxable_equals_assessed_minus_exemptions": float((df["Taxable Assessed Value"] == (df["Total Assessed Value"] - exempt).clip(lower=0)).mean()),
        "max_homestead_amount": float(df["Homestead Exemption Amount"].max()),
        "taxable_zero": int((df["Taxable Assessed Value"] == 0).sum()),
        "status_exempt": int((df["Assessment Status(es)"] == "EX").sum()),
        "living_sqft_equals_record_count": float((df["Living Square Feet"] == df["Assessment Record Count"]).mean()),
        "assessment_date_values": df["Assessment Date(s)"].unique().tolist(),
        "transfer_date_1994_12_31": int((df["Transfer Date(s)"] == "12/31/1994").sum()),
        "purchase_price_zero": int((df["Purchase Price(s)"] == "0").sum()),
    }


if __name__ == "__main__":
    df = load()
    n = {}
    checks(df, n)
    chart_share(df, n)
    chart_values(df, n)
    chart_homestead(df, n)
    chart_ratio(df, n)
    chart_sales_ratio(df, n)
    chart_year_built(df, n)
    (OUT / "eda_numbers.json").write_text(json.dumps(n, indent=2, default=str))
    print(json.dumps(n, indent=2, default=str))
