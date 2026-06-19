(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".nav-menu");
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initImageFallbacks() {
        document.querySelectorAll("img[data-fallback-image]").forEach(function (image) {
            image.addEventListener("error", function () {
                var frame = image.closest(".poster-frame");
                if (frame) {
                    frame.classList.add("is-empty");
                }
                image.remove();
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initHeroSearch() {
        var form = document.querySelector(".hero-search");
        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            var target = form.getAttribute("data-target") || "search.html";
            window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
        });
    }

    function populateYears(cards, select) {
        if (!select) {
            return;
        }
        var years = [];
        cards.forEach(function (card) {
            var year = card.getAttribute("data-year") || "";
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });
        years.sort(function (a, b) {
            return parseInt(b, 10) - parseInt(a, 10);
        });
        years.forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    function initCards() {
        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-movie-grid]"));
        if (!grids.length) {
            return;
        }

        grids.forEach(function (grid) {
            var scope = grid.closest("main") || document;
            var search = scope.querySelector(".movie-search");
            var yearSelect = scope.querySelector(".year-filter");
            var sortSelect = scope.querySelector(".sort-filter");
            var empty = scope.querySelector(".empty-state");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));

            populateYears(cards, yearSelect);

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && search) {
                search.value = query;
            }

            function applyFilters() {
                var term = normalize(search ? search.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesTerm = !term || haystack.indexOf(term) !== -1;
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var visible = matchesTerm && matchesYear;
                    card.classList.toggle("is-hidden", !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            function applySort() {
                var mode = sortSelect ? sortSelect.value : "year-desc";
                cards.sort(function (left, right) {
                    if (mode === "title-asc") {
                        return (left.getAttribute("data-title") || "").localeCompare(right.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    var leftYear = parseInt(left.getAttribute("data-year") || "0", 10);
                    var rightYear = parseInt(right.getAttribute("data-year") || "0", 10);
                    return mode === "year-asc" ? leftYear - rightYear : rightYear - leftYear;
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilters();
            }

            if (search) {
                search.addEventListener("input", applyFilters);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilters);
            }
            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }

            applySort();
        });
    }

    function initPlayer() {
        var frame = document.querySelector(".player-frame[data-video]");
        if (!frame) {
            return;
        }

        var video = frame.querySelector("video");
        var overlay = frame.querySelector(".player-overlay");
        var source = frame.getAttribute("data-video");
        if (!video || !source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        function startVideo() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startVideo);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    ready(function () {
        initNavigation();
        initImageFallbacks();
        initHero();
        initHeroSearch();
        initCards();
        initPlayer();
    });
})();
