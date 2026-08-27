// Router + view rendering. Hash-based routing (#/recipes, #/recipe/<id>, #/tips, #/tip/<id>, #/favorites, #/shopping).

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3];
const ML_UNITS = new Set(["tsp", "tbsp", "cup", "cups"]);

let toastTimer = null;

function showToast(message, action) {
  const el = document.getElementById("toast");
  el.innerHTML = "";
  const span = document.createElement("span");
  span.textContent = message;
  el.appendChild(span);
  if (action) {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    btn.addEventListener("click", action.run);
    el.appendChild(btn);
  }
  el.dataset.visible = "true";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.dataset.visible = "false"; }, 3200);
}

function iconHeart(filled) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.2 4.5 6 4.5c2 0 3.6 1.1 4.5 2.7C11.4 5.6 13 4.5 15 4.5c3.8 0 5.6 3.6 4 7.2C19.5 16.4 12 21 12 21z" ${filled ? "" : "fill-opacity=\"0\""}/></svg>`;
}
function iconCheck() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`; }
function iconBack() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>`; }
function iconChef() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21h12M8 21V13a4 4 0 018 0v8M4 10a4 4 0 014-4c.3-1.7 1.8-3 3.8-3S15.7 4.3 16 6a4 4 0 014 4c0 1.5-.9 2.7-2.1 3.3"/></svg>`; }

/** Recipe card image slot — omitted entirely when the recipe has no photo yet
 * (the `image` field is reserved but not yet populated for any recipe), so
 * cards render compact instead of reserving empty placeholder space. Once a
 * recipe gets a real `image`, only that card switches to the photo layout. */
