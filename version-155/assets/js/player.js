(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(setupPlayer);
  });

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-start");
    var status = player.querySelector(".player-status");
    var source = player.getAttribute("data-video-src");
    var hlsInstance = null;
    var initialized = false;

    if (!video || !button || !source) {
      setStatus("播放器配置不完整");
      return;
    }

    button.addEventListener("click", function () {
      if (!initialized) {
        initialized = true;
        initializeHls(source);
      }

      playVideo();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        setStatus("已暂停");
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
      setStatus("正在播放");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        setStatus("已暂停");
      }
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
      setStatus("播放结束");
    });

    function initializeHls(url) {
      setStatus("正在加载播放源");
      video.controls = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源加载完成");
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络异常，正在重试");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("媒体异常，正在恢复");
            hlsInstance.recoverMediaError();
          } else {
            setStatus("当前浏览器无法播放该源");
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源加载完成");
        }, { once: true });
      } else {
        setStatus("当前浏览器不支持 HLS 播放");
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
          setStatus("请再次点击播放");
        });
      }
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }
  }
})();
