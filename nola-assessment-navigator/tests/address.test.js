// Unit tests for address.js. Run: node tests/address.test.js
// The records below are made-up test fixtures for the matcher, not roll data.
const A = require("../address.js");
let fail = 0;
function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log("FAIL", label, "\n  got ", got, "\n  want", want); } else console.log("ok  ", label);
}

// parse(): spelling, abbreviation and formatting variants
const k = s => A.fullKey(A.parse(s));
eq("suffix spelled out", k("1234 Magazine Street"), "1234 MAGAZINE ST");
eq("punctuation + city/zip", k("1234 Magazine St., New Orleans, LA 70130"), "1234 MAGAZINE ST");
eq("Saint vs St.", k("6000 Saint Charles Avenue"), k("6000 St. Charles Ave"));
eq("direction spelled out", k("300 North Rampart St"), "300 N RAMPART ST");
eq("unit with #", k("1000 Magazine St #3B"), "1000 MAGAZINE ST UNIT 3B");
eq("unit with Apt", k("1000 Magazine St Apt 3B"), "1000 MAGAZINE ST UNIT 3B");
eq("MLK variants", k("2000 MLK Blvd"), k("2000 Martin Luther King Jr. Boulevard"));
eq("O.C. Haley", k("1800 O. C. Haley Blvd"), "1800 ORETHA CASTLE HALEY BLVD");
eq("General abbreviation", k("400 Gen Taylor St"), "400 GENERAL TAYLOR ST");
eq("ordinal word", k("1200 Third Street"), "1200 3RD ST");
eq("half address", k("1234 1/2 Magazine St"), "1234 1/2 MAGAZINE ST");
eq("lowercase + extra spaces", k("  1234   magazine   st "), "1234 MAGAZINE ST");
eq("zip captured", A.parse("1234 Magazine St 70130").zip, "70130");
eq("range parsed", [A.parse("1234-36 Magazine St").number, A.parse("1234-36 Magazine St").numberHigh], ["1234", "1236"]);

// match(): fixtures
const idx = A.buildIndex([
  { id: "T1", address: "1234 MAGAZINE ST" },
  { id: "T2", address: "1000 MAGAZINE ST UNIT 1A" },
  { id: "T3", address: "1000 MAGAZINE ST UNIT 3B" },
  { id: "T4", address: "1234-36 TCHOUPITOULAS ST" },
  { id: "T5", address: "300 N RAMPART ST" },
  { id: "T6", address: "300 S RAMPART ST" },
  { id: "T7", address: "6000 ST CHARLES AVE" }
]);
const m = s => { const r = A.match(idx, s); return [r.status, r.candidates.map(c => c.record.id)]; };
eq("exact", m("1234 Magazine Street"), ["exact", ["T1"]]);
eq("condo building → multiple", m("1000 Magazine St"), ["multiple", ["T2", "T3"]]);
eq("condo with unit → exact", m("1000 Magazine St Apt 3B"), ["exact", ["T3"]]);
eq("inside a number range", m("1236 Tchoupitoulas St"), ["exact", ["T4"]]);
eq("typo in street", m("1234 Tchoupitoulis St"), ["close", ["T4"]]);
eq("direction picks one", m("300 North Rampart"), ["exact", ["T5"]]);
eq("no direction → multiple", m("300 Rampart St"), ["multiple", ["T5", "T6"]]);
eq("Saint spelled out", m("6000 Saint Charles Avenue"), ["exact", ["T7"]]);
eq("number not on street", m("9999 Magazine St"), ["not_found", []]);
eq("unknown street", m("12 Nowhere Ln"), ["not_found", []]);
eq("no house number", m("Magazine St"), ["not_found", []]);
console.log(fail ? `\n${fail} failed` : "\nall passed");
process.exit(fail ? 1 : 0);