function recipeCardMedia(recipe, extra) {
  if (!recipe.image) return "";
  return `<div class="recipe-card__media">${iconChef()}${extra || ""}</div>`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function highlight(text, query) {
  if (!query) return esc(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return esc(text);
  return `${esc(text.slice(0, idx))}<mark>${esc(text.slice(idx, idx + query.length))}</mark>${esc(text.slice(idx + query.length))}`;
}

// ---------------------------------------------------------------- Ingredient formatting

function ingredientLine(ing, multiplier, lang) {
  const scaledAmount = scaleAmount(ing.amount, multiplier);
  const scaledConv = scaleAmount(ing.amount_conv, multiplier);
  let amtHtml;
  if (scaledAmount == null) {
    amtHtml = "";
  } else if (scaledConv != null) {
    amtHtml = `${formatWeightVolume(scaledConv, ing.unit_conv)}<span class="amt-sub">${formatAmount(scaledAmount)} ${esc(ing.unit)}</span>`;
  } else if (ing.unit === "g" || ing.unit === "ml") {
    amtHtml = formatWeightVolume(scaledAmount, ing.unit);
  } else {
    amtHtml = `${formatAmount(scaledAmount)}${ing.unit ? " " + esc(ing.unit) : ""}`;
  }
  const nameClass = scaledAmount == null ? "name name--no-qty" : "name";
  return `<li><span class="${nameClass}">${esc(ing.name)}</span><span class="amt">${amtHtml}</span></li>`;
}

/** Renders the full ingredient list, grouping consecutive ingredients under the same
 * `section` (e.g. "Dough", "Frosting") with a heading — recipes with multiple parts
 * would otherwise show one flat list where a name like "sugar" appearing 4 times
 * looks like a duplicate instead of 4 separate amounts for 4 separate parts. */
function renderIngredientList(ingredients, multiplier, lang) {
  let html = "";
  let currentSection = undefined;
  for (const ing of ingredients) {
    if (ing.section !== currentSection) {
      currentSection = ing.section;
      if (currentSection) html += `<li class="ingredient-section">${esc(currentSection)}</li>`;
    }
    html += ingredientLine(ing, multiplier, lang);
  }
  return html;
}

function scaleStepText(text, multiplier) {
  return text.replace(/\{\{amount:([\d.]+)\}\}/g, (_, num) => {
    const scaled = parseFloat(num) * multiplier;
    const rounded = Math.round(scaled * 10) / 10;
    return `<mark>${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}</mark>`;
  });
}

// ---------------------------------------------------------------- Views

function view404(lang) {
  return `<div class="empty-state"><h2>${t(lang, "noResults")}</h2></div>`;
}

const NAV_LINKS = [
  { href: "#/recipes", key: "navRecipes", match: (r) => r.name === "recipes" || r.name === "recipe" },
  { href: "#/tips", key: "navTips", match: (r) => r.name === "tips" || r.name === "tip" },
  { href: "#/favorites", key: "navFavorites", match: (r) => r.name === "favorites" },
  { href: "#/about", key: "navAbout", match: (r) => r.name === "about" },
  // Shopping list hidden from nav for now — route still works (linked from recipe pages), just not
  // promoted in the main menu yet.
];

function themeIconSvg(theme) {
  return theme === "dark"
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>`;
}

/** Renders the nav shell ONCE per app lifetime (called from init, not from render()).
 * The search input and its dropdown must never be re-created — that's what breaks focus mid-keystroke. */
function renderNav(lang, route) {
  return `
    <div class="container nav__bar">
      <button class="icon-btn nav__hamburger" id="hamburger-btn" aria-label="Menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <div class="nav__search">
        <label class="visually-hidden" for="global-search">${t(lang, "searchPlaceholder")}</label>
        <input id="global-search" type="search" placeholder="${t(lang, "searchPlaceholder")}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="search-dropdown" aria-autocomplete="list">
        <div class="search-dropdown" id="search-dropdown" data-open="false" role="listbox"></div>
      </div>
      <nav aria-label="Primary">
        <ul class="nav__links" id="nav-links">${NAV_LINKS.map((l) => `<li><a class="nav__link" href="${l.href}"${l.match(route) ? ' aria-current="page"' : ""}>${t(lang, l.key)}</a></li>`).join("")}<li><a class="nav__link nav__link--external" href="tools/qa-compare.html" target="_blank" rel="noopener">QA</a></li></ul>
      </nav>
      <div class="nav__actions">
        <!-- lang-toggle removed: LT recipes are temporarily out of sync with rebuilt EN data, see state.js -->
        <button class="icon-btn" id="theme-btn" aria-label="${t(lang, "themeToggle")}">${themeIconSvg(appState.theme)}</button>
      </div>
    </div>
    <div class="nav__sheet" id="nav-sheet" data-open="false">
      ${NAV_LINKS.map((l) => `<a class="nav__link" href="${l.href}"${l.match(route) ? ' aria-current="page"' : ""}>${t(lang, l.key)}</a>`).join("")}
      <a class="nav__link nav__link--external" href="tools/qa-compare.html" target="_blank" rel="noopener">QA</a>
    </div>`;
}

/** Updates nav state (active link, theme icon, lang buttons) without touching the search input's DOM node. */
function updateNavState(lang, route) {
  document.querySelectorAll("#nav-links .nav__link:not(.nav__link--external), #nav-sheet .nav__link:not(.nav__link--external)").forEach((el, i) => {
    const link = NAV_LINKS[i % NAV_LINKS.length];
    el.textContent = t(lang, link.key);
    if (link.match(route)) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });
  const search = document.getElementById("global-search");
  if (search) search.placeholder = t(lang, "searchPlaceholder");
  const searchLabel = document.querySelector('label[for="global-search"]');
  if (searchLabel) searchLabel.textContent = t(lang, "searchPlaceholder");
  const langToggle = document.querySelector(".lang-toggle");
  if (langToggle) langToggle.setAttribute("aria-label", t(lang, "langToggle"));
  const themeBtn = document.getElementById("theme-btn");
  if (themeBtn) {
    themeBtn.innerHTML = themeIconSvg(appState.theme);
    themeBtn.setAttribute("aria-label", t(lang, "themeToggle"));
  }
}

function renderFooter(lang) {
  return `
  <footer class="footer">
    <div class="container footer__row">
      <span>BakeStack · ${new Date().getFullYear()}</span>
      <span>·</span>
      <span>${getRecipes(lang).length} ${lang === "lt" ? "receptai" : "recipes"} · ${getTips(lang).length} ${lang === "lt" ? "patarimai" : "tips"}</span>
      <span>·</span>
      <a href="https://github.com/gerimantas/BakeStack" target="_blank" rel="noopener">GitHub</a>
    </div>
  </footer>`;
}

// ---------------------------------------------------------------- Global search dropdown

const SEARCH_RESULT_LIMIT = 8;

/** Searches recipes (title, category, tags) and tips (title, tags, body text) for the query.
 * Returns up to `limit` results total (default SEARCH_RESULT_LIMIT for the nav dropdown;
 * pass Infinity from the full search page), recipes first, plus the true total match count. */
function searchAll(lang, query, limit = SEARCH_RESULT_LIMIT) {
  const q = query.trim().toLowerCase();
  if (!q) return { results: [], total: 0 };

  const recipeMatches = getRecipes(lang).filter((r) =>
    r.title.toLowerCase().includes(q) ||
    (r.category || "").toLowerCase().includes(q) ||
    (r.tags || []).some((tg) => tg.toLowerCase().includes(q))
  ).map((r) => ({ kind: "recipe", item: r }));

  const tipMatches = getTips(lang).filter((tp) =>
    tp.title.toLowerCase().includes(q) ||
    tp.text.toLowerCase().includes(q) ||
    (tp.tags || []).some((tg) => tg.toLowerCase().includes(q))
  ).map((tp) => ({ kind: "tip", item: tp }));

  const all = [...recipeMatches, ...tipMatches];
  return { results: all.slice(0, limit), total: all.length };
}

function searchResultRow(lang, result, query, index) {
  const { kind, item } = result;
  const isRecipe = kind === "recipe";
  const href = isRecipe ? `#/recipe/${item.id}` : `#/tip/${item.id}`;
  const typeLabel = t(lang, isRecipe ? "navRecipes" : "navTips");
  let snippet = "";
  if (!isRecipe) {
    const q = query.trim().toLowerCase();
    const idx = item.text.toLowerCase().indexOf(q);
    const start = idx > 20 ? idx - 20 : 0;
    snippet = (start > 0 ? "…" : "") + item.text.slice(start, start + 90).replace(/\s+/g, " ");
  }
  return `
  <a class="search-result" href="${href}" role="option" id="search-opt-${index}" data-index="${index}">
    <span class="search-result__type">${esc(typeLabel)}</span>
    <span class="search-result__title">${highlight(item.title, query)}</span>
    ${snippet ? `<span class="search-result__snippet">${highlight(snippet, query)}</span>` : ""}
  </a>`;
}

function renderSearchDropdown(lang, query) {
  const dropdown = document.getElementById("search-dropdown");
  const input = document.getElementById("global-search");
  if (!dropdown) return;

  const { results, total } = searchAll(lang, query);
  if (!query.trim() || results.length === 0) {
    dropdown.dataset.open = "false";
    dropdown.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    return;
  }

  const rowsHtml = results.map((r, i) => searchResultRow(lang, r, query, i)).join("");
  const showAllHtml = total > results.length
    ? `<button class="search-result search-result--all" id="search-show-all" type="button">${t(lang, "showAllResults", total)}</button>`
    : "";

  dropdown.innerHTML = rowsHtml + showAllHtml;
  dropdown.dataset.open = "true";
  input.setAttribute("aria-expanded", "true");
}

function closeSearchDropdown() {
  const dropdown = document.getElementById("search-dropdown");
  const input = document.getElementById("global-search");
  if (!dropdown) return;
  dropdown.dataset.open = "false";
  dropdown.innerHTML = "";
  input?.setAttribute("aria-expanded", "false");
  input?.removeAttribute("aria-activedescendant");
}

/** Keeps the URL's ?q= param in sync with what's typed in the search box, WITHOUT triggering a
 * hashchange (and therefore without re-rendering main / stealing focus). This matters specifically
 * for clearing: if the user is on #/recipes?q=bra and clears the box, the stale q=bra must not
 * survive a reload and silently re-filter the recipe list behind their back. */
function syncQueryParam(value) {
  const { route, params } = parseHash();
  // Only recipes/tips/search actually read ?q= for filtering — don't touch the URL elsewhere
  // (recipe detail, favorites, etc. have no q param to keep in sync).
  if (!["recipes", "tips", "search"].includes(route.name)) return;
  const q = value.trim();
  if (q) params.set("q", q); else params.delete("q");
  const path = route.name === "recipes" ? "/recipes" : route.name === "tips" ? "/tips" : "/search";
  const newHash = `#${path}${params.toString() ? "?" + params.toString() : ""}`;
  if (newHash !== location.hash) history.replaceState(null, "", newHash);
}

function goToSearchResult(href) {
  closeSearchDropdown();
  location.hash = href;
}

function wireSearchDropdown() {
  const input = document.getElementById("global-search");
  const dropdown = document.getElementById("search-dropdown");
  if (!input || !dropdown) return;

  let activeIndex = -1;

  const setActive = (index) => {
    const rows = dropdown.querySelectorAll(".search-result");
    rows.forEach((r) => r.classList.remove("is-active"));
    activeIndex = index;
    if (index >= 0 && rows[index]) {
      rows[index].classList.add("is-active");
      input.setAttribute("aria-activedescendant", rows[index].id || "");
      rows[index].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  input.addEventListener("input", () => {
    activeIndex = -1;
    renderSearchDropdown(appState.lang, input.value);
    syncQueryParam(input.value);
  });

  input.addEventListener("keydown", (e) => {
    const rows = dropdown.querySelectorAll(".search-result");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rows.length) setActive(Math.min(activeIndex + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rows.length) setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && rows[activeIndex]) {
        e.preventDefault();
        rows[activeIndex].click();
      } else if (input.value.trim()) {
        e.preventDefault();
        goToSearchResult(`#/search?q=${encodeURIComponent(input.value.trim())}`);
      }
    } else if (e.key === "Escape") {
      if (dropdown.dataset.open === "true") { closeSearchDropdown(); }
      else { input.value = ""; input.blur(); }
    }
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) renderSearchDropdown(appState.lang, input.value);
  });

  dropdown.addEventListener("click", (e) => {
    const showAll = e.target.closest("#search-show-all");
    if (showAll) {
      e.preventDefault();
      goToSearchResult(`#/search?q=${encodeURIComponent(input.value.trim())}`);
      return;
    }
    const row = e.target.closest(".search-result");
    if (row && row.tagName === "A") {
      closeSearchDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__search")) closeSearchDropdown();
  });
}

function recipeCard(recipe, lang, query) {
  const fav = isFavorite("recipe", recipe.id);
  const favBtn = `<button class="fav-btn recipe-card__fav" data-fav-recipe="${recipe.id}" aria-pressed="${fav}" aria-label="${t(lang, fav ? "unsaveFavorite" : "saveFavorite")}">${iconHeart(fav)}</button>`;
  return `
  <a class="recipe-card ${recipe.image ? "" : "recipe-card--no-media"}" href="#/recipe/${recipe.id}">
    ${recipeCardMedia(recipe, favBtn)}
    ${!recipe.image ? favBtn : ""}
    <div class="recipe-card__body">
      <span class="recipe-card__cat">${esc(tagLabel(lang, "category", recipe.category))}${recipe.is_technique ? `<span class="recipe-card__kind-badge">${t(lang, "kindTechnique")}</span>` : ""}</span>
      <h3 class="recipe-card__title">${highlight(recipe.title, query)}</h3>
      <span class="recipe-card__tags">${(recipe.tags || []).slice(0, 3).map((tg) => anyTagLabel(lang, tg)).join(" · ")}</span>
    </div>
  </a>`;
}

function tipCard(tip, lang, query) {
  const snippet = tip.text.replace(/\s+/g, " ").slice(0, 140);
  return `
  <a class="tip-card" href="#/tip/${tip.id}">
    <h3>${highlight(tip.title, query)}</h3>
    <p>${highlight(snippet, query)}…</p>
  </a>`;
}

function renderRecipesView(lang, params) {
  const all = getRecipes(lang);
  const query = (params.get("q") || "").trim();
  const kind = params.get("kind") || "";
  const category = params.get("cat") || "";
  const tag = params.get("tag") || "";

  const groupDict = STRINGS[lang]?.categoryGroups || STRINGS.en.categoryGroups;
  // curated display order, not alphabetical or by count — biggest/most-searched-for types first
  const groupOrder = ["cupcake", "cheesecake", "cakes-loaf", "cinnamon-roll", "tea-cake", "tiramisu-zephyr", "cookies-brownies", "pies-pastry", "savory", "ganache", "components-fillings"];
  const categoryGroups = groupOrder.filter((g) => all.some((r) => r.categoryGroup === g));
  const flavorTags = (store.tags?.flavor_theme || []).filter((tg) => all.some((r) => r.tags?.includes(tg)));
  const hasTechniques = all.some((r) => r.is_technique);

  let filtered = all;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || (r.tags || []).some((tg) => tg.includes(q)));
  }
  if (kind === "technique") filtered = filtered.filter((r) => r.is_technique);
  else if (kind === "recipe") filtered = filtered.filter((r) => !r.is_technique);
  if (category) filtered = filtered.filter((r) => r.categoryGroup === category);
  if (tag) filtered = filtered.filter((r) => (r.tags || []).includes(tag));

  // Counts reflect the OTHER active filters (so picking a Type doesn't hide Flavor counts, and vice
  // versa), but not the chip's own filter — that would collapse every non-selected chip to a same/lower count.
  const byOtherKind = all.filter((r) => (!category || r.categoryGroup === category) && (!tag || (r.tags || []).includes(tag)));
  const byOtherTag = all.filter((r) => (!kind || (kind === "technique" ? r.is_technique : !r.is_technique)) && (!category || r.categoryGroup === category));
  const byOtherCategory = all.filter((r) => (!kind || (kind === "technique" ? r.is_technique : !r.is_technique)) && (!tag || (r.tags || []).includes(tag)));

  const chip = (label, count, active, href) =>
    `<button class="chip" data-nav="${href}" aria-pressed="${active}">${esc(label)} <span class="chip__count">${count}</span></button>`;

  return `
  <div class="container">
    <div class="page-head">
      <h1>${t(lang, "navRecipes")}</h1>
      <span class="page-head__count">${t(lang, "recipesCount", filtered.length)}</span>
    </div>
    ${hasTechniques ? `<div class="filter-block">
      <span class="filter-label">${t(lang, "filterKind")}</span>
      <div class="filters"><div class="filter-group">
        ${chip(t(lang, "allTypes"), byOtherKind.length, !kind, `#/recipes?${withParam(params, "kind", "")}`)}
        ${chip(t(lang, "kindRecipe"), byOtherKind.filter((r) => !r.is_technique).length, kind === "recipe", `#/recipes?${withParam(params, "kind", "recipe")}`)}
        ${chip(t(lang, "kindTechnique"), byOtherKind.filter((r) => r.is_technique).length, kind === "technique", `#/recipes?${withParam(params, "kind", "technique")}`)}
      </div></div>
    </div>` : ""}
    <div class="filter-block">
      <span class="filter-label">${t(lang, "filterType")}</span>
      <div class="filters">
        <div class="filter-group">
          ${chip(t(lang, "allTypes"), byOtherTag.length, !category, `#/recipes?${withParam(params, "cat", "")}`)}
          ${categoryGroups.map((g) => chip(groupDict[g] || g, byOtherTag.filter((r) => r.categoryGroup === g).length, category === g, `#/recipes?${withParam(params, "cat", g)}`)).join("")}
        </div>
      </div>
    </div>
    ${flavorTags.length ? `<div class="filter-block">
      <span class="filter-label">${t(lang, "filterFlavor")}</span>
      <div class="filters"><div class="filter-group">
        ${chip(t(lang, "allTypes"), byOtherCategory.length, !tag, `#/recipes?${withParam(params, "tag", "")}`)}
        ${flavorTags.slice(0, 14).map((tg) => chip(tagLabel(lang, "flavor_theme", tg), byOtherCategory.filter((r) => (r.tags || []).includes(tg)).length, tag === tg, `#/recipes?${withParam(params, "tag", tg)}`)).join("")}
      </div></div>
    </div>` : ""}
    ${filtered.length ? `<div class="recipe-grid">${filtered.map((r) => recipeCard(r, lang, query)).join("")}</div>`
      : `<div class="empty-state"><h2>${t(lang, "noResults")}</h2><p>${t(lang, "noResultsHint")}</p></div>`}
  </div>`;
}

function withParam(params, key, value) {
  const p = new URLSearchParams(params);
  if (value) p.set(key, value); else p.delete(key);
  return p.toString();
}

function renderRecipeDetail(lang, id) {
  const recipe = getRecipeById(lang, id);
  if (!recipe) return view404(lang);
  const fav = isFavorite("recipe", id);
  const picked = isPicked(id);

  const multBtns = MULTIPLIERS.map((m) =>
    `<button data-mult="${m}" aria-pressed="${m === 1}">${m}×</button>`
  ).join("");

  const ingHtml = renderIngredientList(recipe.ingredients, 1, lang);

  const stepsHtml = recipe.steps.map((s) => `<li><p>${scaleStepText(esc(s).replace(/\{\{amount:([\d.]+)\}\}/g, "{{amount:$1}}"), 1)}</p></li>`).join("");

  // Cost estimates aren't a finished feature yet (see the About page) — prices.json
  // only has one placeholder entry, so showing a partial cost for whichever recipe
  // happens to use that one ingredient is misleading rather than useful.
  const priceHtml = "";

  const related = findRelatedTips(recipe, lang, 4);
  const relatedHtml = related.length ? `
    <div class="related-tips">
      <h2>${t(lang, "relatedTips")}</h2>
      <div class="tip-mini-list">
        ${related.map((tip) => `<a class="tip-mini" href="#/tip/${tip.id}"><h3>${esc(tip.title)}</h3><p>${esc(tip.text.replace(/\s+/g, " ").slice(0, 90))}…</p></a>`).join("")}
      </div>
    </div>` : "";

  return `
  <div class="container recipe-detail" data-recipe-id="${id}">
    <a class="back-link" href="#/recipes">${iconBack()} ${t(lang, "backToRecipes")}</a>
    <div class="recipe-detail__head">
      <div>
        <h1 class="recipe-detail__title">${esc(recipe.title)}${recipe.is_technique ? `<span class="recipe-detail__kind-badge">${t(lang, "kindTechnique")}</span>` : ""}</h1>
        <div class="recipe-detail__meta"><span>${esc(tagLabel(lang, "category", recipe.category))}</span>${(recipe.tags || []).length ? `<span>· ${recipe.tags.map((tg) => anyTagLabel(lang, tg)).join(", ")}</span>` : ""}</div>
      </div>
      <div class="recipe-actions">
        <button class="btn" id="fav-btn" aria-pressed="${fav}">${iconHeart(fav)} ${t(lang, fav ? "unsaveFavorite" : "saveFavorite")}</button>
        <button class="btn" id="share-btn">${t(lang, "share")}</button>
        <button class="btn ${picked ? "" : "btn--primary"}" id="shop-btn" aria-pressed="${picked}">${t(lang, picked ? "removeFromShopping" : "addToShopping")}</button>
      </div>
    </div>
    ${recipe.description ? `<p class="recipe-detail__desc">${esc(recipe.description)}</p>` : ""}
    <div class="recipe-detail__grid">
      <aside class="panel panel--ingredients">
        <h2>${t(lang, "ingredients")}</h2>
        <div class="multiplier" role="group" aria-label="Scale recipe">${multBtns}</div>
        <ul class="ingredient-list" id="ingredient-list">${ingHtml}</ul>
        <div id="price-block">${priceHtml}</div>
        ${recipe.servings ? `<div class="yield-note">${t(lang, "servingsYield", recipe.servings)}</div>` : ""}
      </aside>
      <div class="panel">
        <h2>${t(lang, "steps")}</h2>
        <ol class="steps-list" id="steps-list">${stepsHtml}</ol>
      </div>
    </div>
    ${relatedHtml}
  </div>`;
}

// A recipe's categoryGroup maps to the tip topic(s) most relevant to making
// that kind of dessert — e.g. a cheesecake recipe should surface cheesecake
// tips before a tip that merely happens to share generic ingredient tags
// (butter, sugar, milk) with it. Not every group has a matching topic; those
// fall through to tag-overlap ranking alone.
const CATEGORY_GROUP_TO_TOPICS = {
  cheesecake: ["cheesecake"],
  ganache: ["frostings-ganache"],
  "components-fillings": ["frostings-ganache"],
  "cakes-loaf": ["sponge-pastry"],
  "tea-cake": ["sponge-pastry"],
  "cinnamon-roll": ["sponge-pastry"],
  "pies-pastry": ["sponge-pastry"],
};

function findRelatedTips(recipe, lang, limit) {
  const tags = new Set(recipe.tags || []);
  const relevantTopics = new Set(CATEGORY_GROUP_TO_TOPICS[recipe.categoryGroup] || []);
  const scored = getTips(lang)
    .map((tip) => ({
      tip,
      topicMatch: relevantTopics.has(tip.topic) ? 1 : 0,
      overlap: (tip.tags || []).filter((tg) => tags.has(tg)).length,
    }))
    .filter((x) => x.topicMatch || x.overlap > 0)
    .sort((a, b) => b.topicMatch - a.topicMatch || b.overlap - a.overlap);
  return scored.slice(0, limit).map((x) => x.tip);
}

/** Full search results page — reached via Enter or "Show all N results" from the nav dropdown.
 * Shows every match (not capped at SEARCH_RESULT_LIMIT), recipes and tips in separate groups. */
function renderSearchView(lang, params) {
  const query = (params.get("q") || "").trim();
  const { results } = searchAll(lang, query, Infinity);
  const recipeResults = results.filter((r) => r.kind === "recipe").map((r) => r.item);
  const tipResults = results.filter((r) => r.kind === "tip").map((r) => r.item);

  if (!query) {
    return `<div class="container"><div class="empty-state"><h2>${t(lang, "noResults")}</h2></div></div>`;
  }

  if (!results.length) {
    return `
    <div class="container">
      <div class="page-head"><h1>${t(lang, "searchResultsFor", query)}</h1></div>
      <div class="empty-state"><h2>${t(lang, "noResults")}</h2><p>${t(lang, "noResultsHint")}</p></div>
    </div>`;
  }

  return `
  <div class="container">
    <div class="page-head">
      <h1>${t(lang, "searchResultsFor", query)}</h1>
      <span class="page-head__count">${t(lang, "totalResults", results.length)}</span>
    </div>
    ${recipeResults.length ? `
      <h2 class="search-section-head">${t(lang, "navRecipes")} <span class="search-section-count">${recipeResults.length}</span></h2>
      <div class="recipe-grid">${recipeResults.map((r) => recipeCard(r, lang, query)).join("")}</div>
    ` : ""}
    ${tipResults.length ? `
      <h2 class="search-section-head">${t(lang, "navTips")} <span class="search-section-count">${tipResults.length}</span></h2>
      <div class="tip-list">${tipResults.map((tp) => tipCard(tp, lang, query)).join("")}</div>
    ` : ""}
  </div>`;
}

function renderTipsView(lang, params) {
  const all = getTips(lang);
  const query = (params.get("q") || "").trim();
  const topic = params.get("topic") || "";

  let filtered = all;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((tp) => tp.title.toLowerCase().includes(q) || tp.text.toLowerCase().includes(q) || (tp.tags || []).some((tg) => tg.includes(q)));
  }
  if (topic) filtered = filtered.filter((tp) => tp.topic === topic);

  const topicDict = STRINGS[lang]?.topics || STRINGS.en.topics;
  // preserve a fixed, curated order rather than sorting alphabetically or by count
  const topicOrder = ["ingredients", "techniques", "flavor-pairing", "cheesecake", "frostings-ganache", "sponge-pastry", "troubleshooting", "storage"];
  const topicOptions = topicOrder
    .filter((tp) => all.some((r) => r.topic === tp))
    .map((tp) => `<option value="${tp}" ${topic === tp ? "selected" : ""}>${esc(topicDict[tp] || tp)}</option>`)
    .join("");

  return `
  <div class="container">
    <div class="page-head">
      <h1>${t(lang, "navTips")}</h1>
      <span class="page-head__count">${t(lang, "tipsCount", filtered.length)}</span>
    </div>
    <div class="filter-block">
      <label class="filter-label" for="tip-topic-select">${t(lang, "filterTopic")}</label>
      <select id="tip-topic-select" data-nav-select data-nav-param="topic">
        <option value="">${t(lang, "allTypes")}</option>
        ${topicOptions}
      </select>
    </div>
    ${filtered.length ? `<div class="tip-list">${filtered.slice(0, 100).map((tp) => tipCard(tp, lang, query)).join("")}</div>`
      : `<div class="empty-state"><h2>${t(lang, "noResults")}</h2><p>${t(lang, "noResultsHint")}</p></div>`}
  </div>`;
}

