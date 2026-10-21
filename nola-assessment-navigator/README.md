# NOLA Assessment Navigator

A student-prototype AI assistant that helps City of New Orleans property owners understand
their assessment, the exemptions they can claim, and how to appeal. It's not an official
government tool and doesn't give legal or tax advice.

- **Live draft (Layer 1, general guidance):** https://claude.ai/artifact/PMnTiHc5EGih7pzGky6bWB
- **Agent instructions, domain research and sources:** [`CLAUDE.md`](CLAUDE.md)
- **Sample questions and what it got wrong:** [`docs/sample-questions.md`](docs/sample-questions.md)
- **Facts still to verify:** [`docs/verification-checklist.md`](docs/verification-checklist.md)
- **Data notes (2025 and 2026 rolls):** [`data/README.md`](data/README.md)

## Files

| File | What it is |
|---|---|
| `index.html`, `style.css` | Chat page |
| `kb.js` | Knowledge base: sources (S1–S29) and answer entries |
| `app.js` | Matching, guardrails, date logic and rendering |

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder with any static server.
Add `#q=your question` to the URL to ask a question on load.
