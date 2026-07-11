# Comparison V2 Readability Design

## Goal

Improve `comparison_v2` in three focused ways: make corpus supports readable for humans, remove debate blocks from the visible page, and replace two very wide matrices with an interactive comparison of two or three selected systems.

## Scope

- Modify only `comparison_v2/index.html`.
- Do not modify `comparison/index.html`, the source Markdown, redirects, sitemap, robots, `llms.txt`, or the corpus source map.
- Keep the page local and `noindex,nofollow`.
- Do not deploy.

## Corpus Supports

Reuse the current explanatory texts. Do not rewrite them into new quotations.

Each support item changes from a technical two-column row into this reading order:

1. The existing explanatory text appears first, in larger editorial typography.
2. A human-readable source link appears below: author name and book title in Russian.
3. Technical `kb_id / slug` labels disappear from the visible interface.
4. The link still points to the same exact corpus note, so provenance is preserved.

Do not add quotation marks unless the displayed text is a verified verbatim quotation. The existing paraphrases should look like source-backed theses, not fake direct quotes.

Examples of source labels:

- `Эпиктет, «Энхиридион»`
- `Иоганн Вольфганг Гёте, «Максимы и размышления»`
- `Игнатий Лойола, «Духовные упражнения»`
- `Конфуций, «Лунь юй»`

## Debate Blocks

All `.debate-axis` elements receive the native `hidden` attribute. They disappear from visual layout and accessibility navigation without deleting their source markup.

The source map remains unchanged, including authors that were previously used by debate blocks.

## Interactive Matrices

Both wide source tables remain the single data source. JavaScript reads their header and row cells to build a focused comparison view, avoiding a second copy of the matrix data.

### Selection

- The reader selects two or three systems through compact checkboxes above each matrix.
- Once three systems are selected, unselected options become disabled until one selected option is removed.
- The interface prevents selection from dropping below two systems.
- A concise live status reports `Выбрано 3 из 3` or `Выбрано 2 из 3`.

Teaching defaults:

1. Стоицизм
2. Христианство
3. ИДЕАЛ-метод Тойча (ИМТ)

Methodology defaults:

1. Стоическая практика
2. Христианская аскетическая практика
3. Методика переобучения по ИМТ

### Desktop Layout

The focused matrix has exactly four columns:

1. Criterion column: `minmax(128px, .72fr)`.
2. Three selected systems: `repeat(3, minmax(0, 1fr))`.

The matrix uses the available reading width, fixed tracks, normal wrapping, and compact typography. It must not create horizontal page or component scrolling at desktop widths. When only two systems are selected, the remaining space is divided between two system columns.

Strong-side rows receive a restrained green cue. Weak-side or limitation rows receive a restrained red cue. Color remains supplementary to the criterion label.

### Mobile Layout

Below 760 px, each criterion becomes a vertical comparison group:

- criterion heading;
- selected system name;
- corresponding value;
- next system name and value.

There is no horizontal scrolling. Selection controls wrap to multiple lines and preserve comfortable touch targets.

### Full Tables

The current complete table moves into a collapsed native `details` block labelled `Показать исходную полную таблицу`. This preserves all rows and columns for readers who need the raw matrix.

### URL State

Selected systems are stored in query parameters:

- `teach=stoicism,christianity,imt`
- `method=stoic-practice,christian-ascetic,imt-retraining`

Unknown or malformed values are ignored. If fewer than two valid values remain, the matrix returns to its defaults. Updating the selection uses `history.replaceState` and does not reload the page.

## Accessibility

- Selection controls use `fieldset`, `legend`, and labelled checkboxes.
- The selection count uses `aria-live="polite"`.
- The comparison output remains semantic: row groups and explicit criterion/system labels.
- Native `details/summary` controls the complete-table disclosure.
- Hidden debate blocks are removed from the accessibility tree through the `hidden` attribute.

## Verification

- Confirm `comparison/index.html` remains byte-for-byte unchanged.
- Confirm all corpus links and source-map entries remain present.
- Confirm no visible technical `kb_id / slug` strings remain in support modules.
- Confirm all four debate blocks are hidden and the source map is unchanged.
- Confirm both focused matrices start with the specified defaults.
- Confirm selection limits are enforced at two and three systems.
- Confirm URL parameters restore valid selections and reject invalid ones.
- Confirm desktop matrices have four fitted columns and no horizontal overflow.
- Confirm mobile matrices stack vertically and the document has no horizontal overflow.
- Confirm complete source tables remain available through their disclosure controls.
- Confirm no deploy command is run.
