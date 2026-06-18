(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var queryInput = filterRoot.querySelector("[data-filter-query]");
      var genreSelect = filterRoot.querySelector("[data-filter-genre]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var yearSelect = filterRoot.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
      var empty = filterRoot.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (queryInput && initialQuery) {
        queryInput.value = initialQuery;
      }

      function filterCards() {
        var keyword = text(queryInput && queryInput.value);
        var genre = text(genreSelect && genreSelect.value);
        var region = text(regionSelect && regionSelect.value);
        var year = text(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var target = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
          ].map(text).join(" ");
          var matchKeyword = !keyword || target.indexOf(keyword) !== -1;
          var matchGenre = !genre || text(card.getAttribute("data-genre")).indexOf(genre) !== -1;
          var matchRegion = !region || text(card.getAttribute("data-region")).indexOf(region) !== -1;
          var matchYear = !year || text(card.getAttribute("data-year")) === year;
          var show = matchKeyword && matchGenre && matchRegion && matchYear;

          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [queryInput, genreSelect, regionSelect, yearSelect].forEach(function (item) {
        if (item) {
          item.addEventListener("input", filterCards);
          item.addEventListener("change", filterCards);
        }
      });

      filterCards();
    }
  });

  window.setupPlayer = function (sourceUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector(".play-overlay");

    if (!video || !sourceUrl) {
      return;
    }

    var started = false;

    function start() {
      if (!started) {
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      if (overlay) {
        overlay.classList.add("hidden");
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  };
})();
