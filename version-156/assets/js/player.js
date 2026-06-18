import { H as Hls } from "./hlsjs-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));

  players.forEach(function (box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var button = box.querySelector(".play-button");

    if (!video) {
      return;
    }

    var source = video.getAttribute("data-src");
    var hlsInstance = null;

    function prepare() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute("data-ready", "1");
    }

    function play() {
      prepare();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "1") {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
