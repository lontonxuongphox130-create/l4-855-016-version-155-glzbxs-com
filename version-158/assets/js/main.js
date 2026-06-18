(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                showSlide(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(activeIndex - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                showSlide(activeIndex + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-section]')).forEach(function(section) {
        var searchInput = section.querySelector('[data-search-input]');
        var yearSelect = section.querySelector('[data-year-filter]');
        var typeSelect = section.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
        var empty = section.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(searchInput ? searchInput.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var visible = 0;

            cards.forEach(function(card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-active', visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
    });

    document.addEventListener('error', function(event) {
        var target = event.target;

        if (target && target.tagName === 'IMG') {
            target.classList.add('image-missing');
        }
    }, true);
})();
