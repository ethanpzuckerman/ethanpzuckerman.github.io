# NOLA Assessment Navigator

A student-prototype AI assistant that helps City of New Orleans property owners understand
their assessment, the exemptions they can claim, and how to appeal. Owners can find their
property in the 2026 roll and ask about its actual record. It's not an official government
tool and doesn't give legal or tax advice.

- **Live chatbot (general guidance + property lookup):** https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB
- **Part 2 report (EDA, data dictionary, address matching, outside data, 10 tests):** [`docs/week2-report.md`](docs/week2-report.md), also as a [PDF](docs/NOLA%20Assessment%20Navigator%20-%20Part%202.pdf)
- **2026 vs 2027 roll comparison:** [`docs/year-comparison.md`](docs/year-comparison.md)
- **Agent instructions, domain research and sources:** [`CLAUDE.md`](CLAUDE.md)
- **Sample questions and what it got wrong:** [`docs/sample-questions.md`](docs/sample-questions.md)
- **Facts still to verify:** [`docs/verification-checklist.md`](docs/verification-checklist.md)
- **Data notes (2026 and 2027 rolls, Census data):** [`data/README.md`](data/README.md)

## Files

| File | What it is |
|---|---|
| `index.html`, `style.css` | Chat page |
| `kb.js` | Knowledge base: sources (S1–S31) and answer entries |
| `app.js` | Matching, guardrails, date logic, lookup flow and rendering |
| `address.js`, `lookup.js` | Address normalizing/matching and the property search |
| `property.js` | Answers about the selected property |
| `pipeline/` | Data pipeline (below) |
| `tests/` | Address unit tests, 19-address evaluation, 10-question chatbot evaluation, property-answer sweep |

## Rebuild the data

From this folder (needs the raw files in `data/raw/`, which aren't in git; see `data/README.md`):

1. `python3 pipeline/ltc_roll.py data/raw/ltc2026 2026`, `python3 pipeline/ltc_roll.py data/raw/ltc2027 2027`, then
   `python3 pipeline/compare_rolls.py`: state roll files → parcel tables → the 2026 vs 2027 comparison
2. `python3 pipeline/eda.py` and `python3 pipeline/data_dictionary.py`: charts, numbers and the data dictionary
3. `python3 pipeline/export_web.py && node pipeline/shard.js`: public fields → `data/web/2026/`
4. `python3 pipeline/area_stats.py`: Layer 3 area distributions → `data/web/2026/areas.json` (run after `shard.js`,
   which clears the folder)
5. Optional: `python3 pipeline/fetch_acs.py` and `python3 pipeline/geocode_sample.py` (Census data and the
   tract-matching test); `python3 pipeline/build_standalone.py`: the single-file offline copy (below)

## Run it locally

Serve the folder: `python3 -m http.server 8765` and open http://localhost:8765/. Opening `index.html` directly works
for general questions, but the property search needs a server to load its data files.

**Single-file offline copy:** `python3 pipeline/build_standalone.py [out.html]` embeds the scripts, styles and every
`data/web/2026` file in one HTML page that opens by double-click, with no server. It's generated, so
don't commit it (default output `docs/NOLA Assessment Navigator.html` is git-ignored).

## Tests

- `node tests/address.test.js`: address parser unit tests
- `node tests/address_eval.js`: 19 real addresses against the roll export (writes `docs/address-matching-results.md`)
- `node tests/chatbot_eval.js`: the 10 test questions in the real page; needs Playwright and a local server on port 8765
- `node tests/property_sweep.js`: every property question type on 305 random parcels; must report 0 problems
