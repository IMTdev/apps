#!/usr/bin/env python3
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "comparison" / "christianity-imt" / "index.html"
OG_IMAGE = ROOT / "comparison" / "christianity-imt" / "assets" / "christianity-imt-og.webp"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


require(PAGE.exists(), f"Missing page: {PAGE}")
html = PAGE.read_text(encoding="utf-8")

required_fragments = [
    "Христианство и ИДЕАЛ-метод Тойча (ИМТ)",
    'href="https://app.imt.dev/comparison/christianity-imt/"',
    'id="short"',
    'id="radar"',
    'id="common-core"',
    'id="matrix"',
    'id="scenarios"',
    'id="guidance"',
    'id="practice"',
    'id="boundaries"',
    'id="sources"',
    'application/ld+json',
    '"dateModified": "2026-07-14"',
    'const PAGE_VARIANT = "comparison_pair_christianity_imt_v1"',
    'pair_id: "christianity_imt"',
    "comparison_pair_view",
    "comparison_pair_section_visible",
    "comparison_pair_cta_click",
    "comparison_pair_engaged_45s",
    "https://www.vatican.va/",
    "https://evagriusponticus.net/",
    "https://spiritualexercises.neocities.org/",
]

for fragment in required_fragments:
    require(fragment in html, f"Missing required fragment: {fragment}")

require("cite" not in html, "Deep Research citation tokens must not reach production")
require("по данному канону" not in html.lower(), "Research-process wording must not reach production")
require("по вашему описанию" not in html.lower(), "Prompt-addressed wording must not reach production")
require(OG_IMAGE.exists(), f"Missing share image: {OG_IMAGE}")
require(OG_IMAGE.stat().st_size > 20_000, "Share image is unexpectedly small")

ids = set(re.findall(r'\bid="([^"]+)"', html))
for href in re.findall(r'href="#([^"]+)"', html):
    require(href in ids, f"Broken local anchor: #{href}")

route = "https://app.imt.dev/comparison/christianity-imt/"
for relative in ["comparison_v2/index.html", "sitemap.xml", "robots.txt", "llms.txt"]:
    discovery = (ROOT / relative).read_text(encoding="utf-8")
    route_fragment = route if relative != "robots.txt" else "/comparison/christianity-imt/"
    require(route_fragment in discovery, f"Missing discovery reference in {relative}")

print("christianity-imt validation: PASS")