function renderTipDetail(lang, id) {
  const tip = getTipById(lang, id);
  if (!tip) return view404(lang);
  const fav = isFavorite("tip", id);
  const paragraphs = tip.text.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return `
  <div class="container tip-detail">
    <a class="back-link" href="#/tips">${iconBack()} ${t(lang, "backToTips")}</a>
    <div class="recipe-detail__head">
      <h1 class="recipe-detail__title">${esc(tip.title)}</h1>
      <div class="recipe-actions">
        <button class="btn" id="fav-btn" aria-pressed="${fav}">${iconHeart(fav)} ${t(lang, fav ? "unsaveFavorite" : "saveFavorite")}</button>
        <button class="btn" id="share-btn">${t(lang, "share")}</button>
      </div>
    </div>
    <div class="tip-detail__body">${paragraphs}</div>
    ${(tip.tags || []).length ? `<div class="tag-row">${tip.tags.map((tg) => `<span class="tag-pill">${esc(anyTagLabel(lang, tg))}</span>`).join("")}</div>` : ""}
  </div>`;
}

function renderFavoritesView(lang) {
  const recipeIds = getFavoriteIds("recipe");
  const tipIds = getFavoriteIds("tip");
  const recipes = recipeIds.map((id) => getRecipeById(lang, id)).filter(Boolean);
  const tips = tipIds.map((id) => getTipById(lang, id)).filter(Boolean);

  if (!recipes.length && !tips.length) {
    return `<div class="container"><div class="empty-state">${iconHeart(false)}<h2>${t(lang, "noFavoritesYet")}</h2><p>${t(lang, "noFavoritesHint")}</p></div></div>`;
  }

  return `
  <div class="container">
    <div class="page-head"><h1>${t(lang, "navFavorites")}</h1></div>
    ${recipes.length ? `<h2 style="font-size:var(--text-lg);margin-bottom:var(--space-md)">${t(lang, "navRecipes")}</h2><div class="recipe-grid">${recipes.map((r) => recipeCard(r, lang, "")).join("")}</div>` : ""}
    ${tips.length ? `<h2 style="font-size:var(--text-lg);margin:var(--space-2xl) 0 var(--space-md)">${t(lang, "navTips")}</h2><div class="tip-list">${tips.map((tp) => tipCard(tp, lang, "")).join("")}</div>` : ""}
  </div>`;
}

