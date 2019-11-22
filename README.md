<h1 align="center">
  <a href="https://lovelock.icetea.io"><img width="650px" src="https://lovelock.icetea.io/static/img/share.jpg" alt="Lovelock logo" /></a>
</h1>

<h3 align="center">Lovelock - Cherish Your Intimate Memories</h3>

> An secure place to store and celebrate your meaningful memories. Safe, clutterless, and lasting. Keep to yourself or share with close friends. https://lovelock.icetea.io

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

#### To use the public node:

Setting this in the `.env` file:
```
REACT_APP_RPC=wss://rpc.icetea.io/websocket
```

### 3. Deploy contracts

- `npm run deploy` (this will load and update `.env`)

> Deploying contracts will make the app uses the new contracts, thus all existing data will be lost. Only deploying at the first time you install Icetea, when the contracts' sources were changed, or after you reset the local Icetea Node.

To create some seed data: `npm run seed` then import the outputted private key for testing (use __Forgot Password__ screen to import).

### 4. Start the app

- `npm start`

## How to use the app

The app allow users to create `locks` (i.e. relationship, connection) with others. It is 1-1 relationship. A lock is a timeline between 2 people (often lovers/couple). Then each can post memories onto it (text status, photo, blog).

There are 3 kinds of locks:
- __regular lock__: lock between 2 accounts on Lovelock. Your partner can accept or deny your lock request. Only after he/she accepted, you both can post memories on it.
- __crush lock__: lock between yourself and a _crush_ (that is, someone who does not have account or you don't want to connect to his/her real account on lovelock; like your idol, imaginary lover, etc.)
- __journal__: if you create a lock to yourself, it becomes a journal

Both locks and memories can be _public_ or _private_. Users can create _groups_ like _close friends_ or _family_ and share their locks/memories to only members of the chosen group. Users can organize memories into _collections_.
