const envfile = require('envfile')
const fs = require('fs')
const { toPkey } = require('./mnemonic')
const { IceteaWeb3 } = require('@iceteachain/web3')
const { toKeyString } = require('@iceteachain/common').codec
const { mode, envPath } = require('./mode')
const { randomBytes } = require('crypto')
const blogContent = require('./blogcontent.json')

if (['-h', '--help'].includes(mode)) {
    console.log('Purpose: Seed data.')
    console.log('---------------')
    console.log('seed         seed data using .env file')
    console.log('seed prod    seed data using .env.production file')
    console.log('seed dev     seed data using .env.development file')
    console.log('seed [file]  seed data using [file]')
    return
}

// load config
console.log(`Load RPC endpoint from ${envPath}`)
const {
    REACT_APP_RPC,
    REACT_APP_CONTRACT,
    PORT,
    SEED_PKEY,
    SEED_MNEMONIC,
    MEMORY_COUNT
} = envfile.parseFileSync(envPath)

const toHttpRpc = wsUrl => {
    const url = new URL(wsUrl)
    const protocol = url.protocol === 'wss:' ? 'https' : 'http'
    return `${protocol}://${url.host}`
}

const endpoint = toHttpRpc(REACT_APP_RPC)
const tweb3 = new IceteaWeb3(endpoint, { keepConnection: true })
console.log(`Connect to ${endpoint}.`)

const alias = tweb3.contract('system.alias').methods
const did = tweb3.contract('system.did').methods
const lovelock = tweb3.contract(REACT_APP_CONTRACT).methods

const registerUsers = (
    { address: sender, publicKey: spkey },
    { address: receiver, publicKey: rpkey }) => {
    const bytes = randomBytes(8)
    const senderName = 's_' + bytes.readUInt32BE(0).toString(36)
    const receiverName = 'r_' + bytes.readUInt32BE(4).toString(36)
    const register = (username, from) => alias.register(username, from)
        .sendCommit({ from })
        .then(({ returnValue }) => returnValue.split('.')[1])
    const senderAvatar = 'QmZK5Z8VXjg6RUHbp6BzJnExrFLQRkpJ3H9J11CGJndhUf'
    const receiverAvatar = 'QmciNMPPa2GsRAMM7ftnsg8GiaRKdiWBaCh432r2bDddc4'

    const setProfile = (username, pkey, avatar, from) => did.setTag(from, {
        firstname: username,
        lastname: '',
        'display-name': username,
        avatar,
        'pub-key': toKeyString(pkey),
    }).sendCommit({ from })


    return Promise.all([
        register(senderName, sender),
        register(receiverName, receiver),
        setProfile(senderName, spkey, senderAvatar, sender),
        setProfile(receiverName, rpkey, receiverAvatar, receiver)
    ])
}

const makeLove = ({ method, from, send = 'sendCommit' }, ...args) => {
    return lovelock[method](...args)[send]({ from }).then(({ returnValue }) => returnValue)
}

let fromAccount
let fromAccountObj
let pkey = SEED_PKEY || process.env.SEED_PKEY
if (!pkey) {
    const seed = SEED_MNEMONIC || process.env.SEED_MNEMONIC
    if (seed) {
        pkey = toPkey(seed)
    }
}
let keyGenerated = false
if (pkey) {
    fromAccountObj = tweb3.wallet.importAccount(pkey)
    fromAccount = fromAccountObj.address
} else {
    fromAccountObj = tweb3.wallet.createRegularAccount()
    fromAccount = fromAccountObj.address
    pkey = toKeyString(fromAccountObj.privateKey)
    keyGenerated = true
}
const toAccountObj = tweb3.wallet.createRegularAccount()
const toAccount = toAccountObj.address

