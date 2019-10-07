import React from 'react';
import moment from 'moment';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import { ecc, codec, AccountType } from '@iceteachain/common';
import eccrypto from 'eccrypto';
import { encodeTx } from './encode';
import tweb3 from '../service/tweb3';
import ipfs from '../service/ipfs';
import { decodeTx, decode } from './decode';

const paths = 'm’/44’/60’/0’/0';

export const contract = process.env.REACT_APP_CONTRACT;

export async function callPure(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callPureContractMethod');
  if (resp) {
    return JSON.parse(resp);
  }

  return [];
}
export async function callView(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callReadonlyContractMethod');
  // console.log('resp', funcName, resp);
  if (resp) {
    return JSON.parse(resp);
  }

  return [];
}

async function callReadOrPure(funcName, params, method) {
  const address = contract;

  try {
    const result = await tweb3[method](address, funcName, params || []);
    return tryStringifyJson(result || `${result}`);
  } catch (error) {
    console.log('funcName', funcName);
    console.log(tryStringifyJson(error, true));
  }
}

export async function sendTransaction(funcName, params) {
  // const { address } = this.props;
  // console.log('params', params);
  try {
    const ct = tweb3.contract(contract);
    const result = await ct.methods[funcName](...(params || [])).sendCommit();
    return result;
  } catch (error) {
    console.log(error);
  }
}

