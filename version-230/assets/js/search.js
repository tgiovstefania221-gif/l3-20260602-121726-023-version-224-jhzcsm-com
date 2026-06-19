(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function movieCard(movie) {
        return [
            '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '">',
            '    <div class="poster-frame">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '        <span class="poster-play">▶</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '        <div class="movie-card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.category) + '</div>',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p>' + escapeHtml(movie.description) + '</p>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function search(movies, query) {
        var q = query.toLowerCase();
        if (!q) {
            return movies.slice(0, 80);
        }
        return movies.filter(function (movie) {
            var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.description].join(' ').toLowerCase();
            return text.indexOf(q) !== -1;
        });
    }

    function render() {
        var input = document.querySelector('#searchInput');
        var results = document.querySelector('#searchResults');
        var count = document.querySelector('#searchCount');
        var movies = window.SEARCH_MOVIES || [];
        var query = getQuery();
        if (input) {
            input.value = query;
        }
        var matched = search(movies, query);
        if (count) {
            count.textContent = query ? '找到 ' + matched.length + ' 部相关内容' : '热门内容推荐';
        }
        if (results) {
            results.innerHTML = matched.map(movieCard).join('');
        }
    }

    render();
})();
