import React from 'react';
import { ecc, codec, AccountType } from '@iceteachain/common';
import moment from 'moment';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import eccrypto from 'eccrypto';
import { encodeTx } from './encode';
import tweb3 from '../service/tweb3';
import ipfs from '../service/ipfs';
import { decodeTx, decode } from './decode';

const paths = 'm’/44’/349’/0’/0';

export const contract = process.env.REACT_APP_CONTRACT;

export function signalPrerenderDone(wait) {
  if (wait == null) {
    wait = process.env.REACT_APP_PRERENDER_WAIT || 100
  }
  window.setTimeout(() => {
    window.prerenderReady = true
  }, wait)
}

export function showSubscriptionError(error, enqueueSnackbar) {
  const clickTooQuick = error.code === -32000;
  const variant = clickTooQuick ? 'info' : 'warning';
  const message = clickTooQuick
    ? 'It appears that you click too quickly.'
    : `A warning happened, you may need to reload the page. (${error.code || 'no error code'})`;
  console.warn(error);
  enqueueSnackbar(message, { variant, autoHideDuration: 5000 });
}

export function getQueryParam(name) {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return name ? params.get(name) : params;
}

export function makeProposeName(p, prefix = '') {
  return prefix + (p.sender === p.receiver ? `${p.s_name}'s Journal` : `${p.s_name} ❤️ ${p.r_name}`);
}

export function callPure(funcName, params) {
  return callReadOrPure(funcName, params, 'callPureContractMethod');
}
export function callView(funcName, params) {
  return callReadOrPure(funcName, params, 'callReadonlyContractMethod');
}
function callReadOrPure(funcName, params, method) {
  return tweb3[method](contract, funcName, params || []);
}

