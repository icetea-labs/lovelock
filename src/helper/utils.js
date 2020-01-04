import React from 'react';
import Hash from 'ipfs-only-hash';
import { ipfs, createIpfsClient } from '../service/ipfs';
import { toPublicKey, stableHashObject, sign, toPubKeyAndAddress, toPubKeyAndAddressBuffer } from '@iceteachain/common/src/ecc';
import { 
  decode as codecDecode,
  toString as codecToString,
  toDataString as codecToDataString,
  toKeyBuffer as codecToKeyBuffer,
  toKeyString as codecToKeyString,
  isAddressType as codecIsAddressType,
 } from '@iceteachain/common/src/codec';
import { AccountType } from '@iceteachain/common/src/enum';


import moment from 'moment';
import {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeedSync,
} from 'bip39';
import HDKey from 'hdkey';
// import eccrypto from 'eccrypto';
import { encodeTx } from './encode';
import { getWeb3, getContract, getAliasContract } from '../service/tweb3';
import { decodeTx, decode } from './decode';
import { getTagsInfo } from "./account";

// because we do not support private locks/memoris yet
// let's use a fake eccrypto
// we will review things later when we enable private locks/memories
const eccrypto = {
  derive: function() {
    return 0
  }
}

const paths = 'm’/44’/349’/0’/0';

export const contract = process.env.REACT_APP_CONTRACT;
export const ipfsGateway = process.env.REACT_APP_IPFS;
export const ipfsAltGateway = process.env.REACT_APP_ALT_IPFS;

export function waitForHtmlTags(
  selector,
  callback,
  { timeout = 3000, step = 100, rootElement, func = 'querySelectorAll', testProp = 'length', timeoutCallBack } = {}
) {
  if (timeout < 0) {
    timeoutCallBack && timeoutCallBack();
    return;
  }

  var el = (rootElement || document)[func](selector);
  if (el && (!testProp || el[testProp])) {
    callback(el);
  } else {
    setTimeout(() => {
      waitForHtmlTags(selector, callback, {
        timeout: timeout - step,
        step,
        rootElement,
        func,
        testProp,
        timeoutCallBack,
      });
    }, step);
  }
}

export function ensureHashUrl(url, gateway = ipfsGateway) {
  return url.indexOf(':') < 0 ? gateway + url : url;
}

export function resolveBlogHashUrls(json, gateway) {
  if (!json || !json.blocks || !json.blocks.length) {
    return json;
  }
  const blocks = json.blocks;
  for (const b of blocks) {
    if (b.type === 'image' && b.data.url && b.data.url.indexOf(':') < 0) {
      b.data.url = ensureHashUrl(b.data.url, gateway);
    }
  }
  return json;
}

export function fetchIpfsJson(hash, { gateway = ipfsGateway, signal } = {}) {
  return fetch(gateway + hash, signal ? { signal } : undefined).then(r => resolveBlogHashUrls(r.json(), gateway));
}

export function fetchJsonWithFallback(
  hash,
  mainGateway,
  fallbackGateway,
  {
    timeout = 10, // almost race
    signal,
    abortAtTimeout, // whether to abort main gateway when timeout
    abortMain, // whether to abort main gateway when resolved
    abortFallback, // whether to abort fallback gateway when resolve
  } = {}
) {
  if (signal && signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise((resolve, reject) => {
    const mainController = new AbortController();
    const secondController = signal ? new AbortController() : undefined;

    const timeoutId = setTimeout(() => {
      abortAtTimeout && mainController.abort();
      fetch(fallbackGateway + hash, { signal: secondController && secondController.signal })
        .then(response => response.json())
        .then(json => {
          resolve({ json: resolveBlogHashUrls(json, fallbackGateway), gateway: fallbackGateway });
          abortMain && mainController.abort();
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            reject(err);
          }
        });
    }, timeout);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        mainController.abort();
        secondController && secondController.abort();
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }

    fetch(mainGateway + hash, { signal: mainController.signal })
      .then(response => {
        clearTimeout(timeoutId);
        return response.json();
      })
      .then(json => {
        resolve({ json: resolveBlogHashUrls(json, mainGateway), gateway: mainGateway });
        if (abortFallback) {
          clearTimeout(timeoutId);
          secondController && secondController.abort();
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          reject(err);
        }
      });
  });
}

export function fetchMainFirstIpfsJson(hash, options = {}) {
  if (options.abortMain == null) {
    options.abortMain = true;
  }
  return fetchJsonWithFallback(hash, ipfsGateway, ipfsAltGateway, options);
}

export function fetchAltFirstIpfsJson(hash, options = {}) {
  if (options.timeout == null) {
    options.timeout = 1500; // wait a little to reduce load for our main gateway
  }
  if (options.abortFallback == null) {
    options.abortFallback = true;
  }
  return fetchJsonWithFallback(hash, ipfsAltGateway, ipfsGateway, options);
}