function renderShoppingView(lang) {
  const favoriteIds = new Set(getFavoriteIds("recipe"));
  const all = getRecipes(lang).filter((r) => favoriteIds.has(r.id));
  const pickedIds = Object.keys(appState.shoppingPicks);
  const pickedItems = pickedIds
    .map((id) => ({ recipe: getRecipeById(lang, id), multiplier: appState.shoppingPicks[id] }))
    .filter((x) => x.recipe);
  const list = pickedItems.length ? buildShoppingList(pickedItems) : [];

  const listHtml = list.length
    ? `<ul>${list.map((item) => `<li><span>${esc(item.name)}</span><span class="amt">${item.isText ? "" : (item.isApprox ? "~" : "") + formatAmount(item.amount) + (item.unit ? " " + esc(item.unit) : "")}</span></li>`).join("")}</ul>`
    : `<p style="color:var(--color-muted);font-size:var(--text-sm)">${t(lang, "shoppingListEmpty")}</p>`;

  return `
  <div class="container shopping-picker">
    <div>
      <div class="page-head"><h1>${t(lang, "navShopping")}</h1></div>
      <p style="color:var(--color-muted);font-size:var(--text-sm);margin-bottom:var(--space-lg)">${t(lang, "shoppingListHint")}</p>
      ${all.length ? `<div class="recipe-grid">
        ${all.map((r) => {
          const picked = isPicked(r.id);
          return `<div class="recipe-card ${r.image ? "" : "recipe-card--no-media"}" style="position:relative">
            <button class="pick-checkbox" data-pick="${r.id}" role="checkbox" aria-checked="${picked}" aria-label="${esc(r.title)}">${iconCheck()}</button>
            <a href="#/recipe/${r.id}" style="text-decoration:none;color:inherit;display:contents">
              ${recipeCardMedia(r)}
              <div class="recipe-card__body">
                <span class="recipe-card__cat">${esc(tagLabel(lang, "category", r.category))}</span>
                <h3 class="recipe-card__title">${esc(r.title)}</h3>
              </div>
            </a>
          </div>`;
        }).join("")}
      </div>` : `<div class="empty-state"><h2>${t(lang, "shoppingListNoFavorites")}</h2><p>${t(lang, "shoppingListNoFavoritesHint")}</p></div>`}
    </div>
    <aside class="panel shopping-list-panel">
      <div class="shopping-list-panel__head">
        <h2>${t(lang, "shoppingListTitle")}</h2>
        <span class="shopping-list-panel__date">${new Date().toLocaleDateString(lang === "lt" ? "lt-LT" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
      </div>
      <div id="shopping-list-body">${listHtml}</div>
      ${list.length ? `<div class="recipe-actions">
        <button class="btn" id="copy-list-btn">${t(lang, "copyList")}</button>
        <button class="btn" id="clear-list-btn">${t(lang, "clearList")}</button>
      </div>` : ""}
    </aside>
  </div>`;
}

