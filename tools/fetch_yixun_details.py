"""Fetch selected 易迅 shipment details with the active browser login (GET only)."""

from __future__ import annotations

import argparse
import json
import urllib.parse
from pathlib import Path

from fetch_yixun_api_pages import choose_working_token, get_json, build_url


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--leveldb", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("specs", nargs="+", help="SOURCE|EXP_IMP|ID")
    args = parser.parse_args()
    probe = build_url("METHYL ISOBUTYL KETONE", "2025-08-14", "2026-08-14", 1, 20)
    token, source_file = choose_working_token(args.leveldb, probe)
    results = []
    for spec in args.specs:
        source, exp_imp, record_id = spec.split("|", 2)
        datatype = "0" if exp_imp == "进口" else "1" if exp_imp == "出口" else "2"
        params = urllib.parse.urlencode({"dataSource": source, "id": record_id, "datatype": datatype})
        url = "https://dd.data1688.com/stage-api/es/search/searchDetails?" + params
        payload = get_json(url, token)
        results.append({"source": source, "exp_imp": exp_imp, "id": record_id, "datatype": datatype, "payload": payload})
        print(f"id={record_id} code={payload.get('code')} fields={len(payload.get('data') or {})}")
    args.output.write_text(json.dumps({"token_source": source_file, "records": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"output={args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
