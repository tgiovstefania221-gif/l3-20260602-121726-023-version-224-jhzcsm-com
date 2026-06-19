(function () {
    function initMoviePlayer(streamUrl) {
        var player = document.querySelector('.movie-player');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var loaded = false;
        var hls = null;

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function load() {
            if (!streamUrl || !video) {
                return;
            }
            if (!loaded) {
                loaded = true;
                video.controls = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                player.classList.add('is-playing');
            }
            play();
        }

        if (overlay) {
            overlay.addEventListener('click', load);
        }
        player.addEventListener('click', function (event) {
            if (!loaded && event.target !== overlay) {
                load();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
