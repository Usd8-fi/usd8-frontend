// Anti-Scam Check page (docs/anti-scam-check.html, hidden from the sidebar).
// The official handles are stored only as SHA-256("<platform>:<lowercase handle>")
// so the page source does not list them. To add one:
//   printf '%s' 'telegram:somehandle' | shasum -a 256
(function () {
    var OFFICIAL = {
        telegram: [
            "04371b182e24d20c98dc3b85011560845276fe1bba917936380e4fe3a2fce586"
        ],
        x: [
            "df5550b7e35c99dad1bc7f6ae0c129b375b34ab1424acb16dfc61f5259d7b23f",
            "a1c0e4e17097642771a06c87fc6618e711cd3b30b0c1edac15bc1b1b2deafac7"
        ]
    };
    var NAMES = { telegram: "Telegram", x: "X" };
    // Localised by docs-theme.js (window.usd8DocsText); English when it is absent.
    var EN = {
        antiScamInvalid: "Enter a valid {platform} username.",
        antiScamOfficial: "@{handle} is an official USD8 {platform} account.",
        antiScamUnknown: "@{handle} is not an official USD8 {platform} account. Treat it as a likely scam: do not send funds, sign transactions or share your seed phrase.",
        antiScamUnavailable: "Could not run the check in this browser."
    };
    function T(key, vars) {
        if (window.usd8DocsText) return window.usd8DocsText(key, vars);
        return EN[key].replace(/\{(\w+)\}/g, function (match, name) { return vars && vars[name] !== undefined ? String(vars[name]) : match; });
    }
    // Telegram usernames are 5-32 characters, X handles 1-15; both use letters, digits and "_".
    var PATTERN = { telegram: /^[a-z0-9_]{5,32}$/, x: /^[a-z0-9_]{1,15}$/ };
    var URL_PREFIX = {
        telegram: /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//,
        x: /^(https?:\/\/)?(www\.|mobile\.)?(x\.com|twitter\.com)\//
    };

    function normalize(platform, value) {
        var handle = String(value).trim().toLowerCase().replace(URL_PREFIX[platform], "");
        return handle.replace(/^@+/, "").replace(/[/?#].*$/, "");
    }

    async function sha256(text) {
        var bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(bytes), function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    }

    async function verify(platform, value) {
        var handle = normalize(platform, value);
        if (!PATTERN[platform].test(handle)) return { state: "invalid", handle: handle };
        var digest = await sha256(platform + ":" + handle);
        return { state: OFFICIAL[platform].indexOf(digest) >= 0 ? "official" : "unknown", handle: handle };
    }

    function message(platform, outcome) {
        var vars = { platform: NAMES[platform], handle: outcome.handle };
        if (outcome.state === "invalid") return T("antiScamInvalid", vars);
        if (outcome.state === "official") return T("antiScamOfficial", vars);
        return T("antiScamUnknown", vars);
    }

    function setup() {
        if (document.querySelector(".anti-scam-check") && !document.querySelector('meta[name="robots"]')) {
            var robots = document.createElement("meta");
            robots.name = "robots";
            robots.content = "noindex";
            document.head.appendChild(robots);
        }
        document.querySelectorAll(".anti-scam-check[data-platform]").forEach(function (box) {
            var platform = box.dataset.platform;
            var input = box.querySelector("input");
            var button = box.querySelector("button");
            var result = box.querySelector(".anti-scam-result");
            if (!OFFICIAL[platform] || !input || !button || !result) return;

            async function check() {
                if (!input.value.trim()) return;
                button.disabled = true;
                try {
                    var outcome = await verify(platform, input.value);
                    result.dataset.state = outcome.state;
                    result.textContent = message(platform, outcome);
                } catch (error) {
                    result.dataset.state = "invalid";
                    result.textContent = T("antiScamUnavailable");
                } finally {
                    button.disabled = false;
                }
            }

            button.addEventListener("click", check);
            input.addEventListener("keydown", function (event) { if (event.key === "Enter") check(); });
            input.addEventListener("input", function () { result.textContent = ""; result.dataset.state = ""; });
        });
    }

    window.usd8AntiScam = { normalize: normalize, verify: verify, official: OFFICIAL };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
        setup();
    }
})();