function renderAboutView(lang) {
  const sectionsHtml = t(lang, "aboutSections").map((s) => `
    <h2 style="font-size:var(--text-lg);margin:var(--space-xl) 0 var(--space-2xs)">${esc(s.heading)}</h2>
    <p style="max-width:42rem;color:var(--color-ink-2)">${esc(s.text)}</p>`).join("");

  return `
  <div class="container">
    <div class="page-head"><h1>${t(lang, "aboutTitle")}</h1></div>
    <p style="max-width:42rem;color:var(--color-ink-2)">${esc(t(lang, "aboutIntro"))}</p>
    ${sectionsHtml}
    <p style="max-width:42rem;margin-top:var(--space-xl);color:var(--color-ink-2)">${esc(t(lang, "aboutPlanned"))}</p>
    <p style="max-width:42rem;margin-top:var(--space-md);color:var(--color-ink-2)">${esc(t(lang, "aboutTested"))}</p>
    <h2 style="font-size:var(--text-lg);margin:var(--space-xl) 0 var(--space-2xs)">${esc(t(lang, "aboutHomeScreenTitle"))}</h2>
    <ul style="max-width:42rem;color:var(--color-ink-2);padding-left:1.2em">
      <li style="margin-bottom:var(--space-2xs)">${esc(t(lang, "aboutHomeScreenAndroid"))}</li>
      <li>${esc(t(lang, "aboutHomeScreenIos"))}</li>
    </ul>
  </div>`;
}

