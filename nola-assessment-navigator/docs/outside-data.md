# Outside data: Census neighborhood demographics

## The source

| | |
|---|---|
| **Data** | American Community Survey (ACS) 5-year estimates, U.S. Census Bureau |
| **Geography** | Every census tract in Orleans Parish (state 22, county 071): 184 tracts |
| **How it's pulled** | `pipeline/fetch_acs.py`. By default it uses **Census Reporter's public API** (`https://api.censusreporter.org/1.0/data/show/latest`, one request, no key), which serves the latest ACS release. With `CENSUS_API_KEY` set it uses the Census Bureau's own API (`https://api.census.gov/data/2024/acs/acs5`, two requests), which now needs a free key |
| **Saved to** | `data/outside/acs_orleans_tracts.csv`, plus `data/outside/acs_orleans_tracts.meta.json` with the release, endpoint, tables, variables and pull date |
| **Why this and not PolicyMap** | PolicyMap's race, ethnicity, income and housing layers are these same ACS tables, behind a Tulane login, with no API we can call. The Census Reporter and Census Bureau APIs are public, free and repeatable, so anyone can rerun the pull and get the same numbers (until the next ACS release replaces "latest"). |

**Tables pulled** (estimate and margin of error for each):

| Topic | Table | Why it matters to the Navigator |
|---|---|---|
| Race and ethnicity | B03002 | Context for whether assessment patterns differ across neighborhoods |
| Median household income | B19013 | Senior freeze income limit; tax burden |
| Owner vs. renter households | B25003 | Where homestead-eligible owners live (compare with the homestead map) |
| Median home value | B25077 | A rough outside check on the Assessor's market values |
| Median gross rent | B25064 | Context for rental parcels |
| Residents 65+ | B01001 (12 cells summed) | Where freeze eligibility concentrates |
| Vacant housing units | B25002 | Context for vacant and blighted parcels |

## Status: pulled (Nov. 2, 2026)

- **Release:** ACS 2024 5-year (2020–2024) estimates for **184 tracts**, 371,853 residents, saved to
  `data/outside/acs_orleans_tracts.csv`.
- **How:** pulled through **Census Reporter's public API**. The Census Bureau's own API now redirects to a "missing key"
  page, so it requires a free key; `pipeline/fetch_acs.py` uses it automatically when `CENSUS_API_KEY` is set.
- **Gaps:** 14 tracts have no income estimate and 15 no home-value estimate (small or non-residential tracts). Those
  values are left blank.

## Can it be reliably matched to the assessment rolls?

**Short answer: yes at the tract level, but only after each parcel gets a location. The roll doesn't carry one.**

The 2026 roll has **no latitude/longitude, census tract, or block** (see `docs/data-dictionary.md`). ACS data is published
by tract. So matching takes two steps: parcel → location → tract. The options, best first:

1. **Parcel ID → the City's parcel GIS layer → tract.** If the City/Assessor parcel layer (data.nola.gov) carries
   the same parcel or tax-bill number, each parcel gets a point or shape and a spatial join gives its tract. This avoids
   address problems entirely. *To check:* whether that layer's ID matches the roll's 9-digit Parcel ID.
2. **Address → Census geocoder → tract.** Send roll addresses through the Census batch geocoder (10,000 per batch,
   17 batches for the whole roll). Problems we already know from the roll:

| Problem in the roll | Count | Effect on geocoding |
|---|---|---|
| No N/S/E/W direction (e.g. "701 CLAIBORNE AV" is 3 parcels on N. and S. Claiborne) | Every address | Wrong or ambiguous match on streets that split N/S; the legal description sometimes has the direction |
| Roll suffix codes (AV, BL, HW, PW, CR, WY, TR) | Most addresses | Must be expanded first; `address.js` already does this |
| Bare unit after the suffix ("ST CHARLES AV 607", "HF" for ½) | Thousands | Strip before geocoding; all units in a building share a tract, so the tract is still right |
| Several addresses on one parcel (" \| ") | 820 parcels | Use the first; usually all on one block |
| No usable street address ("XX", "Y2A21C4", street with no number) | 1,004 address strings | Can't geocode; needs the GIS layer |
| Vacant lots with no mailable address | Part of 31,608 vacant parcels | Geocoders often miss these |
| Streets renamed in 2021 (Jefferson Davis → Norman C Francis, Robert E Lee → Allen Toussaint) | ~500 parcels (453 under the new names, 47 still listed as Robert E Lee) | Geocoder may know only one name |

   **Tested** on a random sample of 504 parcels: 86% joined to a tract overall, 94% of homes, 57% of vacant land,
   and 6% were ties between two locations. Full results: `docs/outside-data-matching.md`.

3. **District or ward averages instead of tracts.** Not recommended: tracts don't nest inside wards or municipal
   districts, so any crosswalk would be approximate.

**Other limits:**
- **Margins of error.** ACS estimates have margins of error that can be large for small tracts. Show them, or round.
- **Timing.** The ACS 2024 5-year estimates (2020–2024) describe a different period than the roll's 01/01/2023 valuation date and the
  2026 tax year.
- **Neighborhood, not person.** Tract figures describe residents of the tract, not the owner of a parcel.

**Rule for the chatbot (CLAUDE.md §3, data rule 7):** tract demographics can describe a neighborhood ("this tract's median
household income is about $X ± Y"). They must **never** be used to infer an owner's race, income or age. Matching has
been tested on a sample (`docs/outside-data-matching.md`), but the chatbot doesn't use tract data in property answers yet.
