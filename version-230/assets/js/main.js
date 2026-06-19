(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('#hero-carousel');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        hero.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        });

        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        selectAll('[data-card-filter]').forEach(function (panel) {
            var input = panel.querySelector('.filter-input');
            var year = panel.querySelector('.filter-year');
            var type = panel.querySelector('.filter-type');
            var cards = selectAll('.category-list .movie-card');

            function match(card) {
                var query = (input && input.value || '').trim().toLowerCase();
                var selectedYear = year && year.value || '';
                var selectedType = type && type.value || '';
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-meta') || '',
                    card.getAttribute('data-genre') || ''
                ].join(' ').toLowerCase();
                var okQuery = !query || text.indexOf(query) !== -1;
                var okYear = !selectedYear || (card.getAttribute('data-year') || '') === selectedYear;
                var okType = !selectedType || (card.getAttribute('data-type') || '').indexOf(selectedType) !== -1;
                return okQuery && okYear && okType;
            }

            function apply() {
                cards.forEach(function (card) {
                    card.style.display = match(card) ? '' : 'none';
                });
            }

            [input, year, type].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
        });
    }

    setupMenu();
    setupHero();
    setupFilters();
})();
