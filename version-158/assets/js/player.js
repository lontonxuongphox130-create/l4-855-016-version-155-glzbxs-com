(function() {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var startButton = player.querySelector('[data-play-start]');
    var errorBox = player.querySelector('[data-player-error]');
    var sourceUrl = source ? source.getAttribute('src') : '';
    var hlsInstance = null;
    var initialized = false;

    function showError() {
        if (errorBox) {
            errorBox.classList.add('is-active');
        }
    }

    function hideOverlay() {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (startButton) {
            startButton.classList.remove('is-hidden');
        }
    }

    function initPlayer() {
        if (initialized || !video || !sourceUrl) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);

            hlsInstance.on(window.Hls.Events.ERROR, function(_, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }

                showError();
            });

            return;
        }

        showError();
    }

    function playVideo() {
        initPlayer();
        hideOverlay();

        if (!video) {
            return;
        }

        var action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function() {
                showOverlay();
            });
        }
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    if (video) {
        video.addEventListener('click', function() {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);
    }

    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