export function tryStringifyJson(p, replacer = undefined, space = 2) {
  if (typeof p === 'string') {
    return p;
  }
  try {
    return `${JSON.stringify(p, replacer, space)}`;
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
export async function setTagsInfo(address, name, value) {
  const resp = await tweb3
    .contract('system.did')
    .methods.setTag(address, name, value)
    .sendCommit({ from: address });
  if (resp) {
    const { tags } = resp;
    return tags;
  } else {
    return {};
  }
}
// let cacheTags = {};
export async function getTagsInfo(address) {
  try {
    // if (!cacheTags[address]) {
    const resp = await tweb3
      .contract('system.did')
      .methods.query(address)
      .call();
    // if (resp && resp.tags) {
    //   cacheTags[address] = resp.tags;
    // } else {
    //   cacheTags[address] = {};
    // }
    // }
    return (resp && resp.tags) || {};
  } catch (e) {
    console.error(e);
  }
  // return cacheTags[address] || [];
}

export async function saveToIpfs(files) {
  // const file = [...files][0];
  let ipfsId;
  // const fileDetails = {
  //   path: file.name,
  //   content: file,
  // };
  // const options = {
  //   wrapWithDirectory: true,
  //   progress: prog => console.log(`received: ${prog}`),
  // };
  // console.log('fileDetails', fileDetails);

  //ipfs
  //   .add(fileDetails, options)
  //   .then(response => {
  //     console.log(response);
  //     // CID of wrapping directory is returned last
  //     ipfsId = response[response.length - 1].hash;
  //     console.log(ipfsId);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  // upload usung file nam
  // const response = await ipfs.add(fileDetails, options);
  // ipfsId = response[response.length - 1].hash;
  // console.log(ipfsId);

  // simple upload
  await ipfs
    .add([...files], { progress: false })
    .then(response => {
      ipfsId = response[0].hash;
    })
    .catch(err => {
      console.error(err);
    });
  return ipfsId;
}

export function TimeWithFormat(props) {
  const { format, value } = props;
  const formatValue = format || 'MM/DD/YYYY';
  return <span>{moment(value).format(formatValue)}</span>;
}

export function summaryDayCal(value) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const acceptDay = value.split('T')[0];
  const acceptTime = value.split('T')[1];
  const slugDay = acceptDay.split('-');
  const slugTime = acceptTime.split('Z')[0].split(':');

  const convertAccDay = new Date(slugDay[0], slugDay[1] - 1, slugDay[2], slugTime[0], slugTime[1], slugTime[2]);
  const today = new Date();
  const summaryDay = Math.round(Math.abs(convertAccDay - today) / oneDay);
  return summaryDay;
}

export function holidayCal(){
  
} 

export function diffTime(time) {
  // Set new thresholds
  // moment.relativeTimeThreshold("s", 10);
  moment.relativeTimeThreshold('ss', 60);
  moment.relativeTimeThreshold('m', 60);
  moment.relativeTimeThreshold('h', 20);
  // moment.relativeTimeThreshold("d", 25);
  // moment.relativeTimeThreshold("M", 10);

  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: '%d secs',
      ss: '%d secs',
      m: 'a minute',
      mm: '%d minutes',
      h: '%d hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years',
    },
  });
  return moment(time).fromNow();
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
const cacheAlias = {};
export async function getAlias(address) {
  if (!cacheAlias[address]) {
    const listAlias = await tweb3
      .contract('system.alias')
      .methods.byAddress(address)
      .call();
    if (listAlias && Array.isArray(listAlias) && listAlias[0]) {
      cacheAlias[address] = listAlias[0].replace('account.', '');
    } else {
      cacheAlias[address] = '';
    }
  }
  return cacheAlias[address];
}
export async function registerAlias(username, address) {
  const info = await tweb3
    .contract('system.alias')
    .methods.register(username, address)
    .sendCommit({ from: address });
  return info;
}
export async function savetoLocalStorage(address, keyObject) {
  localStorage.removeItem('user');
  localStorage.setItem('user', JSON.stringify({ address, keyObject }));
}
let cachesharekey = {};
export async function generateSharedKey(privateKeyA, publicKeyB) {
  // console.log('a-b', privateKeyA, '-', publicKeyB);
  const objkey = privateKeyA + publicKeyB;
  if (cachesharekey[objkey]) {
    // console.log('cachesharekey', cachesharekey[objkey]);
    return cachesharekey[objkey];
  }
  const sharekey = await eccrypto.derive(codec.toKeyBuffer(privateKeyA), codec.toKeyBuffer(publicKeyB));
  const result = codec.toString(sharekey);
  cachesharekey = { [objkey]: result };
  return result;
}
export async function encodeWithSharedKey(data, sharekey) {
  const encodeData = encodeTx(data, sharekey, { noAddress: true });
  return JSON.stringify(encodeData || {});
}
export async function decodeWithSharedKey(data, sharekey) {
  const decodeData = decodeTx(sharekey, data);
  return decodeData;
}
export async function encodeWithPublicKey(data, privateKeyA, publicKeyB) {
  const sharekey = await generateSharedKey(privateKeyA, publicKeyB);
  return encodeWithSharedKey(data, sharekey);
}
export async function decodeWithPublicKey(data, privateKeyA, publicKeyB) {
  const sharekey = await generateSharedKey(privateKeyA, publicKeyB);
  return decodeWithSharedKey(data, sharekey);
}
export const wallet = {
  createAccountWithMneomnic(mnemonic, index = 0) {
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    const privateKey = this.getPrivateKeyFromMnemonic(mnemonic, index);
    const { address, publicKey } = ecc.toPubKeyAndAddress(privateKey);

    return {
      mnemonic,
      privateKey,
      address,
      publicKey,
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

  // encryptMnemonic(mnemonic, password) {
  //   const options = {
  //     kdf: 'pbkdf2',
  //     cipher: 'aes-128-ctr',
  //     kdfparams: {
  //       c: 262144,
  //       dklen: 32,
  //       prf: 'hmac-sha256',
  //     },
  //     noAddress: true,
  //   };

  //   const dk = keythereum.create();
  //   return keythereum.dump(password, mnemonic, dk.salt, dk.iv, options);
  // },

  // decryptMnemonic(mnemonicObj, password) {
  //   // type uint8array
  //   const mnemonic = keythereum.recover(password, mnemonicObj);
  //   return new TextDecoder('utf-8').decode(mnemonic).replace(/%20/g, ' ');
  // },
};
