const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function initMobileMenu() {
  const button = qs('[data-mobile-toggle]');
  const panel = qs('[data-mobile-panel]');
  if (!button || !panel) return;
  button.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
}

function initHero() {
  const slides = qsa('[data-hero-slide]');
  const dots = qsa('[data-hero-dot]');
  if (slides.length < 2) return;
  let index = 0;
  let timer = null;
  const show = (next) => {
    index = next;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const start = () => {
    timer = window.setInterval(() => show((index + 1) % slides.length), 5200);
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (timer) window.clearInterval(timer);
      show(i);
      start();
    });
  });
  show(0);
  start();
}

function initFilters() {
  const search = qs('[data-search-input]');
  const year = qs('[data-year-filter]');
  const type = qs('[data-type-filter]');
  const cards = qsa('[data-movie-card]');
  const empty = qs('[data-empty-message]');
  if (!cards.length) return;
  const apply = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const selectedYear = year?.value || '';
    const selectedType = type?.value || '';
    let visible = 0;
    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const okQuery = !query || text.includes(query);
      const okYear = !selectedYear || card.dataset.year === selectedYear;
      const okType = !selectedType || card.dataset.type === selectedType;
      const ok = okQuery && okYear && okType;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };
  [search, year, type].filter(Boolean).forEach((el) => el.addEventListener('input', apply));
  apply();
}

function markBrokenImages() {
  qsa('img').forEach((img) => {
    img.addEventListener('error', () => {
      const parent = img.closest('.card-cover, .hero-poster, .related-item');
      if (parent) parent.classList.add('image-missing');
    });
  });
}

function initPlayer() {
  const player = qs('[data-player]');
  const video = qs('[data-video]');
  const layer = qs('[data-play-layer]');
  const data = qs('#player-data');
  if (!player || !video || !layer || !data) return;
  let config = {};
  try {
    config = JSON.parse(data.textContent || '{}');
  } catch (error) {
    config = {};
  }
  const url = config.url;
  if (!url) return;
  let ready = false;
  const prepare = () => {
    if (ready) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  };
  const play = () => {
    prepare();
    layer.classList.add('hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        layer.classList.remove('hidden');
      });
    }
  };
  layer.addEventListener('click', play);
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHero();
  initFilters();
  markBrokenImages();
  initPlayer();
});