const shuffle = array => {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

const blogParams = [JSON.stringify({
    "meta": {
        "title": "Introduce Lovelock",
        "coverPhoto": {
            "width": 1200,
            "height": 630,
            "url": "https://ipfs.icetea.io/gateway/ipfs/QmfS4c8BJFoURzA83JqQJM6Ax7qP6rBsE81MN66Y6iyoPZ",
        },
    },
    "blogHash": "QmRsnXwcxhDv2iri6Uru87P4o4aLKS4WGYBubyojLLjXTq"
}),
{
    "date": Date.now(),
    "hash": [],
    "blog": true
}]

    ; (async () => {

        const [sender, receiver] = await registerUsers(fromAccountObj, toAccountObj)
        console.log('sender: ' + sender)
        console.log('receiver: ' + receiver)

        // create the lock
        const pIndex = await makeLove({
            method: 'createPropose',
            from: fromAccount
        }, `Create lock from ${sender} to ${receiver}`, toAccount, {
            hash: ['QmcPqy322d4hzGKHY7etwm57dx3SWCE2mQRxFZ2LqtKvJc']
        })
        console.log('Lock index: ' + pIndex)

        // now, accept it
        await makeLove({
            method: 'acceptPropose',
            from: toAccount
        }, pIndex, `${receiver} accepts ${sender}`)


        // now add 2 collections
        await makeLove({
            method: 'addLockCollection',
            from: fromAccount
        }, pIndex, {
            name: 'Travel',
            description: 'Life is a journey, travel it well.'
        })

        await makeLove({
            method: 'addLockCollection',
            from: toAccount
        }, pIndex, {
            name: 'Love letters',
            description: 'Every letter counts.'
        })

        // then add 100 memories
        const count = Number(MEMORY_COUNT || process.env.MEMORY_COUNT) || 10

        const hashes = ['QmaAi38WTTouioSh1yZQ76pJcnVyuxc22p5zyiCZnN3U84', 'QmeoAAKbzsvL6qvajiiRJcCNpNoKzGmYyPXcSxHcktbJbU', 'QmUUgcmsxqEV5Y82HTtusxxDxrrtJ4PWr33ChChW7Sv38U']

        const promises = []
        const accounts = [fromAccount, toAccount]
        for (let i = 0; i < count; i++) {
            const from = accounts[i % 2]
            const hashCandidates = shuffle(hashes)
            const hashCount = Math.round(Math.random() * 3)
            const selectedHashes = hashCandidates.slice(0, hashCount)

            promises.push(makeLove({
                method: 'addMemory',
                from,
                send: 'sendAsync'
            }, pIndex, false, `Memory ${i} for lock ${pIndex}`, {
                hash: selectedHashes,
                date: Date.now(),
                collectionId: Math.round(Math.random())
            }).then(r => {
                //console.log(`Created memory ${i} for lock ${pIndex}`)
                return r
            }))
        }

        // add a single blog
        promises.push(makeLove({
            method: 'addMemory',
            fromAccount,
            send: 'sendAsync'
        }, pIndex, false, ...blogParams)
            .then(r => {
                //console.log(`Created memory ${i} for lock ${pIndex}`)
                return r
            }))

        // this would fail if more than 100 connection
        console.log(`Adding ${promises.length} memories...`)
        await Promise.all(promises)

        // print the URL
        console.log(`http://localhost:3000/lock/${pIndex}`)

        // create a pending propose
        await makeLove({
            method: 'createPropose',
            from: fromAccount
        }, 'I sent, why nobody replies?', toAccount, {
            hash: ['QmcPqy322d4hzGKHY7etwm57dx3SWCE2mQRxFZ2LqtKvJc']
        })

        // another
        await makeLove({
            method: 'createPropose',
            from: toAccount
        }, 'I received this, what the heck?', fromAccount, {
            hash: ['QmeoAAKbzsvL6qvajiiRJcCNpNoKzGmYyPXcSxHcktbJbU']
        })

        // a journal
        await makeLove({
            method: 'createPropose',
            from: fromAccount
        }, 'This is a great blog...', fromAccount, {
            hash: ['QmUUgcmsxqEV5Y82HTtusxxDxrrtJ4PWr33ChChW7Sv38U']
        })

        // a crush
        const crushAccount = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn'
        await makeLove({
            method: 'createPropose',
            from: fromAccount
        }, 'I love so!', crushAccount, {
            hash: ['Qmc8bacYd4iNmvo4ojmZaGADH4qWVNNdEppMgt13T8yqsQ']
        }, {
            "firstname": "Mark",
            "lastname": "Jack",
            "botAva": "QmSrBLu8MB5XdnHpgA4LMyRNNz4w8xbQQLsjAWSZhLq16D",
            "botReply": "I love you too!"
        })

        // print out the private key :D
        console.log('Import the following private keys to use:')
        if (keyGenerated) {
            console.log('Sender key: ' + pkey)
        } else {
            console.log('Sender key: use value in your env variable.')
        }
        console.log('Receiver key: ' + toKeyString(toAccountObj.privateKey))

    })().catch(e => {
        console.error(e)
        process.exit(1)
    })
