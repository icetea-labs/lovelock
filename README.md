## Setup

1. Install

- Rename `.env.example` to `.env`
- `npm i -g ndb TradaTech/icetea`
- `icetea init`
- `npm i`

2. Start Icetea Node

- Normal node: `icetea start`
- Or debug mode: `icetea start -d`

To start the Icetea web, run `icetea app`. To reset Icetea state, run `icetea reset`.

3. Deploy contracts

- `npm run deploy` (this will load and update `.env`)

To use `.env.production`, run `npm run deploy:prod`. Or `npm run deploy:all` to run both.

4. Start the app

- `npm start`

5. Production build

- `npm run build`
