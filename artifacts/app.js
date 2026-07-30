import { artifacts, categories, statusLabels } from "./artifacts-data.js";

const mosaicArtifactIds = [
  "imt-2033",
  "lecture-processing-skill",
  "focus-observer",
  "article-to-video",
  "genogram-from-transcript",
  "shopping-monitor",
];

const statusColors = {
  used: "#1f5b47",
  ready: "#2b5c79",
  prototype: "#8a681e",
  experiment: "#9d4d3c",
};

const pageConfigs = {
  catalog: {
    variant: "artifacts_catalog_v1",
    funnel: "artifacts_portfolio",
    viewEvent: "artifacts_catalog_view",
    visibilityEvent: "artifacts_catalog_visible",
    engagementEvent: "artifacts_catalog_engaged_30s",
  },
  detail: {
    variant: "focus_observer_detail_v1",
    funnel: "artifacts_portfolio",
    viewEvent: "focus_observer_view",
    visibilityEvent: "focus_observer_content_visible",
    engagementEvent: "focus_observer_engaged_30s",
  },
};


export function artifactMatchesFilter(artifact, filter) {
  const categoryMatches =
    filter.category === "all" || artifact.category === filter.category;
  const readinessMatches = !filter.readyOnly || artifact.readyToShow;
  return categoryMatches && readinessMatches;
}

