(function () {
  function activatePlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-cover");
    var stream = shell.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function attachStream() {
      if (loaded || !video || !stream) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }
    }

    function startVideo() {
      attachStream();
      shell.classList.add("is-started");
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          shell.classList.remove("is-started");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-started");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-started");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-stream]")).forEach(activatePlayer);
  });
})();
