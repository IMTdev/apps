export function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function roundTenth(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function formatHours(value) {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value)} ч`;
}

export function calculateRestartCost({ dialogs, minutes }) {
  const boundedDialogs = clamp(dialogs, 1, 30);
  const boundedMinutes = clamp(minutes, 5, 120);
  const monthlyHours = roundTenth((boundedDialogs * boundedMinutes) / 60);
  const yearlyHours = roundTenth(
    (boundedDialogs * boundedMinutes * 12) / 60,
  );

  return {
    dialogs: boundedDialogs,
    minutes: boundedMinutes,
    monthlyHours,
    yearlyHours,
    monthlyLabel: formatHours(monthlyHours),
    yearlyLabel: formatHours(yearlyHours),
  };
}

const PAGE_VARIANT = "codex_intensive_aug28_v1";
const FUNNEL_NAME = "codex_intensive_aug28";
const SESSION_ROUTE_KEY = "codex_aug28_route";
const RECOGNITION_KEY = "codex_aug28_recognition";

const demoData = {
  plan: {
    tabId: "tab-plan",
    episode: "«План на день сорвался — и вместе с ним будто сломался я».",
    fact: "Одна встреча заняла больше времени, чем ожидалось.",
    reaction: "Если маршрут нарушен, день и моя ценность потеряны.",
    context:
      "Триггер, телесную реакцию, прежнее правило и факты, которые ему противоречат.",
    choice:
      "Пересобрать следующий живой шаг, не превращая план в хозяина состояния.",
    boundary:
      "AI возвращает карту эпизода и задаёт следующий вопрос. Выбор и проверка в жизни остаются за человеком.",
  },
  system: {
    tabId: "tab-system",
    episode:
      "«Я снова улучшаю папки и правила, хотя уже знаю, какое действие важно».",
    fact: "На настройку системы ушёл вечер, а выбранный шаг не был сделан.",
    reaction:
      "Сначала нужно построить идеальный контур — только потом можно действовать.",
    context:
      "Что уже известно, где настройка стала защитой и какой минимальный артефакт действительно нужен.",
    choice:
      "Остановить настройку и сделать один ограниченный шаг, которому система уже может служить.",
    boundary:
      "AI не решает, когда система стала избеганием. Он сопоставляет действие с заранее записанным критерием результата.",
  },
  rating: {
    tabId: "tab-rating",
    episode:
      "«После чужой оценки я перестал доверять своей работе, хотя факты не изменились».",
    fact:
      "Один человек дал резкую обратную связь; другие данные о результате остались прежними.",
    reaction:
      "Внешняя оценка автоматически становится окончательной правдой обо мне.",
    context:
      "Слова человека, наблюдаемые факты, собственный стандарт и прежние решения в похожих эпизодах.",
    choice:
      "Отделить полезный сигнал от приговора и проверить работу по своим явным критериям.",
    boundary:
      "AI помогает удержать несколько источников данных, но не назначает человеку ценность и не выносит психологический диагноз.",
  },
};

function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}

function trackFunnelEvent(name, params = {}) {
  trackEvent(name, {
    funnel_name: FUNNEL_NAME,
    page_variant: PAGE_VARIANT,
    ...params,
  });
}

function initCalculator() {
  const dialogs = document.querySelector("#dialogs");
  const minutes = document.querySelector("#restart-minutes");
  const dialogsValue = document.querySelector("#dialogs-value");
  const minutesValue = document.querySelector("#minutes-value");
  const monthlyHours = document.querySelector("#monthly-hours");
  const yearlyHours = document.querySelector("#yearly-hours");

  if (
    !dialogs ||
    !minutes ||
    !dialogsValue ||
    !minutesValue ||
    !monthlyHours ||
    !yearlyHours
  ) {
    return;
  }

  let trackingTimer;
  const render = ({ track = false } = {}) => {
    const result = calculateRestartCost({
      dialogs: dialogs.value,
      minutes: minutes.value,
    });

    dialogsValue.textContent = String(result.dialogs);
    minutesValue.textContent = `${result.minutes} мин`;
    monthlyHours.textContent = result.monthlyLabel;
    yearlyHours.textContent = result.yearlyLabel;

    if (track) {
      window.clearTimeout(trackingTimer);
      trackingTimer = window.setTimeout(() => {
        trackFunnelEvent("codex_aug28_calculator_change", {
          dialogs: result.dialogs,
          restart_minutes: result.minutes,
          monthly_hours: result.monthlyHours,
          yearly_hours: result.yearlyHours,
        });
      }, 350);
    }
  };

  dialogs.addEventListener("input", () => render({ track: true }));
  minutes.addEventListener("input", () => render({ track: true }));
  render();
}

function initDemo() {
  const tabs = Array.from(document.querySelectorAll("[data-demo]"));
  const panel = document.querySelector("#demo-panel");
  const fields = {
    episode: document.querySelector("#demo-episode"),
    fact: document.querySelector("#demo-fact"),
    reaction: document.querySelector("#demo-reaction"),
    context: document.querySelector("#demo-context"),
    choice: document.querySelector("#demo-choice"),
    boundary: document.querySelector("#demo-boundary"),
  };

  if (!tabs.length || !panel || Object.values(fields).some((field) => !field)) {
    return;
  }

  const selectDemo = (key, { focus = false, track = true } = {}) => {
    const demo = demoData[key];
    if (!demo) return;

    tabs.forEach((tab) => {
      const selected = tab.dataset.demo === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    panel.setAttribute("aria-labelledby", demo.tabId);
    Object.entries(fields).forEach(([field, node]) => {
      node.textContent = demo[field];
    });

    panel.classList.remove("is-changing");
    window.requestAnimationFrame(() => panel.classList.add("is-changing"));

    if (track) {
      trackFunnelEvent("codex_aug28_demo_select", {
        demo_id: key,
      });
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectDemo(tab.dataset.demo));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      selectDemo(tabs[nextIndex].dataset.demo, { focus: true });
    });
  });

  selectDemo("plan", { track: false });
}

function readRecognitions() {
  try {
    const stored = window.localStorage.getItem(RECOGNITION_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeRecognitions(recognitions) {
  try {
    window.localStorage.setItem(
      RECOGNITION_KEY,
      JSON.stringify(Array.from(recognitions)),
    );
  } catch {
    // Local feedback is optional; the page remains functional without storage.
  }
}

function initRecognition() {
  const buttons = Array.from(document.querySelectorAll("[data-recognition]"));
  const selected = readRecognitions();

  const renderButton = (button) => {
    const isSelected = selected.has(button.dataset.recognition);
    button.setAttribute("aria-pressed", String(isSelected));
    const action = button.querySelector(".recognition-action");
    if (action) action.textContent = isSelected ? "Отмечено у меня" : "Это про меня";
  };

  buttons.forEach((button) => {
    renderButton(button);
    button.addEventListener("click", () => {
      const key = button.dataset.recognition;
      if (selected.has(key)) selected.delete(key);
      else selected.add(key);
      writeRecognitions(selected);
      renderButton(button);
      trackFunnelEvent("codex_aug28_recognition_click", {
        recognition_id: key,
        selected: selected.has(key),
        selected_total: selected.size,
      });
    });
  });
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  elements.forEach((element) => observer.observe(element));
}

function observeSection(selector, eventName) {
  const section = document.querySelector(selector);
  if (!section || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackFunnelEvent(eventName, { section_name: selector.replace("#", "") });
      observer.disconnect();
    },
    { threshold: 0.25 },
  );

  observer.observe(section);
}

function initApplyTracking() {
  document.querySelectorAll(".js-apply").forEach((cta) => {
    cta.addEventListener("click", () => {
      const placement = cta.dataset.placement || "unknown";
      try {
        window.sessionStorage.setItem(
          SESSION_ROUTE_KEY,
          JSON.stringify({
            route_destination: "telegram_contact",
            source_page: "codex_intensive_aug28",
            source_cta_id: cta.id,
            placement,
            ts: Date.now(),
          }),
        );
      } catch {
        // Tracking context is optional and never blocks the CTA.
      }

      trackFunnelEvent("codex_aug28_apply_click", {
        cta_id: cta.id,
        placement,
        route_destination: "telegram_contact",
      });
      trackEvent("select_content", {
        content_type: "codex_intensive_route",
        item_id: "telegram_contact",
        cta_id: cta.id,
        placement,
        funnel_name: FUNNEL_NAME,
        page_variant: PAGE_VARIANT,
      });
    });
  });
}

function initPage() {
  trackFunnelEvent("codex_aug28_view", {
    step_name: "page_view",
    step_index: 1,
  });
  trackEvent("codex_aug28_page_view", {
    funnel_name: FUNNEL_NAME,
    page_variant: PAGE_VARIANT,
  });

  initCalculator();
  initDemo();
  initRecognition();
  initReveal();
  initApplyTracking();

  observeSection("#restart-calculator", "codex_aug28_calculator_visible");
  observeSection("#program", "codex_aug28_program_visible");

  window.setTimeout(() => {
    trackFunnelEvent("codex_aug28_engaged_45s", {
      engaged_seconds: 45,
    });
  }, 45000);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage, { once: true });
  } else {
    initPage();
  }
}
