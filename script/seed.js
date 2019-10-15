const envfile = require('envfile')
const fs = require('fs')
const { toPkey } = require('./mnemonic')
const { IceteaWeb3 } = require('@iceteachain/web3')
const { mode, envPath } = require('./mode')
const { randomBytes } = require('crypto')

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
    SEED_PKEY, 
    SEED_MNEMONIC,
    MEMORY_COUNT
 } = envfile.parseFileSync(envPath)

const toHttpRpc = wsUrl => {
    const url = new URL(wsUrl)
    return `http://${url.host}`
}

const endpoint = toHttpRpc(REACT_APP_RPC)
const tweb3 = new IceteaWeb3(endpoint, { keepConnection: true })
console.log(`Connect to ${endpoint}.`)

const alias = tweb3.contract('system.alias').methods
const did = tweb3.contract('system.did').methods
const lovelock = tweb3.contract(REACT_APP_CONTRACT).methods

const makeAliasPair = (sender, receiver) => {
    const bytes = randomBytes(8)
    const senderName = 's_' + bytes.readUInt32BE(0).toString(36)
    const receiverName = 'r_' + bytes.readUInt32BE(4).toString(36)
    const register = (username, from) => alias.register(username, from)
        .sendCommit({ from })
        .then(({ returnValue }) => returnValue.split('.')[1])

    return Promise.all([register(senderName, sender), register(receiverName, receiver)])
}

const makeLove = ({ method, from, send = 'sendCommit'}, ...args) => {
    return lovelock[method](...args)[send]( { from }).then(({ returnValue }) => returnValue)
}

let fromAccount
let pkey = SEED_PKEY || process.env.SEED_PKEY
if (!pkey) {
    const seed = SEED_MNEMONIC || process.env.SEED_MNEMONIC
    if (seed) {
        pkey = toPkey(seed)
    }
}
if (pkey) {
    fromAccount = tweb3.wallet.importAccount(pkey).address
} else {
    fromAccount = tweb3.wallet.createRegularAccount().address
}
const { address: toAccount } = tweb3.wallet.createRegularAccount()

;(async () => {

    const [ sender, receiver ]  = await makeAliasPair(fromAccount, toAccount)
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

    // then add 100 memories
    const count = Number(MEMORY_COUNT || process.env.MEMORY_COUNT) || 50

    const promises = []
    const accounts = [fromAccount, toAccount]
    for (let i = 0; i < count; i++) {
        const from = accounts[i % 2]
        promises.push(makeLove({
            method: 'addMemory',
            from,
            send: 'sendAsync'
        }, pIndex, false, `Memory ${i} for lock ${pIndex}`, {
            hash: ['QmeoAAKbzsvL6qvajiiRJcCNpNoKzGmYyPXcSxHcktbJbU'],
            date: Date.now()
        }).then(r => {
                //console.log(`Created memory ${i} for lock ${pIndex}`)
                return r
            }))
    }

    // this would fail if more than 100 connection
    await Promise.all(promises)
    // so we need to slice into chunk
    // const chunksize = 90
    // let result = []
    // for (let i = 0; i < promises.length; i += chunksize) {
    //     const chunk = promises.slice(i, i + chunksize);
    //     result = result.concat(await Promise.all(chunk).then(r => {
    //         console.log(`Memory inserted ${i} ~ ${i + chunk.length}`)
    //         return r
    //         //return new Promise((resolve, reject) => setTimeout(() => resolve(r), 0))
    //     }))
    // }

  
  })().catch(e => {
      console.error(e)
      process.exit(1)
  })
