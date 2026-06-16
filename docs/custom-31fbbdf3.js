// Inject a LIVE pill into the Boosters sidebar link. Runs repeatedly because
// mdBook's sidebar is populated asynchronously by a custom element.
(function () {
    function inject() {
        var items = document.querySelectorAll('ol.chapter > li.chapter-item');
        if (!items.length) return false;
        var boostersLink = null;
        items.forEach(function (li) {
            var a = li.querySelector('a');
            if (!a) return;
            var txt = (a.textContent || '').trim().toLowerCase();
            if (txt.endsWith('boosters')) boostersLink = a;
            var href = a.getAttribute('href') || '';
            if (href.endsWith('boosters.html')) boostersLink = a;
        });
        if (!boostersLink) return false;
        if (boostersLink.querySelector('.nav-live-pill')) return true;
        var pill = document.createElement('span');
        pill.className = 'nav-live-pill';
        pill.textContent = 'LIVE';
        boostersLink.appendChild(pill);
        return true;
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
