
(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initializeNavigation() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = menu.hasAttribute("hidden") === false;
            if (isOpen) {
                menu.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
            } else {
                menu.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
            }
        });
    }

    function initializeHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (slides.length <= 1) {
            return;
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function initializeFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var container = panel.parentElement || document;
            var search = panel.querySelector(".filter-search");
            var region = panel.querySelector(".filter-region");
            var year = panel.querySelector(".filter-year");
            var type = panel.querySelector(".filter-type");
            var cards = Array.prototype.slice.call(container.querySelectorAll(".filter-grid .movie-card"));
            var empty = container.querySelector(".empty-state");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(search && search.value);
                var selectedRegion = region ? region.value : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute("data-search"));
                    var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                    var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
                    var shouldShow = matchKeyword && matchRegion && matchYear && matchType;
                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && search) {
                search.value = query;
            }
            apply();
        });
    }

    function initializeBackToTop() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".back-to-top"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !sourceUrl) {
            return;
        }
        var loaded = false;
        var hls = null;

        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function playVideo() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }
        Array.prototype.slice.call(document.querySelectorAll("[data-start-player]")).forEach(function (button) {
            button.addEventListener("click", function () {
                setTimeout(playVideo, 250);
            });
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initializeNavigation();
        initializeHero();
        initializeFilters();
        initializeBackToTop();
    });
})();
