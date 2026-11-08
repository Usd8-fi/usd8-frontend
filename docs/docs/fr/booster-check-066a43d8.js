(function () {
    // Localised by docs-theme.js (window.usd8DocsText); English when it is absent.
    var EN = { invalidAddress: "Enter a valid Ethereum address.", checking: "Checking...", noBoosters: "No Boosters found for this address.", found_one: "Congratulations! You have {count} Booster.", found_other: "Congratulations! You have {count} Boosters.", error: "Error: {message}", fetchFailed: "could not fetch balance" };
    var T = function (key, vars) {
        if (window.usd8DocsText) return window.usd8DocsText(key, vars);
        if (vars && typeof vars.count === "number" && EN[key + "_other"]) key += vars.count === 1 ? "_one" : "_other";
        return (EN[key] || key).replace(/\{(\w+)\}/g, function (match, name) { return vars && vars[name] !== undefined ? String(vars[name]) : match; });
    };
    var RPC_URL = "https://ethereum.publicnode.com";
    var CONTRACT = "0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d";
    var BALANCE_OF_SELECTOR = "0x00fdd58e";
    var TOKEN_ID = 1;

    function setup() {
        var input = document.getElementById("booster-address");
        var button = document.getElementById("booster-check-btn");
        var result = document.getElementById("booster-result");
        if (!input || !button || !result) return;

        function show(message, state, count) {
            result.replaceChildren();
            result.dataset.state = state || "";

            var text = document.createElement("p");
            text.className = "booster-message";
            text.textContent = message;
            result.appendChild(text);

            if (count > 0) {
                var grid = document.createElement("div");
                grid.className = "booster-grid";
                for (var i = 0; i < count; i += 1) {
                    var image = document.createElement("img");
                    image.src = "/assets/booster.png";
                    image.alt = "Booster";
                    grid.appendChild(image);
                }
                result.appendChild(grid);
            }
        }

        async function check() {
            var address = input.value.trim();
            if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
                show(T("invalidAddress"), "error", 0);
                return;
            }

            button.disabled = true;
            show(T("checking"), "loading", 0);

            try {
                var addressPadded = address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
                var tokenPadded = TOKEN_ID.toString(16).padStart(64, "0");
                var response = await fetch(RPC_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "eth_call",
                        params: [{ to: CONTRACT, data: BALANCE_OF_SELECTOR + addressPadded + tokenPadded }, "latest"]
                    })
                });
                var json = await response.json();
                if (json.error) throw new Error(json.error.message || "RPC error");

                var count = parseInt(json.result, 16);
                if (!count) {
                    show(T("noBoosters"), "empty", 0);
                } else {
                    show(T("found", { count: count }), "success", count);
                }
            } catch (error) {
                show(T("error", { message: error.message || T("fetchFailed") }), "error", 0);
            } finally {
                button.disabled = false;
            }
        }

        button.addEventListener("click", check);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") check();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
        setup();
    }
})();
