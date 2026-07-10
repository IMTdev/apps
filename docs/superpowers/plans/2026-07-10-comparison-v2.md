# Comparison V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local research edition of the comparison article with source-backed corpus anchors and debate axes while leaving the current comparison page and production configuration unchanged.

**Architecture:** Duplicate the current single-file comparison page into `comparison_v2/index.html`, then add a restrained evidence layer directly in that file. Research data is fetched to `/tmp`, verified against targeted `philosophers.2pub.me` corpora, and inserted only after an exact slug is confirmed; no source manifest or additional content file is persisted.

**Tech Stack:** Static HTML, embedded CSS and JavaScript, native `details/summary`, shell-based structural checks, local HTTP server, browser screenshots.

---

## File Structure

- Create: `comparison_v2/index.html` — complete local page, including copied article, evidence modules, debate axes, source map, page-specific CSS, and `noindex` metadata.
- Preserve byte-for-byte: `comparison/index.html` — current production comparison page.
- Preserve: `comparison.md`, `_redirects`, `sitemap.xml`, `robots.txt`, `llms.txt` — no content or routing changes.
- Temporary only: `/tmp/comparison-v2-sources/` — downloaded hub pages and author-corpus pages used for verification; never committed.

### Task 1: Establish Isolation And Baseline Guards

**Files:**
- Create: `comparison_v2/index.html`
- Preserve: `comparison/index.html`

- [ ] **Step 1: Record the production-page checksum**

Run:

```bash
shasum -a 256 comparison/index.html > /tmp/comparison-v2-original.sha256
```

Expected: `/tmp/comparison-v2-original.sha256` contains one SHA-256 line for `comparison/index.html`.

- [ ] **Step 2: Run the page-existence check before creation**

Run:

```bash
test -f comparison_v2/index.html
```

Expected: exit code `1`, proving the requested page does not exist yet.

- [ ] **Step 3: Create the isolated page from the current production baseline**

Run:

```bash
mkdir -p comparison_v2
cp comparison/index.html comparison_v2/index.html
```

Expected: `comparison_v2/index.html` exists and initially matches `comparison/index.html`.

- [ ] **Step 4: Verify the copy and the untouched source**

Run:

```bash
cmp -s comparison/index.html comparison_v2/index.html
shasum -a 256 -c /tmp/comparison-v2-original.sha256
```

Expected: `cmp` exits `0`; checksum output is `comparison/index.html: OK`.

- [ ] **Step 5: Commit the isolated baseline**

```bash
git add comparison_v2/index.html
git commit -m "feat: start isolated comparison v2"
```

### Task 2: Collect And Verify Targeted Corpus Evidence

**Files:**
- Read: `comparison_v2/index.html`
- Temporary: `/tmp/comparison-v2-sources/*.html`

- [ ] **Step 1: Download only the hub routes required by the brief**

Run:

```bash
mkdir -p /tmp/comparison-v2-sources
curl -fsSL https://philosophers.2pub.me/ru -o /tmp/comparison-v2-sources/hub.html
curl -fsSL https://philosophers.2pub.me/ru/topics -o /tmp/comparison-v2-sources/topics.html
curl -fsSL https://philosophers.2pub.me/ru/contradictions -o /tmp/comparison-v2-sources/contradictions.html
```

Expected: all three files are non-empty HTML documents.

- [ ] **Step 2: Download the relevant hub author cards, not all knowledge bases**

Run:

```bash
for id in epictetus confucius laozi ignatius tolstoy pascal montaigne goethe schopenhauer nietzsche larochefoucauld adler machiavelli; do
  curl -fsSL "https://philosophers.2pub.me/ru/hub/$id" -o "/tmp/comparison-v2-sources/hub-$id.html"
done
```

Expected: thirteen non-empty author-card documents.

- [ ] **Step 3: Extract corpus routes and supporting slugs from the cards**

Run:

```bash
rg -n 'База:|Ключевые темы и опорные слаги|С чего начать' /tmp/comparison-v2-sources/hub-*.html
rg -n 'epictetus_schopenhauer|confucius_laozi|ignatius_montaigne|schopenhauer_nietzsche' /tmp/comparison-v2-sources/contradictions.html
```

