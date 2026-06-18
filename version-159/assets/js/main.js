(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-movie-list-scope]').forEach(function (scope) {
    var inputs = Array.prototype.slice.call(scope.querySelectorAll('[data-search-input]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var sortSelect = scope.querySelector('[data-sort-select]');
    var grid = scope.querySelector('[data-movie-grid]');

    function filterCards() {
      var query = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(' ');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || query.split(/\s+/).every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!sortSelect || !grid) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();

      sorted.sort(function (a, b) {
        if (value === 'year-desc') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (value === 'score-desc') {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        }
        if (value === 'title-asc') {
          return (a.getAttribute('data-search') || '').localeCompare(b.getAttribute('data-search') || '', 'zh-Hans-CN');
        }
        return 0;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      filterCards();
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', filterCards);
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
  });
})();
