document.addEventListener("DOMContentLoaded", () => {
  const data = window.caseData;
  if (!data) return;

  const mainRoot = document.querySelector("#main-root");
  const sidebarRoot = document.querySelector("#sidebar-root");
  if (!mainRoot || !sidebarRoot) return;

  const descriptionEl = document.querySelector('meta[name="description"]');
  const caseAsset = (window.caseAssets && window.caseAssets[data.meta.caseId]) || {
    svg: "lp-patterns-focus.svg",
    alt: "Визуальная метафора кейса",
    lp: "",
    lpLabel: "",
  };

  const transitionOverrides = {
    "CASE-DIGNITY-RATING-01": {
      beforeText:
        "Один комментарий или пост могли выбить клиента из фокуса на часы: тишина и спор читались как диагноз собственной ценности.",
      beforeMetrics: [
        "Критерий: лайки и общий отклик",
        "После публикации: сомнение в себе",
        "Язык подстраивается под массовое одобрение",
      ],
      afterText:
        "Публикация перестала быть экзаменом на достоинство: важен не шум, а попадание в нужных людей и созидательный эффект сообщения.",
      afterMetrics: [
        "Критерий: живой эффект на адресата",
        "Даже один точный отклик считается попаданием",
        "Язык выбирается под цель, а не под лайки",
      ],
    },
    "CASE-SYSTEM-INSTEAD-SELF-01": {
      beforeText:
        "Система росла быстрее, чем собственное применение: бот, кабинет и инфраструктура расширялись, а личная практика снова откладывалась.",
      beforeMetrics: [
        "Новые инструменты: да",
        "Применение к себе: запаздывает",
        "Рост ощущается как обслуживание системы",
      ],
      afterText:
        "Инструменты включаются только там, где реально ускоряют понимание и применение, а не подменяют собой рост жизни.",
      afterMetrics: [
        "Сначала применение, потом автоматизация",
        "Лишние ветки режутся раньше",
        "Жизнеспособность растет вместе с системой",
      ],
    },
    "CASE-PLAN-IDOL-01": {
      beforeText:
        "Два-три бытовых сбоя могли сломать весь день: маршрут срывался и вместе с ним срывалось ощущение нормальной жизни.",
      beforeMetrics: [
        "Сбой = раздражение и язвительность",
        "Цена: напряжение в близких отношениях",
        "Цель дня: дойти любой ценой",
      ],
      afterText:
        "Маршрут перестал быть хозяином дня: даже при сбое клиент возвращает фокус на любовь и не отдает ей всю внутреннюю власть.",
      afterMetrics: [
        "Сбой = сигнал к перенастройке",
        "Больше гибкости в дороге и быту",
        "Цель дня: сохранить жизнь по пути",
      ],
    },
    "CASE-REALIZATION-FLAG-01": {
      beforeText:
        "Как только начиналась реализация, клиент выпадал из процесса: оставались флажок, перегруз и потеря себя внутри выполнения.",
      beforeMetrics: [
        "Много веток одновременно",
        "К концу шага: истощение",
        "Главный критерий: закрыть флажок",
      ],
      afterText:
        "Реализация стала местом присутствия, а не коридором самопотери: шаг заканчивается не только выполнением, но и чувством живого участия.",
      afterMetrics: [
        "Лишние ветки срезаются раньше",
        "Шаг заканчивается с чувством присутствия",
        "Главный критерий: больше жизни в процессе",
      ],
    },
    "CASE-RIGHT-PLAN-01": {
      beforeText:
        "План выглядел правильно, но быстро высушивал энергию и запускал новый цикл перерисовки вместо реального движения.",
      beforeMetrics: [
        "Старт от результата и внешней логики",
        "Через время: выжатость и пустота",
        "Итог: новый план вместо шага",
      ],
      afterText:
        "План собирается вокруг живого импульса и дольше держит движение, потому что в нем снова появился сам клиент, а не только правильная схема.",
      afterMetrics: [
        "Старт от внутреннего «хочу»",
        "Маршрут уточняется по факту движения",
        "Меньше перезапусков похожих схем",
      ],
    },
    "CASE-FEEDBACK-TRUTH-01": {
      beforeText:
        "Одна внешняя оценка могла переписать всю картину себя и на время обнулить факты доверия, качества и реальной пользы клиента.",
      beforeMetrics: [
        "Опора: чужой вердикт",
        "После критики: провал в самоценности",
        "Талант уходит в режим «докажи»",
      ],
      afterText:
        "Внешняя оценка перестала быть окончательной правдой: клиент удерживает факты доверия и собственный стандарт качества без внутреннего коллапса.",
      afterMetrics: [
        "Опора: сильные факты доверия",
        "Стандарт качества держится изнутри",
        "Энергия возвращается в живую работу",
      ],
    },
    "CASE-GIVE-RESULT-01": {
      beforeText:
        "Каждая встреча или помощь легко превращались в контракт дотащить другого до результата любой ценой, даже через собственное выгорание.",
      beforeMetrics: [
        "Моя помощь = мой долг за чужой итог",
        "Цена: контроль и делание через силу",
        "Чужой шаг тащится на себе",
      ],
      afterText:
        "Клиентка передает понимание и пространство, а не живет чужую жизнь за человека. От этого помощь стала и точнее, и легче.",
      afterMetrics: [
        "Граница ответственности видна раньше",
        "Меньше делания через силу",
        "Передача остается живой, а не карательной",
      ],
    },
    "CASE-NEGATIVITY-DRAIN-01": {
      beforeText:
        "Тяжелый разговор выбрасывал из жизни на десятки минут и оставлял длинный шлейф злости, вины и потери рабочего ритма.",
      beforeMetrics: [
        "После контакта: потерянное внимание",
        "Чужой тон становится моим состоянием",
        "Рабочий ритм срывается",
      ],
      afterText:
        "Чужой негатив больше не получает права диктовать весь день: контакт проходит через границу, а не через автоматическое заражение.",
      afterMetrics: [
        "Шлейф после контакта короче",
        "Разговор разворачивается раньше",
        "Возврат в свои задачи быстрее",
      ],
    },
    "CASE-PERMISSION-REST-01": {
      beforeText:
        "Даже болезнь и явное истощение не считались достаточной причиной остановиться, пока отдых не был одобрен кем-то снаружи.",
      beforeMetrics: [
        "Отдых без санкции невозможен",
        "Перегруз копится дольше нужного",
        "Забота о себе запускает вину",
      ],
      afterText:
        "Остановка происходит раньше, чем срыв: клиентка слышит сигнал изнутри и не ждет, пока право на себя подпишет внешний авторитет.",
      afterMetrics: [
        "Сигнал тела слышится раньше",
        "Нагрузка снижается без драмы",
        "День строится от внутреннего ресурса",
      ],
    },
    "CASE-PRICE-SHAME-01": {
      beforeText:
        "Клуб уже открыт и людям интересно, но цена не названа: оффер зависает, а вопрос оплаты превращается в стыд и самозанижение.",
      beforeMetrics: [
        "Цена не назначена",
        "Оффер не собран",
        "Оплата тормозится внутренним стыдом",
      ],
      afterText:
        "Цена названа, участие структурировано, люди могут спокойно оплачивать справедливую стоимость, а сама оплата перестает быть унижением.",
      afterMetrics: [
        "Базовая цена удерживается",
        "Оффер собирается без ступора",
        "Предоплата становится нормой участия",
      ],
    },
    "CASE-CLUB-IMPULSE-01": {
      beforeText:
        "Идея клуба разгоралась и почти сразу гасла под внутренним советом директоров, который требовал гарантий, безошибочности и вечной подписки на будущее.",
      beforeMetrics: [
        "Живой импульс есть, но он быстро душится",
        "Старт зависает на гарантиях и расчете",
        "Идея не получает первый шаг",
      ],
      afterText:
        "Идея получила право на пилот без клятвы на вечность: разум оформляет формат, а не отменяет сам импульс до начала действия.",
      afterMetrics: [
        "Формат можно запускать как опыт",
        "Разум помогает, а не судит",
        "Первый шаг появляется раньше",
      ],
    },
    "CASE-CAN-MUST-01": {
      beforeText:
        "Любая компетентность автоматически превращалась в обязанность тащить. Сила клиента читалась как бессрочный контракт на чужие задачи.",
      beforeMetrics: [
        "Умею = должна",
        "Чужие просьбы садятся сверху",
        "Итог: злость, вина, ступор",
      ],
      afterText:
        "Способность перестала быть приговором: помощь проходит через согласие и различение, а не через автоматическое самопожертвование.",
      afterMetrics: [
        "Сначала согласие, потом помощь",
        "Чужая ответственность различается яснее",
        "Меньше самопотери к концу дня",
      ],
    },
    "CASE-TIME-BELONGS-01": {
      beforeText:
        "Один незапланированный звонок мог разорвать рабочий блок и украсть несколько часов фокуса вместе с внутренним спокойствием.",
      beforeMetrics: [
        "Фокус рвется входящими",
        "Ответить нужно сразу",
        "Границы приходят поздно, через раздражение",
      ],
      afterText:
        "Коммуникация подчиняется ритму клиентки, а не наоборот: помощь остается, но мгновенная доступность перестает быть обязательной нормой.",
      afterMetrics: [
        "Больше асинхрона и заранее заданных рамок",
        "Рабочие блоки сохраняются чаще",
        "Контакт остается конструктивным без самосрыва",
      ],
    },
  };

  document.title = data.meta.title;
  if (descriptionEl) descriptionEl.setAttribute("content", data.meta.description);

  const renderList = (items) =>
    `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

  const renderMetricList = (items) =>
    items && items.length
      ? `<ul class="compare-metrics">${items
          .map((item) => `<li>${item}</li>`)
          .join("")}</ul>`
      : "";

  const renderPanel = (panel) => {
    const softClass = panel.soft ? " panel-soft" : "";
    const items = panel.items && panel.items.length ? renderList(panel.items) : "";
    const text = panel.text ? `<p>${panel.text}</p>` : "";
    const text2 = panel.text2 ? `<p>${panel.text2}</p>` : "";
    const callout = panel.callout
      ? `
        <div class="callout inner-callout callout-soft">
            <div class="callout-title">Инвариант Cloud OS</div>
            ${panel.callout.text}
        </div>
      `
      : "";

    return `
      <article class="panel accent-panel${softClass}">
          <h3>${panel.title}</h3>
          ${text}
          ${text2}
          ${items}
          ${callout}
      </article>
    `;
  };

  const renderQuoteGrid = (quotes) => `
    <div class="quote-grid">
      ${quotes
        .map(
          (quote) => `
            <article class="quote-card quote-soft">
                <span class="quote-role">Цитаты клиента</span>
                <blockquote>${quote}</blockquote>
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  const renderHero = () => `
    <header class="doc-header" id="hero">
        <div class="hero-copy">
            <div class="meta-row">
                <span class="meta-tag">case: ${data.meta.caseId}</span>
                <span class="meta-tag">based on summary: ${data.meta.basedOn}</span>
                <span class="meta-tag">read time: ${data.meta.readTime}</span>
            </div>
            <h1>${data.meta.pageTitle}</h1>
            <p class="summary">${data.hero.summary}</p>
            <ul class="hero-lines">
                ${data.hero.lines
                  .map(
                    (line) => `
                    <li><span class="k">${line.k}</span><span>${line.v}</span></li>
                `,
                  )
                  .join("")}
            </ul>
        </div>
        <div class="hero-metaphor" aria-hidden="true">
            <img src="../svg/${caseAsset.svg}" alt="${caseAsset.alt}">
        </div>
        <div class="quick-specs">
            ${data.hero.specs
              .map(
                (spec) => `
                <div class="spec spec-soft">
                    <div class="spec-label">${spec.label}</div>
                    <div class="spec-value">${spec.value}</div>
                </div>
            `,
              )
              .join("")}
        </div>
    </header>
  `;

  const renderStimulus = () => {
    const section = data.sections.stimulus;
    return `
      <section class="timeline-step tone-red" id="stimulus">
          <div class="step-shell">
              <p class="step-kicker">Начальный стимул-реакция</p>
              <h2>${section.title}</h2>
              <p class="section-intro">${section.intro}</p>
              <div class="two-col">
                  ${section.panels.map(renderPanel).join("")}
              </div>
              <div class="callout tone-callout">
                  <div class="callout-title">${section.callout.title}</div>
                  ${section.callout.text}
              </div>
              ${renderQuoteGrid(section.quotes)}
          </div>
      </section>
    `;
  };

  const renderConsultation = () => {
    const section = data.sections.consultation;
    return `
      <section class="timeline-step tone-slate" id="consultation">
          <div class="step-shell">
              <p class="step-kicker">Консультация</p>
              <h2>${section.title}</h2>
              <p class="section-intro">${section.intro}</p>
              <div class="detail-grid">
                  ${section.panels.map(renderPanel).join("")}
              </div>
          </div>
      </section>
    `;
  };

  const renderSupport = () => {
    const section = data.sections.support;
    return `
      <section class="timeline-step tone-amber" id="support">
          <div class="step-shell">
              <p class="step-kicker">Сопровождение и новая привычка</p>
              <h2>${section.title}</h2>
              <p class="section-intro">${section.intro}</p>
              <div class="two-col">
                  ${section.panels.map(renderPanel).join("")}
              </div>
              ${renderQuoteGrid(section.quotes)}
          </div>
      </section>
    `;
  };

  const renderTraining = () => {
    const section = data.sections.training;
    return `
      <section class="timeline-step tone-blue" id="training">
          <div class="step-shell">
              <p class="step-kicker">Обучение</p>
              <h2>${section.title}</h2>
              <p class="section-intro">${section.intro}</p>
              <div class="detail-grid">
                  ${section.panels.map(renderPanel).join("")}
              </div>
          </div>
      </section>
    `;
  };

  const renderResult = () => {
    const section = data.sections.result;
    const override = transitionOverrides[data.meta.caseId] || {};
    const beforeText = override.beforeText || section.before;
    const afterText = override.afterText || section.after;

    return `
      <section class="timeline-step tone-green" id="result">
          <div class="step-shell">
              <p class="step-kicker">Новый стимул-реакция и результат</p>
              <h2>${section.title}</h2>
              <p class="section-intro">${section.intro}</p>
              <div class="before-after">
                  <div class="compare-card compare-before">
                      <span class="compare-label">До</span>
                      <p class="compare-text">${beforeText}</p>
                      ${renderMetricList(override.beforeMetrics)}
                  </div>
                  <div class="compare-arrow" aria-hidden="true">→</div>
                  <div class="compare-card compare-after">
                      <span class="compare-label">После</span>
                      <p class="compare-text">${afterText}</p>
                      ${renderMetricList(override.afterMetrics)}
                  </div>
              </div>
              <div class="two-col result-panels">
                  ${section.panels.map(renderPanel).join("")}
              </div>
              <div class="callout tone-callout callout-soft">
                  <div class="callout-title">${section.callout.title}</div>
                  ${section.callout.text}
              </div>
          </div>
      </section>
    `;
  };

  const renderCta = () => `
    <section class="section" id="next-step">
        <h2>${data.cta.title}</h2>
        <p class="section-intro">${data.cta.intro}</p>
        <div class="meta-row">
            <a class="btn btn-secondary" href="${data.cta.secondary.url}" target="_blank" rel="noopener noreferrer">${data.cta.secondary.label}</a>
            <a class="btn btn-primary" href="${data.cta.primary.url}" target="_blank" rel="noopener noreferrer">${data.cta.primary.label}</a>
        </div>
    </section>
  `;

  mainRoot.innerHTML = `
    ${renderHero()}
    <div class="storyline">
      ${renderStimulus()}
      ${renderConsultation()}
      ${renderSupport()}
      ${renderTraining()}
      ${renderResult()}
    </div>
    ${renderCta()}
  `;

  sidebarRoot.innerHTML = `
    <article class="summary-card">
        <h3>Короткая карта кейса</h3>
        ${data.sidebar.summary
          .map((line) => `<div class="summary-line"><strong>${line.label}:</strong> ${line.value}</div>`)
          .join("")}
    </article>

    <nav class="toc-card">
        <h3>Оглавление</h3>
        <ul id="toc">
            <li><a href="#hero">О кейсе</a></li>
            <li><a href="#stimulus">Начальный стимул-реакция</a></li>
            <li><a href="#consultation">Консультация</a></li>
            <li><a href="#support">Сопровождение</a></li>
            <li><a href="#training">Обучение</a></li>
            <li><a href="#result">Новый результат</a></li>
        </ul>
    </nav>
  `;

  const links = Array.from(document.querySelectorAll("#toc a"));
  const targets = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
  };

  const updateTocOnScroll = () => {
    const threshold = 160;
    let current = targets[0] ? targets[0].id : "";

    targets.forEach((target) => {
      const top = target.getBoundingClientRect().top;
      if (top <= threshold) current = target.id;
    });

    if (current) setActive(current);
  };

  window.addEventListener("scroll", updateTocOnScroll, { passive: true });
  window.addEventListener("resize", updateTocOnScroll);
  updateTocOnScroll();
});
