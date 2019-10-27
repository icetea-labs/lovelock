## Setup

1. Install

- Rename `.env.example` to `.env`
- `npm i -g ndb TradaTech/icetea`
- `icetea init`
- `npm i`

2. Start Icetea Node

- Normal mode: `icetea start`
- Or debug mode (it is slow, use only when you want to debug contracts): `icetea start -d`

For help, type `icetea -h`.

3. Deploy contracts

- `npm run deploy` (this will load and update `.env`)

To use `.env.production`, run `npm run deploy:prod`. Or `npm run deploy:all` to run both.

Deploying contracts will make the app uses the new contracts, thus all existing data is lost. Only deploying at the first time you install Icetea, when the contracts' sources were changes, or after you reset Icetea Node.

4. Start the app

- `npm start`