export function smartFetchIpfsJson(hash, options = {}) {
  let func = fetchMainFirstIpfsJson;
  if (options.timestamp && Date.now() - options.timestamp > 100000 * 60 * 1000) {
    func = fetchAltFirstIpfsJson;
  }
  return func(hash, options);
}

export function signalPrerenderDone(wait) {
  if (wait == null) {
    wait = +process.env.REACT_APP_PRERENDER_WAIT || 100;
  }
  window.setTimeout(() => {
    window.prerenderReady = true;
  }, wait);
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

export function makeLockName(p, prefix = '') {
  return prefix + (p.sender === p.receiver ? `${p.s_name}'s Journal` : `${p.s_name} ❤️ ${p.r_name}`);
}

export function callPure(funcName, params) {
  return callReadOrPure(funcName, params, 'callPureContractMethod');
}
export function callView(funcName, params) {
  return callReadOrPure(funcName, params, 'callReadonlyContractMethod');
}
function callReadOrPure(funcName, params, method) {
  return getWeb3()[method](contract, funcName, params || []);
}

export async function sendTxUtil(funcName, params, opts) {
  const ct = getContract();
  const sendType = opts.sendType || 'sendCommit';

  console.log(sendType, funcName, params);

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

export function getAccountInfo(address) {
  return getWeb3().getAccountInfo(address);
}

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function saveToIpfs(files) {
  if (!files || !files.length) return [];

  // simple upload
  const isBuffer = Buffer.isBuffer(files[0]);
  if (files.length !== 1) {
    files = files.map(f => ({ content: f }));
  }

  let contentBuffer = files;
  if (!isBuffer) {
    const data = [];
    for (let i = 0; i < files.length; i++) {
      data.push(readFileAsync(files[i]));
    }
    contentBuffer = await Promise.all(data);
  }

  // get hash and sign
  const preHash = [];
  for (let i = 0; i < contentBuffer.length; i++) {
    let buffer = '';
    if (files.length !== 1) {
      buffer = Buffer.from(contentBuffer[i].content);
    } else {
      buffer = Buffer.from(contentBuffer[i]);
    }
    preHash.push(Hash.of(buffer));
  }

  const fileHashes = await Promise.all(preHash);
  // const signs = {};
  const sessionData = sessionStorage.getItem('sessionData') || localStorage.getItem('sessionData');
  const token = codecDecode(Buffer.from(sessionData, 'base64'));
  const tokenKey = codecToString(token.tokenKey);
  const pubkey = toPublicKey(tokenKey);
  let user = localStorage.getItem('user') || sessionStorage.getItem('user');
  user = JSON.parse(user);
  const from = user.address;
  const app = process.env.REACT_APP_CONTRACT

  const time = Date.now();
  const hash32bytes = stableHashObject({ app, fileHashes, from, time });
  const signature = sign(hash32bytes, tokenKey).signature;
  const authData = JSON.stringify({ app, from, pubkey, sign: codecToDataString(signature), time });

  const newIpfs = createIpfsClient(authData)

  return newIpfs.add([...contentBuffer]).then(results => {
    return results.map(el => {
      return el.hash;
    });
  });
}

// upload one file
export function saveFileToIpfs(files) {
  return saveToIpfs(files).then(ids => ids[0]);
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
    throw e;
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
  let blob;
  if (Buffer.isBuffer(cid)) {
    blob = new Blob([cid], { type: 'image/jpeg' });
    url = URL.createObjectURL(blob);
  } else {
    url = process.env.REACT_APP_IPFS + cid;
  }
  const dimensions = await getImageDimensions(url);
  result.src = url;
  result.width = dimensions.w;
  result.height = dimensions.h;
  result.key = `Key-${key}`;

  if (blob) {
    URL.revokeObjectURL(url);
  }

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

export function isJsonString(str) {
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
          <span>{`3 days left to ${diffDate + 3} days anniversary.`}</span>
        </div>
      </div>
    );
  }
  if (diffDate > 0 && diffDate % 100 === 98) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`2 days left to ${diffDate + 2} days anniversary.`}</span>
        </div>
      </div>
    );
  }
  if (diffDate > 0 && diffDate % 100 === 99) {
    return (
      <div className="summaryCongrat">
        <div className="congratContent">
          <span>{`1 day left to ${diffDate + 1} days anniversary.`}</span>
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
      s: '%d sec',
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
    const sharekey = await eccrypto.derive(codecToKeyBuffer(privateKeyA), codecToKeyBuffer(publicKeyB));
    key = codecToString(sharekey);
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
    if (!mnemonic) mnemonic = generateMnemonic();

    const privateKey = this.getPrivateKeyFromMnemonic(mnemonic, index);
    const { address, publicKey } = toPubKeyAndAddress(privateKey);

    return { mnemonic, privateKey, publicKey, address };
  },
  // default regular account.
  getAccountFromMneomnic(mnemonic, type = AccountType.REGULAR_ACCOUNT) {
    let pkey;
    let found;
    let resp;
    if (!mnemonic) mnemonic = generateMnemonic();
    const hdkey = this.getHdKeyFromMnemonic(mnemonic);
    for (let i = 0; !found; i++) {
      if (i > 100) {
        // there must be something wrong, because the ratio of regular account is 50%
        throw new Error('Too many tries deriving regular account from seed.');
      }
      pkey = codecToKeyString(hdkey.deriveChild(i).privateKey);
      const { address, publicKey } = toPubKeyAndAddress(pkey);
      found = codecIsAddressType(address, type);
      resp = { mnemonic, privateKey: pkey, publicKey, address };
    }
    return resp;
  },
  getPrivateKeyFromMnemonic(mnemonic, index = 0) {
    const hdkey = this.getHdKeyFromMnemonic(mnemonic);
    const { privateKey } = hdkey.deriveChild(index);
    return codecToKeyString(privateKey);
  },
  getHdKeyFromMnemonic(mnemonic) {
    if (!this.isMnemonic(mnemonic)) {
      throw new Error('wrong mnemonic format');
    }
    const seed = mnemonicToSeedSync(mnemonic);
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
    const privateKey = codecToString(account.privateKey);
    return privateKey;
  },
  getAddressFromPrivateKey(privateKey) {
    const { address } = toPubKeyAndAddressBuffer(privateKey);
    return address;
  },
  isMnemonic(mnemonic) {
    return !!validateMnemonic(mnemonic);
  },
};

