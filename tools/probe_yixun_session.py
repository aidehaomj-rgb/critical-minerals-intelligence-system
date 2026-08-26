"""Locate the logged-in 易迅 Admin-Token in a Chromium local-storage snapshot.

The token is never printed or persisted.  Diagnostic output is restricted to
candidate length and a short SHA-256 fingerprint so the script is safe to use
in logs.  The extraction helper is imported by the read-only API collector.
"""

from __future__ import annotations

import argparse
import hashlib
import re
from pathlib import Path


ASCII_JWT = re.compile(rb"eyJ[A-Za-z0-9_.-]{40,}")
ASCII_OPAQUE = re.compile(rb"[A-Za-z0-9_.-]{40,}")


def _decode_candidates(blob: bytes) -> list[str]:
    out: list[str] = []
    for match in ASCII_JWT.finditer(blob):
        out.append(match.group().decode("ascii", "ignore"))
    # Chromium may store DOM-string values as UTF-16LE.
    for start in (0, 1):
        try:
            text = blob[start:].decode("utf-16le", "ignore")
        except UnicodeDecodeError:
            continue
        out.extend(m.group(0) for m in re.finditer(r"eyJ[A-Za-z0-9_.-]{40,}", text))
    return out


def find_yixun_tokens(leveldb_dir: Path) -> list[tuple[str, str]]:
    """Return unique ``(token, source_file)`` candidates, newest file first."""

    files = sorted(
        (p for p in leveldb_dir.iterdir() if p.suffix.lower() in {".log", ".ldb"}),
        key=lambda p: (p.stat().st_mtime_ns, p.name),
        reverse=True,
    )
    found: list[tuple[str, str]] = []
    seen: set[str] = set()
    for path in files:
        blob = path.read_bytes()
        for marker in (b"Admin-Token", "Admin-Token".encode("utf-16le")):
            cursor = 0
            while True:
                pos = blob.find(marker, cursor)
                if pos < 0:
                    break
                window = blob[max(0, pos - 64) : min(len(blob), pos + len(marker) + 2048)]
                for token in _decode_candidates(window):
                    if token not in seen:
                        seen.add(token)
                        found.append((token, path.name))
                cursor = pos + len(marker)
    return found


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("leveldb_dir", type=Path)
    args = parser.parse_args()
    candidates = find_yixun_tokens(args.leveldb_dir)
    print(f"candidates={len(candidates)}")
    for token, source in candidates:
        fp = hashlib.sha256(token.encode()).hexdigest()[:12]
        print(f"source={source} length={len(token)} sha256={fp}")
    return 0 if candidates else 2


if __name__ == "__main__":
    raise SystemExit(main())
