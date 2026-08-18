# USD8 Frontend
The public site is a two-product React/Vite app. The same GitHub Pages artifact includes an mdBook documentation site at `/docs/`.

- `npm install --include=dev` installs dependencies.
- `npm run dev` starts the React development server.
- `npm test` runs the component and score-client tests.
- `npm run build` builds the React app into `docs/` and mdBook into `docs/docs/`.
- `npm run docs:serve` previews the mdBook source.
- `npm run deploy` builds, commits changed files, and pushes the current branch.

Copy `.env.example` to `.env.local` and set `VITE_REOWN_PROJECT_ID` to enable wallet connection. The score client defaults to the public Sepolia AWS API Gateway endpoint and can be overridden with `VITE_SCORE_API_URL`.
