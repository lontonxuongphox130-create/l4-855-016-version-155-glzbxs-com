(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var input = document.getElementById("searchInput");
    var categorySelect = document.getElementById("categorySelect");
    var sortSelect = document.getElementById("searchSort");
    var results = document.getElementById("searchResults");
    var count = document.getElementById("searchCount");
    var limitNote = document.getElementById("searchLimitNote");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (!input || !categorySelect || !sortSelect || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    input.value = initialQuery;

    input.addEventListener("input", render);
    categorySelect.addEventListener("change", render);
    sortSelect.addEventListener("change", render);

    render();

    function render() {
      var query = input.value.trim().toLowerCase();
      var category = categorySelect.value;
      var sortValue = sortSelect.value;
      var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags,
          movie.oneLine
        ].join(" ").toLowerCase();

        var queryMatches = !query || text.indexOf(query) !== -1;
        var categoryMatches = !category || movie.category === category;
        return queryMatches && categoryMatches;
      });

      if (sortValue === "score-desc") {
        list.sort(function (a, b) { return b.score - a.score; });
      } else if (sortValue === "year-desc") {
        list.sort(function (a, b) { return b.year - a.year; });
      } else if (sortValue === "title-asc") {
        list.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hans-CN"); });
      } else {
        list.sort(function (a, b) { return b.heat - a.heat; });
      }

      count.textContent = "找到 " + list.length + " 部影片";
      results.innerHTML = list.slice(0, 240).map(toCard).join("");

      if (limitNote) {
        limitNote.textContent = list.length > 240
          ? "结果较多，已优先显示前 240 部，可继续输入关键词缩小范围。"
          : "";
      }
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function toCard(movie) {
      var tags = movie.tags.split("|").slice(0, 5).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card\">",
        "  <a class=\"movie-card-cover\" href=\"" + escapeHtml(movie.url) + "\">",
        "    <img class=\"movie-cover\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "    <span class=\"image-fallback\">" + escapeHtml(movie.title) + "</span>",
        "    <span class=\"movie-badge\">" + escapeHtml(movie.type) + "</span>",
        "    <span class=\"play-chip\">立即观看</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <div class=\"movie-card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
        "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class=\"movie-tags\">" + tags + "</div>",
        "  </div>",
        "</article>"
      ].join("");
    }
  });
})();
