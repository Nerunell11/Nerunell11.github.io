/*
 * ポートフォリオサイトの動作まわり
 * - Works カードの描画と絞り込み
 * - Skills の描画
 * - ナビゲーション（モバイルメニュー / スクロール追従）
 * - スクロールに応じたフェードイン
 *
 * 表示内容の編集は js/works-data.js と js/skills-data.js で行えます。
 * このファイルは通常さわる必要はありません。
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* 小さなヘルパー                                                       */
  /* ------------------------------------------------------------------ */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ------------------------------------------------------------------ */
  /* スクロール連動のフェードイン                                          */
  /* ------------------------------------------------------------------ */

  var revealObserver = null;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  }

  function watchReveal(node) {
    if (revealObserver) {
      revealObserver.observe(node);
    } else {
      // アニメーション無効時・非対応環境では最初から表示する
      node.classList.add('is-visible');
    }
  }

  function watchAllReveals(root) {
    var targets = (root || document).querySelectorAll('.reveal:not(.is-visible)');
    Array.prototype.forEach.call(targets, watchReveal);
  }

  /* ------------------------------------------------------------------ */
  /* Works                                                               */
  /* ------------------------------------------------------------------ */

  var worksGrid = document.getElementById('worksGrid');
  var worksEmpty = document.getElementById('worksEmpty');
  var filterBox = document.getElementById('filter');
  var works = (typeof WORKS !== 'undefined' && Array.isArray(WORKS)) ? WORKS : [];

  // 画像が無い / 読み込めないときに出すプレースホルダ
  function buildPlaceholder(title) {
    var ph = el('div', 'thumb-placeholder');
    ph.setAttribute('aria-hidden', 'true');
    ph.appendChild(el('span', 'thumb-initial', (title || '?').trim().charAt(0).toUpperCase()));
    return ph;
  }

  function buildThumb(work) {
    var thumb = el('div', 'work-thumb');

    if (!work.image) {
      thumb.appendChild(buildPlaceholder(work.title));
      return thumb;
    }

    var img = el('img', 'work-image');
    img.src = work.image;
    img.alt = work.title + ' のスクリーンショット';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () {
      thumb.replaceChildren(buildPlaceholder(work.title));
    });
    thumb.appendChild(img);
    return thumb;
  }

  function buildCard(work) {
    var card = el('article', 'work-card reveal');
    card.dataset.tech = (work.tech || []).join('|');

    card.appendChild(buildThumb(work));

    var body = el('div', 'work-body');

    var meta = el('div', 'work-meta');
    if (work.year) meta.appendChild(el('span', 'work-year', work.year));
    if (work.category) meta.appendChild(el('span', 'work-category', work.category));
    if (meta.childNodes.length) body.appendChild(meta);

    body.appendChild(el('h3', 'work-title', work.title));

    if (work.role) {
      var role = el('p', 'work-role');
      role.appendChild(el('span', 'work-role-label', '担当'));
      role.appendChild(el('span', 'work-role-value', work.role));
      body.appendChild(role);
    }

    if (work.summary) body.appendChild(el('p', 'work-summary', work.summary));
    if (work.description) body.appendChild(el('p', 'work-description', work.description));

    if (work.tech && work.tech.length) {
      var tags = el('ul', 'tag-list');
      work.tech.forEach(function (tech) {
        var li = el('li', 'tag', tech);
        tags.appendChild(li);
      });
      body.appendChild(tags);
    }

    if (work.links && work.links.length) {
      var linkWrap = el('div', 'work-links');
      work.links.forEach(function (link) {
        if (!link || !link.url) return;
        var a = el('a', 'work-link', link.label || link.url);
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener';
        linkWrap.appendChild(a);
      });
      if (linkWrap.childNodes.length) body.appendChild(linkWrap);
    }

    card.appendChild(body);
    return card;
  }

  function renderWorks() {
    if (!worksGrid) return;
    var frag = document.createDocumentFragment();
    works.forEach(function (work) {
      frag.appendChild(buildCard(work));
    });
    worksGrid.appendChild(frag);
  }

  function applyFilter(tech) {
    var cards = worksGrid ? worksGrid.querySelectorAll('.work-card') : [];
    var shown = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var list = card.dataset.tech ? card.dataset.tech.split('|') : [];
      var match = (tech === '*') || list.indexOf(tech) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });

    if (worksEmpty) worksEmpty.hidden = shown !== 0;
  }

  function renderFilter() {
    if (!filterBox || !works.length) return;

    var techs = [];
    works.forEach(function (work) {
      (work.tech || []).forEach(function (tech) {
        if (techs.indexOf(tech) === -1) techs.push(tech);
      });
    });
    if (!techs.length) return;
    techs.sort(function (a, b) { return a.localeCompare(b, 'ja'); });

    var options = [{ label: 'すべて', value: '*' }].concat(
      techs.map(function (tech) { return { label: tech, value: tech }; })
    );

    options.forEach(function (option, index) {
      var btn = el('button', 'filter-btn', option.label);
      btn.type = 'button';
      btn.dataset.value = option.value;
      btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      if (index === 0) btn.classList.add('is-active');

      btn.addEventListener('click', function () {
        var buttons = filterBox.querySelectorAll('.filter-btn');
        Array.prototype.forEach.call(buttons, function (other) {
          var active = other === btn;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        applyFilter(option.value);
      });

      filterBox.appendChild(btn);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Skills                                                              */
  /* ------------------------------------------------------------------ */

  var MAX_LEVEL = 5;

  function renderSkills() {
    var grid = document.getElementById('skillsGrid');
    if (!grid || typeof SKILLS === 'undefined' || !Array.isArray(SKILLS)) return;

    var frag = document.createDocumentFragment();

    SKILLS.forEach(function (group) {
      var card = el('div', 'skill-group reveal');
      card.appendChild(el('h3', 'skill-category', group.category));

      var list = el('ul', 'skill-list');
      (group.items || []).forEach(function (item) {
        var level = Math.max(0, Math.min(MAX_LEVEL, Number(item.level) || 0));

        var li = el('li', 'skill-item');

        var head = el('div', 'skill-head');
        head.appendChild(el('span', 'skill-name', item.name));
        if (item.note) head.appendChild(el('span', 'skill-note', item.note));
        li.appendChild(head);

        var meter = el('div', 'skill-meter');
        meter.setAttribute('role', 'img');
        meter.setAttribute('aria-label', item.name + ' の習熟度 ' + level + ' / ' + MAX_LEVEL);
        var bar = el('span', 'skill-bar');
        bar.style.width = (level / MAX_LEVEL * 100) + '%';
        meter.appendChild(bar);
        li.appendChild(meter);

        list.appendChild(li);
      });

      card.appendChild(list);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  /* ------------------------------------------------------------------ */
  /* ナビゲーション                                                       */
  /* ------------------------------------------------------------------ */

  function setupNav() {
    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');

    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (!toggle || !menu) return;

    var closeMenu = function () {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'メニューを開く');
    };

    toggle.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });

    // リンクを踏んだらメニューを閉じる（モバイル）
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 起動                                                                */
  /* ------------------------------------------------------------------ */

  renderWorks();
  renderFilter();
  renderSkills();
  setupNav();
  watchAllReveals();

  var yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
})();
