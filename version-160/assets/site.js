(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    initHero();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !yearValue || cardYear === yearValue;
          card.style.display = matchKeyword && matchYear ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var trigger = box.querySelector("[data-play-trigger]");
      if (!video || !trigger) {
        return;
      }

      function begin() {
        trigger.classList.add("is-hidden");
        attachStream(box, video);
      }

      trigger.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          attachStream(box, video);
        }
      });
    });
  }

  function attachStream(box, video) {
    var stream = box.getAttribute("data-stream");
    if (!stream) {
      return;
    }

    if (video.getAttribute("data-ready") === "yes") {
      video.play().catch(function () {});
      return;
    }

    video.setAttribute("data-ready", "yes");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || typeof SEARCH_INDEX === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var title = document.querySelector("[data-search-title]");
    var desc = document.querySelector("[data-search-desc]");
    var formInput = document.querySelector(".hero-search-form input[name='q']");

    if (formInput) {
      formInput.value = query;
    }

    if (!query) {
      return;
    }

    var lowered = query.toLowerCase();
    var matches = SEARCH_INDEX.filter(function (item) {
      return item.search.toLowerCase().indexOf(lowered) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = "搜索结果";
    }

    if (desc) {
      desc.textContent = "与“" + query + "”相关的影片内容";
    }

    results.innerHTML = matches.map(function (item) {
      return [
        "<article class=\"movie-card\" data-card>",
        "  <a class=\"poster-link\" href=\"./" + escapeAttr(item.file) + "\" aria-label=\"" + escapeAttr(item.title) + "\">",
        "    <img src=\"" + escapeAttr(item.cover) + "\" alt=\"" + escapeAttr(item.title) + "\" loading=\"lazy\">",
        "    <span class=\"poster-overlay\">立即播放</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <div class=\"movie-meta-line\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.rating) + "</span></div>",
        "    <h2><a href=\"./" + escapeAttr(item.file) + "\">" + escapeHtml(item.title) + "</a></h2>",
        "    <p>" + escapeHtml(item.oneLine) + "</p>",
        "    <div class=\"movie-foot\"><span>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + "</span><a href=\"./" + escapeAttr(item.file) + "\">详情</a></div>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
