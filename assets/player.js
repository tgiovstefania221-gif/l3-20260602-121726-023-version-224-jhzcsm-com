(function () {
  var HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("HLS library failed to load"));
      };
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function setStatus(element, message) {
    if (element) {
      element.textContent = message;
    }
  }

  function setupPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-play-button]");
    var status = container.querySelector("[data-player-status]");
    var source = container.getAttribute("data-source") || (video && video.getAttribute("data-video-source"));
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
      setStatus(status, "播放器缺少视频地址。");
      return;
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      video.setAttribute("playsinline", "");
      video.controls = true;
      setStatus(status, "正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus(status, "播放源已加载，点击视频可继续控制播放。");
        return Promise.resolve();
      }

      return loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(status, "播放源已解析，点击视频可继续控制播放。");
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus(status, "播放源加载异常，请稍后重试。");
            }
          });
        } else {
          video.src = source;
          setStatus(status, "当前浏览器将尝试直接播放 m3u8 地址。");
        }
      }).catch(function () {
        video.src = source;
        setStatus(status, "已切换为浏览器原生播放模式。");
      });
    }

    function play() {
      attachSource().then(function () {
        if (button) {
          button.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus(status, "播放已准备，请再次点击视频开始。");
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!initialized || video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
      setStatus(status, "正在播放。");
    });

    video.addEventListener("pause", function () {
      setStatus(status, "已暂停，点击视频继续播放。");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
