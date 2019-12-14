const envfile = require('envfile');
const fs = require('fs');
const { toPkey } = require('./mnemonic');
const { transpile } = require('@iceteachain/sunseed');
const { IceteaWeb3 } = require('@iceteachain/web3');

const { mode, envPath } = require('./mode');

if (['-h', '--help'].includes(mode)) {
  console.log('Purpose: Deploy contract then update .env file.');
  console.log('---------------');
  console.log('deploy         deploy contract using .env file');
  console.log('deploy prod    deploy contract using .env.production file');
  console.log('deploy dev     deploy contract using .env.development file');
  console.log('deploy [file]  deploy contract using [file]');
  return;
}

// load config
console.log(`Load RPC endpoint from ${envPath}`);
const config = envfile.parseFileSync(envPath);
const endpoint = config.REACT_APP_RPC;

// load source file
const src = fs.readFileSync('./contracts/lovelock.js');

(async () => {
  // compile source
  const compiledSrc = await transpile(src, { prettier: true, context: './contracts/' });

  // connect to Icetea RPC
  const tweb3 = new IceteaWeb3(endpoint);
  console.log(`Connected to ${endpoint}.`);

  // create a private key
  let pkey = config.PKEY || process.env.PKEY;
  if (!pkey) {
    const seed = config.MNEMONIC || process.env.MNEMONIC;
    if (seed) {
      pkey = toPkey(seed);
    }
  }

  let account;
  if (pkey) {
    account = tweb3.wallet.importAccount(pkey);
  } else {
    account = tweb3.wallet.createBankAccount();
  }

  console.log(`Deploying from ${account.address}...`);

  tweb3.onError(console.error);

  // deploy the contract
  const r = await tweb3.deployJs(compiledSrc, [], { from: account.address });
  console.log(`Contract created: ${r.address}`);

  // migrate data
  const oldAddress = config.REACT_APP_CONTRACT.trim();
  if (oldAddress) {
    console.log('Trying to migrate data from ' + oldAddress);
    try {
      const newContract = tweb3.contract(r);
      await newContract.methods.migrateState(oldAddress, true).sendCommit({ from: account.address });
      console.log('Data migration finished.');
    } catch (e) {
      console.log('Fail to migrate data: ', e.message);
    }
  }

  // add user
  if (config.USER_ADDRESS) {
    console.log('Adding user ' + config.USER_ADDRESS);
    try {
      const newContract = tweb3.contract(r);
      await newContract.methods.addUsers([config.USER_ADDRESS]).sendCommit({ from: account.address });
      console.log('User added.');
    } catch (e) {
      console.log('Fail to add user: ', e.message);
    }
  }

  // update .env
  config.REACT_APP_CONTRACT = r.address;
  fs.writeFileSync(envPath, envfile.stringifySync(config));
  console.log(`New contract address was updated to ${envPath}.`);

  process.exit(0);
})();