export function filterArtifacts(items, filter) {
  return items.filter((artifact) => artifactMatchesFilter(artifact, filter));
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function trackFunnelEvent(name, params = {}) {
  const page = document.body.dataset.page || "catalog";
  const config = pageConfigs[page];
  trackEvent(name, {
    funnel_name: config.funnel,
    page_variant: config.variant,
    ...params,
  });
}

function createPlaceholder(artifact) {
  const placeholder = element("div", "artifact-placeholder");
  const format = element(
    "span",
    "artifact-placeholder__format",
    artifact.format,
  );
  const name = element(
    "span",
    "artifact-placeholder__name",
    artifact.title,
  );
  const note = element(
    "span",
    "artifact-placeholder__note",
    "изображение будет добавлено",
  );
  placeholder.append(format, name, note);
  return placeholder;
}

function createArtifactCard(artifact, category) {
  const card = element(artifact.detailUrl ? "a" : "article", "artifact-card");
  card.dataset.category = artifact.category;

  if (artifact.detailUrl) {
    card.href = artifact.detailUrl;
    card.setAttribute("aria-label", `${artifact.title}: открыть подробную страницу`);
    card.addEventListener("click", () => {
      trackFunnelEvent("artifacts_open_detail_click", {
        artifact_id: artifact.id,
        route_destination: artifact.detailUrl,
      });
    });
  }

  const media = element("div", "artifact-media");
  if (artifact.image) {
    const image = element("img");
    image.src = artifact.image;
    image.alt = artifact.imageAlt;
    image.loading = "lazy";
    media.append(image);
  } else {
    media.append(createPlaceholder(artifact));
  }

  const body = element("div", "artifact-card__body");
  const meta = element("div", "artifact-card__meta");
  meta.append(
    element("span", "", category.label),
    element("span", "", statusLabels[artifact.status]),
  );

  if (artifact.readyToShow) {
    meta.append(element("span", "artifact-card__ready", "готов показать"));
  }

  const titleRow = element("div", "artifact-card__title-row");
  titleRow.append(element("h3", "", artifact.title));
  if (artifact.detailUrl) {
    const arrow = element("span", "artifact-card__arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    titleRow.append(arrow);
  }

  body.append(
    meta,
    titleRow,
    element("p", "artifact-card__outcome", artifact.outcome),
    element("p", "artifact-card__proof", artifact.proof),
  );
  card.append(media, body);
  return card;
}

function renderMosaic() {
  const root = document.querySelector("#artifact-mosaic");
  if (!root) return;

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const accentByName = {
    green: "var(--green)",
    blue: "var(--blue)",
    red: "var(--red)",
    violet: "var(--violet)",
    ochre: "var(--ochre)",
  };

  mosaicArtifactIds.forEach((id, index) => {
    const artifact = artifactById.get(id);
    const category = categoryById.get(artifact.category);
    const tile = element("div", "mosaic-tile");
    tile.style.setProperty("--tile-accent", accentByName[category.accent]);
    tile.append(
      element("span", "mosaic-tile__index", String(index + 1).padStart(2, "0")),
      element("span", "mosaic-tile__title", artifact.title),
    );
    root.append(tile);
  });
}

function renderLegend() {
  const root = document.querySelector("#status-legend");
  if (!root) return;

  Object.entries(statusLabels).forEach(([status, label]) => {
    const item = element("span", "status-key", label);
    item.style.setProperty("--status-color", statusColors[status]);
    root.append(item);
  });
}

function renderCatalog() {
  const sectionsRoot = document.querySelector("#artifact-sections");
  const filtersRoot = document.querySelector("#category-filters");
  const readyButton = document.querySelector("#ready-filter");
  const resultCount = document.querySelector("#result-count");
  if (!sectionsRoot || !filtersRoot || !readyButton || !resultCount) return;

  const state = {
    category: "all",
    readyOnly: false,
  };

  const filterOptions = [
    { id: "all", label: "Все" },
    ...categories.map(({ id, label }) => ({ id, label })),
  ];

  function updateButtons() {
    filtersRoot.querySelectorAll("button").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === state.category),
      );
    });
    readyButton.setAttribute("aria-pressed", String(state.readyOnly));
  }

  function updateSections() {
    sectionsRoot.replaceChildren();
    const visibleArtifacts = filterArtifacts(artifacts, state);
    resultCount.textContent = `${visibleArtifacts.length} из ${artifacts.length}`;

    categories.forEach((category, index) => {
      const categoryArtifacts = visibleArtifacts.filter(
        (artifact) => artifact.category === category.id,
      );
      if (!categoryArtifacts.length) return;

      const section = element("section", "artifact-section");
      section.dataset.accent = category.accent;
      section.setAttribute("aria-labelledby", `section-${category.id}`);

      const inner = element("div", "artifact-section__inner section-shell");
      const intro = element("div", "artifact-section__intro");
      intro.append(
        element("span", "section-index", String(index + 1).padStart(2, "0")),
      );
      const heading = element("h2", "", category.label);
      heading.id = `section-${category.id}`;
      intro.append(
        heading,
        element("p", "artifact-section__description", category.description),
      );

      const grid = element("div", "artifact-grid");
      categoryArtifacts.forEach((artifact) => {
        grid.append(createArtifactCard(artifact, category));
      });

      inner.append(intro, grid);
      section.append(inner);
      sectionsRoot.append(section);
    });
  }

  filterOptions.forEach((option) => {
    const button = element("button", "filter-button", option.label);
    button.type = "button";
    button.dataset.category = option.id;
    button.setAttribute("aria-pressed", String(option.id === state.category));
    button.addEventListener("click", () => {
      state.category = option.id;
      updateButtons();
      updateSections();
      trackFunnelEvent("artifacts_filter_select", {
        filter_category: option.id,
        ready_only: state.readyOnly,
      });
    });
    filtersRoot.append(button);
  });

  readyButton.addEventListener("click", () => {
    state.readyOnly = !state.readyOnly;
    updateButtons();
    updateSections();
    trackFunnelEvent("artifacts_ready_filter_toggle", {
      filter_category: state.category,
      ready_only: state.readyOnly,
    });
  });

  updateButtons();
  updateSections();
}

function initPageTracking() {
  const page = document.body.dataset.page || "catalog";
  const config = pageConfigs[page];
  if (!config) return;

  trackFunnelEvent(config.viewEvent);
  const visibilityTarget =
    document.querySelector("#artifact-sections") ||
    document.querySelector("#focus-content");

  if ("IntersectionObserver" in window && visibilityTarget) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        trackFunnelEvent(config.visibilityEvent);
        observer.disconnect();
      },
      { threshold: 0.1 },
    );
    observer.observe(visibilityTarget);
  }

  window.setTimeout(() => {
    trackFunnelEvent(config.engagementEvent);
  }, 30000);
}

function initDetailPage() {
  const backLink = document.querySelector("[data-back-link]");
  if (!backLink) return;
  backLink.addEventListener("click", () => {
    trackFunnelEvent("focus_observer_back_click", {
      route_destination: "/artifacts/",
    });
  });
}

function init() {
  const page = document.body.dataset.page;
  if (page === "catalog") {
    renderMosaic();
    renderLegend();
    renderCatalog();
  } else if (page === "detail") {
    initDetailPage();
  }
  initPageTracking();
}

export { artifacts, categories, statusLabels };

if (typeof document !== "undefined") {
  init();
}
