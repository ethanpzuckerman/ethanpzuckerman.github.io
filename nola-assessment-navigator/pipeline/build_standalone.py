"""Build a single-file copy of the Navigator that opens by double-click, with no server.

Run from nola-assessment-navigator/ after pipeline/shard.js:  python3 pipeline/build_standalone.py
Every file in data/web/2026 is gzipped and embedded as base64; the page decompresses only the
street file it needs (DecompressionStream, supported in current Chrome, Edge, Safari and Firefox).
Writes "NOLA Assessment Navigator.html" to the path given, or to docs/ by default (git-ignored: ~20 MB).
"""
import base64
import gzip
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER = """<script>
window.NOLA_LOAD = async function (name) {
  const b64 = (window.NOLA_DATA || {})[name];
  if (!b64) throw new Error("not embedded: " + name);
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
};
</script>"""


def main(out):
    data = {f.name: base64.b64encode(gzip.compress(f.read_bytes(), 9)).decode()
            for f in sorted((ROOT / "data/web/2026").iterdir()) if f.suffix == ".json"}
    html = (ROOT / "index.html").read_text()
    html = html.replace('<link rel="stylesheet" href="style.css" />', "<style>\n" + (ROOT / "style.css").read_text() + "\n</style>")
    html = re.sub(r'<link rel="icon"[^>]*>\n?', "", html)
    scripts = "".join(f"<script>\n{(ROOT / js).read_text()}\n</script>\n" for js in ["kb.js", "address.js", "lookup.js", "property.js", "app.js"])
    blob = "<script>window.NOLA_DATA = " + json.dumps(data, separators=(",", ":")) + ";</script>\n"
    # A function replacement, so backslashes in the JavaScript aren't read as regex escapes.
    html = re.sub(r'\s*<script src="kb.js"></script>.*<script src="app.js"></script>',
                  lambda m: "\n" + blob + LOADER + "\n" + scripts, html, flags=re.S)
    out.write_text(html)
    print(f"wrote {out} ({out.stat().st_size / 1e6:.1f} MB, {len(data)} data files embedded)")


if __name__ == "__main__":
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "docs/NOLA Assessment Navigator.html")
