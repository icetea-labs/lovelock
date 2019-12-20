import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { getContract } from '../service/tweb3';
import { sendTxUtil } from './utils';
import { setNeedAuth as actionSetNeedAuth } from '../store/actions/account';

// use for 'remember me' checkbox
export function useRemember() {
  const [value, _setValue] = useState(window.localStorage['remember'] !== '0');
  const setValue = val => {
    const boolValue = !!val;
    _setValue(boolValue);
    window.localStorage['remember'] = boolValue ? '1' : '0';
  };

  return [value, setValue];
}

/* usage
const tx = useTx()
tx.sendCommit
tx.sendAsync
tx.sendSync
*/
export function useTx({ privacy, address } = {}) {
  const ms = getContract(address).methods;
  const keyName = !privacy ? 'tokenKey' : 'privateKey';
  const key = useSelector(state => state.account[keyName]);
  const from = useSelector(state => state.account.address);
  const signers = useSelector(state => state.account.tokenAddress);
  const defaultOpts = { from, signers };
  const dispatch = useDispatch();

  const make = m => (method, ...params) => {
    const send = ms[method](...params)[m];
    if (key) {
      console.log('with key', m, method, params);
      return send(defaultOpts);
    }

    return new Promise((resolve, reject) => {
      const sendTx = opts => {
        console.log('with authen', m, method, params);
        const sendOpts = opts ? { from: opts.address, signers: opts.tokenAddress } : defaultOpts
        return send(sendOpts)
          .then(resolve)
          .catch(reject);
      };
      dispatch(actionSetNeedAuth(sendTx));
    });
  };

  return ['sendCommit', 'sendAsync', 'sendSync'].reduce((o, m) => {
    o[m] = make(m);
    return o;
  }, {});
}

export function sendTransaction({ address, tokenAddress }, funcName, ...params) {
  console.log('address, tokenAddress', address, tokenAddress);
  console.log('funcName, params', funcName, params);
  return sendTxUtil(funcName, params, { address, tokenAddress });
}

// For component class where you cannot use hooks
export function sendTxWithAuthen({ tokenKey, address, tokenAddress, dispatch }, funcName, ...params) {
  if (tokenKey) {
    return sendTxUtil(funcName, params, { address, tokenAddress });
  }

  return new Promise((resolve, reject) => {
    const sendTx = opts => {
      return sendTxUtil(funcName, params, opts || { address, tokenAddress })
        .then(resolve)
        .catch(reject);
    };
    dispatch(actionSetNeedAuth(sendTx));
  });
}

// For check earlier, before send tX
// e.g. IPFS -> TX, if user cancel at TX step, IPFS already upload
// so it is better to check for tokenKey before IPFS step
export function ensureToken({ tokenKey, dispatch }, callback) {
  if (tokenKey) {
    return callback();
  }

  return new Promise((resolve, reject) => {
    const wrap = opts => {
      return callback(opts)
        .then(resolve)
        .catch(reject);
    };
    dispatch(actionSetNeedAuth(wrap));
  });
}
