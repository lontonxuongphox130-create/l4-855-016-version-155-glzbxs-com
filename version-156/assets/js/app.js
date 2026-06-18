document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var previous = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector("[data-empty-filter]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function yearMatches(cardYear, selectedYear) {
    if (!selectedYear) {
      return true;
    }

    var numericYear = parseInt(cardYear, 10);
    var numericSelected = parseInt(selectedYear, 10);

    if (selectedYear === "2021") {
      return numericYear <= 2021;
    }

    return numericYear === numericSelected;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : "");
    var yearValue = yearFilter ? yearFilter.value : "";
    var typeValue = typeFilter ? typeFilter.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search"));
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matched = true;

      if (query && searchText.indexOf(query) === -1) {
        matched = false;
      }

      if (!yearMatches(cardYear, yearValue)) {
        matched = false;
      }

      if (typeValue && cardType.indexOf(typeValue) === -1) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput || yearFilter || typeFilter) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && filterInput) {
      filterInput.value = initialQuery;
    }

    [filterInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