export async function sendTransaction(funcName, params, opts) {
  console.log('sendTransaction', funcName, params);
  const ct = tweb3.contract(contract);
  const sendType = opts.sendType || 'sendCommit';
  const result = await ct.methods[funcName](...(params || []))[sendType]({
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

export async function saveToIpfs(files) {
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
export async function saveBufferToIpfs(files, opts = {}) {
  let ipfsId = [];
  try {
    if (files && files.length > 0) {
      const content = files.map(el => {
        return Buffer.from(el);
      });
      if (opts.privateKey && opts.publicKey) {
        let encodeJsonData = [];
        for (let i = 0; i < content.length; i++) {
          encodeJsonData.push(encodeWithPublicKey(content[i], opts.privateKey, opts.publicKey));
        }
        encodeJsonData = await Promise.all(encodeJsonData);
        const encodeBufferData = encodeJsonData.map(el => {
          return Buffer.from(JSON.stringify(el));
        });
        ipfsId = await saveToIpfs(encodeBufferData);
      } else {
        ipfsId = await saveToIpfs(content);
      }
      console.log('ipfsId', ipfsId);
    }
  } catch (e) {
    console.error(e);
  }
  return ipfsId;
}
// Return buffer
export async function decodeImg(cid, privateKey, partnerKey) {
  const buff = await ipfs.get(cid);
  const fileJsonData = JSON.parse(buff[0].content.toString());
  const data = await decodeWithPublicKey(fileJsonData, privateKey, partnerKey, 'img');
  return data;
}
// upload one file
export async function getJsonFromIpfs(cid, key) {
  const result = {};
  let url;
  // console.log('Buffer.isBuffer(cid)', Buffer.isBuffer(cid), '--', cid);
  if (Buffer.isBuffer(cid)) {
    const blob = new Blob([cid], { type: 'image/jpeg' });
    url = URL.createObjectURL(blob);
  } else {
    url = process.env.REACT_APP_IPFS + cid;
  }
  const dimensions = await getImageDimensions(url);
  result.src = url;
  result.width = dimensions.w;
  result.height = dimensions.h;
  result.key = `Key-${key}`;

  return result;
}

function getImageDimensions(file) {
  return new Promise(resolved => {
    const i = new Image();
    i.onload = () => {
      resolved({ w: i.width, h: i.height });
    };
    i.src = file;
  });
}

export function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function saveMemCacheAPI(memoryContent, id) {
  if (!('caches' in window.self)) {
    // eslint-disable-next-line no-alert
    alert('Cache API is not supported.');
  } else {
    const cacheName = 'lovelock-private';
    caches.open(cacheName).then(cache => {
      if (!memoryContent) {
        // eslint-disable-next-line no-alert
        alert('Please select a file first!');
        return;
      }
      const response = new Response(JSON.stringify(memoryContent));
      cache.put(`memo/${id}`, response).then(() => {
        // alert('Saved!');
      });
    });
  }
}

export async function loadMemCacheAPI(id) {
  let json;
  if (!('caches' in window.self)) {
    alert('Cache API is not supported.');
  } else {
    const cacheName = 'lovelock-private';
    const cache = await caches.open(cacheName);
    const response = await cache.match(`memo/${id}`);
    json = response && (await response.json());
  }
  // console.log('response', json);
  return json;
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

  if (congratMonth < month && congratDate === date) {
    // Months between years.
    diffMonth = (year - congratYear) * 12;
    // Months between... months.
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

export async function savetoLocalStorage(value) {
  localStorage.removeItem('user');
  localStorage.setItem('user', JSON.stringify(value));
}
let cachesharekey = {};
export async function generateSharedKey(privateKeyA, publicKeyB) {
  let key = '';
  // console.log('a-b', privateKeyA, '-', publicKeyB);
  const objkey = privateKeyA + publicKeyB;
  if (cachesharekey[objkey]) {
    key = cachesharekey[objkey];
  } else {
    const sharekey = await eccrypto.derive(codec.toKeyBuffer(privateKeyA), codec.toKeyBuffer(publicKeyB));
    key = codec.toString(sharekey);
    cachesharekey = { [objkey]: key };
  }
  return key;
}
export async function encodeWithSharedKey(data, sharekey) {
  const encodeJsonData = encodeTx(data, sharekey, { noAddress: true });
  return encodeJsonData;
}
export async function decodeWithSharedKey(data, sharekey, encode) {
  return decodeTx(sharekey, data, encode);
}
export async function encodeWithPublicKey(data, privateKeyA, publicKeyB) {
  const sharekey = await generateSharedKey(privateKeyA, publicKeyB);
  return encodeWithSharedKey(data, sharekey);
}
export async function decodeWithPublicKey(data, privateKeyA, publicKeyB, encode = '') {
  const sharekey = await generateSharedKey(privateKeyA, publicKeyB);
  return decodeWithSharedKey(data, sharekey, encode);
}

export const wallet = {
  createAccountWithMneomnic(nemon, index = 0) {
    let mnemonic = nemon;
    if (!mnemonic) mnemonic = bip39.generateMnemonic();

    const privateKey = this.getPrivateKeyFromMnemonic(mnemonic, index);
    const { address, publicKey } = ecc.toPubKeyAndAddress(privateKey);

    return { mnemonic, privateKey, publicKey, address };
  },
  // default regular account.
  getAccountFromMneomnic(mnemonic, type = AccountType.REGULAR_ACCOUNT) {
    let pkey;
    let found;
    let resp;
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    const hdkey = this.getHdKeyFromMnemonic(mnemonic);
    for (let i = 0; !found; i++) {
      if (i > 100) {
        // there must be something wrong, because the ratio of regular account is 50%
        throw new Error('Too many tries deriving regular account from seed.');
      }
      pkey = codec.toKeyString(hdkey.deriveChild(i).privateKey);
      const { address, publicKey } = ecc.toPubKeyAndAddress(pkey);
      found = codec.isAddressType(address, type);
      resp = { mnemonic, privateKey: pkey, publicKey, address };
    }
    return resp;
  },
  getPrivateKeyFromMnemonic(mnemonic, index = 0) {
    const hdkey = this.getHdKeyFromMnemonic(mnemonic);
    const { privateKey } = hdkey.deriveChild(index);
    return codec.toKeyString(privateKey);
  },
  getHdKeyFromMnemonic(mnemonic) {
    if (!this.isMnemonic(mnemonic)) {
      throw new Error('wrong mnemonic format');
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed).derive(paths);
    return hdkey;
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
  isMnemonic(mnemonic) {
    if (bip39.validateMnemonic(mnemonic)) {
      return true;
    }
    return false;
  },
};

