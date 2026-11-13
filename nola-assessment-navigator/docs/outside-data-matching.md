# Can roll parcels be matched to Census tracts? (tested)

`python3 pipeline/geocode_sample.py`: a random sample of **504 parcels** from the 2026 roll, stratified by
occupancy type (seed 42), sent to the **Census Bureau batch geocoder** (`https://geocoding.geo.census.gov/geocoder/geographies/addressbatch`, benchmark Public_AR_Current).
Before sending, roll addresses were rewritten: first address only, suffix codes expanded (AV→AVE, BL→BLVD, HW→HWY,
PW→PKWY…), trailing unit dropped, because all units in a building share a tract. The returned tract was joined to the
ACS tract table (`data/outside/acs_orleans_tracts.csv`).

| | Parcels | Share of sample |
|---|---|---|
| Sample | 504 | 100% |
| Not sent (no house number in the roll address) | 0 | 0% |
| Matched to one location | 432 | 86% |
| … of which exact address matches | 393 | 78% |
| Tie: more than one possible location | 29 | 6% |
| No match | 43 | 9% |
| **Joined to an ACS tract** | **432** | **86%** |
| … tract also has a median-income estimate | 415 | 82% |

**By occupancy type** (share of each type that ended up joined to an ACS tract):

| occupancy   |   sent |   matched |   tie |   no_match |   joined |   not_sent |   match_rate_of_sample |
|:------------|-------:|----------:|------:|-----------:|---------:|-----------:|-----------------------:|
| COMMERCIAL  |     21 |        17 |     3 |          1 |       17 |          0 |                  0.81  |
| EXEMPT      |     11 |        10 |     0 |          1 |       10 |          0 |                  0.909 |
| MIXED       |      5 |         3 |     0 |          2 |        3 |          0 |                  0.6   |
| RESIDENTIAL |    370 |       347 |    18 |          5 |      347 |          0 |                  0.938 |
| VACANT LAND |     97 |        55 |     8 |         34 |       55 |          0 |                  0.567 |

**Why parcels fail:**
- **Ties** are mostly streets that split North/South while the roll drops the direction. Examples (as sent): 237 PETERS ST; 117 MURAT ST; 1218 COLUMBUS ST; 322 WHITE ST; 511 OLYMPIA ST.
- **No match:** vacant lots and other parcels with no mailable address, plus streets the geocoder spells or names
  differently. Examples (as sent): 1294401 MAGELLAN ST; 5383803 HIGHLAND AVE; 29132 SQUARE; 1926 MAGIC WALK; 56434 VERONESE RD;
  1143001 BEHRMAN AVE; 1135501 SHEPARD ST; 4287. Several have 5- to 7-digit numbers that aren't real house numbers.
- **Not sent:** roll addresses with no house number, such as vacant lots described only by street (none in this sample).

**Verdict:** address geocoding is **reliable enough for neighborhood context on homes** (see the residential row), but
not for every parcel. Vacant land fails far more often (57% joined), and commercial parcels somewhat more (81%). A
parcel-ID join to the City's parcel GIS layer would avoid most of these failures and is the next thing to test. Until
then, the chatbot doesn't use tract data in property answers.
