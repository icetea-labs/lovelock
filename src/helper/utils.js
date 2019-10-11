import React from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
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

export async function sendTransaction(funcName, params, opts) {
  // console.log('params', params);
  const ct = tweb3.contract(contract);
  const result = await ct.methods[funcName](...(params || [])).sendCommit({
    from: opts.address,
    signers: opts.tokenAddress,
  });
  return result;
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
export async function setTagsInfo(key, value, opts) {
  const options = { from: opts.address };
  if (opts.tokenAddress) options.signers = opts.tokenAddress;

  const resp = await tweb3
    .contract('system.did')
    .methods.setTag(opts.address, key, value)
    .sendCommit(options);
  return resp && resp.tags;
}

export async function getTagsInfo(address) {
  const resp = await tweb3
    .contract('system.did')
    .methods.query(address)
    .call();
  return resp && resp.tags;
}

async function saveToIpfs(files) {
  if (!files) return '';
  // simple upload
  let ipfsId = [];
  console.log('saveToIpfs', files);
  try {
    const results = await ipfs.add([...files]);
    ipfsId = results.map(el => {
      return el.hash;
    });
  } catch (e) {
    console.error(e);
  }
  return ipfsId;
}
// upload one file
export async function saveFileToIpfs(files) {
  const ipfsId = await saveToIpfs(files);
  return ipfsId[0];
}

/**
 * @param: files: array
 * @return: ipfsId: array
 */
export async function saveBufferToIpfs(files) {
  let ipfsId = [];
  try {
    if (files && files.length > 0) {
      const content = files.map(el => {
        return Buffer.from(el);
      });
      ipfsId = await saveToIpfs(content);
    }
  } catch (e) {
    console.error(e);
  }
  return ipfsId;
}

// upload one file
export async function getJsonFromIpfs(cid, key) {
  const result = {};
  try {
    const url = process.env.REACT_APP_IPFS + cid;
    // const files = await ipfs.get(cid);
    // const json = `data:image/*;charset=utf-8;base64,${files[0].content.toString('base64')}`;
    const dimensions = await getImageDimensions(url);
    result.src = url;
    result.width = dimensions.w;
    result.height = dimensions.h;
    result.key = `Key-${key}`;
  } catch (e) {
    console.error(e);
  }
  return result;
}

function getImageDimensions(file) {
  return new Promise((resolved, rejected) => {
    const i = new Image();
    i.onload = () => {
      resolved({ w: i.width, h: i.height });
    };
    i.src = file;
  });
}

export function TimeWithFormat(props) {
  const { format, value } = props;
  const formatValue = format || 'MM/DD/YYYY';
  return <span>{moment(value).format(formatValue)}</span>;
}

export function summaryDayCal(value) {
  if (!value) return '';
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const convertAccDay = new Date(value);
  const today = new Date();
  const summaryDay = Math.round(Math.abs(convertAccDay - today) / oneDay);
  return summaryDay;
}

function summaryYearCal(value) {
  let diffYear = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();

  const congratDay = new Date(value);
  const congratYear = congratDay.getFullYear();
  const congratMonth = congratDay.getMonth();
  const congratDate = congratDay.getDate();

  if (congratYear < year && congratMonth === month && congratDate === date) {
    diffYear = Math.abs(year - congratYear);
  }
  return diffYear;
}

function summaryMonthCal(value) {
  let diffMonth = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();

  const congratDay = new Date(value);
  const congratYear = congratDay.getFullYear();
  const congratMonth = congratDay.getMonth();
  const congratDate = congratDay.getDate();

  // Months between years.
  diffMonth = (year - congratYear) * 12;

  // Months between... months.
  if (congratMonth < month && congratDate === date) {
    diffMonth += month - congratMonth;
  }
  return diffMonth;
}

export function HolidayEvent(props) {
  const { day } = props;
  const diffDate = summaryDayCal(day);
  const diffYear = summaryYearCal(day);
  const diffMonth = summaryMonthCal(day);
  if (diffYear) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          {diffYear === 1 ? (
            <span>{`You have been together for ${diffYear} year.`}</span>
          ) : (
            <span>{`You have been together for ${diffYear} years.`}</span>
          )}
        </div>
      </div>
    );
  }

  if (diffMonth) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          {diffMonth === 1 ? (
            <span>{`You have been together for ${diffMonth} month.`}</span>
          ) : (
            <span>{`You have been together for ${diffMonth} months.`}</span>
          )}
        </div>
      </div>
    );
  }

  if (diffDate > 0 && diffDate % 100 === 0) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`Congratulations for ${diffDate} days together!.`}</span>
        </div>
      </div>
    );
  }
  if (diffDate > 0 && diffDate % 100 === 97) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`3 days left to ${diffDate + 3} day anniversary.`}</span>
        </div>
      </div>
    );
  }
  if (diffDate > 0 && diffDate % 100 === 98) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`2 days left to ${diffDate + 2} day anniversary.`}</span>
        </div>
      </div>
    );
  }
  if (diffDate > 0 && diffDate % 100 === 99) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`1 days left to ${diffDate + 1} day anniversary.`}</span>
        </div>
      </div>
    );
  }
  return <span />;
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
  const resp = await tweb3
    .contract('system.alias')
    .methods.register(username, address)
    .sendCommit({ from: address });
  return resp;
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
  return encodeData;
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