// ---------------------------------------------------------------- Router

function parseHash() {
  const hash = location.hash.slice(1) || "/recipes";
  const [path, queryStr] = hash.split("?");
  const params = new URLSearchParams(queryStr || "");
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "recipe" && segments[1]) return { route: { name: "recipe", id: segments[1] }, params };
  if (segments[0] === "tip" && segments[1]) return { route: { name: "tip", id: segments[1] }, params };
  if (segments[0] === "search") return { route: { name: "search" }, params };
  if (segments[0] === "tips") return { route: { name: "tips" }, params };
  if (segments[0] === "favorites") return { route: { name: "favorites" }, params };
  if (segments[0] === "shopping") return { route: { name: "shopping" }, params };
  if (segments[0] === "about") return { route: { name: "about" }, params };
  return { route: { name: "recipes" }, params };
}

let navRendered = false;

function render() {
  const lang = appState.lang;
  const { route, params } = parseHash();

  if (!navRendered) {
    document.getElementById("nav-slot").innerHTML = renderNav(lang, route);
    wireNavEvents();
    navRendered = true;
  }
  const navSheet = document.getElementById("nav-sheet");
  if (navSheet) navSheet.dataset.open = "false";
  document.getElementById("hamburger-btn")?.setAttribute("aria-expanded", "false");
  updateNavState(lang, route);

  const search = document.getElementById("global-search");
  const q = params.get("q") || "";
  if (document.activeElement !== search && search.value !== q) search.value = q;

  let html;
  switch (route.name) {
    case "recipe": html = renderRecipeDetail(lang, route.id); break;
    case "tips": html = renderTipsView(lang, params); break;
    case "tip": html = renderTipDetail(lang, route.id); break;
    case "search": html = renderSearchView(lang, params); break;
    case "favorites": html = renderFavoritesView(lang); break;
    case "shopping": html = renderShoppingView(lang); break;
    case "about": html = renderAboutView(lang); break;
    default: html = renderRecipesView(lang, params);
  }
  const main = document.getElementById("main");
  main.innerHTML = html;
  document.getElementById("footer-slot").innerHTML = renderFooter(lang);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  wireEvents(route);
  document.title = pageTitle(lang, route);
}

