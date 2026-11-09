# Address matching results

Run: `node tests/address_eval.js` against the 2026 roll export (`data/web/2026`).
Method: `address.js` normalizes both the owner's input and the roll's addresses the same way:
- suffixes (Avenue/AV, Boulevard/BL, Highway/HW, Parkway/PW)
- Saint/St and General/GEN
- MLK and O.C. Haley spellings
- 2021 street renames
- units (Apt / # / Unit, or a bare unit after the suffix as the roll writes it)
- half addresses (1/2 vs HF)
- city, state and ZIP tails

It then matches by street name and house number. If the street isn't found, it tries close spellings
(edit distance). A 9-digit input is looked up as a parcel ID.

**Result: 19 of 19 cases behaved as expected.** By status:
- exact: 13
- multiple, with the owner picking from a list: 2
- close match, with the owner confirming: 1
- not found: 3

| # | What the owner typed | What it tests | Expected | Got | Matches | Top candidate | OK |
|---|---|---|---|---|---|---|---|
| 1 | 1205 St. Charles Avenue, Apt 607, New Orleans, LA 70130 | unit with Apt, Avenue vs AV, city/ZIP | exact | exact | 1 | 1205 ST CHARLES AV   607 (102000079) | ✅ |
| 2 | 1205 Saint Charles Ave | condo building, no unit given | multiple | multiple | 225 | 1205 ST CHARLES AV    C1 (102000001) | ✅ |
| 3 | 423 Gravier Street #3A | unit with # | exact | exact | 1 | 423 GRAVIER ST 3A (105100749) | ✅ |
| 4 | 1201 Canal St Unit 273 | unit with Unit | exact | exact | 1 | 1201 CANAL ST 273 (206104825) | ✅ |
| 5 | 2000 MLK Blvd | MLK vs MARTIN L KING BL | exact | exact | 1 | 2000 MARTIN L KING BL (101108701) | ✅ |
| 6 | 1632 O.C. Haley Blvd. | O.C. Haley vs ORETHA C HALEY BL | exact | exact | 1 | 1632 ORETHA C HALEY BL (101107818) | ✅ |
| 7 | 1050 Jefferson Davis Parkway | old street name (renamed 2021) | exact | exact | 1 | 1050 NORMAN C FRANCIS PW (102206001) | ✅ |
| 8 | 519 General Pershing Street | General vs GEN | exact | exact | 1 | 519 GEN PERSHING ST (614103512) | ✅ |
| 9 | 130 Robert E. Lee Blvd | old street name (renamed 2021) | exact | exact | 1 | 130 ALLEN TOUSSAINT BL (206411902) | ✅ |
| 10 | 1122 Tchoupitoulas St | second address on a multi-address parcel | exact | exact | 1 | 1116 TCHOUPITOULAS ST \| 1122 TCHOUPITOULAS ST \| 1112 TCHOUPITOULAS ST (102101404) | ✅ |
| 11 | 1116 Tchoupitoulis St | misspelled street | close | close | 1 | 1116 TCHOUPITOULAS ST \| 1122 TCHOUPITOULAS ST \| 1112 TCHOUPITOULAS ST (102101404) | ✅ |
| 12 | 701 S. Claiborne Ave | roll has no N/S direction | multiple | multiple | 3 | 701 CLAIBORNE AV (103107307) | ✅ |
| 13 | 1518 1/2 Melpomene St | half address vs HF | exact | exact | 1 | 1518 MELPOMENE ST HF (101105624) | ✅ |
| 14 | 1514 freret | lowercase, no suffix | exact | exact | 1 | 1514 FRERET ST (101110115) | ✅ |
| 15 | 510 Esplanade Avenue | Avenue vs AV | exact | exact | 1 | 510 ESPLANADE AV (208100308) | ✅ |
| 16 | 101100224 | parcel ID instead of address | exact | exact | 1 | 301 RACE ST (101100224) | ✅ |
| 17 | 9999 Magazine St | house number not on street | not_found | not_found | 0 | — | ✅ |
| 18 | 3300 Veterans Blvd, Metairie, LA 70002 | address outside Orleans Parish | not_found | not_found | 0 | — | ✅ |
| 19 | Magazine Street | no house number | not_found | not_found | 0 | — | ✅ |

## Why the multiple and not-found cases happen

- **1205 Saint Charles Ave** → multiple: 225 records at this address (225 with unit numbers). Pick yours.
- **1116 Tchoupitoulis St** → close: Closest match: same house number; street spelled "TCHOUPITOULAS" in the roll. Please confirm it's your property.
- **701 S. Claiborne Ave** → multiple: 3 records share this address. Pick yours. 1 of them has "S CLAIBORNE" in the legal description, listed first.
- **9999 Magazine St** → not_found: "MAGAZINE" is in the roll, but not house number 9999.
- **3300 Veterans Blvd, Metairie, LA 70002** → not_found: METAIRIE is outside Orleans Parish, so it isn't in this roll. Contact that parish's assessor.
- **Magazine Street** → not_found: No house number found. Enter it like "1234 Magazine St".
