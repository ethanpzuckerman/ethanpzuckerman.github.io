# Data

| Folder | Contents | In git? |
|---|---|---|
| `raw/` | `Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv` from the course Box folder (163,135 parcels, 115 columns, 110 MB). Holds owner names. | **No** (ignored) |
| `processed/` | `roll2026_public.jsonl`: public fields only (no owner names, mailing addresses or prices); output of `pipeline/export_web.py` | No (regenerate) |
| `web/2026/` | The files the chatbot loads: 241 street files `s_XX.json`, `ids.json` (parcel ID → file), `meta.json` (source, year, street list). Output of `pipeline/shard.js`. | No (regenerate; published with the live chatbot) |
| `raw/ltc2026/`, `raw/ltc2027/` | Raw Louisiana Tax Commission downloads (7 district zips per year) from stax.latax.la.gov/TaxRollsFolder. Hold owner names. | **No** (ignored) |
| `outside/` | `acs_orleans_tracts.csv` (+ `.meta.json`): Census ACS 2024 5-year by tract from `pipeline/fetch_acs.py`; `geocode_sample_results.csv`: the tract-matching test | Yes |

**What's in the roll, and what isn't:** `../CLAUDE.md` §3 and `../docs/data-dictionary.md`.
**Profile and charts:** `../docs/week2-report.md` and `../docs/eda/`.

**Rebuild everything** (from `nola-assessment-navigator/`):
```
python3 pipeline/eda.py
python3 pipeline/data_dictionary.py
python3 pipeline/export_web.py && node pipeline/shard.js
```

**Year comparison:** `python3 pipeline/ltc_roll.py data/raw/ltc2026 2026 && python3 pipeline/ltc_roll.py data/raw/ltc2027 2027 && python3 pipeline/compare_rolls.py`
(run before `export_web.py`). The 2025 roll isn't available; if it turns up as a CSV like the Box file, use
`pipeline/compare_years.py`.

Python packages: pandas, matplotlib, tabulate (for `geocode_sample.py`'s tables).
