const Cinema = {
  initPlayer(source) {
    const video = document.querySelector("[data-player]");
    const overlay = document.querySelector("[data-player-cover]");
    const playButton = document.querySelector("[data-play-button]");
    if (!video || !source) {
      return;
    }

    let mounted = false;
    let hls = null;

    const mount = () => {
      if (mounted) {
        return;
      }
      mounted = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    };

    const showOverlay = () => {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    };

    const hideOverlay = () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    };

    const play = () => {
      mount();
      hideOverlay();
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(showOverlay);
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (playButton) {
      playButton.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);

    document.querySelectorAll("[data-scroll-player]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        video.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        play();
      });
    });

    mount();
    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  }
};

function setMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function setHero() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }
  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  const prev = carousel.querySelector("[data-hero-prev]");
  const next = carousel.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      show(dotIndex);
      start();
    });
  });
  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      start();
    });
  }
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  show(0);
  start();
}

function normalize(value) {
  return (value || "").toString().toLowerCase().trim();
}

function applyScope(scope) {
  const input = scope.querySelector("[data-search-input]");
  const query = normalize(input ? input.value : "");
  const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
  const groups = Array.from(scope.querySelectorAll("[data-filter-group]"));
  const filters = groups.map((group) => ({
    key: group.getAttribute("data-filter-key"),
    value: normalize(group.getAttribute("data-active-value"))
  }));

  cards.forEach((card) => {
    const searchText = normalize(card.getAttribute("data-search"));
    const keywordMatched = !query || searchText.includes(query);
    const filterMatched = filters.every((filter) => {
      if (!filter.key || !filter.value) {
        return true;
      }
      return normalize(card.getAttribute(`data-${filter.key}`)) === filter.value;
    });
    card.hidden = !(keywordMatched && filterMatched);
  });
}

function setSearch() {
  document.querySelectorAll("[data-search-scope]").forEach((scope) => {
    const inputs = scope.querySelectorAll("[data-search-input]");
    inputs.forEach((input) => {
      input.addEventListener("input", () => applyScope(scope));
    });
    scope.querySelectorAll("[data-filter-group]").forEach((group) => {
      group.querySelectorAll("[data-filter-value]").forEach((button) => {
        button.addEventListener("click", () => {
          group.setAttribute("data-active-value", button.getAttribute("data-filter-value") || "");
          group.querySelectorAll("[data-filter-value]").forEach((item) => {
            item.classList.toggle("active", item === button);
          });
          applyScope(scope);
        });
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setMenu();
  setHero();
  setSearch();
});
