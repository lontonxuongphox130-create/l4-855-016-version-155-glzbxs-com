(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('.filter-input');
        var clear = scope.querySelector('.filter-clear');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var container = scope.parentElement;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('.empty-state');
        var activeFilter = 'all';

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var filterMatch = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                var visible = keywordMatch && filterMatch;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                activeFilter = 'all';
                buttons.forEach(function (button) {
                    button.classList.toggle('is-active', button.getAttribute('data-filter') === 'all');
                });
                applyFilter();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });
}());

function initMoviePlayer(streamUrl) {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var button = player.querySelector('.play-button');
    var hlsInstance = null;

    function attachStream() {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
        attachStream();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        video.setAttribute('playsinline', 'playsinline');
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
