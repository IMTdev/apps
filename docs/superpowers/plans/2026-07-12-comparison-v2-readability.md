# Comparison V2 Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformat corpus supports, hide debates, and replace two wide matrices with focused comparisons of two or three selected systems while preserving the complete source tables.

**Architecture:** Keep `comparison_v2/index.html` as a self-contained static page. Existing tables remain the only matrix data source; embedded JavaScript reads them and renders accessible focused comparisons, while embedded CSS provides four fitted desktop columns and stacked mobile rows.

**Tech Stack:** Static HTML, embedded CSS, vanilla JavaScript, native `details/summary`, URL query parameters, Node-based structural assertions, local browser verification.

---

## File Structure

- Modify: `comparison_v2/index.html` — source support markup, hidden debates, matrix controls, responsive matrix renderer, URL state.
- Preserve: `comparison/index.html`, `comparison_v2` source map, sitemap, robots, redirects, `llms.txt`.

### Task 1: Baseline And Regression Guards

**Files:**
- Test: `comparison_v2/index.html`
- Preserve: `comparison/index.html`

- [ ] **Step 1: Record checksums for protected content**

```bash
shasum -a 256 comparison/index.html > /tmp/comparison-v2-readability-production.sha256
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const sourceMap = html.match(/<!-- V2:SOURCE-MAP:START -->[\s\S]*?<!-- V2:SOURCE-MAP:END -->/)?.[0];
if (!sourceMap) process.exit(1);
fs.writeFileSync('/tmp/comparison-v2-source-map.html', sourceMap);
console.log('protected baselines recorded');
NODE
```

Expected: production checksum and source-map snapshot exist.

