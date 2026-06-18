(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallbacks();
    setupStaticFilters();
  });

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === activeIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        showSlide(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        restartTimer();
      });
    });

    showSlide(0);
    restartTimer();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
        image.setAttribute("aria-hidden", "true");
      }, { once: true });
    });
  }

  function setupStaticFilters() {
    var input = document.querySelector("[data-filter-input]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    var count = document.querySelector("[data-filter-count]");

    if (!grid || (!input && !sortSelect)) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));
    var originalCards = cards.slice();

    function getText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-category") || "",
        card.getAttribute("data-tags") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var isVisible = !query || getText(card).indexOf(query) !== -1;
        card.classList.toggle("is-filtered-out", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visibleCount + " / " + cards.length + " 部";
      }
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();

      if (value === "default") {
        sorted = originalCards.slice();
      } else if (value === "heat-desc") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
        });
      } else if (value === "score-desc") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
      } else if (value === "year-desc") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
      } else if (value === "title-asc") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }

      sorted.forEach(function (card) {
        if (card.parentNode) {
          card.parentNode.appendChild(card);
        }
      });

      cards = sorted;
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }

    applyFilter();
  }
})();
