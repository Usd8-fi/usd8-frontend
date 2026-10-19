# Frontend efficiency changes

AppKit and WalletConnect remain the wallet integration. Contract economics, deployment addresses, proof checks and transaction arguments are unchanged except that the redemption preview now displays the actual rate used for its minimum output.

## Implemented

1. A synchronous operation lock prevents repeated submissions across approval/action sequences. A confirmed receipt is independent of refresh success, and its explorer link survives dialog dismissal. Approval receipts continue directly to the authorized action. Account/network changes invalidate old operations and status updates.
2. React Query caches configuration, public pool data, account balances, derived values, score inputs and incident state separately. Stale resources share a block-pinned multicall, individual read failures remain isolated, and receipt refreshes target affected resources. Anonymous visits skip wallet reads. Balances and incident state publish before optional history finishes.
3. Foreground data refreshes every 30 seconds and on reconnection/focus. Optional history runs independently. History requests have cancellation, timeouts, bounded concurrency and size limits. Incremental logs and account claim mappings validate block-hash checkpoints and retain a 128-block reorg overlap. APR retains its original history seed; verified immutable settlement artifacts are cached by deployment, incident, root and ordered topology.
4. The public page renders before the wallet runtime loads. Connect intent loads AppKit; saved Wagmi sessions restore after paint. Claim UI and proof processing load separately. MathJax was removed from the app shell, with documentation configuration preserved. Viem 2.54.6 is pinned for compatibility with the existing Wagmi core 3.5.0 Tempo API. CI checks dependency compatibility, tests, the application build and initial bundle size.
5. Dialogs share focus trapping/restoration and Escape handling. Redemption previews use exact integer units and require another review when the rate changes. The claim bond comes from the contract. Data errors have retry controls and a freshness timestamp. The wallet button opens AppKit account controls, unsupported networks offer a Sepolia switch, and product hashes support direct links and browser Back.

## Measurement and verification

The same measurement sums the entry script and all HTML module preloads, using Node gzip:

| Initial application JavaScript | Reviewed beta | Updated build |
| --- | ---: | ---: |
| Files | 51 | 9 |
| Raw bytes | 2,020,192 | See `npm run check:bundle` |
| Gzip bytes | 591,616 | Approximately 177,000 |
| Gzip reduction | — | Approximately 70% |

`npm test`, `npm run check:wallet`, `npm run build` (including mdBook), and `npm run check:bundle` pass. Tests cover transaction locking and refresh failure, quote changes, focus, account isolation, anonymous reads, cold/warm/targeted requests, slow history, reorgs and immutable-root cache validation. The production browser preview loaded live pool data, opened the AppKit chooser and restored the previous product with Back. No real wallet signature or transaction was submitted; reconnect and network changes are covered through mocks, not physical wallet interoperability tests.

A warm snapshot performs no multicall inside its cache lifetime; the targeted-refresh fixture reads only the affected balance contract. These are deterministic request-count checks, not a claim about live RPC latency or a measured percentage reduction across all user journeys. Development-only counters in `src/lib/requestUtils.js` record labels, counts and durations, without addresses or request payloads.

The initial bundle budget is 250,000 gzip bytes and 800,000 raw bytes. Large wallet chunks are lazy and can still trigger Vite's general chunk-size advisory. Very large/incomplete history is reported as unavailable rather than treated as zero. Changes are source updates; publishing remains a separate deployment step.
