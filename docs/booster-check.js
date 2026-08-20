(function () {
    var RPC_URL = 'https://ethereum.publicnode.com';
    var CONTRACT = '0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d';
    // ERC1155 balanceOf(address,uint256)
    var BALANCE_OF_SELECTOR = '0x00fdd58e';
    var TOKEN_ID = 1;

    function setup() {
        var input = document.getElementById('booster-address');
        var btn = document.getElementById('booster-check-btn');
        var result = document.getElementById('booster-result');
        if (!input || !btn || !result) return;

        function show(msg, state, count) {
            result.innerHTML = '';
            result.dataset.state = state || '';
            var p = document.createElement('p');
            p.className = 'booster-message';
            p.textContent = msg;
            result.appendChild(p);
            if (count && count > 0) {
                var grid = document.createElement('div');
                grid.className = 'booster-grid';
                for (var i = 0; i < count; i++) {
                    var img = document.createElement('img');
                    img.src = 'assets/booster.png';
                    img.alt = 'Booster';
                    grid.appendChild(img);
                }
                result.appendChild(grid);
            }
        }

        async function check() {
            var addr = (input.value || '').trim();
            if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
                show('Enter a valid Ethereum address.', 'error');
                return;
            }
            btn.disabled = true;
            show('Checking...', 'loading');
            try {
                var addrPadded = addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
                var idPadded = TOKEN_ID.toString(16).padStart(64, '0');
                var data = BALANCE_OF_SELECTOR + addrPadded + idPadded;
                var res = await fetch(RPC_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0', id: 1, method: 'eth_call',
                        params: [{ to: CONTRACT, data: data }, 'latest']
                    })
                });
                var json = await res.json();
                if (json.error) throw new Error(json.error.message || 'RPC error');
                var count = parseInt(json.result, 16);
                if (count === 0) show('No Boosters found for this address.', 'empty');
                else show('Congratulations! You have ' + count + ' Booster' + (count === 1 ? '' : 's') + '.', 'success', count);
            } catch (e) {
                show('Error: ' + (e.message || 'could not fetch balance'), 'error');
            } finally {
                btn.disabled = false;
            }
        }

        btn.addEventListener('click', check);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();
