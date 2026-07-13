#!/usr/bin/env python3
"""Validate the public app.imt.dev SEO and entity graph contract."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PERSON_ID = "https://app.imt.dev/consultant/#person"
METHOD_ID = "https://app.imt.dev/imt/#method"

CORE_PAGES = {
    "https://app.imt.dev/": ROOT / "index.html",
    "https://app.imt.dev/consultant/": ROOT / "consultant/index.html",
    "https://app.imt.dev/imt/": ROOT / "imt/index.html",
    "https://app.imt.dev/lp-catalog/": ROOT / "lp-catalog/index.html",
    "https://app.imt.dev/personalos/": ROOT / "personaloS/index.html",
    "https://app.imt.dev/selfdev/": ROOT / "selfdev/index.html",
    "https://app.imt.dev/comparison/": ROOT / "comparison_v2/index.html",
    "https://app.imt.dev/comparison/stoicism-imt/": ROOT / "comparison/stoicism-imt/index.html",
}

LP_PATHS = (
    "lp-self-doc",
    "lp-relearn-doc",
    "lp-science-doc",
    "lp-marn-doc",
    "lp-patterns-doc",
)


def secondary_pages() -> dict[str, Path]:
    pages = {
        f"https://app.imt.dev/{path}/": ROOT / path / "index.html"
        for path in LP_PATHS
    }
    pages.update(
        {
            f"https://app.imt.dev/{path.parent.name}/": path
            for path in sorted(ROOT.glob("case-*/index.html"))
        }
    )
    return pages


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.h1 = ""
        self.meta: dict[str, str] = {}
        self.links: dict[str, str] = {}
        self.json_ld_raw: list[str] = []
        self._capture: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        if tag == "title":
            self._capture = "title"
            self._buffer = []
        elif tag == "h1" and not self.h1:
            self._capture = "h1"
            self._buffer = []
        elif tag == "script" and values.get("type") == "application/ld+json":
            self._capture = "json_ld"
            self._buffer = []
        elif tag == "meta":
            key = values.get("name") or values.get("property")
            if key:
                self.meta[key] = values.get("content", "")
        elif tag == "link" and values.get("rel"):
            self.links[values["rel"]] = values.get("href", "")

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        expected = {"title": "title", "h1": "h1", "script": "json_ld"}.get(tag)
        if not expected or self._capture != expected:
            return
        value = re.sub(r"\s+", " ", "".join(self._buffer)).strip()
        if expected == "title":
            self.title = value
        elif expected == "h1":
            self.h1 = value
        else:
            self.json_ld_raw.append(value)
        self._capture = None
        self._buffer = []


def parse_page(path: Path) -> tuple[PageParser, str, list[dict]]:
    source = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(source)
    graphs = []
    for raw in parser.json_ld_raw:
        graphs.append(json.loads(raw))
    return parser, source, graphs


def flatten_types(value: object) -> set[str]:
    types: set[str] = set()
    if isinstance(value, dict):
        current = value.get("@type")
        if isinstance(current, str):
            types.add(current)
        elif isinstance(current, list):
            types.update(item for item in current if isinstance(item, str))
        for child in value.values():
            types.update(flatten_types(child))
    elif isinstance(value, list):
        for child in value:
            types.update(flatten_types(child))
    return types


def expected_sitemap_urls() -> set[str]:
    urls = set(CORE_PAGES)
    urls.update(f"https://app.imt.dev/{path}/" for path in LP_PATHS)
    urls.update(
        f"https://app.imt.dev/{path.parent.name}/"
        for path in sorted(ROOT.glob("case-*/index.html"))
    )
    return urls


def main() -> int:
    errors: list[str] = []

    required_meta = (
        "description",
        "robots",
        "og:title",
        "og:description",
        "og:url",
        "og:image",
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
    )

    required_types = {
        "https://app.imt.dev/": {"CollectionPage", "ItemList"},
        "https://app.imt.dev/consultant/": {"Person", "Service", "FAQPage"},
        "https://app.imt.dev/imt/": {"AboutPage"},
        "https://app.imt.dev/comparison/": {"Article"},
        "https://app.imt.dev/comparison/stoicism-imt/": {"Article"},
        "https://app.imt.dev/selfdev/": {"WebPage"},
    }

    for url, path in CORE_PAGES.items():
        try:
            page, source, graphs = parse_page(path)
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{path.relative_to(ROOT)}: cannot parse: {exc}")
            continue
        if not page.title:
            errors.append(f"{path.relative_to(ROOT)}: missing title")
        if not page.h1:
            errors.append(f"{path.relative_to(ROOT)}: missing h1")
        if page.links.get("canonical") != url:
            errors.append(f"{path.relative_to(ROOT)}: canonical must be {url}")
        if not any(key in page.links for key in ("icon", "shortcut icon")):
            errors.append(f"{path.relative_to(ROOT)}: missing favicon")
        for key in required_meta:
            if not page.meta.get(key):
                errors.append(f"{path.relative_to(ROOT)}: missing {key}")
        if page.meta.get("og:url") != url:
            errors.append(f"{path.relative_to(ROOT)}: og:url must be {url}")
        if not graphs:
            errors.append(f"{path.relative_to(ROOT)}: missing JSON-LD")
        types = flatten_types(graphs)
        for expected_type in required_types.get(url, set()):
            if expected_type not in types:
                errors.append(f"{path.relative_to(ROOT)}: missing JSON-LD type {expected_type}")
        if PERSON_ID not in source:
            errors.append(f"{path.relative_to(ROOT)}: missing shared Person @id")
        if METHOD_ID not in source:
            errors.append(f"{path.relative_to(ROOT)}: missing shared method @id")

    for url, path in secondary_pages().items():
        try:
            page, source, graphs = parse_page(path)
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{path.relative_to(ROOT)}: cannot parse: {exc}")
            continue
        if page.links.get("canonical") != url:
            errors.append(f"{path.relative_to(ROOT)}: canonical must be {url}")
        if not page.meta.get("description"):
            errors.append(f"{path.relative_to(ROOT)}: missing description")
        if page.meta.get("robots") != "index, follow":
            errors.append(f"{path.relative_to(ROOT)}: missing indexable robots meta")
        if page.meta.get("og:url") != url:
            errors.append(f"{path.relative_to(ROOT)}: og:url must be {url}")
        if not page.meta.get("og:image") or not page.meta.get("twitter:image"):
            errors.append(f"{path.relative_to(ROOT)}: missing social image metadata")
        if not graphs:
            errors.append(f"{path.relative_to(ROOT)}: missing JSON-LD")
        if PERSON_ID not in source or METHOD_ID not in source:
            errors.append(f"{path.relative_to(ROOT)}: missing shared entity IDs")

    sitemap = ET.parse(ROOT / "sitemap.xml")
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [node.text or "" for node in sitemap.findall("sm:url/sm:loc", namespace)]
    expected = expected_sitemap_urls()
    missing = sorted(expected - set(locs))
    duplicates = sorted({url for url in locs if locs.count(url) > 1})
    if missing:
        errors.append("sitemap.xml: missing URLs: " + ", ".join(missing))
    if duplicates:
        errors.append("sitemap.xml: duplicate URLs: " + ", ".join(duplicates))

    llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
    for phrase in (
        "Champion Kurt Teutsch",
        "Joel Marie Teutsch",
        "unity of spirit, mind, and body",
        "Dmitry Kompanets is a consultant",
    ):
        if phrase not in llms:
            errors.append(f"llms.txt: missing fact: {phrase}")

    if errors:
        print("SEO validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "SEO validation passed: "
        f"{len(CORE_PAGES)} core pages, {len(secondary_pages())} secondary pages, "
        f"{len(expected)} sitemap URLs"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
