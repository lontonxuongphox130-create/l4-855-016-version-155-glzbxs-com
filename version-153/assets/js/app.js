function rootPrefix() {
  return window.location.pathname.includes('/movies/') ? '../' : './';
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>\"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '\"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function setupHeader() {
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      searchPanel.classList.toggle('is-open');
      const input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }
}

function setupHero() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }

  let current = 0;
  let timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      start();
    });
  });

  showSlide(0);
  start();
}

function setupLocalFilters() {
  const forms = Array.from(document.querySelectorAll('[data-filter-form]'));
  forms.forEach((form) => {
    const scopeSelector = form.getAttribute('data-filter-form');
    const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    const cards = scope ? Array.from(scope.querySelectorAll('[data-movie-card]')) : [];
    const empty = document.querySelector('[data-empty-state]');
    const inputs = Array.from(form.querySelectorAll('input, select'));

    function applyFilter() {
      const keyword = normalizeText(form.querySelector('[data-filter-keyword]')?.value);
      const type = normalizeText(form.querySelector('[data-filter-type]')?.value);
      const year = normalizeText(form.querySelector('[data-filter-year]')?.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalizeText(card.getAttribute('data-search'));
        const cardType = normalizeText(card.getAttribute('data-type'));
        const cardYear = normalizeText(card.getAttribute('data-year'));
        const okKeyword = !keyword || haystack.includes(keyword);
        const okType = !type || cardType.includes(type);
        const okYear = !year || cardYear === year;
        const ok = okKeyword && okType && okYear;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    inputs.forEach((input) => {
      input.addEventListener('input', applyFilter);
      input.addEventListener('change', applyFilter);
    });
  });
}

function setupGlobalSearch() {
  const inputs = Array.from(document.querySelectorAll('[data-global-search]'));
  const suggestions = Array.from(document.querySelectorAll('[data-search-suggestions]'));
  const searchPage = document.querySelector('[data-search-results]');
  const prefix = rootPrefix();

  function getItems(keyword) {
    const index = window.MovieSearchIndex || [];
    const query = normalizeText(keyword);
    if (!query) {
      return [];
    }
    return index.filter((item) => {
      const text = normalizeText([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags,
        item.category
      ].join(' '));
      return text.includes(query);
    }).slice(0, 18);
  }

  function renderSuggestion(container, items) {
    if (!container) {
      return;
    }
    container.innerHTML = items.slice(0, 6).map((item) => {
      return `<a href="${prefix}${item.link}"><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.category)}</span></a>`;
    }).join('');
  }

  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      const items = getItems(input.value);
      suggestions.forEach((container) => renderSuggestion(container, items));
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const query = encodeURIComponent(input.value.trim());
        if (query) {
          window.location.href = `${prefix}search.html?q=${query}`;
        }
      }
    });
  });

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const title = document.querySelector('[data-search-title]');
    const pageInput = document.querySelector('[data-page-search-input]');
    if (pageInput) {
      pageInput.value = query;
    }
    if (title && query) {
      title.textContent = `“${query}”相关内容`;
    }
    renderSearchResults(searchPage, getItems(query));
  }
}

function renderSearchResults(container, items) {
  if (!items.length) {
    container.innerHTML = '<div class="empty-state is-visible">没有找到匹配内容</div>';
    return;
  }

  container.innerHTML = items.map((item) => {
    return `
      <article class="movie-card">
        <a href="./${item.link}" class="poster">
          <img src="./${item.cover}.jpg" alt="${escapeHtml(item.title)}">
          <span class="poster-shade">${escapeHtml(item.year)} · ${escapeHtml(item.region)}</span>
        </a>
        <div class="card-body">
          <h3><a href="./${item.link}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.one)}</p>
          <div class="card-meta">
            <span class="badge">${escapeHtml(item.category)}</span>
            <span class="badge">${escapeHtml(item.type)}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function setupMoviePlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach((shell) => {
    const button = shell.querySelector('[data-play-button]');
    const video = shell.querySelector('video');
    const stream = shell.getAttribute('data-stream');

    function start() {
      if (!video || !stream) {
        return;
      }
      shell.classList.add('is-playing');
      if (!shell.dataset.ready) {
        shell.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(() => {});
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else {
          video.src = stream;
          video.play().catch(() => {});
        }
      } else {
        video.play().catch(() => {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', () => {
        if (!shell.dataset.ready) {
          start();
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupHero();
  setupLocalFilters();
  setupGlobalSearch();
  setupMoviePlayers();
});
