(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        restart();
      });
    });

    start();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('.search-box'));

  forms.forEach(function (form) {
    var input = form.querySelector('input[type="search"]');
    if (!input) {
      return;
    }

    var filter = function () {
      var keyword = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered-out', keyword !== '' && text.indexOf(keyword) === -1);
      });
    };

    input.addEventListener('input', filter);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
  });
})();

function initializeMoviePlayer(source) {
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  var started = false;
  var hls = null;

  if (!video || !cover || !source) {
    return;
  }

  var attach = function () {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  var play = function () {
    attach();
    cover.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  };

  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
