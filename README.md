## Setup

### 1. Install

- Rename `.env.example` to `.env`
- `npm i`

If you want to use local Icetea node (easier for debugging).
- `npm i -g ndb TradaTech/icetea`
- `icetea init`

### 2. Connect to Icetea Node

#### To use the local node:

`icetea start`

For help, type `icetea -h`.

#### To use the public node

Setting this in the `.env` file:
```
REACT_APP_RPC=wss://rpc.icetea.io/websocket
```

### 3. Deploy contracts

- `npm run deploy` (this will load and update `.env`)

To use `.env.production`, run `npm run deploy:prod`. Or `npm run deploy:all` to run both.

Deploying contracts will make the app uses the new contracts, thus all existing data is lost. Only deploying at the first time you install Icetea, when the contracts' sources were changed, or after you reset Icetea Node.

### 4. Start the app

- `npm start`
