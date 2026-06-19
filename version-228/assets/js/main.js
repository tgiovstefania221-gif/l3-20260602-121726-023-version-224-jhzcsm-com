(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
  var grid = document.querySelector("[data-card-grid]");
  var empty = document.querySelector(".empty-state");

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var match = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  function applySort() {
    if (!sortSelect || !grid) {
      return;
    }
    var mode = sortSelect.value;
    var ordered = cards.slice().sort(function (a, b) {
      if (mode === "rating") {
        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
      }
      if (mode === "title") {
        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      }
      return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
    });
    ordered.forEach(function (card) {
      grid.appendChild(card);
    });
    applyFilters();
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", applySort);
    applySort();
  } else {
    applyFilters();
  }
})();
