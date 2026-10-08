(() => {
  const data = window.TRIGENT_LANDING_DATA;
  if (!data?.locales) return;

  const supportedLanguages = ["en", "ja", "de", "zh", "hi"].filter((key) => data.locales[key]);
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const storedLanguage = (() => {
    try {
      return window.localStorage.getItem("trigent-language");
    } catch {
      return null;
    }
  })();
  const language = supportedLanguages.includes(requestedLanguage)
    ? requestedLanguage
    : supportedLanguages.includes(storedLanguage)
      ? storedLanguage
      : "en";
  const locale = data.locales[language];

  const all = (selector) => Array.from(document.querySelectorAll(selector));
  const one = (selector) => document.querySelector(selector);
  const setText = (selector, value) => {
    const element = one(selector);
    if (element && value !== undefined) element.textContent = value;
  };
  const setHtml = (selector, value) => {
    const element = one(selector);
    if (element && value !== undefined) element.innerHTML = value;
  };
  const setTextList = (selector, values) => {
    all(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.textContent = values[index];
    });
  };
  const setHtmlList = (selector, values) => {
    all(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.innerHTML = values[index];
    });
  };
  const setAttr = (selector, name, value) => {
    const element = one(selector);
    if (element && value !== undefined) element.setAttribute(name, value);
  };
  const setAttrList = (selector, name, values) => {
    all(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.setAttribute(name, values[index]);
    });
  };
  const setLinkLabel = (element, label, arrow) => {
    if (!element) return;
    element.replaceChildren(document.createTextNode(`${label} `));
    if (!arrow) return;
    const icon = document.createElement("span");
    icon.className = "button-arrow";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = arrow;
    element.append(icon);
  };
  const setLinkList = (selector, labels, arrows) => {
    all(selector).forEach((element, index) => setLinkLabel(element, labels[index], arrows[index]));
  };

  const renderLanguageOptions = () => {
    const menu = one("#language-menu");
    const mobileList = one(".mobile-language-list");
    if (!menu || !mobileList) return;

    menu.replaceChildren();
    mobileList.replaceChildren();

    supportedLanguages.forEach((key) => {
      const item = data.locales[key];
      const isCurrent = key === language;

      const desktopButton = document.createElement("button");
      desktopButton.className = `language-option${isCurrent ? " is-current" : ""}`;
      desktopButton.type = "button";
      desktopButton.dataset.lang = key;
      if (isCurrent) desktopButton.setAttribute("aria-current", "true");

      const code = document.createElement("span");
      code.className = "language-option-code";
      code.textContent = item.meta.code;
      const name = document.createElement("span");
      name.className = "language-option-name";
      name.textContent = item.meta.name;
      const state = document.createElement("span");
      state.className = "language-option-state";
      state.textContent = isCurrent ? locale.ui.current : "";
      desktopButton.append(code, name, state);
      menu.append(desktopButton);

      const mobileButton = document.createElement("button");
      mobileButton.className = `mobile-language-item${isCurrent ? " is-current" : ""}`;
      mobileButton.type = "button";
      mobileButton.dataset.lang = key;
      if (isCurrent) mobileButton.setAttribute("aria-current", "true");
      const mobileName = document.createElement("span");
      mobileName.textContent = item.meta.name;
      const mobileCode = document.createElement("small");
      mobileCode.textContent = item.meta.code;
      mobileButton.append(mobileName, mobileCode);
      mobileList.append(mobileButton);
    });
  };

  const selectLanguage = (nextLanguage) => {
    if (!supportedLanguages.includes(nextLanguage) || nextLanguage === language) return;
    try {
      window.localStorage.setItem("trigent-language", nextLanguage);
    } catch {
      // The URL still carries the selected language when storage is unavailable.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLanguage);
    window.location.assign(url.toString());
  };

  const applyCommonUi = () => {
    const { meta, ui } = locale;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.title = meta.pageTitle;
    setAttr('meta[name="description"]', "content", meta.pageDescription);
    setAttr('meta[property="og:description"]', "content", meta.ogDescription);
    setText(".skip-link", ui.skip);
    setAttr(".brand", "aria-label", ui.brandAria);
    setAttr(".desktop-nav", "aria-label", ui.desktopNavAria);
    setAttr(".mobile-nav", "aria-label", ui.mobileNavAria);
    setTextList(".desktop-nav > a", [ui.nav.orchestration, ui.nav.product, ui.nav.memory, ui.nav.safety, ui.nav.support, ui.nav.blog]);
    setLinkLabel(one(".header-cta"), ui.nav.github, "↗");
    setLinkList(".mobile-nav > a", [ui.nav.orchestration, ui.nav.product, ui.nav.memory, ui.nav.safety, ui.nav.support, ui.nav.blog, ui.nav.github], ["→", "→", "→", "→", "→", "→", "↗"]);
    setAttr(".menu-toggle", "aria-label", ui.menuOpen);
    setText(".language-button > span:first-child", ui.language);
    setText(".language-code", meta.code);
    setAttr("#language-menu", "aria-label", ui.languageMenu);
    setText(".mobile-language-title", ui.languagesLabel);
    setAttr(".mobile-language", "aria-label", ui.mobileLanguagesAria);
    setAttr(".media-lightbox-close", "aria-label", ui.lightboxClose);
    setAttr(".media-lightbox-close", "title", ui.lightboxTitle);

    all('a[href^="blog.html"]').forEach((link) => {
      link.href = `blog.html?lang=${language}`;
    });

    setTextList(".footer-links a", [ui.nav.github, ui.nav.blog, locale.footer.safety, locale.footer.support, locale.footer.backTop]);
  };

  const applyHero = () => {
    const copy = locale.hero;
    const status = one(".hero-status");
    const dot = status?.querySelector(".status-dot");
    if (status && dot) status.replaceChildren(dot, document.createTextNode(` ${copy.releaseLabel}`));
    setText(".hero-mark-caption", copy.markCaption);
    setHtml(".hero-tagline", `<span class="type-line" id="type-line">${locale.typePhrases[0]}</span><br>${copy.suffix}`);
    setText(".hero-note", copy.note);
    setLinkList(".hero-actions .button", copy.actions, ["↓", "↓", "↗"]);
    setAttr(".hero-stage", "aria-label", copy.stageAria);
    setAttr(".hero-stage-frame img", "alt", copy.imageAlt);
    setTextList(".signal-tag", copy.signals);
    setText(".hero-next span:first-child", copy.scroll);
    setText(".hero-next span:last-child", copy.commandCenter);
  };

  const applyManifesto = () => {
    setHtml(".manifesto-quote p", locale.manifesto.quoteHtml);
    setTextList(".manifesto-point p", locale.manifesto.descriptions);
    setAttr(".plan-requirement", "aria-label", locale.manifesto.planLabel);
    setText(".plan-requirement-label", locale.manifesto.planLabel);
    setHtml(".plan-requirement-copy", locale.manifesto.planCopyHtml);
  };

  const applyRoute = () => {
    const copy = locale.route;
    setText(".route-heading .section-kicker", copy.kicker);
    setHtml("#route-title", copy.titleHtml);
    setHtml(".route-heading .section-lead", copy.leadHtml);
    setAttr(".role-formula", "aria-label", copy.formulaAria);
    setTextList(".role-factor small", copy.formulaSmall);
    setTextList(".role-factor strong", copy.formulaStrong);
    setAttr(".intent-examples", "aria-label", copy.intentAria);
    setTextList(".intent-example q", copy.intents);
    setHtml(".route-demo-note", copy.demoNoteHtml);
    setAttr(".route-tabs", "aria-label", copy.tabsAria);
    setTextList(".route-tab", copy.tabs);
    setText(".route-mode-label", copy.modeLabel);
    const routeKey = document.createElement("span");
    routeKey.id = "route-key";
    routeKey.textContent = "SOLO";
    one(".route-mode-label")?.append(routeKey);
    setText(".route-flow-label", copy.flowLabel);
    setTextList(".agent-role strong", copy.agentRoles);
    setTextList(".agent-role span", Array(3).fill(copy.roleDefinition));
    setTextList(".agent-log-line span:last-child", copy.logs);
    setHtmlList(".agent-output", copy.outputs);
    setTextList(".agent-state", [copy.active, copy.standby, copy.standby]);
  };

  const applyConversation = () => {
    const copy = locale.conversation;
    setText(".conversation-heading .section-kicker", copy.kicker);
    setHtml("#conversation-title", copy.titleHtml);
    setText(".conversation-heading .section-lead", copy.lead);
    setAttr(".conversation-section .sr-only", "aria-label", copy.srAria);
    setTextList(".conversation-section .sr-only p", copy.messages.map((message) => `${message.name}: ${message.text}`));
    setAttr("#conversation-frame", "aria-label", copy.frameAria);
    setText(".conversation-thread", copy.thread);
    setText(".conversation-live", copy.live);
    setAttr("#conversation-replay", "aria-label", copy.replay);
    setAttr("#conversation-replay", "title", copy.replay);
    setText("#conversation-state", copy.initialState);
    setText(".direction-label", copy.directionLabel);
    setText(".direction-copy h3", copy.directionHeading);
    setText(".direction-copy > p:last-child", copy.directionCopy);
    setAttr(".direction-flow", "aria-label", copy.flowAria);
    all(".direction-step").forEach((step, index) => {
      const values = copy.steps[index];
      if (!values) return;
      step.querySelector("small").textContent = values[0];
      step.querySelector("strong").textContent = values[1];
      step.querySelector("span").textContent = values[2];
    });
    const pause = one(".direction-pause");
    const pauseIcon = pause?.querySelector(".direction-pause-icon");
    if (pause && pauseIcon) pause.replaceChildren(pauseIcon, document.createTextNode(` ${copy.pause}`));
  };

  const applyUsecases = () => {
    for (const id of ["play", "vibe"]) {
      const copy = locale[id];
      setText(`#${id} .section-kicker`, copy.kicker);
      setText(`#${id}-title`, copy.title);
      setText(`#${id} .section-lead`, copy.lead);
      setText(`#${id} .usecase-detail`, copy.detail);
      all(`#${id} .usecase-figure`).forEach((figure, index) => {
        const button = figure.querySelector("button");
        const img = figure.querySelector("img");
        img.alt = copy.images[index];
        button.setAttribute("aria-label", `${copy.zoom}: ${copy.images[index]}`);
        button.title = copy.zoom;
        button.dataset.lightboxCaption = copy.captions[index];
        figure.querySelector("figcaption").textContent = copy.captions[index];
      });
    }
  };

  const applyProduct = () => {
    const copy = locale.product;
    setText(".product-heading .section-kicker", copy.kicker);
    setText("#product-title", copy.title);
    setText(".product-heading .section-lead", copy.lead);
    setAttr("#product-demo-video", "aria-label", copy.videoAria);
    setText(".product-wide .media-caption span", copy.wideCaption);
    const triggers = all(".product-grid .media-zoom-trigger");
    if (triggers[0]) {
      triggers[0].setAttribute("aria-label", copy.canvasZoomAria);
      triggers[0].setAttribute("title", copy.zoomTitle);
      triggers[0].dataset.lightboxCaption = copy.canvasLightbox;
    }
    if (triggers[1]) {
      triggers[1].setAttribute("aria-label", copy.chatZoomAria);
      triggers[1].setAttribute("title", copy.zoomTitle);
      triggers[1].dataset.lightboxCaption = copy.chatLightbox;
    }
    setAttrList(".product-grid .media-zoom-trigger img", "alt", copy.imageAlts);
    setTextList(".product-grid .media-caption span", copy.figureCaptions);
    setText(".canvas-standard-copy h3", copy.canvasHeading);
    setText(".canvas-standard-copy p", copy.canvasCopy);
    setAttr(".canvas-standard-points", "aria-label", copy.canvasPointsAria);
    setTextList(".canvas-standard-points span", copy.canvasPoints);
    all(".proof-item").forEach((item, index) => {
      const values = copy.proof[index];
      if (!values) return;
      item.querySelector("h3").textContent = values[0];
      item.querySelector("p").textContent = values[1];
    });
  };

  const applyMemory = () => {
    const copy = locale.memory;
    setText(".memory-copy .section-kicker", copy.kicker);
    setHtml("#memory-title", copy.titleHtml);
    setHtml(".memory-copy .section-lead", copy.leadHtml);
    setHtml(".memory-system-note", copy.systemNoteHtml);
    setText(".memory-local", copy.localLabel);
    setTextList(".memory-detail-label", copy.detailLabels);
    setAttr(".memory-stack", "aria-label", copy.stackAria);
    setTextList(".memory-index", ["01", "02", "03"]);
    setTextList(".memory-description", copy.descriptions);
    setAttr(".memory-details", "aria-label", copy.detailsAria);
    all(".memory-detail").forEach((item, index) => {
      const values = copy.details[index];
      if (!values) return;
      item.querySelector("h3").innerHTML = values[0];
      item.querySelector("p").textContent = values[1];
    });
    setHtml(".memory-context h3", copy.contextHeading);
    setText(".memory-context > p", copy.contextCopy);
  };

  const applyFeatures = () => {
    const copy = locale.features;
    setText(".feature-header .section-kicker", copy.kicker);
    setText("#feature-title", copy.title);
    setText(".feature-header .section-lead", copy.lead);
    setTextList(".feature-item p", copy.descriptions);
    setHtml(".language-coverage-copy strong", copy.coverageHeadingHtml);
    setText(".language-coverage-copy > span", copy.coverageCopy);
    setAttr(".language-coverage-list", "aria-label", copy.coverageAria);
  };

  const applyPets = () => {
    const copy = locale.pets;
    setText("#pets-title", copy.title);
    setText(".pets-copy .section-lead", copy.lead);
    setAttr(".pet-badges", "aria-label", copy.badgesAria);
    setTextList(".pet-badge", copy.badges);
    setAttr(".pet-lineup", "aria-label", copy.lineupAria);
    setAttrList(".lineup-pet", "aria-label", copy.petAria);
    setAttr(".pets-visual", "aria-label", copy.visualAria);
    setTextList(".pet-status span", copy.status);
  };

  const applySafety = () => {
    const copy = locale.safety;
    setText(".safety-copy .section-kicker", copy.kicker);
    setHtml("#safety-title", copy.titleHtml);
    setText(".safety-copy .section-lead", copy.lead);
    setTextList(".safety-check", copy.labels);
    setTextList(".safety-row dd", copy.descriptions);
  };

  const applyOriginality = () => {
    const copy = locale.originality;
    setText(".originality-heading .section-kicker", copy.kicker);
    setHtml("#originality-title", copy.titleHtml);
    setText(".originality-context", copy.context);
    setText(".originality-statement-label", copy.statementLabel);
    setText(".originality-claim", copy.claim);
    setText(".originality-statement-copy > strong", copy.local);
    setText(".originality-note", copy.note);
    setText(".originality-definition-label", copy.definitionLabel);
    setHtml(".originality-definition-copy h3", copy.definitionHeadingHtml);
    setText(".originality-definition-copy p", copy.definitionCopy);
    setAttr(".originality-points", "aria-label", copy.pointsAria);
    all(".originality-point").forEach((item, index) => {
      const values = copy.points[index];
      if (!values) return;
      item.querySelector("h4").textContent = values[0];
      item.querySelector("p").textContent = values[1];
    });
    setText(".originality-origin-label", copy.originLabel);
    setText(".originality-origin strong", copy.originHeading);
    setText(".originality-origin p", copy.originCopy);
  };

  const applyResearch = () => {
    const copy = locale.research;
    setText(".research-copy .section-kicker", copy.kicker);
    setText("#research-title", copy.title);
    setText(".research-copy .section-lead", copy.lead);
    setText(".research-emphasis", copy.emphasis);
    setText(".research-boundary", copy.boundary);
    all(".research-fact").forEach((item, index) => {
      const values = copy.facts[index];
      if (!values) return;
      item.querySelector("h3").textContent = values[0];
      item.querySelector("p").innerHTML = values[1];
    });
  };

  const applySupport = () => {
    const copy = locale.support;
    setText(".support-intro .section-kicker", copy.kicker);
    setHtml("#support-title", copy.titleHtml);
    setHtml(".support-message", copy.messageHtml);
    setText(".support-actions .is-disabled", copy.sponsorPending);
    setLinkLabel(one(".support-actions a"), copy.githubPolicy, "↗");
    setText(".support-impact-heading h3", copy.impactHeading);
    setText(".support-impact-heading p", copy.impactCopy);
    setAttr(".support-metrics", "aria-label", copy.metricsAria);
    const standardMetrics = all(".support-metric:not(.support-metric--lifework)");
    standardMetrics.forEach((item, index) => {
      const values = copy.metrics[index];
      if (!values) return;
      item.querySelector(".support-metric-label").textContent = copy.metricLabels[index];
      item.querySelector("strong").textContent = values[0];
      item.querySelector("small").textContent = values[1];
    });
    setText(".support-metric--lifework .support-metric-label", copy.lifeworkLabel);
    setHtml(".support-metric--lifework strong", copy.lifeworkHeadingHtml);
    setHtml(".support-lifework-copy", copy.lifeworkCopyHtml);
    setText(".supporter-heading h3", copy.supporterHeading);
    setText(".supporter-heading p", copy.supporterCopy);
    setAttr(".supporter-wall", "aria-label", copy.supporterAria);
    all(".supporter-tier").forEach((item, index) => {
      const values = copy.tiers[index];
      if (!values) return;
      item.querySelector(".supporter-tier-label").textContent = values[0];
      item.querySelector("h4").textContent = values[1];
      item.querySelector("p").textContent = values[2];
    });
  };

  const applyCta = () => {
    const copy = locale.cta;
    setHtml("#cta-title", copy.titleHtml);
    setText(".cta-main > p", copy.copy);
    setLinkList(".cta-actions .button", copy.actions, ["↗", "↑"]);
    setAttr(".requirements", "aria-label", copy.requirementsAria);
    setTextList(".requirement small", copy.requirementCopy);
  };

  applyCommonUi();
  applyHero();
  applyManifesto();
  applyRoute();
  applyConversation();
  applyUsecases();
  applyProduct();
  applyMemory();
  applyFeatures();
  applyPets();
  applySafety();
  applyOriginality();
  applyResearch();
  applySupport();
  applyCta();
  renderLanguageOptions();

  one("#language-menu")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (button) selectLanguage(button.dataset.lang);
  });
  one(".mobile-language-list")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (button) selectLanguage(button.dataset.lang);
  });

  window.TRIGENT_I18N = { language, locale, selectLanguage };
})();
