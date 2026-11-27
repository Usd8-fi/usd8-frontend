// Anti-Scam Check section at the bottom of the Branding and Assets page
// (docs/branding.html#anti-scam-check; the old anti-scam-check.html redirects there).
// The official handles are stored only as SHA-256("<platform>:<lowercase handle>")
// so the page source does not list them. To add one:
//   printf '%s' 'telegram:somehandle' | shasum -a 256
// Email addresses use the same scheme: printf '%s' 'email:name@example.com' | shasum -a 256
(function () {
    var OFFICIAL = {
        telegram: [
            "04371b182e24d20c98dc3b85011560845276fe1bba917936380e4fe3a2fce586"
        ],
        x: [
            "df5550b7e35c99dad1bc7f6ae0c129b375b34ab1424acb16dfc61f5259d7b23f",
            "a1c0e4e17097642771a06c87fc6618e711cd3b30b0c1edac15bc1b1b2deafac7",
            "f3131199e0fec17e1a5005484b190b9bb7d12726331dd5098bd11f5fba7e5556"
        ],
        email: [
            "f7ed38f3c4ee29f38fb975a088c1989feea744388934deba76fb8b869e3ecd2d"
        ]
    };
    var NAMES = { telegram: "Telegram", x: "X", email: "Email" };
    // Localised by docs-theme.js (window.usd8DocsText); English when it is absent.
    var EN = {
        antiScamInvalid: "Enter a valid {platform} username.",
        antiScamOfficial: "@{handle} is an official USD8 {platform} account.",
        antiScamUnknown: "@{handle} is not an official USD8 {platform} account. Treat it as a likely scam: do not send funds, sign transactions or share your seed phrase.",
        antiScamUnavailable: "Could not run the check in this browser.",
        antiScamEmailInvalid: "Enter a valid email address.",
        antiScamEmailOfficial: "{address} is an official USD8 email address.",
        antiScamEmailUnknown: "{address} is not an official USD8 email address. Treat it as a likely scam: do not send funds, sign transactions or share your seed phrase."
    };
    function T(key, vars) {
        if (window.usd8DocsText) return window.usd8DocsText(key, vars);
        return EN[key].replace(/\{(\w+)\}/g, function (match, name) { return vars && vars[name] !== undefined ? String(vars[name]) : match; });
    }
    // Telegram usernames are 5-32 characters, X handles 1-15; both use letters, digits and "_".
    var PATTERN = { telegram: /^[a-z0-9_]{5,32}$/, x: /^[a-z0-9_]{1,15}$/, email: /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/ };
    var URL_PREFIX = {
        telegram: /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//,
        x: /^(https?:\/\/)?(www\.|mobile\.)?(x\.com|twitter\.com)\//,
        email: /^mailto:/
    };

    function normalize(platform, value) {
        if (platform === "email") {
            // Accepts "name@example.com", "mailto:name@example.com" or a pasted "Name <name@example.com>" sender line.
            var address = String(value).trim().toLowerCase();
            var bracketed = address.match(/<([^>]*)>/);
            if (bracketed) address = bracketed[1].trim();
            return address.replace(URL_PREFIX.email, "").replace(/[?#].*$/, "");
        }
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
        if (platform === "email") {
            var mail = { address: outcome.handle };
            if (outcome.state === "invalid") return T("antiScamEmailInvalid", mail);
            if (outcome.state === "official") return T("antiScamEmailOfficial", mail);
            return T("antiScamEmailUnknown", mail);
        }
        var vars = { platform: NAMES[platform], handle: outcome.handle };
        if (outcome.state === "invalid") return T("antiScamInvalid", vars);
        if (outcome.state === "official") return T("antiScamOfficial", vars);
        return T("antiScamUnknown", vars);
    }

    function setup() {
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
