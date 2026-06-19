(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var sliders = document.querySelectorAll('[data-slider]');
    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-dot]'));
        var index = 0;

        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelect = document.querySelector('[data-filter-select]');
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function runFilter() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var selected = filterSelect ? filterSelect.value.trim().toLowerCase() : '';
        var visible = 0;

        filterItems.forEach(function (item) {
            var text = (item.getAttribute('data-filter') || '').toLowerCase();
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchSelected = !selected || text.indexOf(selected) !== -1;
            var shouldShow = matchKeyword && matchSelected;
            item.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', runFilter);
    }
})();
