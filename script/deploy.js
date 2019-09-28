const envfile = require('envfile')
const fs = require('fs')
const { transpile } = require('@iceteachain/sunseed')
const { IceteaWeb3 } = require('@iceteachain/web3')

// process arguments
const args = process.argv.slice(2)
let mode = args.length ? args[0] : ''
mode = mode.trim().toLocaleLowerCase()

if (['-h', '--help'].includes(mode)) {
  console.log('Purpose: Deploy contract then update .env file.')
  console.log('---------------')
  console.log('deploy         deploy contract using .env file')
  console.log('deploy prod    deploy contract using .env.production file')
  console.log('deploy dev     deploy contract using .env.development file')
  console.log('deploy [file]  deploy contract using [file]')
  return
}

// determine path to .env file
let envPath
if (mode) {
  if (mode === 'prod') {
    envPath = '.env.production'
  } else if (mode === 'dev') {
    envPath = '.env.development'
  }
} else {
  envPath = '.env'
}
console.log(`Load RPC endpoint from ${envPath}`)

// load config
const config = envfile.parseFileSync(envPath)
const endpoint = config.REACT_APP_RPC

// load source file
const src = fs.readFileSync('./contracts/index.js')

;(async () => {

  // compile source
  const compiledSrc = await transpile(src, { prettier: true, context: './contracts/' })

  // connect to Icetea RPC
  const tweb3 = new IceteaWeb3(endpoint)
  console.log(`Connected to ${endpoint}.`)

  // create a private key
  const pkey = config.DEPLOY_KEY || process.env.DEPLOY_KEY
  let account
  if (pkey) {
    account = tweb3.wallet.importAccount(pkey)
  } else {
    account = tweb3.wallet.createBankAccount()
  }

  console.log(`Deploying from ${account.address}...`)

  tweb3.onError(console.error)

  // deploy the contract
  const r = await tweb3.deployJs(compiledSrc, [], { from: account.address })
  console.log(`Contract created: ${r.address}`)

  // update .env
  config.REACT_APP_CONTRACT = r.address
  fs.writeFileSync(envPath, envfile.stringifySync(config)) 
  console.log(`New contract address was update to ${envPath}.`)

  process.exit(0)

})();