function pageTitle(lang, route) {
  const base = "BakeStack";
  if (route.name === "recipe") { const r = getRecipeById(lang, route.id); return r ? `${r.title} · ${base}` : base; }
  if (route.name === "tip") { const tp = getTipById(lang, route.id); return tp ? `${tp.title} · ${base}` : base; }
  if (route.name === "tips") return `${t(lang, "navTips")} · ${base}`;
  if (route.name === "favorites") return `${t(lang, "navFavorites")} · ${base}`;
  if (route.name === "shopping") return `${t(lang, "navShopping")} · ${base}`;
  if (route.name === "about") return `${t(lang, "navAbout")} · ${base}`;
  return base;
}

// ---------------------------------------------------------------- Event wiring

/** Wires nav-level events (lang, theme, hamburger, search dropdown) — called ONCE from render()
 * the first time the nav is created. These elements are never re-created, so their listeners
 * never need to be re-attached. */
function wireNavEvents() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => { setLang(btn.dataset.lang); render(); });
  });
  const themeBtn = document.getElementById("theme-btn");
  themeBtn?.addEventListener("click", () => {
    const next = appState.theme === "dark" ? "light" : appState.theme === "light" ? null : "dark";
    setTheme(next);
    updateNavState(appState.lang, parseHash().route);
  });
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const sheet = document.getElementById("nav-sheet");
  const closeSheet = () => {
    sheet.dataset.open = "false";
    hamburgerBtn?.setAttribute("aria-expanded", "false");
  };
  hamburgerBtn?.addEventListener("click", () => {
    const open = sheet.dataset.open === "true";
    sheet.dataset.open = String(!open);
    hamburgerBtn.setAttribute("aria-expanded", String(!open));
  });
  sheet?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeSheet();
  });
  document.addEventListener("click", (e) => {
    if (sheet?.dataset.open === "true" && !sheet.contains(e.target) && !hamburgerBtn?.contains(e.target)) closeSheet();
  });
  window.addEventListener("hashchange", closeSheet);
  wireSearchDropdown();
}

