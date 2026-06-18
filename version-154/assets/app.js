(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-nav-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-global-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      }
    });
  });

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  document.querySelectorAll("[data-filter-grid]").forEach(function (scope) {
    var searchInput = scope.querySelector("[data-local-search]");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var activeValue = "all";

    function applyFilters() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-search") || "",
          card.getAttribute("data-filter") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var typeValue = card.getAttribute("data-filter") || "";
        var yearValue = card.getAttribute("data-year") || "";
        var tagValue = card.getAttribute("data-tags") || "";
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesFilter = activeValue === "all" || typeValue === activeValue || yearValue === activeValue || tagValue.indexOf(activeValue) !== -1;
        card.classList.toggle("is-hidden", !(matchesTerm && matchesFilter));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeValue = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });

    if (searchInput) {
      var query = new URLSearchParams(window.location.search).get("q");
      if (query && scope.closest("main") && document.body.textContent.indexOf("片库搜索") !== -1) {
        searchInput.value = query;
      }
      searchInput.addEventListener("input", applyFilters);
    }

    applyFilters();
  });

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-overlay");
    var stream = box.getAttribute("data-stream");
    var ready = false;
    var hls;

    function beginPlayback() {
      if (!video || !stream) {
        return;
      }

      box.classList.add("is-playing");
      video.controls = true;

      if (!ready) {
        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }

        video.src = stream;
      }

      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          beginPlayback();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
