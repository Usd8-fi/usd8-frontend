(function () {
    // Lists every operation scheduled through the USD8 timelock, newest first,
    // from the Blockscout log index. Status comes from the timelock's own events:
    // executed and cancelled operations are final; anything else is queued until
    // its delay has passed and ready to execute after that.
    var CALL_SCHEDULED = "0x4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca";
    var CALL_EXECUTED = "0xc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b58";
    var CANCELLED = "0xbaa1eb22f2a492ba1a5fea61b8df4d27c6c8b5f3971e63bb58fa14ff72eedb70";
    var MAX_PAGES = 20;
    var ROLE_NAMES = {
        "0x0000000000000000000000000000000000000000000000000000000000000000": "DEFAULT_ADMIN_ROLE",
        "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1": "PROPOSER_ROLE",
        "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63": "EXECUTOR_ROLE",
        "0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783": "CANCELLER_ROLE"
    };

    // ─────────────── ABI decoding (calldata of scheduled calls) ───────────────

    function word(hex, byteOffset) {
        var start = byteOffset * 2;
        if (start + 64 > hex.length) throw new Error("calldata too short");
        return hex.slice(start, start + 64);
    }

    function wordNumber(hex, byteOffset) {
        var value = BigInt("0x" + word(hex, byteOffset));
        if (value > BigInt(hex.length)) throw new Error("bad offset");
        return Number(value);
    }

    function arrayParts(type) {
        var match = /^(.*)\[(\d*)\]$/.exec(type);
        return match ? { inner: match[1], length: match[2] === "" ? null : Number(match[2]) } : null;
    }

    function isDynamic(param) {
        var array = arrayParts(param.type);
        if (array) return array.length === null || isDynamic({ type: array.inner, components: param.components });
        if (param.type === "bytes" || param.type === "string") return true;
        if (param.type === "tuple") return param.components.some(isDynamic);
        return false;
    }

    function headSize(param) {
        if (isDynamic(param)) return 32;
        var array = arrayParts(param.type);
        if (array) return array.length * headSize({ type: array.inner, components: param.components });
        if (param.type === "tuple") return param.components.reduce(function (sum, c) { return sum + headSize(c); }, 0);
        return 32;
    }

    function decodeList(params, hex, base) {
        var offset = base;
        return params.map(function (param) {
            var value = isDynamic(param)
                ? decodeAt(param, hex, base + wordNumber(hex, offset))
                : decodeAt(param, hex, offset);
            offset += headSize(param);
            return { param: param, value: value };
        });
    }

    function decodeAt(param, hex, position) {
        var array = arrayParts(param.type);
        if (array) {
            var length = array.length;
            var start = position;
            if (length === null) {
                length = wordNumber(hex, position);
                start = position + 32;
            }
            var items = [];
            for (var i = 0; i < length; i += 1) items.push({ type: array.inner, components: param.components, name: "" });
            return { list: decodeList(items, hex, start) };
        }
        if (param.type === "tuple") return { list: decodeList(param.components, hex, position) };

        var raw = word(hex, position);
        if (param.type === "address") return { address: "0x" + raw.slice(24) };
        if (param.type === "bool") return { text: BigInt("0x" + raw) === 0n ? "false" : "true" };
        if (/^uint\d*$/.test(param.type)) return { text: BigInt("0x" + raw).toString() };
        if (/^int\d*$/.test(param.type)) {
            var n = BigInt("0x" + raw);
            if (n >= 1n << 255n) n -= 1n << 256n;
            return { text: n.toString() };
        }
        if (/^bytes\d+$/.test(param.type)) {
            var bytes = "0x" + raw.slice(0, Number(param.type.slice(5)) * 2);
            return { text: ROLE_NAMES[bytes] || bytes };
        }
        if (param.type === "bytes" || param.type === "string") {
            var size = wordNumber(hex, position);
            var data = hex.slice((position + 32) * 2, (position + 32 + size) * 2);
            if (param.type === "string") {
                var arr = new Uint8Array(data.match(/../g) ? data.match(/../g).map(function (b) { return parseInt(b, 16); }) : []);
                return { text: JSON.stringify(new TextDecoder().decode(arr)) };
            }
            if (size === 0) return { text: "0x" };
            return { text: size <= 32 ? "0x" + data : "0x" + data.slice(0, 16) + "… (" + size + " bytes)" };
        }
        throw new Error("unsupported type " + param.type);
    }

    // ─────────────── Formatting ───────────────

    function shortHex(value) {
        return value.slice(0, 8) + "…" + value.slice(-6);
    }

    // Word joiners stop a shortened address breaking across lines at the ellipsis.
    function shortAddress(value) {
        return value.slice(0, 8) + "\u2060…\u2060" + value.slice(-6);
    }

    function humanize(name) {
        var spaced = name
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

    function formatEther(wei) {
        var whole = wei / 1000000000000000000n;
        var fraction = (wei % 1000000000000000000n).toString().padStart(18, "0").replace(/0+$/, "");
        return whole.toString() + (fraction ? "." + fraction : "");
    }

    // `full` keeps whole addresses (for the hover title); otherwise they are shortened like hashes.
    function formatValue(value, names, full) {
        if (value.address) {
            var name = names[value.address.toLowerCase()];
            if (name) return name;
            return full ? value.address : shortAddress(value.address);
        }
        if (value.list) {
            return "(" + value.list.map(function (item) { return formatArg(item, names, full); }).join(", ") + ")";
        }
        return value.text;
    }

    function formatArg(item, names, full) {
        var label = item.param.name ? item.param.name.replace(/_$/, "").replace(/^_/, "") + ": " : "";
        return label + formatValue(item.value, names, full);
    }

    function describeCall(call, selectors, names, full) {
        var target = names[call.target.toLowerCase()] || (full ? call.target : shortAddress(call.target));
        var data = call.data.replace(/^0x/, "");
        var selector = "0x" + data.slice(0, 8);
        var fn = selectors[selector];
        var text;
        if (data.length < 8) {
            text = target + " · Plain Transfer";
        } else if (!fn) {
            text = target + " · Unknown Call " + selector;
        } else {
            try {
                var args = decodeList(fn.inputs, data.slice(8), 0).map(function (item) { return formatArg(item, names, full); });
                text = target + " · " + humanize(fn.name) + (args.length ? " (" + args.join(", ") + ")" : "");
            } catch (error) {
                text = target + " · " + humanize(fn.name) + " (calldata could not be decoded)";
            }
        }
        if (call.value > 0n) text += " · sends " + formatEther(call.value) + " ETH";
        return text;
    }

    function timeLeft(seconds) {
        if (seconds >= 3600) return Math.ceil(seconds / 3600) + "h left";
        return Math.max(1, Math.ceil(seconds / 60)) + "m left";
    }

    // ─────────────── Data ───────────────

    async function fetchLogs(indexUrl, timelock) {
        var logs = [];
        var params = "";
        for (var page = 0; page < MAX_PAGES; page += 1) {
            var response = await fetch(indexUrl + "/api/v2/addresses/" + timelock + "/logs" + params);
            if (!response.ok) throw new Error("index returned " + response.status);
            var json = await response.json();
            logs = logs.concat(json.items || []);
            if (!json.next_page_params) return logs;
            params = "?" + new URLSearchParams(json.next_page_params).toString();
        }
        throw new Error("too many timelock events to list");
    }

    function decodeScheduled(log) {
        var data = log.data.replace(/^0x/, "");
        var dataOffset = wordNumber(data, 64);
        var size = wordNumber(data, dataOffset);
        return {
            index: Number(BigInt(log.topics[2])),
            target: "0x" + word(data, 0).slice(24),
            value: BigInt("0x" + word(data, 32)),
            data: "0x" + data.slice((dataOffset + 32) * 2, (dataOffset + 32 + size) * 2),
            delay: Number(BigInt("0x" + word(data, 128)))
        };
    }

    function buildOperations(logs) {
        var ops = {};
        var executed = {};
        var cancelled = {};
        logs.forEach(function (log) {
            var topic = (log.topics[0] || "").toLowerCase();
            var id = (log.topics[1] || "").toLowerCase();
            var block = Number(log.block_number);
            if (topic === CALL_SCHEDULED) {
                var call = decodeScheduled(log);
                var op = ops[id];
                // A cancelled id can be scheduled again; keep only its latest scheduling.
                if (!op || block > op.block) {
                    op = ops[id] = {
                        id: id,
                        hash: log.transaction_hash,
                        block: block,
                        logIndex: Number(log.index),
                        scheduledAt: Date.parse(log.block_timestamp) / 1000,
                        delay: call.delay,
                        calls: []
                    };
                }
                if (block === op.block) op.calls.push(call);
            } else if (topic === CALL_EXECUTED) {
                if (!executed[id] || block > executed[id].block) executed[id] = { hash: log.transaction_hash, block: block };
            } else if (topic === CANCELLED) {
                if (!cancelled[id] || block > cancelled[id].block) cancelled[id] = { hash: log.transaction_hash, block: block };
            }
        });
        return Object.keys(ops).map(function (id) {
            var op = ops[id];
            op.calls.sort(function (a, b) { return a.index - b.index; });
            if (executed[id] && executed[id].block >= op.block) op.executed = executed[id];
            if (cancelled[id] && cancelled[id].block >= op.block) op.cancelled = cancelled[id];
            return op;
        }).sort(function (a, b) { return b.block - a.block || b.logIndex - a.logIndex; });
    }

    // ─────────────── Rendering ───────────────

    function link(href, text) {
        var a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noreferrer";
        var code = document.createElement("code");
        code.textContent = text;
        a.appendChild(code);
        return a;
    }

    // Status sits last: a pulsing yellow dot while queued, a pulsing green dot once
    // ready to execute, and a green tick when executed.
    function statusCell(op, explorer, now) {
        var cell = document.createElement("td");
        var readyAt = op.scheduledAt + op.delay;
        var indicator = document.createElement("span");
        indicator.setAttribute("aria-hidden", "true");
        var label;
        if (op.executed) {
            cell.dataset.status = "executed";
            indicator.className = "timelock-status-tick";
            // "Executed" links to the execution transaction; the Transaction column is the scheduling one.
            label = document.createElement("a");
            label.href = explorer + "/tx/" + op.executed.hash;
            label.target = "_blank";
            label.rel = "noreferrer";
            label.textContent = "Executed";
        } else {
            indicator.className = "timelock-status-dot";
            label = document.createElement("span");
            if (op.cancelled) {
                cell.dataset.status = "cancelled";
                label.textContent = "Cancelled";
            } else if (now < readyAt) {
                cell.dataset.status = "queued";
                label.textContent = "Queued · " + timeLeft(readyAt - now);
            } else {
                cell.dataset.status = "ready";
                label.textContent = "Ready to Execute";
            }
        }
        cell.className = "timelock-queue-status";
        cell.appendChild(indicator);
        cell.appendChild(label);
        cell.title = "Executable from " + new Date(readyAt * 1000).toUTCString();
        return cell;
    }

    // The table and its header are always shown, like the Addresses table above it;
    // loading, empty and error states are a single full-width row.
    function tableBody(root) {
        root.replaceChildren();
        var table = document.createElement("table");
        var head = table.createTHead().insertRow();
        ["Transaction", "Description", "Status"].forEach(function (label) {
            var th = document.createElement("th");
            th.textContent = label;
            head.appendChild(th);
        });
        root.appendChild(table);
        return table.createTBody();
    }

    function messageRow(body) {
        var cell = body.insertRow().insertCell();
        cell.colSpan = 3;
        cell.className = "timelock-queue-message";
        return cell;
    }

    function render(root, ops, names, selectors, explorer) {
        var body = tableBody(root);
        root.dataset.state = "loaded";
        if (!ops.length) {
            messageRow(body).textContent = "No timelock transactions yet";
            return;
        }
        var now = Date.now() / 1000;
        ops.forEach(function (op) {
            var row = body.insertRow();
            var hashCell = row.insertCell();
            hashCell.appendChild(link(explorer + "/tx/" + op.hash, shortHex(op.hash)));
            var description = row.insertCell();
            description.className = "timelock-queue-description";
            op.calls.forEach(function (call) {
                var line = document.createElement("div");
                line.textContent = describeCall(call, selectors, names, false);
                line.title = describeCall(call, selectors, names, true);
                description.appendChild(line);
            });
            row.appendChild(statusCell(op, explorer, now));
        });
    }

    function contractNames() {
        // Names come from the address table on the same page, so the two never disagree.
        var names = {};
        document.querySelectorAll(".address-table tbody tr").forEach(function (row) {
            var cells = row.querySelectorAll("td");
            var match = cells.length > 1 && /0x[0-9a-fA-F]{40}/.exec(cells[1].textContent);
            if (match) names[match[0].toLowerCase()] = cells[0].textContent.trim();
        });
        return names;
    }

    function setup() {
        var root = document.getElementById("timelock-queue");
        if (!root) return;
        var timelock = root.dataset.timelock;
        var explorer = root.dataset.explorer;
        var indexUrl = root.dataset.index;
        var selectors = window.USD8_TIMELOCK_SELECTORS || {};
        var names = contractNames();
        var ops = null;

        function showMessage(text, state) {
            root.dataset.state = state;
            var message = messageRow(tableBody(root));
            if (state === "loading") {
                var spinner = document.createElement("span");
                spinner.className = "timelock-queue-spinner";
                spinner.setAttribute("aria-label", "Loading");
                message.appendChild(spinner);
            } else {
                message.textContent = text;
            }
        }

        async function load() {
            showMessage("", "loading");
            try {
                ops = buildOperations(await fetchLogs(indexUrl, timelock));
                render(root, ops, names, selectors, explorer);
            } catch (error) {
                ops = null;
                showMessage("Timelock transactions could not be loaded", "error");
                var retry = document.createElement("button");
                retry.type = "button";
                retry.className = "timelock-queue-retry";
                retry.textContent = "Retry";
                retry.addEventListener("click", load);
                root.querySelector(".timelock-queue-message").appendChild(retry);
            }
        }

        load();
        // Keep "hours left" current without refetching.
        setInterval(function () {
            if (ops) render(root, ops, names, selectors, explorer);
        }, 60000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
        setup();
    }
})();