Expected: the cards expose the corpus domains and source slugs; the contradiction index exposes the four allowed debate routes without requiring a broad search across all corpora.

- [ ] **Step 4: Fetch the exact note routes exposed by each target corpus**

Run:

```bash
urls=(
  https://epictetus.2pub.me/concepts/dihotomiya-kontrolya
  https://epictetus.2pub.me/concepts/sudzhdeniya-ne-veshchi
  https://confucius.2pub.me/concepts/ren
  https://confucius.2pub.me/concepts/li
  https://laozi.2pub.me/concepts/wuwei
  https://ignatius.2pub.me/concepts/nachalo-i-osnovanie
  https://ignatius.2pub.me/concepts/ispytanie-sovesti
  https://tolstoy.2pub.me/concepts/vera-sila-zhizni
  https://pascal.2pub.me/concepts/serdtse_i_razum
  https://montaigne.2pub.me/concepts/chto-ya-znayu
  https://goethe.2pub.me/concepts/trebovanie_dnya
  https://schopenhauer.2pub.me/concepts/stradanie_polozhitelno
  https://nietzsche.2pub.me/concepts/volya_k_vlasti
  https://larochefoucauld.2pub.me/concepts/amour_propre
  https://adler.2pub.me/concepts/chuvstvo_obshchnosti
)
for url in "${urls[@]}"; do
  name="${url#https://}"
  name="${name//\//--}"
  curl -fsSL "$url" -o "/tmp/comparison-v2-sources/$name.html"
done
```

Expected: fifteen non-empty note pages. If an exact route has changed, derive its current route from the corresponding corpus root page and update the URL before writing page copy.

- [ ] **Step 5: Check the research index against excluded corpora**

Run:

```bash
selected_names=$(for file in /tmp/comparison-v2-sources/*.2pub.me--*.html; do basename "$file"; done)
if print -r -- "$selected_names" | rg -ni 'franklin|smiles|hill|wattles|ford|rockefeller|lebon|james[-_ ]allen'; then
  exit 1
fi
```

Expected: exit code `0`; no excluded corpus is present in the selected note set.

### Task 3: Give The Copy A Local Research Identity

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Add local-only metadata and remove production identity**

Use `apply_patch` to add this immediately after the viewport meta tag:

```html
<meta name="robots" content="noindex,nofollow" />
```

Remove the production canonical element and change the title to:

```html
<title>Сравнение систем изменения человека — исследовательская версия</title>
```

Expected: the page cannot accidentally claim `/comparison/` as its canonical production URL.

- [ ] **Step 2: Add evidence-layer styles before the existing responsive rules**

Use `apply_patch` to add the following complete style block inside the existing `<style>` element:

```css
.research-edition{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;color:var(--green-dark);font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:700;text-transform:uppercase}
.corpus-evidence{margin:24px 0 34px;border-top:1px solid rgba(36,124,104,.28);border-bottom:1px solid rgba(36,124,104,.18);background:rgba(103,201,174,.07)}
.corpus-evidence summary{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;cursor:pointer;list-style:none;font-weight:800}
.corpus-evidence summary::-webkit-details-marker{display:none}
.corpus-evidence summary::after{content:"+";font-family:"IBM Plex Mono",monospace;color:var(--green-dark)}
.corpus-evidence[open] summary::after{content:"−"}
.evidence-body{padding:0 20px 20px}
.evidence-list{display:grid;gap:12px;margin:0;padding:0;list-style:none}
.evidence-list li{display:grid;grid-template-columns:minmax(150px,.32fr) 1fr;gap:18px;padding-top:12px;border-top:1px solid var(--line)}
.source-chip{color:var(--green-dark);font-family:"IBM Plex Mono",monospace;font-size:12px;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.debate-axis{margin:28px 0 38px;padding:24px;border-left:3px solid var(--gold);background:var(--warm-soft)}
.debate-axis h4{margin:0 0 16px}
.debate-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(217,154,69,.22)}
.debate-side{padding:18px;background:var(--warm-soft)}
.debate-side strong{display:block;margin-bottom:7px}
.source-map{margin-top:72px;padding-top:34px;border-top:1px solid var(--line)}
.source-map-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin:24px 0 0;padding:0;list-style:none}
.source-map-list li{padding:16px 0;border-top:1px solid var(--line)}
@media(max-width:760px){.evidence-list li,.debate-grid,.source-map-list{grid-template-columns:1fr}.corpus-evidence summary{padding:16px}.evidence-body{padding:0 16px 16px}.debate-axis{padding:18px}}
@media(prefers-reduced-motion:reduce){.source-chip{transition:none}}
```

