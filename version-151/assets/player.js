(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    if (!video || !button || !url) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach(done) {
      if (attached) {
        done();
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        attached = true;
        done();
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          attached = true;
          done();
        } else {
          video.src = url;
          attached = true;
          done();
        }
      });
    }

    function start() {
      button.classList.add("is-hidden");
      attach(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
