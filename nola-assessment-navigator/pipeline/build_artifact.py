"""Build the page published as the live Claude artifact (CLAUDE.md §7).

Run from nola-assessment-navigator/:
  python3 pipeline/build_artifact.py <out.html>
Inlines style.css and the six scripts into index.html's body. The data files are NOT inlined: they're published
next to the page at the same relative paths (data/web/2026/...), so app.js fetches them as it does on any server.
Publish with capabilities {"sample": {}} so the page can ask Claude for the AI explanation (ai.js).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ["kb.js", "address.js", "lookup.js", "property.js", "ai.js", "app.js"]


def main(out):
    html = (ROOT / "index.html").read_text()
    body = re.search(r"<body>(.*?)\s*<script src=\"kb.js\">", html, re.S).group(1)
    title = re.search(r"<title>(.*?)</title>", html).group(1)
    fonts = re.search(r'<link href="https://fonts.googleapis.com[^>]+>', html).group(0)
    css = (ROOT / "style.css").read_text()
    js = "".join(f"<script>\n{(ROOT / s).read_text()}\n</script>\n" for s in SCRIPTS)
    page = (f"<title>{title}</title>\n<meta name=\"claude:viewport-fit-sides\" content=\"cover\">\n{fonts}\n"
            f"<style>\n{css}\n</style>\n{body.strip()}\n{js}")
    Path(out).write_text(page)
    print(f"wrote {out} ({len(page) / 1e3:.0f} KB)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
