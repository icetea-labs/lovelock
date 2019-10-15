const envfile = require('envfile')
const fs = require('fs')
const { toPkey } = require('./mnemonic')
const { IceteaWeb3 } = require('@iceteachain/web3')

const { mode, envPath } = require('./mode')

if (['-h', '--help'].includes(mode)) {
  console.log('Purpose: Seed data.')
  console.log('---------------')
  console.log('deploy         seed data using .env file')
  console.log('deploy prod    seed data using .env.production file')
  console.log('deploy dev     seed data using .env.development file')
  console.log('deploy [file]  deploy contract using [file]')
  return
}

// load config
console.log(`Load RPC endpoint from ${envPath}`)
const { REACT_APP_RPC, REACT_APP_CONTRACT, SEED_PKEY, SEED_MNEMONIC } = envfile.parseFileSync(envPath)
const tweb3 = new IceteaWeb3(REACT_APP_RPC)
console.log(`Connected to ${REACT_APP_RPC}.`)

const alias = tweb3.contract('system.alias').methods
const did = tweb3.contract('system.did').methods
const lovelock = tweb3.contract(REACT_APP_CONTRACT).methods

const makeAlias = (account, prefix) => {
    const from = account.address || account
    const username = prefix + Date.now() + String(Math.random()).replace('.', '')
    return alias.register(username, from)
        .sendCommit({ from })
        .then(({ returnValue }) => returnValue.split('.')[1])
}

const makeLove = (m, account, ...args) => {
    const from = account.address || account
    return lovelock[m](...args).sendCommit( { from }).then(({ returnValue }) => returnValue)
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

    // register alias for from and to
    const p1 = makeAlias(fromAccount, 'sender_')
    const p2 = makeAlias(toAccount, 'receiver_')

    const [ sender, receiver ]  = await Promise.all([p1, p2])
  
    console.log(sender, receiver)

    // create the lock
    const pIndex = await makeLove('createPropose', fromAccount, `Create lock from ${sender} to ${receiver}`, toAccount, {
        hash: ['QmcPqy322d4hzGKHY7etwm57dx3SWCE2mQRxFZ2LqtKvJc']
    })
    console.log('Lock index: ' + pIndex)

    // now, accept it
    await makeLove('acceptPropose', toAccount, pIndex, `${receiver} accepts ${sender}`)

    // then add 100 memories
    const count = 10
    const promises = []
    const accounts = [fromAccount, toAccount]
    for (let i = 0; i < count; i++) {
        const from = accounts[i % 2]
        promises.push(makeLove('addMemory', from, pIndex, false, `Memory ${i} for lock ${pIndex}`, {
            hash: ['QmeoAAKbzsvL6qvajiiRJcCNpNoKzGmYyPXcSxHcktbJbU'],
            date: Date.now()
        }).then(r => {
                console.log(`Created memory ${i} for lock ${pIndex}`)
                return r
            }))
    }

    await Promise.all(promises)

    process.exit(0)
  
  })().catch(e => {
      console.error(e)
      process.exit(1)
  })
