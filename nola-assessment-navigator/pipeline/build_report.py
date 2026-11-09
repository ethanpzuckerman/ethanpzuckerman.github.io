"""Build the Part 2 submission PDF from docs/week2-report.md, with the full data dictionary and the
address-matching results as appendices so the PDF stands on its own.

Run from nola-assessment-navigator/:  python3 pipeline/build_report.py && node pipeline/report_pdf.js
Writes docs/report.html (intermediate) and docs/NOLA Assessment Navigator - Part 2.pdf. Needs: pip install markdown.
"""
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
REPO = "https://github.com/ethanpzuckerman/ethanpzuckerman.github.io/tree/claude/elegant-brahmagupta-747i4y/nola-assessment-navigator"


def tidy(md):
    """python-markdown needs a blank line before a list and 4-space nesting; bare URLs become links."""
    out, lines = [], md.split("\n")
    for i, line in enumerate(lines):
        prev = lines[i - 1] if i else ""
        if re.match(r"^- ", line) and prev.strip() and not re.match(r"^\s*- ", prev):
            out.append("")
        line = re.sub(r"^  - ", "    - ", line)
        if re.match(r"^  \S", line) and re.match(r"^\s*- ", prev):
            line = "  " + line
        out.append(line)
        # End the paragraph after a chart so its caption and image stay together but the text can flow.
        if re.match(r"^!\[", line):
            out.append("")
    md = "\n".join(out)
    return re.sub(r"(?<![(<`\[])(https://[^\s)|`]+?)(?=[.,]?(\s|$))", r"<\1>", md)


def section(path, title, drop_title=True):
    md = (DOCS / path).read_text()
    if drop_title:
        md = re.sub(r"^# .*\n", "", md, count=1)
    return f"\n\n<div class=\"appendix\"></div>\n\n# {title}\n\n" + md


def main():
    md = (DOCS / "week2-report.md").read_text()
    md = md.replace("**Code:**", f"**Code and full docs:** {REPO}  \n**Code:**", 1)
    md += section("data-dictionary.md", "Appendix A. Data dictionary (all 115 fields)")
    md += section("address-matching-results.md", "Appendix B. Address-matching test results")
    # Appendix C: the chatbot's actual answers to the 10 test questions, two per row.
    import json
    tests = json.loads((ROOT / "tests/chatbot_eval_results.json").read_text())
    cells = "".join(
        f'<figure><img src="file://{ROOT / t["shot"]}" alt="Test {t["n"]}"><figcaption><b>Test {t["n"]}.</b> '
        f'{t["q"]}{" (" + t["prop"] + ")" if t["prop"] else " (address search)"}</figcaption></figure>' for t in tests)
    md += ('\n\n<div class="appendix"></div>\n\n# Appendix C. The chatbot\'s answers to the 10 test questions\n\n'
           'Screenshots from `node tests/chatbot_eval.js`, run against the same page as the live link. Each answer labels what '
           'is recorded in the roll, what the Navigator calculated, and the general explanation, with sources.\n\n'
           f'<div class="shots">{cells}</div>\n')
    body = markdown.markdown(tidy(md), extensions=["tables"])
    body = body.replace('<div class="appendix"></div>', '<div class="pagebreak"></div>')
    # Column widths for the two appendix tables, found by their header text.
    body = body.replace("<table>\n<thead>\n<tr>\n<th>Field</th>", '<table class="dict">\n<thead>\n<tr>\n<th>Field</th>', 1)
    body = body.replace("<table>\n<thead>\n<tr>\n<th>#</th>\n<th>Property</th>", '<table class="tests">\n<thead>\n<tr>\n<th>#</th>\n<th>Property</th>', 1)
    body = body.replace("<table>\n<thead>\n<tr>\n<th>#</th>\n<th>What the owner typed</th>", '<table class="addr">\n<thead>\n<tr>\n<th>#</th>\n<th>What the owner typed</th>', 1)
    body = re.sub(r'src="eda/', f'src="file://{DOCS}/eda/', body)
    css = """
@page { size: Letter; margin: 0.6in 0.6in 0.7in; }
body { font-family: Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1e1c1a; }
h1 { font-size: 19pt; margin: 0 0 6px; color: #0d1b2a; }
h2 { font-size: 14pt; margin: 22px 0 6px; color: #0d1b2a; border-bottom: 1px solid #ccc8c0; padding-bottom: 3px; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14px 0 4px; break-after: avoid; }
p { margin: 0 0 7px; }
img { width: 100%; max-width: 6.2in; display: block; margin: 6px auto 4px; break-inside: avoid; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; margin: 6px 0 10px; }
th, td { border: 1px solid #ddd8cf; padding: 4px 6px; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
th { background: #f4ead6; }
tr { break-inside: avoid; }
code { font-size: 8.8pt; background: #f0eeea; padding: 0 3px; border-radius: 3px; overflow-wrap: anywhere; }
a { color: #1f4f86; overflow-wrap: anywhere; }
ul { margin: 0 0 8px 0; padding-left: 20px; } li { margin-bottom: 2px; }
hr { border: 0; border-top: 1px solid #ccc8c0; margin: 12px 0; }
blockquote { margin: 6px 0; padding: 4px 10px; border-left: 3px solid #ccc8c0; color: #3d3a36; }
.byline { color: #5d5a55; font-size: 9.5pt; margin-bottom: 10px; }
.pagebreak { break-before: page; }
.pagebreak + h1 { font-size: 15pt; }
p:has(img) { break-inside: avoid; }
.shots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; align-items: start; }
.shots figure { margin: 0; break-inside: avoid; }
.shots img { width: 100%; max-width: none; border: 1px solid #ddd8cf; margin: 0 0 3px; }
.shots figcaption { font-size: 8.5pt; color: #3d3a36; }
.pagebreak ~ table { font-size: 7.6pt; table-layout: fixed; }
table.dict th:nth-child(1) { width: 15%; } table.dict th:nth-child(2) { width: 9%; } table.dict th:nth-child(3) { width: 6%; }
table.dict th:nth-child(4) { width: 7%; } table.dict th:nth-child(5) { width: 21%; } table.dict th:nth-child(6) { width: 42%; }
table.addr th:nth-child(1) { width: 4%; } table.addr th:nth-child(2) { width: 24%; } table.addr th:nth-child(3) { width: 18%; }
table.addr th:nth-child(4), table.addr th:nth-child(5) { width: 9%; } table.addr th:nth-child(6) { width: 7%; }
table.addr th:nth-child(7) { width: 23%; } table.addr th:nth-child(8) { width: 6%; }
table.tests { table-layout: fixed; }
table.tests th:nth-child(1) { width: 4%; } table.tests th:nth-child(2) { width: 15%; } table.tests th:nth-child(3) { width: 16%; }
table.tests th:nth-child(4) { width: 27%; } table.tests th:nth-child(5) { width: 38%; }
"""
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>NOLA Assessment Navigator, Part 2</title>
<style>{css}</style></head><body>
<p class="byline">Ethan Zuckerman · AI and Real Estate · Final Project Part 2: Data Exploration, Property Lookup, and Chatbot</p>
{body}</body></html>"""
    (DOCS / "report.html").write_text(html)
    print(f"wrote {DOCS / 'report.html'}")


if __name__ == "__main__":
    main()
