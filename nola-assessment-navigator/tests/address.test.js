// Unit tests for address.js. Run: node tests/address.test.js
// The fixture records are written in the 2026 roll's format but are made up for testing.
const A = require("../address.js");
let fail = 0;
function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log("FAIL", label, "\n  got ", got, "\n  want", want); } else console.log("ok  ", label);
}

// parse(): user spellings and roll spellings normalize to the same key
const k = s => A.fullKey(A.parse(s));
eq("Street vs ST", k("1234 Magazine Street"), "1234 MAGAZINE ST");
eq("punctuation + city/zip", k("1234 Magazine St., New Orleans, LA 70130"), "1234 MAGAZINE ST");
eq("Avenue vs roll AV", k("6000 Saint Charles Avenue"), k("6000 ST CHARLES AV"));
eq("Highway vs roll HW", k("5500 Chef Menteur Hwy"), k("5500 CHEF MENTEUR HW"));
eq("Blvd vs roll BL", k("2000 Martin Luther King Jr. Boulevard"), k("2000 MARTIN L KING BL"));
eq("MLK", k("2000 MLK Blvd"), k("2000 MARTIN L KING BL"));
eq("O.C. Haley", k("1800 O. C. Haley Blvd"), k("1800 ORETHA C HALEY BL"));
eq("Parkway vs roll PW", k("100 Norman C Francis Parkway"), k("100 NORMAN C FRANCIS PW"));
eq("old name Jeff Davis", k("100 Jefferson Davis Pkwy"), k("100 NORMAN C FRANCIS PW"));
eq("Circle vs roll CR", k("10 Wheaton Circle"), k("10 WHEATON CR"));
eq("Trail vs roll TR", k("5000 Old Spanish Trail"), k("5000 OLD SPANISH TR"));
eq("General vs GEN", k("400 General Taylor St"), k("400 GEN TAYLOR ST"));
eq("ordinal word", k("1200 Third Street"), "1200 3RD ST");
eq("name word inside", k("100 Louisiana Avenue Parkway"), k("100 LOUISIANA AVE PW"));
eq("unit with #", k("1000 Magazine St #3B"), "1000 MAGAZINE ST UNIT 3B");
eq("Apt vs roll bare unit", k("1000 Magazine St Apt 202"), k("1000 MAGAZINE ST   202"));
eq("half address", k("1234 1/2 Claiborne Ave"), k("1234 CLAIBORNE AV HF"));
eq("St Charles, no suffix", A.parse("6000 St Charles").name, "ST CHARLES");
eq("lowercase + extra spaces", k("  1234   magazine   st "), "1234 MAGAZINE ST");
eq("Jefferson Davis with city tail", k("100 Jefferson Davis Pkwy, New Orleans, LA"), k("100 NORMAN C FRANCIS PW"));
eq("Metairie detected", A.parse("3300 Veterans Blvd, Metairie, LA 70002").otherCity, "METAIRIE");
eq("Harvey as a street isn't a city", A.parse("100 Harvey St, New Orleans").otherCity, "");
eq("zip captured", A.parse("1234 Magazine St 70130").zip, "70130");

// match(): fixtures in roll format
const idx = A.buildIndex([
  { id: "T1", address: "1234 MAGAZINE ST" },
  { id: "T2", address: "1000 MAGAZINE ST   201" },
  { id: "T3", address: "1000 MAGAZINE ST   202" },
  { id: "T4", address: "1116 TCHOUPITOULAS ST | 1122 TCHOUPITOULAS ST" },
  { id: "T5", address: "701 CLAIBORNE AV" },
  { id: "T6", address: "701 CLAIBORNE AV" },
  { id: "T7", address: "6000 ST CHARLES AV" },
  { id: "T8", address: "2000 MARTIN L KING BL" }
]);
const m = s => { const r = A.match(idx, s); return [r.status, r.candidates.map(c => c.record.id)]; };
eq("exact", m("1234 Magazine Street"), ["exact", ["T1"]]);
eq("condo building → multiple", m("1000 Magazine St"), ["multiple", ["T2", "T3"]]);
eq("condo with unit → exact", m("1000 Magazine St Apt 202"), ["exact", ["T3"]]);
eq("second address on a parcel", m("1122 Tchoupitoulas St"), ["exact", ["T4"]]);
eq("typo in street", m("1116 Tchoupitoulis St"), ["close", ["T4"]]);
eq("N/S not in roll → both", m("701 South Claiborne Ave"), ["multiple", ["T5", "T6"]]);
eq("Saint spelled out", m("6000 Saint Charles Avenue"), ["exact", ["T7"]]);
eq("MLK", m("2000 MLK Blvd"), ["exact", ["T8"]]);
eq("number not on street", m("9999 Magazine St"), ["not_found", []]);
eq("unknown street", m("12 Nowhere Ln"), ["not_found", []]);
eq("no house number", m("Magazine St"), ["not_found", []]);
console.log(fail ? `\n${fail} failed` : "\nall passed");
process.exit(fail ? 1 : 0);
