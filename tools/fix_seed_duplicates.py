#!/usr/bin/env python3
"""Fix seed brand_objects: remove true duplicates only (same SKU imported twice)."""

from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED_DIR = ROOT / "backend/src/main/resources/seed"
REPORT_PATH = ROOT / "seed_duplicate_report.json"

RENAME_SUFFIX_PATTERNS = (
    re.compile(r" #\d+$"),
    re.compile(r" \(Series \d+\)$"),
    re.compile(r" \(1:\d+\)$"),
)


def parse_sql_value(text: str, pos: int) -> tuple[object, int]:
    segment = text[pos:].lstrip()
    offset = pos + (len(text[pos:]) - len(segment))
    if segment.startswith("'"):
        i = 1
        chars: list[str] = []
        while i < len(segment):
            c = segment[i]
            if c == "'" and i + 1 < len(segment) and segment[i + 1] == "'":
                chars.append("'")
                i += 2
            elif c == "\\" and i + 1 < len(segment):
                chars.append(segment[i + 1])
                i += 2
            elif c == "'":
                return "".join(chars), offset + i + 1
            else:
                chars.append(c)
                i += 1
        raise ValueError(f"Unterminated string at pos {pos}")
    if segment.upper().startswith("NULL"):
        return None, offset + 4
    m = re.match(r"-?\d+(?:\.\d+)?", segment)
    if not m:
        raise ValueError(f"Cannot parse value at pos {pos}: {segment[:40]!r}")
    raw = m.group(0)
    value: object = float(raw) if "." in raw else int(raw)
    return value, offset + m.end()


def parse_row_tuple(line: str) -> list[object]:
    line = line.strip().rstrip(";").rstrip(",").strip()
    if not line.startswith("(") or not line.endswith(")"):
        raise ValueError(f"Invalid row: {line[:60]!r}")
    inner = line[1:-1]
    values: list[object] = []
    pos = 0
    while pos < len(inner):
        while pos < len(inner) and inner[pos] in " \t":
            pos += 1
        if pos >= len(inner):
            break
        value, consumed = parse_sql_value(inner, pos)
        values.append(value)
        pos = consumed
        while pos < len(inner) and inner[pos] in " \t":
            pos += 1
        if pos < len(inner) and inner[pos] == ",":
            pos += 1
    return values


def image_score(url: str | None) -> tuple[int, int]:
    if not url:
        return 1000, 0
    fname = url.rsplit("/", 1)[-1]
    penalty = 0
    if re.search(r"-\d+\.(jpg|jpeg|png|webp|JPG|PNG|WEBP)", fname, re.I):
        penalty += 100
    if re.search(r"\(\d+\)", fname):
        penalty += 50
    return penalty, len(fname)


def dedupe_key(row: dict) -> tuple:
    return (
        row["name_en"],
        row["name_zh"],
        row.get("series_id"),
        row["category_id"],
        row["scale_id"],
        row["brand_id"],
    )


def pick_best_row(rows: list[dict]) -> dict:
    def sort_key(r: dict) -> tuple:
        img_penalty, img_len = image_score(r["image_url"])
        price_score = 0
        if r["release_price_usd"] is not None:
            price_score -= 2
        if r["release_price_cny"] is not None:
            price_score -= 1
        return (img_penalty, img_len, price_score)

    return min(rows, key=sort_key)


def parse_sql_text(text: str, source: str = "<text>") -> tuple[str, list[str], list[dict]]:
    lines = text.splitlines()
    if len(lines) < 2:
        raise ValueError(f"Unexpected file format: {source}")

    header = lines[1]
    m = re.search(r"\(([^)]+)\)\s*VALUES", header, re.I)
    if not m:
        raise ValueError(f"Missing INSERT header: {source}")
    columns = [c.strip() for c in m.group(1).split(",")]

    rows: list[dict] = []
    for line in lines[2:]:
        stripped = line.strip()
        if not stripped.startswith("("):
            continue
        values = parse_row_tuple(stripped)
        if len(values) != len(columns):
            raise ValueError(
                f"{source}: expected {len(columns)} values, got {len(values)} in {stripped[:80]!r}"
            )
        rows.append(dict(zip(columns, values)))
    return lines[0], columns, rows


def parse_file(path: Path) -> tuple[str, list[str], list[dict]]:
    return parse_sql_text(path.read_text(encoding="utf-8"), str(path))


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "\\'") + "'"


def format_row(row: dict, columns: list[str]) -> str:
    parts: list[str] = []
    for col in columns:
        val = row[col]
        if val is None:
            parts.append("NULL")
        elif isinstance(val, str):
            parts.append(sql_quote(val))
        elif isinstance(val, float) and val.is_integer():
            parts.append(str(int(val)))
        else:
            parts.append(str(val))
    return "(" + ", ".join(parts) + ")"


def write_file(path: Path, comment: str, columns: list[str], rows: list[dict]) -> None:
    header = "INSERT INTO brand_objects (" + ", ".join(columns) + ") VALUES"
    formatted_rows = [format_row(r, columns) for r in rows]
    content = comment + "\n" + header + "\n" + ",\n".join(formatted_rows) + ";\n"
    path.write_text(content, encoding="utf-8")


