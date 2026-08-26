"""Read-only 易迅 ``searchGlobal`` page collector using an existing browser login.

The script discovers the active Admin-Token from a Chromium local-storage
snapshot, sends only GET requests, never downloads through 易迅's download
center, and never prints or persists the token.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from probe_yixun_session import find_yixun_tokens


BASE = "https://dd.data1688.com/stage-api/es/search/searchGlobal"


def build_url(
    goods_desc: str,
    start: str,
    end: str,
    page_no: int,
    page_size: int,
    hs_code: str = "",
    destination: str = "",
    origin: str = "",
) -> str:
    params = [
        ("preciseMatching[0]", "1"),
        ("datatype", "2"),
        ("date[0]", start),
        ("date[1]", end),
        ("dataSource", "全球"),
        ("isInputPrecise", "false"),
        ("destState[0]", "全部"),
        ("relationFlag", "0"),
        ("csRelationFlag", "0"),
        ("matchingMethod", "1"),
        ("pageNo", str(page_no)),
        ("pageSize", str(page_size)),
        ("tabName", "数据列表"),
        ("isExportFlag", "false"),
        ("sort", "DATE"),
        ("order", "desc"),
    ]
    if goods_desc:
        params.insert(1, ("GOODS_DESC", goods_desc))
    if hs_code:
        params.insert(1, ("HS_CODE", hs_code))
    if destination:
        params.insert(1, ("DEST_COUNTRY_TC", destination))
    if origin:
        params.insert(1, ("ORIGIN_COUNTRY_TC", origin))
    return BASE + "?" + urllib.parse.urlencode(params)


def get_json(url: str, token: str, timeout: int = 120, attempts: int = 6) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": "Bearer " + token,
            "lang": "zh-cn",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://dd.data1688.com/custom/search",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36",
        },
        method="GET",
    )
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, ConnectionError, TimeoutError) as exc:
            last_error = exc
            if attempt == attempts:
                break
            time.sleep(min(8.0, 0.8 * (2 ** (attempt - 1))))
    assert last_error is not None
    raise last_error


def choose_working_token(leveldb_dir: Path, probe_url: str) -> tuple[str, str]:
    candidates = find_yixun_tokens(leveldb_dir)
    errors: list[str] = []
    for token, source in candidates:
        try:
            payload = get_json(probe_url, token)
            if payload.get("code") == 200 and isinstance(payload.get("data"), dict):
                return token, source
            errors.append(f"{source}:code={payload.get('code')}")
        except Exception as exc:  # diagnostic contains no token
            errors.append(f"{source}:{type(exc).__name__}")
    raise RuntimeError("No working 易迅 token; " + "; ".join(errors))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--leveldb", type=Path, required=True)
    parser.add_argument("--goods-desc", default="")
    parser.add_argument("--hs-code", default="")
    parser.add_argument("--destination", default="")
    parser.add_argument("--origin", default="")
    parser.add_argument("--start", default="2025-08-14")
    parser.add_argument("--end", default="2026-08-14")
    parser.add_argument("--page-size", type=int, default=200)
    parser.add_argument("--max-pages", type=int, default=0)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if not (args.goods_desc or args.hs_code):
        parser.error("at least one of --goods-desc or --hs-code is required")
    probe = build_url(
        args.goods_desc, args.start, args.end, 1, args.page_size,
        args.hs_code, args.destination, args.origin,
    )
    token, token_source = choose_working_token(args.leveldb, probe)
    first = get_json(probe, token)
    data = first.get("data") or {}
    rows = data.get("param") or []
    total = int(data.get("totalRow") or 0)
    total_pages = max(1, math.ceil(total / args.page_size))
    pages_to_fetch = min(total_pages, args.max_pages) if args.max_pages else total_pages
    pages = [{"page": 1, "rows": rows}]
    print(f"auth=ok source={token_source} total={total} pages={total_pages} first_rows={len(rows)}")

    def write_checkpoint() -> None:
        result = {
            "query_id": "YIXUN-API-READONLY",
            "query": {
                "goods_desc": args.goods_desc,
                "hs_code": args.hs_code,
                "destination": args.destination,
                "origin": args.origin,
                "date": [args.start, args.end],
                "page_size": args.page_size,
                "total": total,
                "total_pages": total_pages,
                "fetched_pages": len(pages),
            },
            "pages": pages,
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    write_checkpoint()
    for page in range(2, pages_to_fetch + 1):
        payload = get_json(build_url(
            args.goods_desc, args.start, args.end, page, args.page_size,
            args.hs_code, args.destination, args.origin,
        ), token)
        if payload.get("code") != 200:
            raise RuntimeError(f"page {page} code={payload.get('code')}")
        page_rows = (payload.get("data") or {}).get("param") or []
        pages.append({"page": page, "rows": page_rows})
        write_checkpoint()
        print(f"page={page}/{pages_to_fetch} rows={len(page_rows)}")
        time.sleep(0.75)

    write_checkpoint()
    unique_keys = sorted({key for row in rows for key in row})
    print("row_keys=" + ",".join(unique_keys))
    print(f"output={args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
