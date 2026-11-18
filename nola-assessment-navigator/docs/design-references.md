# Design references for the site layout (Nov. 18, 2026; dashboard added the same day)

The layout borrows proven patterns from well-regarded public-service design systems, award-winning government sites
and leading property sites. Each pattern below names its source and what was adapted. Nothing was copied: no logos,
code, artwork or wording, and the site never presents itself as official.

| Pattern on our site | Reference | What we took from it |
|---|---|---|
| Disclosure banner with a "How to tell" panel | U.S. Web Design System (USWDS) Banner: https://designsystem.digital.gov/components/banner/ · standard: https://standards.digital.gov/standards/banner/ | A thin top bar with an expandable "how you know" panel. **Inverted on purpose:** ours says the site is *not* official and points to the official sites. No flag or .gov styling. |
| Three numbered steps in the hero (Search → Confirm → Ask) | USWDS Process list: https://designsystem.digital.gov/components/process-list | Short, numbered steps with a bold verb, so a first-time visitor knows what to do. |
| Search-first hero ("Find your property") | GOV.UK "Start using a service": https://design-system.service.gov.uk/patterns/start-using-a-service | Start with the one task most people came for, in plain language, with the action right there. |
| Property facts as label/value rows (Parcel ID, type, district, valuation date) | GOV.UK Summary list: https://design-system.service.gov.uk/components/summary-list/ | Key-value pairs in a description list (`<dl>`), not a table. |
| "Tax history" table with year-over-year change | Redfin public records / tax history on listing pages: https://support.redfin.com/hc/en-us/articles/360001454531-Public-Records | One row per year (roll), assessed value and tax, with the % change; source and lag caveat shown under it. |
| Chat header that states scope and limits, and a "Talk to a person" button | Nielsen Norman Group research on site chatbots (transparency, scannable answers, willingness to hand off): https://www.nngroup.com/articles/author/georgia-kenderova/ | Say up front what the bot does and doesn't do; make reaching a human one click away. |
| Example property card beside the hero | Product sites that show the real product above the fold | A real record from the roll (1205 St. Charles #607), clickable, with its tax check shown. |
| Property dashboard: map with the parcel and nearby homes | Property detail pages on Zillow and Redfin put the home on a map with nearby homes; built with Leaflet (https://leafletjs.com) on OpenStreetMap tiles (https://www.openstreetmap.org/copyright) | Parcel, recommended similar parcels and nearby parcels as markers; click to compare. |
| Tax history chart and ZIP trend chart | Zillow's value-history chart on home detail pages: https://www.zillow.com/zestimate/ · Redfin tax history (above) | Year-over-year bars for tax; a monthly line for the ZIP's typical value with the valuation date marked; tooltips on hover. |
| "Similar properties nearby" recommendations | Zillow detail pages' "Nearby Similar Sales" / "Similar Homes" sections; comps explained at https://www.zillow.com/sellers-guide/what-are-comps/ | Automatic suggestions of comparable homes (same type, similar value, nearby), with the rule shown and "not an appraisal". |
| Compare side by side (up to 4) | Zillow "Homes to Compare" tool: https://zillow.mediaroom.com/2022-03-03-Zillows-new-side-by-side-comparison-tool-helps-home-shoppers-make-faster,-smarter-decisions-to-find-a-home-they-love | One table with a column per home and a row per detail; ours compares roll records (value, homestead, tax) and marks the lowest tax. |
| Chart colors and marks | The dataviz method used for this project (validated palette: color-vision separation, lightness band, contrast in light and dark) | Thin marks, labeled values, no color-only identity (stripe texture for police/fire), recessive grid, keyboard-reachable tooltips. |
| Footer with organized link columns and a bottom bar | 2025 Webby winners in Government & Associations, e.g. NASA.gov: https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/government-associations · CDC.gov: https://winners.webbyawards.com/2025/websites-and-mobile-sites/general-desktop-mobile-sites/government-associations/321463/the-new-cdcgov | Grouped links (offices, navigation, help) and a bottom line with status and date. |

Kept from the earlier design: navy/gold palette, light and dark themes, the "Your property" panel, key dates, the
recorded / calculated / explanation labels, and every chat feature.
