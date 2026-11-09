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
| `pipeline/` | EDA, data dictionary, raw state-file parser, web export, year comparison, Census pull and geocoding test |
| `tests/` | Address unit tests, 19-address evaluation, 10-question chatbot evaluation |

## Run it locally

Generate the data first (see `data/README.md`), then serve the folder: `python3 -m http.server 8765`
and open http://localhost:8765/. Opening `index.html` directly works for general questions, but the
property search needs a server to load its data files.