export const applyRotation = (file, orientation, maxWidth) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;

      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        let { width, height } = image;

        const [outputWidth, outputHeight] = orientation >= 5 && orientation <= 8 ? [height, width] : [width, height];

        const scale = outputWidth > maxWidth ? maxWidth / outputWidth : 1;

        width *= scale;
        height *= scale;

        // set proper canvas dimensions before transform & export
        canvas.width = outputWidth * scale;
        canvas.height = outputHeight * scale;
        // transform context before drawing image
        switch (orientation) {
          case 3:
            context.transform(-1, 0, 0, -1, width, height);
            break;
          case 6:
            context.transform(0, -1, 1, 0, 0, width);
            break;
          case 8:
            context.transform(0, 1, -1, 0, height, 0);
            break;
          default:
            break;
        }
        // draw image
        context.drawImage(image, 0, 0, width, height);
        // export base64
        resolve(canvas.toDataURL('image/jpeg'));
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  });

export function imageResize(oldFile, newFile) {
  const { name, type } = oldFile;
  const byteString = atob(newFile.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ia], { type });
  const parseFile = new File([blob], name, { type });
  const saveFile = [parseFile];
  return saveFile;
}
export function handleError(err, action) {
  console.error(err);
  let msg = `An error occurred while ${action}`;
  if (err.response && err.response.status === 401)
    msg = 'You are not approved to create content. Please contact customer support to unlock your account first.';
  if (typeof err !== 'object') return msg;
  const fail = (err.deliver_tx && err.deliver_tx.code) || (err.check_tx && err.check_tx.code);
  if (fail) {
    msg = err.deliver_tx.log || err.check_tx.log;
  }
  return msg;
}

export async function getUserSuggestions(value) {
  let escapedValue = escapeRegexCharacters(value.trim().toLowerCase());
  // remove the first @ if it is there
  escapedValue = escapedValue.substring(escapedValue.indexOf('@') + 1)
  if (escapedValue.length < 3) {
    return [];
  }

  const regexText = `\^account\\..*${escapedValue}`
  const regex = new RegExp(regexText);
  
  let people = await getAliasContract()
    .methods.query(regex)
    .call()
    .then(result => {
      return Object.keys(result).map(key => {
        const nick = key.substring(key.indexOf('.') + 1);
        return { nick, address: result[key].address };
      });
    })
    .catch(err => {
      console.warn(err)
      return []
    })

  if (!people.length) return []
  people = people.slice(0, 10);

  return Promise.all(people.reduce((ps, p) => {
    ps.push(getTagsInfo(p.address).then(tag => {
      p.avatar = tag.avatar
    }))
    return ps
  }, []))
  .then(() => people)
  .catch(err => {
    console.warn(err)
    return []
  })

}

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function copyToClipboard(text, enqueueSnackbar) {
  const dummy = document.createElement('textarea');
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
  enqueueSnackbar && enqueueSnackbar('Copied', { variant: 'success' });
}