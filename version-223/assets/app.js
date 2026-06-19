function initNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
    });
}

function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initFilters() {
    const roots = Array.from(document.querySelectorAll('[data-filter-root]'));
    if (!roots.length) {
        return;
    }

    roots.forEach(function (root) {
        const scope = root.parentElement || document;
        const input = root.querySelector('[data-search-input]');
        const yearSelect = root.querySelector('[data-year-filter]');
        const typeSelect = root.querySelector('[data-type-filter]');
        const sortSelect = root.querySelector('[data-sort-select]');
        const empty = root.querySelector('[data-empty-state]');
        const list = scope.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('[data-card]'));
        const original = cards.slice();

        function yearMatches(value, year) {
            if (value === 'all') {
                return true;
            }
            const number = parseInt(year, 10);
            if (value === 'classic') {
                return !number || number < 2020;
            }
            return String(year).indexOf(value) !== -1;
        }

        function typeMatches(value, card) {
            if (value === 'all') {
                return true;
            }
            const type = card.getAttribute('data-type') || '';
            const genre = card.getAttribute('data-genre') || '';
            return type.indexOf(value) !== -1 || genre.indexOf(value) !== -1;
        }

        function applySort() {
            if (!sortSelect) {
                return;
            }

            const mode = sortSelect.value;
            const sorted = original.slice();

            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            } else if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            } else if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            }

            sorted.forEach(function (card) {
                const parent = card.parentElement;
                if (parent) {
                    parent.appendChild(card);
                }
            });
        }

        function filter() {
            const q = input ? input.value.trim().toLowerCase() : '';
            const y = yearSelect ? yearSelect.value : 'all';
            const t = typeSelect ? typeSelect.value : 'all';
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                const ok = (!q || searchText.indexOf(q) !== -1) &&
                    yearMatches(y, card.getAttribute('data-year') || '') &&
                    typeMatches(t, card);

                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filter);
                element.addEventListener('change', filter);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                filter();
            });
        }

        applySort();
        filter();
    });
}

function bindMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const button = document.getElementById(options.buttonId);
    const url = options.url;
    let ready = false;
    let hls = null;

    if (!video || !overlay || !url) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        ready = true;
    }

    function play() {
        attach();
        overlay.classList.add('is-hidden');
        video.controls = true;
        const result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', play);
    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            play();
        });
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

window.bindMoviePlayer = bindMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
});