Expected: the new classes are defined once and use the existing page palette.

- [ ] **Step 3: Label the hero without rewriting its hook**

Insert above the existing hero `h1`:

```html
<span class="research-edition">research edition · опоры из первоисточников</span>
```

Expected: the original headline and lead remain unchanged.

- [ ] **Step 4: Verify local identity**

Run:

```bash
rg -n 'noindex,nofollow|research edition|corpus-evidence|debate-axis' comparison_v2/index.html
! rg -n '<link rel="canonical" href="https://app.imt.dev/comparison/"' comparison_v2/index.html
```

Expected: all local identity markers are found; the old canonical is absent.

### Task 4: Insert Verified Evidence And Debate Modules

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Insert an evidence module after each verified relevant section**

Use this complete module for the first verified Stoicism insertion, then repeat the same structure with the other verified source notes:

```html
<!-- V2:EVIDENCE:START -->
<details class="corpus-evidence" open data-v2-only>
  <summary>Опоры из корпуса · Эпиктет / Энхиридион</summary>
  <div class="evidence-body">
    <ul class="evidence-list">
      <li>
        <a class="source-chip" href="https://epictetus.2pub.me/concepts/dihotomiya-kontrolya">epictetus / dihotomiya-kontrolya</a>
        <span>Практика начинается со строгого различения подвластного и неподвластного человеку.</span>
      </li>
      <li>
        <a class="source-chip" href="https://epictetus.2pub.me/concepts/sudzhdeniya-ne-veshchi">epictetus / sudzhdeniya-ne-veshchi</a>
        <span>Страдание связывается не только с событием, но и с суждением, которое человек принимает о событии.</span>
      </li>
    </ul>
  </div>
</details>
<!-- V2:EVIDENCE:END -->
```

Add modules only to these sections when exact slugs have been verified:

- Stoicism and Stoic practice: `epictetus`.
- Christianity and Christian ascetic practice: `ignatius`, with `tolstoy` and `pascal` only where their corpus notes directly support the existing paragraph.
- Yoga/Vedanta: `laozi` only as a labeled contrast, never as evidence that the systems are identical.
- Aristotelian ethics: `goethe` only where the source supports activity, measure, or character.
- Confucianism: `confucius`.
- Cross-cutting diagnosis of false motives: `larochefoucauld`, `montaigne`, or `adler` only where the source directly supports an existing claim.

Expected: every displayed chip has a real `kb_id`, slug, and working URL; no module is added to an unsupported section.

- [ ] **Step 2: Insert only verified debate axes**

Use this complete structure for the verified Epictetus–Schopenhauer axis, then repeat it only for the other confirmed pairs:

```html
<!-- V2:DEBATE:START -->
<aside class="debate-axis" aria-label="Ось спора" data-v2-only>
  <h4>Ось спора · как освобождаться от страдания</h4>
  <div class="debate-grid">
    <div class="debate-side"><strong>Эпиктет</strong><p>Возвращает свободу через различение подвластного и проверку суждения о событии.</p></div>
    <div class="debate-side"><strong>Шопенгауэр</strong><p>Ищет освобождение через ограничение желаний и снижение власти ненасытной воли.</p></div>
  </div>
</aside>
<!-- V2:DEBATE:END -->
```

Candidate pairs, included only after both sides are verified:

- Epictetus versus Schopenhauer: freedom from suffering through judgment versus through quieting the will.
- Confucius versus Laozi: cultivation through ritual versus alignment through non-action.
- Ignatius versus Montaigne: disciplined examination versus exploratory self-observation.
- Schopenhauer versus Nietzsche: quieting the will versus using suffering as material for self-overcoming.

