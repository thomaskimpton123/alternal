#!/bin/bash
# Pre-deploy checks for index.html. Run this before every push.
# Added 2026-08-26 after three same-day regressions (all "use variable before
# declaration" bugs that silently killed the whole script) — this catches that
# exact class of bug in seconds instead of a live back-and-forth debug session.
set -e
cd "$(dirname "$0")"

echo "1/4 Extracting inline script..."
python3 - <<'PYEOF'
import re
html = open('index.html').read()
scripts = re.findall(r'<script(?:\s+src="[^"]*")?>(.*?)</script>', html, re.S)
inline = [s for s in scripts if s.strip()]
if not inline:
    raise SystemExit("No inline <script> block found in index.html")
open('/tmp/alternal_check.js', 'w').write(inline[0])
PYEOF

echo "2/4 Syntax check..."
node --check /tmp/alternal_check.js && echo "   OK"

echo "3/4 Execution test (stubbed DOM — catches TDZ/use-before-declare bugs)..."
node -e "
require('./dom_stub.js');
try {
  const fs = require('fs');
  const code = fs.readFileSync('/tmp/alternal_check.js','utf8');
  new Function(code)();
  console.log('   OK — script ran top-to-bottom without throwing');
} catch(e) {
  console.log('   FAILED:', e.message);
  console.log(e.stack.split('\n').slice(0,6).join('\n'));
  process.exit(1);
}
"

echo "4/4 Duplicate IDs / dangling getElementById refs..."
# Uses Python re, not grep -P — grep implementations differ across machines/PATHs
# (this bit us once already: works interactively, fails when run as a script).
python3 - <<'PYEOF'
import re, sys
html = open('index.html').read()
ids = re.findall(r'id="([^"]*)"', html)
dupes = sorted({i for i in ids if ids.count(i) > 1})
if dupes:
    print(f"   FAILED — duplicate ids: {dupes}")
    sys.exit(1)
declared = set(ids)
used = set(re.findall(r"getElementById\('([^']+)'\)", html))
missing = sorted(used - declared)
if missing:
    print(f"   FAILED — missing elements for ids: {missing}")
    sys.exit(1)
print("   OK — no duplicates, no dangling refs")
PYEOF

echo ""
echo "All checks passed."
