# Accessibility and speed audit (Nov. 18, 2026)

Tested on the public site, https://ethanpzuckerman.github.io/nola-assessment-navigator/, after the dashboard release.

## Lighthouse 12.6.1 (headless Chromium)

| Preset | Performance | Accessibility | Best practices | SEO | First paint | Largest paint | Blocking time | Layout shift | Page weight |
|---|---|---|---|---|---|---|---|---|---|
| Desktop | **100** | **100** | **100** | **100** | 0.5 s | 0.5 s | 0 ms | 0 | 211 KiB |
| Mobile (simulated slow 4G) | **99** | **100** | **100** | **100** | 1.5 s | 1.6 s | 0 ms | 0 | 211 KiB |

## axe-core 4.10.3 (WCAG 2.0/2.1 A and AA, plus best practices)

Run with a property open, the dashboard drawn (map, three charts, neighborhood tile), one property in the comparison,
and the disclaimer's "How to tell" panel open: **0 violations in light mode, 0 in dark mode.**

## What the first audit found, and the fixes

| Finding (first run, local server) | Fix |
|---|---|
| Performance 77 on desktop: the page downloaded ~6.5 MB on load (the parcel-ID index and a street file, to fill the example card) | The example card's numbers are written in the page and checked by `tests/example_card.js`; nothing large loads until someone searches |
| Layout shift 0.145 when web fonts swapped in | Fonts load with `display=optional` and a preloaded stylesheet, so text never reflows |
| Low contrast on gold labels (eyebrows, tags) | Light-mode gold darkened from #a5761f to #8a5f12 |
| Example card's accessible name didn't match its visible text | Removed the extra `aria-label`; the visible text names it |
| axe "region": content outside landmarks | Disclaimer is a named region; everything between header and footer is inside `<main>` |

## Chart colors

The dashboard's chart colors were checked with a palette validator (lightness band, chroma, color-vision-deficiency
separation, normal-vision separation, contrast against the surface):
light #2f6db3 / #c0841a / #7b5cc4 and dark #4f8ad6 / #b8842a / #8f72dc: all checks pass. Identity is never color
alone: every bar is labeled, and the police/fire levy uses a stripe texture.

## Not covered

- Phone layout was not redesigned (owner's choice, Nov. 18); the phone check in `tests/final_eval.js` still passes
  (no sideways scrolling).
- Screen-reader testing with a person, and usability testing with the five outside testers, are still to do; an
  automated audit can't replace them.
- The map needs the internet (Leaflet from cdnjs, OpenStreetMap tiles). Offline or where blocked, the dashboard
  shows Google Maps / OpenStreetMap links instead.
