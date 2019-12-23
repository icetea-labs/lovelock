<h1>
  <a href="https://lovelock.icetea.io"><img width="650px" src="https://lovelock.icetea.io/static/img/share.jpg" alt="Lovelock logo" /></a>
</h1>

<h3>Lovelock - Cherish Your Intimate Memories</h3>

> An secure place to store and celebrate your meaningful memories. Safe, clutterless, and lasting. Keep to yourself or share with close friends. https://lovelock.icetea.io

## Setup

### 1. Install

- Rename `.env.example` to `.env`
- `npm i`
- `npm i -g TradaTech/icetea TradaTech/ipfs-proxy`
- `icetea init`

### 2. Start to Icetea and IPFS node

Start an Icetea Node:
```sh
icetea start
```

Start a fake IPFS node for testing:
```sh
ipfslocal
```

### 3. Deploy contracts

Deploy Lovelock contract:
```
npm run deploy
```

Generate some seed data (optional):

`npm run seed` then import the outputted private key for testing (use __Forgot Password__ screen to import).

### 4. Start the app

- `npm start`

> __Note__: New users need to be unlocked before they can post contents. To unlock a user, run `npm run unlock [usernameOrAddress]`

## How to use the app

The app allow users to create `locks` (i.e. relationship, connection) with others. It is 1-1 relationship. A lock is a timeline between 2 people (often lovers/couple). Then each can post memories onto it (text status, photo, blog).

There are 3 kinds of locks:
- __regular lock__: lock between 2 accounts on Lovelock. Your partner can accept or deny your lock request. Only after he/she accepted, you both can post memories on it.
- __crush lock__: lock between yourself and a _crush_ (that is, someone who does not have account or you don't want to connect to his/her real account on lovelock; like your idol, imaginary lover, etc.)
- __journal__: if you create a lock to yourself, it becomes a journal

Both locks and memories can be _public_ or _private_. Users can create _groups_ like _close friends_ or _family_ and share their locks/memories to only members of the chosen group. Users can organize memories into _collections_.
