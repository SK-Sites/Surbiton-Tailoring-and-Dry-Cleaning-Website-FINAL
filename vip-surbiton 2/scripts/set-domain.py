#!/usr/bin/env python3
"""Swap the placeholder web address for the real one:  python3 scripts/set-domain.py www.yourdomain.co.uk"""
import sys, pathlib
if len(sys.argv) != 2: sys.exit("usage: python3 scripts/set-domain.py www.yourdomain.co.uk")
d = sys.argv[1].replace("https://", "").strip("/")
n = 0
for p in list(pathlib.Path("public").rglob("*")) + [pathlib.Path("scripts/make-pages.py")]:
    if p.is_file() and p.suffix in {".html", ".txt", ".xml", ".py", ".js"}:
        s = p.read_text(); t = s.replace("https://www.example.com", "https://" + d)
        if t != s: p.write_text(t); n += 1
print(f"Updated {n} files. Now set SITE_URL=https://{d} in your hosting settings.")
