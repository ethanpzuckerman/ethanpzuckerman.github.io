# Data notes

Raw roll files go in `data/raw/`. That folder is git-ignored because the rolls list owner names.

| File | Roll | Values posted | Bill due | Reassessment year? |
|---|---|---|---|---|
| `raw/roll_2025.*` | 2025 | July 15 – Aug. 15, 2024 | early 2025 | No (values carried from the 2024 reappraisal) |
| `raw/roll_2026.*` | 2026 | July 15 – Aug. 15, 2025 | early 2026 | No |

The 2027 roll (posted July 2026) **is** a reassessment year. It is **not** in this project's data.

## Profile checklist (fill in when the files are added)

- [ ] Source and download date for each file
- [ ] Format (CSV / XLSX / other), row count, and file size
- [ ] Column names and types (paste the header row here)
- [ ] Parcel ID column, and whether it is unique per row
- [ ] Land, improvement, and total value columns (FMV or assessed?)
- [ ] Exemption columns (homestead, SAL, veteran, other) and their codes
- [ ] Neighborhood or district column, if any
- [ ] Nulls and odd values (zeros, negatives, exempt parcels)
- [ ] Parcels found in only one of the two years

See `../CLAUDE.md` §3 for the rules on joining, privacy, and citations.