- [ ] **Step 2: Run the failing feature assertion**

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const required = ['matrix-selector','focused-matrix','full-matrix','evidence-source'];
const missing = required.filter(name => !html.includes(name));
if (!missing.length) process.exit(0);
console.error(`missing features: ${missing.join(', ')}`);
process.exit(1);
NODE
```

Expected: exit code `1` with all four feature markers missing.

### Task 2: Reformat Corpus Supports And Hide Debates

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Replace evidence layout styles**

Replace the current two-column evidence rules with:

```css
.evidence-list{display:grid;gap:0;margin:0;padding:0;list-style:none}
.evidence-list li{display:flex;flex-direction:column;gap:10px;padding:20px 0;border-top:1px solid var(--line)}
.evidence-list li>span{order:1;color:var(--ink);font-size:19px;line-height:1.52}
.evidence-source{order:2;align-self:flex-start;color:var(--green-dark);font-size:14px;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.debate-axis[hidden]{display:none!important}
```

Expected: thesis text is visually primary and source attribution is secondary.

- [ ] **Step 2: Reorder every evidence item and humanize labels**

For every `.evidence-list li`, place the existing `<span>` before its `<a>`, change the link class to `source-chip evidence-source`, and replace technical labels using this map:

```javascript
const evidenceLabels = {
  epictetus: 'Эпиктет, «Энхиридион»',
  ignatius: 'Игнатий Лойола, «Духовные упражнения»',
  tolstoy: 'Лев Толстой, «Исповедь»',
  pascal: 'Блез Паскаль, «Мысли»',
  larochefoucauld: 'Франсуа де Ларошфуко, «Максимы»',
  laozi: 'Лао-цзы, «Дао дэ цзин»',
  goethe: 'Иоганн Вольфганг Гёте, «Максимы и размышления»',
  adler: 'Альфред Адлер, «Понимание человеческой природы»',
  confucius: 'Конфуций, «Лунь юй»'
};
```

The map documents the exact visible strings; it is not added to runtime JavaScript.

Expected: no visible `kb_id / slug` label remains inside the seven evidence modules; all existing note URLs remain unchanged.

- [ ] **Step 3: Hide all debate axes without changing the source map**

Add `hidden` to each of the four existing elements:

```html
<aside class="debate-axis" aria-label="Ось спора" data-v2-only hidden>
```

Expected: four debate blocks remain in source but are absent from visual and accessibility layout.

- [ ] **Step 4: Verify evidence and debate changes**

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const evidence = [...html.matchAll(/<details class="corpus-evidence"[\s\S]*?<\/details>/g)].map(m => m[0]);
if (evidence.length !== 7) process.exit(1);
if (evidence.some(block => />(?:epictetus|ignatius|tolstoy|pascal|larochefoucauld|laozi|goethe|adler|confucius)\s*\//i.test(block))) process.exit(1);
if (evidence.some(block => !block.includes('evidence-source'))) process.exit(1);
const hiddenDebates = (html.match(/class="debate-axis"[^>]*hidden/g) || []).length;
if (hiddenDebates !== 4) process.exit(1);
console.log('evidence humanized; 4 debates hidden');
NODE
```

Expected: exit code `0`.

- [ ] **Step 5: Commit the editorial presentation**

```bash
git add comparison_v2/index.html
git commit -m "refactor: simplify comparison v2 evidence"
```

### Task 3: Wrap Complete Tables And Add Matrix Hosts

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Give both source tables stable IDs**

Use:

```html
<table id="teaching-matrix-source">
<table id="method-matrix-source">
```

Expected: each matrix has exactly one source table.

- [ ] **Step 2: Add focused comparison hosts above source tables**

Insert before each complete table:

```html
<div class="matrix-explorer" data-matrix-kind="teaching">
  <div class="matrix-selector"></div>
  <div class="focused-matrix" aria-live="polite"></div>
</div>
```

and:

```html
<div class="matrix-explorer" data-matrix-kind="method">
  <div class="matrix-selector"></div>
  <div class="focused-matrix" aria-live="polite"></div>
</div>
```

Expected: two independent explorer roots exist.

- [ ] **Step 3: Move complete tables into collapsed disclosures**

Wrap each existing `.table-scroll` with:

```html
<details class="full-matrix">
  <summary>Показать исходную полную таблицу</summary>
  <div class="table-scroll">...</div>
</details>
```

Expected: all original table rows and cells remain unchanged inside native disclosures.

### Task 4: Implement Focused Matrix Rendering

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Add matrix configuration**

Add before existing analytics initialization:

```javascript
const MATRIX_CONFIG = {
  teaching: {
    tableId: 'teaching-matrix-source',
    param: 'teach',
    legend: 'Выберите учения для сравнения',
    defaults: ['stoicism', 'christianity', 'imt'],
    keys: {
      'Стоицизм': 'stoicism',
      'Христианство': 'christianity',
      'Буддизм': 'buddhism',
      'Йога / Веданта': 'yoga-vedanta',
      'Аристотелевская этика': 'aristotle',
      'Конфуцианство': 'confucianism',
      'Суфизм': 'sufism',
      'Логотерапия': 'logotherapy',
      'ИДЕАЛ-метод Тойча (ИМТ)': 'imt'
    }
  },
  method: {
    tableId: 'method-matrix-source',
    param: 'method',
    legend: 'Выберите методики для сравнения',
    defaults: ['stoic-practice', 'christian-ascetic', 'imt-retraining'],
    keys: {
      'КПТ': 'cbt',
      'ACT': 'act',
      'Гештальт': 'gestalt',
      'Схема-терапия': 'schema-therapy',
      'IFS': 'ifs',
      'Логотерапия': 'logotherapy',
      'Стоическая практика': 'stoic-practice',
      'Христианская аскетическая практика': 'christian-ascetic',
      'Буддийская медитативная практика': 'buddhist-meditation',
      'Йогическая практика': 'yogic-practice',
      'Методика переобучения по ИМТ': 'imt-retraining'
    }
  }
};
```

Expected: every table row name resolves to one stable key.

- [ ] **Step 2: Add data parsing and selection validation**

Implement:

```javascript
function readMatrix(config) {
  const table = document.getElementById(config.tableId);
  const criteria = [...table.querySelectorAll('thead th')].slice(1).map(node => node.textContent.trim());
  const systems = [...table.querySelectorAll('tbody tr')].map(row => {
    const cells = [...row.querySelectorAll('td')].map(node => node.textContent.trim());
    return { name: cells[0], key: config.keys[cells[0]], values: cells.slice(1) };
  });
  return { criteria, systems };
}

function readSelection(config, systems) {
  const valid = new Set(systems.map(item => item.key));
  const requested = new URLSearchParams(location.search).get(config.param)?.split(',').filter(key => valid.has(key)) || [];
  const unique = [...new Set(requested)].slice(0, 3);
  return unique.length >= 2 ? unique : [...config.defaults];
}
```

Expected: malformed URL values fall back to defaults; valid two- and three-item selections are retained.

- [ ] **Step 3: Add selector rendering and limits**

Implement `renderSelector(host, config, data, selected, onChange)` using a `fieldset`, `legend`, labelled checkboxes, and `<span class="matrix-selection-status" aria-live="polite">`. Prevent unchecking when only two values remain and disable unselected inputs when three are active.

Expected: the user can compare exactly two or three systems.

- [ ] **Step 4: Add focused matrix rendering**

Implement rows with this semantic shape:

```html
<div class="focused-matrix-grid" role="table" style="--system-count:3">
  <div class="focused-row focused-head" role="row">
    <div class="criterion-cell" role="columnheader">Критерий</div>
    <div class="system-head" role="columnheader">Стоицизм</div>
  </div>
  <div class="focused-row tone-strength" role="row">
    <div class="criterion-cell" role="rowheader">Сильная сторона</div>
    <div class="matrix-value" role="cell"><strong>Стоицизм</strong><span>...</span></div>
  </div>
</div>
```

Use `tone-strength` when the criterion contains `Сильная` or `Где сильна`, and `tone-weak` when it contains `Слабое` or `Чего не хватает`.

Expected: all criteria and values for selected systems appear without changing source tables.

- [ ] **Step 5: Persist selection in the URL**

On each accepted change:

```javascript
const url = new URL(location.href);
url.searchParams.set(config.param, selected.join(','));
history.replaceState(null, '', url);
```

Expected: both `teach` and `method` parameters coexist and reload restores the same selection.

### Task 5: Add Compact Responsive Matrix Styling

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Add selector and disclosure styles**

```css
.matrix-selector fieldset{margin:22px 0;padding:0;border:0}
.matrix-selector legend{margin-bottom:10px;font-weight:800}
.matrix-option-list{display:flex;flex-wrap:wrap;gap:8px}
.matrix-option{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:7px 11px;border:1px solid var(--line-strong);border-radius:4px;background:#fff;font-size:13px;cursor:pointer}
.matrix-option:has(input:checked){border-color:var(--green);background:rgba(103,201,174,.12)}
.matrix-option:has(input:disabled){opacity:.45;cursor:not-allowed}
.matrix-selection-status{display:block;margin-top:9px;color:var(--ink-mute);font-size:13px}
.full-matrix{margin-top:22px;border-top:1px solid var(--line)}
.full-matrix summary{padding:16px 0;cursor:pointer;font-weight:800}
```

- [ ] **Step 2: Add four-column desktop matrix styles**

```css
.focused-matrix-grid{--system-count:3;display:grid;width:100%;border-top:1px solid var(--line);border-left:1px solid var(--line)}
.focused-row{display:grid;grid-column:1/-1;grid-template-columns:minmax(128px,.72fr) repeat(var(--system-count),minmax(0,1fr))}
.focused-row>*{min-width:0;padding:12px 10px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);overflow-wrap:anywhere}
.focused-head{background:var(--warm-soft);font-size:13px;font-weight:800}
.criterion-cell{color:var(--ink);font-size:12px;font-weight:800}
.matrix-value{color:var(--ink-soft);font-size:13px;line-height:1.4}
.matrix-value strong{display:none}
.tone-strength .criterion-cell{box-shadow:inset 3px 0 0 var(--green);background:rgba(36,124,104,.06)}
.tone-weak .criterion-cell{box-shadow:inset 3px 0 0 #a7473f;background:rgba(167,71,63,.06)}
```

Expected: criterion plus three system columns fit at full reader width without horizontal scrolling.

- [ ] **Step 3: Add stacked mobile styles**

```css
@media(max-width:760px){
  .focused-matrix-grid{display:block;border-left:0}
  .focused-row{display:block;margin-bottom:18px;border:1px solid var(--line)}
  .focused-head{display:none}
  .focused-row>*{border-right:0}
  .criterion-cell{padding:10px 12px;background:var(--warm-soft)}
  .matrix-value{padding:12px}
  .matrix-value strong{display:block;margin-bottom:4px;font-size:13px}
  .matrix-option{font-size:12px}
}
```

Expected: no matrix or page-level horizontal scrolling at 390 px.

### Task 6: Structural And Browser Verification

**Files:**
- Test: `comparison_v2/index.html`
- Preserve: `comparison/index.html`

- [ ] **Step 1: Verify protected content**

```bash
shasum -a 256 -c /tmp/comparison-v2-readability-production.sha256
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const current = html.match(/<!-- V2:SOURCE-MAP:START -->[\s\S]*?<!-- V2:SOURCE-MAP:END -->/)?.[0];
const original = fs.readFileSync('/tmp/comparison-v2-source-map.html', 'utf8');
if (current !== original) process.exit(1);
console.log('source map unchanged');
NODE
```

- [ ] **Step 2: Verify static requirements**

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const checks = {
  hiddenDebates: (html.match(/class="debate-axis"[^>]*hidden/g)||[]).length === 4,
  selectors: (html.match(/class="matrix-selector"/g)||[]).length === 2,
  focusedMatrices: (html.match(/class="focused-matrix"/g)||[]).length === 2,
  fullMatrices: (html.match(/class="full-matrix"/g)||[]).length === 2,
  sourceTables: html.includes('teaching-matrix-source') && html.includes('method-matrix-source'),
  defaults: html.includes("['stoicism', 'christianity', 'imt']") && html.includes("['stoic-practice', 'christian-ascetic', 'imt-retraining']")
};
if (Object.values(checks).some(value => !value)) { console.error(checks); process.exit(1); }
console.log(checks);
NODE
```

- [ ] **Step 3: Verify desktop behavior at 1440 × 1100**

Use the in-app browser at `http://127.0.0.1:8765/comparison_v2/` and assert:

- teaching defaults are Стоицизм, Христианство, ИДЕАЛ-метод Тойча (ИМТ);
- method defaults are Стоическая практика, Христианская аскетическая практика, Методика переобучения по ИМТ;
- each focused matrix has four fitted columns and `scrollWidth === clientWidth`;
- complete tables are collapsed;
- all four debate blocks are hidden;
- no broken images or browser errors.

- [ ] **Step 4: Verify interaction and URL state**

In the browser:

- deselect one default and select another system;
- confirm a fourth system cannot be selected;
- confirm a second selected system cannot be removed;
- reload with valid `teach` and `method` query parameters and confirm restoration;
- reload with invalid parameters and confirm defaults.

- [ ] **Step 5: Verify mobile behavior at 390 × 844**

Assert:

- matrix rows stack vertically;
- system names are visible inside each value;
- `document.documentElement.scrollWidth === innerWidth`;
- each focused matrix has no internal horizontal overflow;
- full source tables remain available only after opening disclosure.

- [ ] **Step 6: Commit verified implementation**

```bash
git add comparison_v2/index.html
git commit -m "feat: add focused comparison matrices"
```

