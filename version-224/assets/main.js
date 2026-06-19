(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("missing-cover");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupFiltering() {
    var list = document.querySelector("[data-movie-list]");

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-search-input]");
    var sort = document.querySelector("[data-sort-select]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeFilter = "";

    function textFor(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags")
      ].join(" "));
    }

    function applyFilter() {
      var query = normalize(search ? search.value : "");
      var filter = normalize(activeFilter);

      cards.forEach(function (card) {
        var haystack = textFor(card);
        var matchesSearch = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = !filter || haystack.indexOf(filter) !== -1;
        card.classList.toggle("hidden-by-filter", !(matchesSearch && matchesFilter));
      });
    }

    function applySort() {
      var mode = sort ? sort.value : "year-desc";
      var sorted = cards.slice().sort(function (a, b) {
        var yearA = Number(a.getAttribute("data-year")) || 0;
        var yearB = Number(b.getAttribute("data-year")) || 0;
        var titleA = a.getAttribute("data-title") || "";
        var titleB = b.getAttribute("data-title") || "";

        if (mode === "year-asc") {
          return yearA - yearB || titleA.localeCompare(titleB, "zh-Hans-CN");
        }

        if (mode === "title-asc") {
          return titleA.localeCompare(titleB, "zh-Hans-CN");
        }

        return yearB - yearA || titleA.localeCompare(titleB, "zh-Hans-CN");
      });

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (search) {
      search.addEventListener("input", applyFilter);
    }

    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter-value") || "";
        applyFilter();
      });
    });

    applySort();
    applyFilter();
  }

  ready(function () {
    setupNavigation();
    setupImageFallbacks();
    setupHero();
    setupFiltering();
  });
})();
