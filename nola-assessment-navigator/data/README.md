# Data

| Folder | Contents | In git? |
|---|---|---|
| `raw/` | `Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv` from the course Box folder (163,135 parcels, 115 columns, 110 MB). Holds owner names. | **No** (ignored) |
| `processed/` | `roll2026_public.jsonl`: public fields only (no owner names, mailing addresses or prices); output of `pipeline/export_web.py` | No (regenerate) |
| `web/2026/` | The files the chatbot loads: 241 street files `s_XX.json`, `ids.json` (parcel ID → file), `meta.json` (source, year, street list). Output of `pipeline/shard.js`. | No (regenerate; published with the live chatbot) |
| `outside/` | Census ACS tract data from `pipeline/fetch_acs.py` (not pulled yet: api.census.gov is blocked in the cloud session) | Yes, once pulled |

**What's in the roll, and what isn't:** `../CLAUDE.md` §3 and `../docs/data-dictionary.md`.
**Profile and charts:** `../docs/week2-report.md` and `../docs/eda/`.

**Rebuild everything** (from `nola-assessment-navigator/`):
```
python3 pipeline/eda.py
python3 pipeline/data_dictionary.py
python3 pipeline/export_web.py && node pipeline/shard.js
```

**2025 roll:** not provided yet. When you have it, put it in `raw/` and run
`python3 pipeline/compare_years.py data/raw/<2025 file>.csv data/raw/Orleans_Parish_2026_LTC_Expanded_Real_Estate_Roll.csv`.