def update_comment(comment: str, count: int) -> str:
    return re.sub(r"(\d+)\s+products", f"{count} products", comment, count=1)


def strip_rename_suffixes(name: str) -> str:
    prev = None
    while prev != name:
        prev = name
        for pattern in RENAME_SUFFIX_PATTERNS:
            name = pattern.sub("", name)
    return name


def load_head_name_map(path: Path) -> dict[str, tuple[str, str]]:
    rel = path.relative_to(ROOT)
    try:
        text = subprocess.check_output(
            ["git", "show", f"HEAD:{rel}"],
            cwd=ROOT,
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        return {}

    try:
        _, _, rows = parse_sql_text(text, f"HEAD:{rel}")
    except ValueError:
        return {}

    name_map: dict[str, tuple[str, str]] = {}
    for row in rows:
        url = row.get("image_url")
        if url:
            name_map[url] = (row["name_en"], row["name_zh"])
    return name_map


def revert_row_names(row: dict, head_map: dict[str, tuple[str, str]]) -> tuple[dict, bool]:
    url = row.get("image_url")
    if url and url in head_map:
        orig_en, orig_zh = head_map[url]
        if row["name_en"] != orig_en or row["name_zh"] != orig_zh:
            return {**row, "name_en": orig_en, "name_zh": orig_zh}, True
        return row, False

    stripped_en = strip_rename_suffixes(row["name_en"])
    stripped_zh = strip_rename_suffixes(row["name_zh"])
    if stripped_en != row["name_en"] or stripped_zh != row["name_zh"]:
        return {**row, "name_en": stripped_en, "name_zh": stripped_zh}, True
    return row, False


def process_rows(rows: list[dict]) -> tuple[list[dict], dict]:
    stats = {
        "exact_deduped": 0,
        "identity_deduped": 0,
    }

    seen_exact: set[tuple] = set()
    exact_filtered: list[dict] = []
    for row in rows:
        key = (*dedupe_key(row), row["image_url"])
        if key in seen_exact:
            stats["exact_deduped"] += 1
            continue
        seen_exact.add(key)
        exact_filtered.append(row)

    by_identity: dict[tuple, list[dict]] = defaultdict(list)
    for row in exact_filtered:
        by_identity[dedupe_key(row)].append(row)

    identity_filtered: list[dict] = []
    for group in by_identity.values():
        images = {g["image_url"] for g in group}
        if len(group) > 1 and len(images) > 1:
            identity_filtered.append(pick_best_row(group))
            stats["identity_deduped"] += len(group) - 1
        else:
            identity_filtered.extend(group)

    return identity_filtered, stats


def scan_conflicts(rows: list[dict]) -> list[dict]:
    by_name: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        by_name[row["name_en"]].append(row)
    groups = []
    for name, entries in by_name.items():
        images = {e["image_url"] for e in entries}
        if len(entries) > 1 and len(images) > 1:
            groups.append(
                {
                    "name_en": name,
                    "count": len(entries),
                    "distinct_images": len(images),
                    "entries": [{"image_url": e["image_url"]} for e in entries],
                }
            )
    return groups


def main() -> None:
    all_stats: dict[str, dict] = {}
    remaining_groups: list[dict] = []
    total_reverted = 0

    for path in sorted(SEED_DIR.glob("*/brand-objects.sql")):
        brand = path.parent.name
        comment, columns, rows = parse_file(path)
        head_map = load_head_name_map(path)

        reverted_rows: list[dict] = []
        reverted = 0
        for row in rows:
            restored, changed = revert_row_names(row, head_map)
            if changed:
                reverted += 1
            reverted_rows.append(restored)

        original_count = len(reverted_rows)
        fixed_rows, stats = process_rows(reverted_rows)
        total_reverted += reverted

        if reverted or stats["exact_deduped"] or stats["identity_deduped"]:
            comment = update_comment(comment, len(fixed_rows))
            write_file(path, comment, columns, fixed_rows)

        all_stats[brand] = {
            **stats,
            "names_reverted": reverted,
            "before": original_count,
            "after": len(fixed_rows),
        }

        for group in scan_conflicts(fixed_rows):
            remaining_groups.append({"brand": brand, **group})

    report = {
        "duplicate_group_count": len(remaining_groups),
        "conflict_row_count": sum(g["count"] for g in remaining_groups),
        "note": "Same name with different images across different SKUs is allowed and not auto-renamed.",
        "fix_stats_by_brand": all_stats,
        "groups": remaining_groups,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    total_exact = sum(s["exact_deduped"] for s in all_stats.values())
    total_identity = sum(s["identity_deduped"] for s in all_stats.values())
    print(f"Names reverted: {total_reverted}")
    print(f"Exact duplicates removed: {total_exact}")
    print(f"Identity duplicates removed: {total_identity}")
    print(f"Same-name-diff-image groups (allowed): {len(remaining_groups)}")


if __name__ == "__main__":
    main()
