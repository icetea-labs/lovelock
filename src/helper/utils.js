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

const paths = 'm’/44’/349’/0’/0';

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
  recoverAccountFromMneomnic(mnemonic, options = { index: 0, type: AccountType.REGULAR_ACCOUNT }) {
    const typeTMP =
      options.type === AccountType.BANK_ACCOUNT ? AccountType.BANK_ACCOUNT : AccountType.REGULAR_ACCOUNT;
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

export const checkDevice = {
  isOldBrowser(e) {},
  isMobile() {
    let check = false;
    (a => {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  },
};
