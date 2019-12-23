require('dotenv').config()
const { IceteaWeb3 } = require('@iceteachain/web3')
const { toPkey } = require('./mnemonic')

const args = process.argv.slice(2)
if (args.length !== 1 && args.length !== 2) {
    return console.log('Wrong number of arguments. Syntax: add [usernameOrAddress]')
}

if (!process.env.MNEMONIC && !process.env.PKEY && args.length !== 2) {
    return console.log('You must provide MNEMONIC or PKEY env variable, or pass it as second command-line argument.')
}

let pkey = process.env.PKEY
if (args.length === 2) {
    pkey = args[1]
}

if (!pkey) {
    const seed = process.env.MNEMONIC;
    if (seed) {
      pkey = toPkey(seed);
    }
}

const tweb3 = new IceteaWeb3(process.env.REACT_APP_RPC)
const account = tweb3.wallet.importAccount(pkey)

const lovelock = tweb3.contract(process.env.REACT_APP_CONTRACT || 'contract.lovelockdev').methods
lovelock.addUsers(args[0]).sendCommit({ from: account.address })
.then(({ returnValue }) => {
    console.log(`DONE. User ${returnValue} unlocked.`)
    process.exit(0)
})
.catch(e => {
    console.error(e)
    process.exit(1)
})