Expected: each debate axis clarifies an existing section and does not introduce a new matrix row.

- [ ] **Step 3: Keep the author synthesis untouched around insertions**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const original = fs.readFileSync('comparison/index.html', 'utf8');
let v2 = fs.readFileSync('comparison_v2/index.html', 'utf8');
v2 = v2.replace(/<!-- V2:(?:EVIDENCE|DEBATE|SOURCE-MAP):START -->[\s\S]*?<!-- V2:(?:EVIDENCE|DEBATE|SOURCE-MAP):END -->/g, '');
const body = html => html.match(/<main[\s\S]*?<\/main>/)?.[0]
  .replace(/<span class="research-edition"[\s\S]*?<\/span>/, '')
  .replace(/\s+/g, ' ')
  .trim();
if (body(original) !== body(v2)) {
  console.error('Existing article narrative changed outside v2 modules');
  process.exit(1);
}
console.log('existing article narrative preserved');
NODE
```

Expected: exit code `0` and `existing article narrative preserved`.

- [ ] **Step 4: Commit the verified evidence layer**

```bash
git add comparison_v2/index.html
git commit -m "feat: add source anchors to comparison v2"
```

### Task 5: Add The Corpus Source Map

**Files:**
- Modify: `comparison_v2/index.html`

- [ ] **Step 1: Add the final source-map section before the existing final CTA or footer**

Use this complete source-map structure, removing an item only when its corresponding evidence or debate module was omitted after verification:

```html
<!-- V2:SOURCE-MAP:START -->
<section class="source-map" id="source-map" data-v2-only>
  <p class="eyebrow">первоисточники</p>
  <h2>Опоры из базы «Философы»</h2>
  <p>Корпуса не заменяют авторский синтез. Они дают проверяемые точки входа для углубления и сопоставления позиций.</p>
  <ul class="source-map-list">
    <li><a class="source-chip" href="https://epictetus.2pub.me">Эпиктет · Энхиридион</a><br><span>Стоицизм и стоическая практика</span></li>
    <li><a class="source-chip" href="https://confucius.2pub.me">Конфуций · Лунь юй</a><br><span>Конфуцианство и воспитание через форму</span></li>
    <li><a class="source-chip" href="https://laozi.2pub.me">Лао-цзы · Дао дэ цзин</a><br><span>Контраст ритуала и недеяния</span></li>
    <li><a class="source-chip" href="https://ignatius.2pub.me">Игнатий Лойола · Духовные упражнения</a><br><span>Христианская аскетика и испытание совести</span></li>
    <li><a class="source-chip" href="https://tolstoy.2pub.me">Лев Толстой · Исповедь</a><br><span>Кризис смысла, вера и самообман</span></li>
    <li><a class="source-chip" href="https://pascal.2pub.me">Блез Паскаль · Мысли</a><br><span>Сердце, разум и бегство от себя</span></li>
    <li><a class="source-chip" href="https://montaigne.2pub.me">Мишель де Монтень · Опыты</a><br><span>Самонаблюдение и скепсис к готовым выводам</span></li>
    <li><a class="source-chip" href="https://goethe.2pub.me">Иоганн Вольфганг Гёте · Максимы</a><br><span>Характер, мера и познание через действие</span></li>
    <li><a class="source-chip" href="https://schopenhauer.2pub.me">Артур Шопенгауэр · Афоризмы</a><br><span>Страдание, желание и ограничение</span></li>
    <li><a class="source-chip" href="https://nietzsche.2pub.me">Фридрих Ницше · По ту сторону добра и зла</a><br><span>Страдание и самопреодоление как ось спора</span></li>
    <li><a class="source-chip" href="https://larochefoucauld.2pub.me">Ларошфуко · Максимы</a><br><span>Скрытые мотивы и самообман</span></li>
    <li><a class="source-chip" href="https://adler.2pub.me">Альфред Адлер · Понимание человеческой природы</a><br><span>Цель, стиль жизни и чувство общности</span></li>
  </ul>
