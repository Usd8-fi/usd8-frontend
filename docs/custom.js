// Inject pills into sidebar links. Runs repeatedly because mdBook's sidebar
// is populated asynchronously by a custom element.
// To add a new pill, append an entry to NAV_PILLS below.
(function () {
    var NAV_PILLS = [
        { match: 'boosters',    label: 'LIVE' },
        { match: 'help-needed', label: 'LIVE' }
    ];

    function findLink(items, match) {
        var found = null;
        items.forEach(function (li) {
            var a = li.querySelector('a');
            if (!a) return;
            var href = a.getAttribute('href') || '';
            var txt = (a.textContent || '').trim().toLowerCase();
            if (href.toLowerCase().endsWith(match + '.html')) found = a;
            else if (txt.endsWith(match.replace('-', ' '))) found = a;
        });
        return found;
    }

    function inject() {
        var items = document.querySelectorAll('ol.chapter > li.chapter-item');
        if (!items.length) return false;
        var allDone = true;
        NAV_PILLS.forEach(function (cfg) {
            var link = findLink(items, cfg.match);
            if (!link) { allDone = false; return; }
            if (link.querySelector('.nav-live-pill')) return;
            var pill = document.createElement('span');
            pill.className = 'nav-live-pill';
            pill.textContent = cfg.label;
            link.appendChild(pill);
        });
        return allDone;
    }
    function tryRepeatedly() {
        if (inject()) return;
        var tries = 0;
        var iv = setInterval(function () {
            tries++;
            if (inject() || tries > 40) clearInterval(iv);
        }, 50);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryRepeatedly);
    } else {
        tryRepeatedly();
    }
})();
