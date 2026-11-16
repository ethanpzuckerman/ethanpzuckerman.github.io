"""Build the Part 2 submission PDF from docs/week2-report.md, with the full data dictionary and the
address-matching results as appendices so the PDF stands on its own.

Run from nola-assessment-navigator/:  python3 pipeline/build_report.py && node pipeline/report_pdf.js
Writes intermediate HTML to docs/build/ and these PDFs to docs/:
  NOLA Assessment Navigator - Part 2.pdf   (report + Appendix A dictionary, B address results, C complete test log)
  Attachment 1 - EDA Charts.pdf, Attachment 2 - Data Dictionary.pdf,
  Attachment 3 - Address-Match Results.pdf, Attachment 4 - Chatbot Test Log.pdf
Needs: pip install markdown. Run tests/chatbot_eval.js and tests/test_log.js first so the test log is current.
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


def render(md):
    """Markdown → HTML body with file:// image paths and the table classes the CSS expects."""
    body = markdown.markdown(tidy(md), extensions=["tables"])
    body = body.replace('<div class="appendix"></div>', '<div class="pagebreak"></div>')
    # Column widths for the appendix tables, found by their header text.
    body = body.replace("<table>\n<thead>\n<tr>\n<th>Field</th>", '<table class="dict">\n<thead>\n<tr>\n<th>Field</th>', 1)
    body = body.replace("<table>\n<thead>\n<tr>\n<th>#</th>\n<th>Property</th>", '<table class="tests">\n<thead>\n<tr>\n<th>#</th>\n<th>Property</th>', 1)
    body = body.replace("<table>\n<thead>\n<tr>\n<th>#</th>\n<th>What the owner typed</th>", '<table class="addr">\n<thead>\n<tr>\n<th>#</th>\n<th>What the owner typed</th>', 1)
    body = re.sub(r'src="eda/', f'src="file://{DOCS}/eda/', body)
    body = re.sub(r'src="screenshots/', f'src="file://{DOCS}/screenshots/', body)
    return body


def test_log():
    """docs/chatbot-test-log.md (from tests/test_log.js): every test question with the complete answer."""
    md = (DOCS / "chatbot-test-log.md").read_text()
    # A blank quoted line separates paragraphs; keep single line breaks inside an answer (tables, source lists).
    md = re.sub(r"^(> .+)$", r"\1  ", md, flags=re.M)
    return re.sub(r"^!\[(Screenshot[^\]]*)\]", r'<div class="shotwrap"></div>\n\n![\1]', md, flags=re.M)


def main():
    week2 = (DOCS / "week2-report.md").read_text()
    charts = "# EDA charts: 2026 Orleans Parish roll\n\n" + week2[week2.index("## 1. Exploratory data analysis"):week2.index("## 2. Data dictionary")]
    report = week2.replace("**Code:**", f"**Code and full docs:** {REPO}  \n**Code:**", 1)
    report = report.replace("Screenshots of every answer are in **Appendix C**.", "Every complete answer, word for word, with screenshots, is in **Appendix C**.")
    report += section("data-dictionary.md", "Appendix A. Data dictionary (all 115 fields)")
    report += section("address-matching-results.md", "Appendix B. Address-matching test results")
    report += "\n\n<div class=\"appendix\"></div>\n\n# Appendix C. Chatbot test log: complete answers\n\n" + re.sub(r"^# .*\n", "", test_log(), count=1)
    by2 = "Ethan Zuckerman · AI and Real Estate · Final Project Part 2: Data Exploration, Property Lookup, and Chatbot"
    by = "Ethan Zuckerman · AI and Real Estate · NOLA Assessment Navigator"
    # (intermediate html, markdown, byline). pipeline/report_pdf.js prints each one to a PDF of the same name.
    docs = [
        ("NOLA Assessment Navigator - Part 2", report, by2),
        ("Attachment 1 - EDA Charts", charts, by),
        ("Attachment 2 - Data Dictionary", (DOCS / "data-dictionary.md").read_text(), by),
        ("Attachment 3 - Address-Match Results", (DOCS / "address-matching-results.md").read_text(), by),
        ("Attachment 4 - Chatbot Test Log", test_log(), by),
    ]
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
.pagebreak ~ table, table.dict, table.addr { font-size: 7.6pt; table-layout: fixed; }
img[alt^="Screenshot"] { width: auto; max-width: 5.6in; max-height: 8.4in; border: 1px solid #ddd8cf; }
.shotwrap { break-before: page; }
blockquote { font-size: 9.3pt; }
blockquote p { margin: 0 0 6px; }
table.dict th:nth-child(1) { width: 15%; } table.dict th:nth-child(2) { width: 9%; } table.dict th:nth-child(3) { width: 6%; }
table.dict th:nth-child(4) { width: 7%; } table.dict th:nth-child(5) { width: 21%; } table.dict th:nth-child(6) { width: 42%; }
table.addr th:nth-child(1) { width: 4%; } table.addr th:nth-child(2) { width: 24%; } table.addr th:nth-child(3) { width: 18%; }
table.addr th:nth-child(4), table.addr th:nth-child(5) { width: 9%; } table.addr th:nth-child(6) { width: 7%; }
table.addr th:nth-child(7) { width: 23%; } table.addr th:nth-child(8) { width: 6%; }
table.tests { table-layout: fixed; }
table.tests th:nth-child(1) { width: 4%; } table.tests th:nth-child(2) { width: 15%; } table.tests th:nth-child(3) { width: 16%; }
table.tests th:nth-child(4) { width: 27%; } table.tests th:nth-child(5) { width: 38%; }
"""
    out = DOCS / "build"
    out.mkdir(exist_ok=True)
    for name, md, byline in docs:
        html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>{name}</title>
<style>{css}</style></head><body>
<p class="byline">{byline}</p>
{render(md)}</body></html>"""
        (out / f"{name}.html").write_text(html)
        print(f"wrote {out / (name + '.html')}")


if __name__ == "__main__":
    main()
