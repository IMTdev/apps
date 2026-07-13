# Stoicism and IMT Shared Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the Stoicism and IMT pair page around a shared causal core while showing how IMT expands the scope to multigenerational causality, true nature, purpose, and reproducible constructive ability.

**Architecture:** Keep the existing static single-page structure and analytics contracts. Replace competitive comparison language with a nested-coverage model, update the radar and matrix to match that model, and preserve all existing routes and CTA destinations.

**Tech Stack:** Static HTML/CSS/SVG/JavaScript, GA4/Google Ads tracking, Netlify redirects and deployment.

---

### Task 1: Define content acceptance checks

**Files:**
- Test: `comparison/stoicism-imt/index.html` through a temporary Python assertion script

- [ ] **Step 1: Run assertions for the approved phrases before editing**

```bash
python3 - <<'PY'
from pathlib import Path
s = Path('comparison/stoicism-imt/index.html').read_text()
assert 'общее причинное ядро' in s.lower()
assert 'Один процесс на разной глубине' in s
assert 'Какой глубины требует задача' in s
assert 'BID' in s
PY
```

Expected: FAIL before implementation because the approved framing is absent.

### Task 2: Rewrite the page around nested coverage

**Files:**
- Modify: `comparison/stoicism-imt/index.html`

- [ ] **Step 1: Update share metadata, structured data, visible update date, and page version**
- [ ] **Step 2: Replace the hero and short conclusion with the shared-core framing**
- [ ] **Step 3: Rework the radar as a coverage map with shared and expanded axes**
- [ ] **Step 4: Replace the roles, matrix, practice, depth, and final-formula copy**
- [ ] **Step 5: Preserve GA event names and CTA destinations while incrementing `PAGE_VARIANT`**

### Task 3: Update discovery metadata

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Set the pair page `lastmod` to `2026-07-13`**

### Task 4: Verify and publish

**Files:**
- Verify: `comparison/stoicism-imt/index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Re-run the approved content assertions and require PASS**
- [ ] **Step 2: Check local anchors, JavaScript syntax, GA contracts, and `git diff --check`**
- [ ] **Step 3: Inspect desktop and 390 px mobile layouts with no horizontal overflow or console errors**
- [ ] **Step 4: Commit only the pair page, sitemap entry, and this plan; push `main`**
- [ ] **Step 5: Deploy the apps directory to Netlify production and verify `/comparison/stoicism-imt/` returns the new copy**
