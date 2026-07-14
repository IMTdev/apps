# Christianity and IMT Pair Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a focused comparison of Christianity and the IDEAL Method Teutsch (IMT) at `/comparison/christianity-imt/`.

**Architecture:** Reuse the approved static pair-page system from `/comparison/stoicism-imt/`, while replacing its competitive framing with a careful comparison of shared causal logic, different ultimate aims, and different roles of spiritual guide and IMT consultant. Keep SEO, structured data, analytics, responsive tables, internal discovery links, and Netlify deployment consistent with the rest of `app.imt.dev`.

**Tech Stack:** Static HTML/CSS/SVG/JavaScript, Schema.org JSON-LD, GA4/Google Ads, Netlify.

---

### Task 1: Define acceptance checks

**Files:**
- Create: `scripts/validate_christianity_imt.py`

- [ ] Assert the page exists, has canonical metadata, required sections, source links, analytics contracts, and no Deep Research citation tokens.
- [ ] Run the script and confirm it fails before the page exists.

### Task 2: Build the pair page

**Files:**
- Create: `comparison/christianity-imt/index.html`

- [ ] Reuse the established visual system and responsive behavior.
- [ ] Add the shared causal core, radar, matrix, three scenarios, mentor-role distinction, IMT retraining process, limits of analogy, sources, and CTA.
- [ ] Add canonical, Open Graph, Twitter, JSON-LD, favicon, and GA4 tracking.

### Task 3: Add discovery links

**Files:**
- Modify: `comparison/index.html`
- Modify: `sitemap.xml`
- Modify: `robots.txt`
- Modify: `llms.txt`

- [ ] Add the Christianity pair to the main comparison page.
- [ ] Add the route to sitemap, robots, and the LLM knowledge map.

### Task 4: Verify presentation and publish

**Files:**
- Verify: `comparison/christianity-imt/index.html`

- [ ] Run content, HTML, anchor, JavaScript, and discovery checks.
- [ ] Inspect desktop and mobile screenshots for overflow and readability.
- [ ] Create and verify a dedicated share image.
- [ ] Deploy the apps directory to Netlify production.
- [ ] Verify the live URL and metadata.
