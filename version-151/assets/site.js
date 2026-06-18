(function () {
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 360) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-index")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  var searchInput = document.querySelector("[data-search-input]");
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial) {
      searchInput.value = initial;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty]");
    function normalize(text) {
      return String(text || "").toLowerCase().replace(/\s+/g, "");
    }
    function filterCards() {
      var key = normalize(searchInput.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var matched = !key || haystack.indexOf(key) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    searchInput.addEventListener("input", filterCards);
    filterCards();
  }
})();
