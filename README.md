## Setup

1. Install

- Rename `.env.example` to `.env`
- `npm i -g TradaTech/icetea`
- `npm install -g ndb`
- `icetea init`
- `npm install`

2. Start Icetea Node

- Normal node: `icetea start`
- Or debug mode: `icetea start -d`

To start the Icetea web, run `icetea app`. To reset Icetea state, run `icetea reset`.

To debug contract, run 

For debug, you can run

3. Deploy contracts

- `npm run deploy` (this will load and update `.env`)

To use `.env.production`, run `npm run deploy:prod`. Or `npm run deploy:all` to run both.

4. Start the app

- `npm start`

5. Production build

- `npm run build`
