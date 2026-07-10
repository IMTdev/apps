# Comparison V2 Enrichment Design

## Goal

Create a standalone local page at `comparison_v2/index.html` that preserves the current comparison article and enriches relevant sections with verifiable source anchors and debate axes from the `philosophers.2pub.me` knowledge bases.

## Scope

- Create only the new local web page and its local assets when required.
- Use the current `comparison/index.html` as the visual and editorial baseline.
- Do not modify `comparison/index.html`, the source `comparison.md`, sitemap, robots, redirects, `llms.txt`, or deployed pages.
- Add `<meta name="robots" content="noindex,nofollow">` because this version is local and experimental.
- Do not deploy the page.

## Editorial Model

The existing author text remains the primary narrative. Source material is added as a supporting layer and does not replace conclusions, introduce new teachings, or change the teaching-versus-methodology structure.

Relevant sections receive one or both of these modules:

1. `Опоры из корпуса`: three to five concise source-backed points with the author, corpus, exact slug, and a direct link to the source note.
2. `Ось спора`: a compact two-position comparison drawn from the hub contradiction index and linked to the relevant source notes.

The final section, `Опоры из базы «Философы»`, maps each used corpus to the comparison sections it supports.

## Source Protocol

For every inserted claim:

1. Start from the hub author card, topic matrix, or contradiction index.
2. Record the relevant `kb_id` and supporting slug.
3. Open the targeted author corpus and verify the formulation against that slug.
4. Link the displayed source chip to the exact note or, when an exact note URL is unavailable, to the corpus page that exposes that slug.
5. Keep direct quotations short and use paraphrases when the source wording is not necessary.

Allowed corpora: `epictetus`, `confucius`, `laozi`, `ignatius`, `tolstoy`, `pascal`, `montaigne`, `goethe`, `schopenhauer`, `nietzsche`, `larochefoucauld`, `adler`, and conditionally `machiavelli`.

Excluded corpora: `franklin`, `smiles`, `hill`, `wattles`, `ford`, `rockefeller`, `lebon`, and `james-allen` or `james_allen`. They must not appear in visible text, links, source metadata, or debate modules.

## Information Architecture

- Preserve the existing hero, summary, article order, complete matrices, working formula, and footer.
- Extend the table of contents with one final link to the source map.
- Insert evidence modules immediately after the relevant teaching or methodology, so the reader does not need to cross-reference footnotes.
- Keep evidence details collapsible on narrow screens and initially expanded on desktop where space permits.
- Place debate axes only where they clarify an existing distinction, such as Epictetus versus Schopenhauer on suffering, Confucius versus Laozi on ritual and non-action, and Ignatius versus Montaigne on disciplined versus exploratory self-examination.

## Visual Thesis

An editorial research edition of the current comparison page: warm paper, disciplined typography, restrained green source markers, and thin amber debate dividers. The page should feel more credible and navigable without becoming an academic database interface.

## Content Plan

- Hero: retain the existing hook and label the page as an enriched local research edition.
- Main article: retain all current sections and tables.
- Evidence layer: compact source modules under relevant sections.
- Debate layer: two-sided comparisons in selected places only.
- Source map: corpus-to-section index with direct links.
- Footer: local version label and update date.

## Interaction Thesis

- Source modules use native `details/summary` disclosure on mobile and compact expanded layouts on desktop.
- Source chips receive a restrained hover/focus transition that makes provenance discoverable.
- Existing table scrolling and table-of-contents behavior remain unchanged.
- Motion is disabled for users who prefer reduced motion.

## Accessibility And Failure Handling

- All disclosure controls remain keyboard accessible through native HTML.
- External source links open in the same tab unless the existing site convention requires otherwise.
- If a claim cannot be verified against an exact slug, omit it rather than inserting a placeholder or an unsourced statement.
- The source map lists only corpora actually used on the page.
- Color is supplementary: modules also use explicit labels, borders, and headings.

## Verification

- Confirm the old comparison file hash is unchanged.
- Confirm every local hash link resolves to an element ID.
- Confirm every external source link returns an HTTP success response or a valid redirect.
- Scan the generated HTML for all excluded author IDs and names.
- Confirm the page includes `noindex,nofollow` and contains no production canonical pointing to `/comparison/`.
- Render desktop and mobile screenshots and check navigation, tables, disclosure blocks, overflow, and text overlap.
- Confirm no deploy command is run.
