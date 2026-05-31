# USD8 Score API

Cloudflare Worker API for dashboard score calculation.

The React site should call this Worker instead of scanning Ethereum logs directly in the browser. The Worker stores resumable per-wallet checkpoints in D1 and advances each score calculation in bounded chunks, using Alchemy's indexed `alchemy_getAssetTransfers` API for ERC-20 history.

## Setup

1. Log in:

   ```bash
   npx wrangler login
   ```

2. Create D1:

   ```bash
   npx wrangler d1 create usd8-score-cache --config worker/wrangler.toml
   ```

3. Copy the returned `database_id` into `worker/wrangler.toml`.

4. Apply schema:

   ```bash
   npx wrangler d1 execute usd8-score-cache --remote --file worker/schema.sql --config worker/wrangler.toml
   ```

5. Set the Alchemy Ethereum mainnet RPC secret:

   ```bash
   npx wrangler secret put ETH_RPC_URL --config worker/wrangler.toml
   ```

6. If this is the first Worker on the account, register a `workers.dev` subdomain in the Cloudflare dashboard:

   ```txt
   https://dash.cloudflare.com/?to=/:account/workers/onboarding
   ```

7. Deploy:

   ```bash
   npx wrangler deploy --config worker/wrangler.toml
   ```

8. Set `VITE_SCORE_API_URL` for the React build to the deployed Worker URL.

## Endpoint

```txt
GET /score?address=0x...
```

Returns `status: "syncing"` while the Worker is still advancing the checkpoint, and `status: "complete"` once the cached score is current to the target block.
