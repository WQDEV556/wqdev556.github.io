/* ============================================================
   林间小筑 · 全站脚本
   1. 深浅色主题（记忆到 localStorage，跟随系统）
   2. 移动端菜单
   3. 顶栏吸顶阴影
   4. 首页搜索 / 标签筛选
   5. 文章页：阅读进度、目录高亮、阅读时长、代码复制
   6. 滚动浮现
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 主题 ---------- */
  var THEME_KEY = 'linjian-theme';

  function applyTheme(theme) {
    var resolved = theme;
    if (resolved !== 'dark' && resolved !== 'light') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', resolved);
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      var isDark = resolved === 'dark';
      btn.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
      btn.setAttribute('title', isDark ? '切换到浅色模式' : '切换到深色模式');
    }
  }

  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* 隐私模式 */ }
  applyTheme(stored);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var isDark = root.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* 忽略 */ }
  });

  /* ---------- 2. 移动端菜单 ---------- */
  var nav = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ---------- 3. 顶栏吸顶状态 ---------- */
  var head = document.querySelector('.site-head');
  if (head) {
    var onScrollHead = function () {
      head.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScrollHead();
    window.addEventListener('scroll', onScrollHead, { passive: true });
  }

  /* ---------- 4. 首页搜索 / 筛选 ---------- */
  var list = document.querySelector('[data-post-list]');
  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-post]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var input = document.querySelector('[data-search]');
    var empty = document.querySelector('[data-empty]');
    var countEl = document.querySelector('[data-count]');
    var activeTag = 'all';

    var normalize = function (s) {
      return (s || '').toLowerCase().trim();
    };

    var applyFilter = function () {
      var q = normalize(input ? input.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var tags = normalize(card.getAttribute('data-tags'));
        var haystack = normalize(card.getAttribute('data-search') || card.textContent);
        var tagOk = activeTag === 'all' || tags.split(/\s+/).indexOf(normalize(activeTag)) !== -1;
        var queryOk = !q || haystack.indexOf(q) !== -1;
        var ok = tagOk && queryOk;
        card.hidden = !ok;
        if (ok) shown += 1;
      });

      if (empty) empty.hidden = shown !== 0;
      if (countEl) countEl.textContent = String(shown);
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeTag = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        applyFilter();
      });
    });

    if (input) {
      var timer = null;
      input.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(applyFilter, 120);
      });
      // 兼容从其它页面带 #tag=xxx 过来，以及站内标签链接（只改 hash 不刷新）
      var applyHashTag = function () {
        var hash = window.location.hash;
        if (hash.indexOf('#tag=') !== 0) return;
        var wanted = decodeURIComponent(hash.slice(5));
        var match = chips.filter(function (c) {
          return c.getAttribute('data-filter') === wanted;
        })[0];
        if (match && match.getAttribute('aria-pressed') !== 'true') match.click();
      };
      applyHashTag();
      window.addEventListener('hashchange', applyHashTag);
    }
  }

  /* ---------- 5. 文章页 ---------- */
  var article = document.querySelector('[data-article]');
  if (article) {
    /* 5.1 阅读进度条 */
    var bar = document.querySelector('[data-progress]');
    if (bar) {
      var updateProgress = function () {
        var rect = article.getBoundingClientRect();
        var total = rect.height - window.innerHeight * 0.4;
        var passed = -rect.top + window.innerHeight * 0.25;
        var pct = total > 0 ? (passed / total) * 100 : 0;
        bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      };
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
    }

    /* 5.2 自动生成目录 */
    var toc = document.querySelector('[data-toc]');
    if (toc) {
      var headings = Array.prototype.slice.call(article.querySelectorAll('h2, h3'));
      if (headings.length >= 2) {
        var ol = document.createElement('ol');
        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'section-' + (i + 1);
          var li = document.createElement('li');
          li.className = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent.replace(/^#+\s*/, '');
          li.appendChild(a);
          ol.appendChild(li);
        });
        toc.appendChild(ol);

        var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
        if ('IntersectionObserver' in window) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var id = entry.target.id;
              links.forEach(function (l) {
                l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
              });
            });
          }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });
          headings.forEach(function (h) { observer.observe(h); });
        }
      } else {
        var wrap = toc.closest('.toc');
        if (wrap) wrap.hidden = true;
      }
    }

    /* 5.3 阅读时长（中文约 400 字/分钟，英文按词计） */
    var timeEl = document.querySelector('[data-read-time]');
    if (timeEl) {
      var text = article.innerText || '';
      var cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
      var words = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
      var minutes = Math.max(1, Math.round(cjk / 400 + words / 220));
      timeEl.textContent = minutes + ' 分钟阅读';
    }

    /* 5.4 代码块：加语言标签 + 复制按钮 */
    Array.prototype.forEach.call(article.querySelectorAll('pre'), function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;
      var cls = code.className || '';
      var lang = (cls.match(/language-([\w-]+)/) || [])[1] || 'code';

      /* 作者在 HTML 里已经写好 .code-block 时不再重复包裹，只补一个复制按钮 */
      var box = pre.closest('.code-block');
      var head;
      if (box) {
        head = box.querySelector('.code-head');
        if (!head) {
          head = document.createElement('div');
          head.className = 'code-head';
          box.insertBefore(head, box.firstChild);
        }
      } else {
        box = document.createElement('div');
        box.className = 'code-block';
        pre.parentNode.insertBefore(box, pre);
        head = document.createElement('div');
        head.className = 'code-head';
        var label = document.createElement('span');
        label.textContent = lang;
        head.appendChild(label);
        box.appendChild(head);
        box.appendChild(pre);
      }
      if (!head.textContent.trim()) {
        var autoLabel = document.createElement('span');
        autoLabel.textContent = lang;
        head.appendChild(autoLabel);
      }
      if (head.querySelector('.copy-btn')) return;

      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'copy-btn';
      copy.textContent = '复制';
      copy.addEventListener('click', function () {
        var done = function () {
          copy.textContent = '已复制';
          copy.classList.add('is-done');
          setTimeout(function () {
            copy.textContent = '复制';
            copy.classList.remove('is-done');
          }, 1800);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(code.innerText).then(done).catch(function () { fallback(); });
        } else {
          fallback();
        }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = code.innerText;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
          document.body.removeChild(ta);
        }
      });
      head.appendChild(copy);
    });
  }

  /* ---------- 6. 滚动浮现 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 7. 页脚年份 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 8. 回到顶部 ---------- */
  document.addEventListener('click', function (e) {
    var top = e.target.closest('[data-top]');
    if (top) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  });
})();