function wireEvents(route) {
  document.querySelectorAll("[data-fav-recipe]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = btn.dataset.favRecipe;
      const nowFav = toggleFavorite("recipe", id);
      btn.setAttribute("aria-pressed", String(nowFav));
      btn.innerHTML = iconHeart(nowFav);
    });
  });

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => { location.hash = el.dataset.nav; });
  });

  document.querySelectorAll("[data-nav-select]").forEach((el) => {
    el.addEventListener("change", () => {
      const currentParams = new URLSearchParams(location.hash.split("?")[1] || "");
      const path = location.hash.split("?")[0];
      const withVal = withParam(currentParams, el.dataset.navParam, el.value);
      location.hash = withVal ? `${path}?${withVal}` : path;
    });
  });

  const main = document.getElementById("main");

  const favBtn = document.getElementById("fav-btn");
  favBtn?.addEventListener("click", () => {
    const kind = route.name === "tip" ? "tip" : "recipe";
    const id = route.id;
    const nowFav = toggleFavorite(kind, id);
    const lang = appState.lang;
    favBtn.setAttribute("aria-pressed", String(nowFav));
    favBtn.innerHTML = `${iconHeart(nowFav)} ${t(lang, nowFav ? "unsaveFavorite" : "saveFavorite")}`;
  });

  const shareBtn = document.getElementById("share-btn");
  shareBtn?.addEventListener("click", async () => {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t(appState.lang, "linkCopied"));
    } catch {
      showToast(url);
    }
  });

  const shopBtn = document.getElementById("shop-btn");
  shopBtn?.addEventListener("click", () => {
    const id = route.id;
    const nowPicked = togglePick(id, 1);
    const lang = appState.lang;
    shopBtn.setAttribute("aria-pressed", String(nowPicked));
    shopBtn.classList.toggle("btn--primary", !nowPicked);
    shopBtn.textContent = t(lang, nowPicked ? "removeFromShopping" : "addToShopping");
  });

  if (route.name === "recipe") {
    const recipe = getRecipeById(appState.lang, route.id);
    if (recipe) wireRecipeDetail(recipe);
  }

  if (route.name === "shopping") wireShoppingView();
}

function wireRecipeDetail(recipe) {
  const lang = appState.lang;
  const multBtns = document.querySelectorAll(".multiplier button");
  multBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const m = parseFloat(btn.dataset.mult);
      multBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      document.getElementById("ingredient-list").innerHTML = renderIngredientList(recipe.ingredients, m, lang);
      document.getElementById("steps-list").innerHTML = recipe.steps.map((s) => `<li><p>${scaleStepText(esc(s), m)}</p></li>`).join("");
      if (isPicked(recipe.id)) setPickMultiplier(recipe.id, m);
    });
  });
}

function wireShoppingView() {
  document.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      togglePick(btn.dataset.pick, 1);
      render();
    });
  });
  document.getElementById("clear-list-btn")?.addEventListener("click", () => {
    clearPicks();
    render();
  });
  document.getElementById("copy-list-btn")?.addEventListener("click", async () => {
    const lang = appState.lang;
    const pickedItems = Object.keys(appState.shoppingPicks)
      .map((id) => ({ recipe: getRecipeById(lang, id), multiplier: appState.shoppingPicks[id] }))
      .filter((x) => x.recipe);
    const list = buildShoppingList(pickedItems);
    const text = list.map((item) => `- ${item.name}${item.isText ? "" : `: ${formatAmount(item.amount)}${item.unit ? " " + item.unit : ""}`}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast(t(lang, "listCopied"));
    } catch {
      showToast(text.slice(0, 80));
    }
  });
}

// ---------------------------------------------------------------- Init

async function init() {
  applyTheme();
  try {
    await loadAll();
  } catch (err) {
    document.getElementById("main").innerHTML = `<div class="container empty-state"><h2>Failed to load data</h2><p>${esc(err.message)}</p></div>`;
    return;
  }
  window.addEventListener("hashchange", render);
  render();
}

document.addEventListener("DOMContentLoaded", init);
