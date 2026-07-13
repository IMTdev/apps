#!/usr/bin/env python3
"""Add canonical metadata and shared entities to case and Learning Path pages."""

from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATE_MODIFIED = "2026-07-13"
PERSON_ID = "https://app.imt.dev/consultant/#person"
METHOD_ID = "https://app.imt.dev/imt/#method"
SOCIAL_IMAGE = "https://app.imt.dev/comparison/assets/comparison-og.webp"
MARKER = "<!-- seo-entity-graph:v1 -->"

LP_DESCRIPTIONS = {
    "lp-self-doc": "Learning Path «Концепция себя» по ИДЕАЛ-методу Тойча (ИМТ): целостное понимание себя, способностей, предназначения и направления развития.",
    "lp-relearn-doc": "Learning Path «Переобучение» по ИДЕАЛ-методу Тойча (ИМТ): от повторяющегося результата и управляющего понимания к новой практике действий.",
    "lp-science-doc": "Learning Path «Научный трек и концепция жизни» по ИДЕАЛ-методу Тойча (ИМТ): системная картина человека, законов и развития сознания.",
    "lp-marn-doc": "Learning Path «Формула сознания» по ИДЕАЛ-методу Тойча (ИМТ): восприятие, понимание, выбор, действие и закономерный жизненный результат.",
    "lp-patterns-doc": "Learning Path «Паттерны» по ИДЕАЛ-методу Тойча (ИМТ): распознавание устойчивых сценариев и переход к воспроизводимому новому действию.",
}


def json_ld(url: str, title: str, description: str, page_type: str) -> str:
    payload = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": page_type,
                "@id": f"{url}#webpage",
                "url": url,
                "name": title,
                "description": description,
                "inLanguage": "ru",
                "dateModified": DATE_MODIFIED,
                "isPartOf": {"@id": "https://app.imt.dev/#website"},
                "author": {"@id": PERSON_ID},
                "about": {"@id": METHOD_ID},
                "mainEntityOfPage": url,
            },
            {
                "@type": "Person",
                "@id": PERSON_ID,
                "name": "Дмитрий Компанец",
                "alternateName": "Dmitry Kompanets",
                "url": "https://app.imt.dev/consultant/",
            },
            {
                "@type": "CreativeWork",
                "@id": METHOD_ID,
                "name": "ИДЕАЛ-метод Тойча (ИМТ)",
                "alternateName": ["IDEAL Method Teutsch", "ИМТ"],
                "url": "https://app.imt.dev/imt/",
            },
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def seo_block(
    url: str,
    title: str,
    description: str,
    page_type: str,
    include_description: bool,
) -> str:
    lines = [MARKER]
    if include_description:
        lines.append(f'<meta name="description" content="{escape(description, quote=True)}" />')
    lines.extend(
        [
            '<meta name="robots" content="index, follow" />',
            f'<link rel="canonical" href="{url}" />',
            '<link rel="icon" type="image/x-icon" href="../consultant/assets/favicon.ico" />',
            '<link rel="shortcut icon" href="../consultant/assets/favicon.ico" />',
            '<meta property="og:type" content="article" />',
            f'<meta property="og:title" content="{escape(title, quote=True)}" />',
            f'<meta property="og:description" content="{escape(description, quote=True)}" />',
            f'<meta property="og:url" content="{url}" />',
            f'<meta property="og:image" content="{SOCIAL_IMAGE}" />',
            '<meta property="og:image:width" content="1672" />',
            '<meta property="og:image:height" content="941" />',
            '<meta name="twitter:card" content="summary_large_image" />',
            f'<meta name="twitter:title" content="{escape(title, quote=True)}" />',
            f'<meta name="twitter:description" content="{escape(description, quote=True)}" />',
            f'<meta name="twitter:image" content="{SOCIAL_IMAGE}" />',
            '<script type="application/ld+json">',
            json_ld(url, title, description, page_type),
            "</script>",
        ]
    )
    return "\n    ".join(lines)


def current_title(source: str) -> str:
    match = re.search(r"<title>(.*?)</title>", source, flags=re.S)
    if not match:
        raise ValueError("missing title")
    return re.sub(r"\s+", " ", match.group(1)).strip()


def current_description(source: str) -> str:
    match = re.search(
        r'<meta\s+name="description"\s+content="(.*?)"\s*/?>',
        source,
        flags=re.S,
    )
    if not match:
        raise ValueError("missing description")
    return re.sub(r"\s+", " ", match.group(1)).strip()


def enrich_case(path: Path) -> None:
    source = path.read_text(encoding="utf-8")
    if MARKER in source:
        return
    original_title = current_title(source)
    parts = [part.strip() for part in original_title.split(" — ")]
    human_title = parts[1] if len(parts) > 1 else original_title
    title = f"{human_title} — кейс ИДЕАЛ-метода Тойча (ИМТ)"
    description = current_description(source)
    slug = path.parent.name
    url = f"https://app.imt.dev/{slug}/"
    source = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", source, count=1, flags=re.S)
    pattern = r'(<meta\s+name="description"\s+content=".*?"\s*/?>)'
    block = seo_block(url, title, description, "Article", include_description=False)
    source = re.sub(pattern, rf"\1\n    {block}", source, count=1, flags=re.S)
    source = source.replace("https://imt.dev/typkd", "https://app.imt.dev/consultant/")
    path.write_text(source, encoding="utf-8")


def enrich_lp(path: Path) -> None:
    source = path.read_text(encoding="utf-8")
    if MARKER in source:
        return
    slug = path.parent.name
    original_title = current_title(source)
    parts = [part.strip() for part in original_title.split(" — ")]
    human_title = parts[-1]
    title = f"{human_title} — Learning Path по ИДЕАЛ-методу Тойча (ИМТ)"
    description = LP_DESCRIPTIONS[slug]
    url = f"https://app.imt.dev/{slug}/"
    source = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", source, count=1, flags=re.S)
    block = seo_block(url, title, description, "WebPage", include_description=True)
    source = source.replace(f"<title>{title}</title>", f"<title>{title}</title>\n    {block}", 1)
    source = source.replace("https://app.imt.dev/lp-catalog\"", "https://app.imt.dev/lp-catalog/\"")
    path.write_text(source, encoding="utf-8")


def main() -> None:
    for path in sorted(ROOT.glob("case-*/index.html")):
        enrich_case(path)
    for slug in LP_DESCRIPTIONS:
        enrich_lp(ROOT / slug / "index.html")


if __name__ == "__main__":
    main()
