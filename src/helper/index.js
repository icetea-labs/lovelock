import tweb3 from '../service/tweb3';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import { ecc, codec, AccountType } from '@iceteachain/common';
import decode from './decode';
const paths = 'm’/44’/60’/0’/0';

export async function callPure(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callPureContractMethod');
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
export async function callView(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callReadonlyContractMethod');
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
async function callReadOrPure(funcName, params, method) {
  const address = process.env.contract;

  try {
    const result = await tweb3[method](address, funcName, params || []);
    return tryStringifyJson(result || '' + result);
  } catch (error) {
    console.log(tryStringifyJson(error, true));
  }
}

export async function sendTransaction(func) {
  const { address } = this.props;
  const { answers, loading, params_value, account } = this.state;
  const signers = account.address;
  // console.log('params_value', params_value);
  try {
    const ct = tweb3.contract(address);
    const result = await ct.methods[func.name](...(params_value[func.name] || [])).sendCommit({ signers });
    answers[func.name] = formatResult(result);
  } catch (error) {
    console.log(error);
    answers[func.name] = formatResult(error, true);
  } finally {
    loading[func.name] = false;
    this.setState({ answers, loading });
  }
}
export function tryStringifyJson(p, replacer = undefined, space = 2) {
  if (typeof p === 'string') {
    return p;
  }
  try {
    return '' + JSON.stringify(p, replacer, space);
  } catch (e) {
    return String(p);
  }
}

export async function getAccountInfo(address) {
  try {
    const info = await tweb3.getAccountInfo(address);
    return info;
  } catch (err) {
    throw err;
  }
}

export async function getTagsInfo(address) {
  const resp = await tweb3
    .contract('system.did')
    .methods.query(address)
    .call();
  if (resp) {
    const { tags } = resp;
    return tags;
  } else {
    return {};
  }
}
export async function isAliasRegisted(username) {
  try {
    const alias = 'account.'.concat(username);
    const info = await tweb3
      .contract('system.alias')
      .methods.resolve(alias)
      .call();
    return info;
  } catch (err) {
    console.log(tryStringifyJson(err));
    throw err;
  }
}
export async function registerAlias(username, address, privateKey) {
  try {
    tweb3.wallet.importAccount(privateKey);
    const info = await tweb3
      .contract('system.alias')
      .methods.register(username, address)
      .sendCommit({ from: address });
    return info;
  } catch (err) {
    console.log(tryStringifyJson(err));
    throw err;
  }
}
export const wallet = {
  createAccountWithMneomnic(mnemonic, index = 0) {
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    const privateKey = this.getPrivateKeyFromMnemonic(mnemonic, index);
    const { address } = ecc.toPubKeyAndAddress(privateKey);

    return {
      mnemonic,
      privateKey,
      address,
    };
  },
  recoverAccountFromMneomnic(mnemonic, options = { index: 0, type: AccountType.BANK_ACCOUNT }) {
    const typeTMP =
      options.type === AccountType.REGULAR_ACCOUNT ? AccountType.REGULAR_ACCOUNT : AccountType.BANK_ACCOUNT;
    let privateKey = '';
    let address = '';
    let indexBase = '';

    do {
      indexBase = options.index;
      privateKey = this.getPrivateKeyFromMnemonic(mnemonic, options.index);
      ({ address } = ecc.toPubKeyAndAddress(privateKey));
      options.index += 1;
      // console.log('index', options.index);
    } while (options.index < 100 && !codec.isAddressType(address, typeTMP));

    return {
      privateKey,
      address,
      index: indexBase,
    };
  },

  getPrivateKeyFromMnemonic(mnemonic, index = 0) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('wrong mnemonic format');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const childkey = hdkey.derive(paths + index);

    return codec.toKeyString(childkey.privateKey);
  },

  recoverAccountFromPrivateKey(keyStore, password, address) {
    const privateKey = this.getPrivateKeyFromKeyStore(keyStore, password);
    if (this.getAddressFromPrivateKey(privateKey) !== address) {
      throw new Error('wrong password');
    }
    return privateKey;
  },

  getPrivateKeyFromKeyStore(keyStore, password) {
    const account = decode(password, keyStore);
    const privateKey = codec.toString(account.privateKey);
    return privateKey;
  },

  getAddressFromPrivateKey(privateKey) {
    const { address } = ecc.toPubKeyAndAddressBuffer(privateKey);
    return address;
  },

  encryptMnemonic(mnemonic, password) {
    const options = {
      kdf: 'pbkdf2',
      cipher: 'aes-128-ctr',
      kdfparams: {
        c: 262144,
        dklen: 32,
        prf: 'hmac-sha256',
      },
      noAddress: true,
    };

    const dk = keythereum.create();
    return keythereum.dump(password, mnemonic, dk.salt, dk.iv, options);
  },

  decryptMnemonic(mnemonicObj, password) {
    // type uint8array
    const mnemonic = keythereum.recover(password, mnemonicObj);
    return new TextDecoder('utf-8').decode(mnemonic).replace(/%20/g, ' ');
  },
};