</section>
<!-- V2:SOURCE-MAP:END -->
```

Expected: every list item maps one used corpus to one or more existing comparison sections.

- [ ] **Step 2: Add a table-of-contents link**

Add this anchor to the existing table of contents:

```html
<a class="toc-link toc-level-1" href="#source-map">9. Опоры из первоисточников</a>
```

Expected: clicking the link scrolls to `#source-map`.

- [ ] **Step 3: Mark the local version and current update date in the footer**

Set the local page variant to:

```javascript
const PAGE_VARIANT = "comparison_v2_research";
```

Add visible footer text:

```html
<span>research edition · updated 2026-07-10</span>
```

Expected: analytics code, if locally exercised, distinguishes the v2 page without changing the production page.

### Task 6: Structural And Editorial Verification

**Files:**
- Test: `comparison_v2/index.html`
- Preserve: `comparison/index.html`

- [ ] **Step 1: Verify the old page is byte-for-byte unchanged**

Run:

```bash
shasum -a 256 -c /tmp/comparison-v2-original.sha256
```

Expected: `comparison/index.html: OK`.

- [ ] **Step 2: Verify local anchors and duplicate IDs**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
const missing = hrefs.filter(id => !ids.includes(id));
if (duplicates.length || missing.length) {
  console.error({ duplicates: [...new Set(duplicates)], missing: [...new Set(missing)] });
  process.exit(1);
}
console.log(`anchors ok: ${hrefs.length}; ids: ${ids.length}`);
NODE
```

Expected: exit code `0` and an `anchors ok` summary.

- [ ] **Step 3: Verify required and forbidden content**

Run:

```bash
rg -n 'Опоры из корпуса|Ось спора|Опоры из базы «Философы»|noindex,nofollow|comparison_v2_research' comparison_v2/index.html
! rg -ni 'franklin|smiles|hill|wattles|ford|rockefeller|lebon|james[-_ ]allen|Франклин|Смайлс|Хилл|Уоттлс|Форд|Рокфеллер|Ле Бон|Джеймс Аллен' comparison_v2/index.html
```

Expected: all required markers are found; the forbidden scan exits `0` with no output.

- [ ] **Step 4: Verify every external source link**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('comparison_v2/index.html', 'utf8');
const urls = [...new Set([...html.matchAll(/href="(https:\/\/[^\"]*2pub\.me[^\"]*)"/g)].map(m => m[1]))];
if (!urls.length) process.exit(1);
fs.writeFileSync('/tmp/comparison-v2-source-urls.txt', urls.join('\n') + '\n');
console.log(`source urls: ${urls.length}`);
NODE
while IFS= read -r url; do curl -LfsS --max-time 20 -o /dev/null "$url" || exit 1; done < /tmp/comparison-v2-source-urls.txt
```

Expected: at least one source URL and exit code `0` for all requests.

### Task 7: Browser And Responsive Verification

**Files:**
- Test: `comparison_v2/index.html`

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Expected: server remains available at `http://127.0.0.1:8765/comparison_v2/`.

- [ ] **Step 2: Inspect desktop layout at 1440 × 1100**

Open `http://127.0.0.1:8765/comparison_v2/` in the in-app browser and verify:

- hero and original article hierarchy remain intact;
- evidence modules align with the reading column;
- debate columns have equal width and no clipping;
- table of contents reaches `#source-map`;
- tables retain horizontal scrolling without moving the entire page.

Expected: no overlap, truncated labels, or unintended horizontal page overflow.

- [ ] **Step 3: Inspect mobile layout at 390 × 844**

Verify:

- evidence modules collapse and expand with native controls;
- debate axes become one column;
- source chips wrap inside their modules;
- tables scroll internally;
- no fixed element obscures article text.

Expected: all content remains readable and interactive without viewport overflow.

- [ ] **Step 4: Stop the local server and inspect the final diff**

Run:

```bash
git status --short
git diff --stat HEAD -- comparison_v2/index.html
shasum -a 256 -c /tmp/comparison-v2-original.sha256
```

Expected: only the intended v2 work is new relative to the implementation commits; the old checksum remains `OK`; no deploy command has been run.

- [ ] **Step 5: Commit any verified responsive corrections**

```bash
git add comparison_v2/index.html
git commit -m "fix: polish comparison v2 research layout"
```
