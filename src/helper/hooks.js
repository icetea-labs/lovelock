import { getContract } from '../service/tweb3'
import { useSelector, useDispatch } from 'react-redux';
import { sendTxUtil } from './utils'
import { setNeedAuth as actionSetNeedAuth } from '../store/actions/account';
import { useState } from 'react';

// use for 'remember me' checkbox
export function useRemember() {
    const [value, _setValue] = useState(window.localStorage['remember'] === '1')
    const setValue = value => {
        const boolValue = !!value
        _setValue(boolValue)
        window.localStorage['remember'] = boolValue ? '1' : '0'
    }

    return [value, setValue]
}

/* usage
const tx = useTx()
tx.sendCommit
tx.sendAsync
tx.sendSync
*/
export function useTx({ privacy, address } = {}) {
    const ms = getContract(address).methods
    const keyName = !privacy ? 'tokenKey' : 'privateKey'
    const key = useSelector(state => state.account[keyName])
    const from = useSelector(state => state.account.address)
    const signers = useSelector(state => state.account.tokenAddress)
    const opts = { from, signers }
    const dispatch = useDispatch()

    const make = m => (method, ...params) => {
        const send = ms[method](...params)[m]
        if (key) {
            console.log(m, method, params);
            return send(opts)
        }

        return new Promise((resolve, reject) => {
            const sendTx = () => {
                console.log(m, method, params);
                return send(opts).then(resolve).catch(reject)
            }
            dispatch(actionSetNeedAuth(sendTx))
        })
    }

    return ['sendCommit', 'sendAsync', 'sendSync'].reduce((o, m) => {
        o[m] = make(m)
        return o
    }, {})
}

export function sendTransaction({ address, tokenAddress }, funcName, ...params) {
    return sendTxUtil(funcName, params, { address, tokenAddress })
}

// For component class where you cannot use hooks
export function sendTxWithAuthen({ tokenKey, address, tokenAddress, dispatch }, funcName, ...params) {
    if (tokenKey) {
        return sendTxUtil(funcName, params, { address, tokenAddress })
    }

    return new Promise((resolve, reject) => {
        const sendTx = () => {
            return sendTxUtil(funcName, params, { address, tokenAddress }).then(resolve).catch(reject)
        }
        dispatch(actionSetNeedAuth(sendTx))
    })
}

// For check earlier, before send tX
// e.g. IPFS -> TX, if user cancel at TX step, IPFS already upload
// so it is better to check for tokenKey before IPFS step
export function ensureToken({ tokenKey, dispatch }, callback) {
    if (tokenKey) {
        return callback()
    }

    return new Promise((resolve, reject) => {
        const wrap = () => {
            return callback().then(resolve).catch(reject)
        }
        dispatch(actionSetNeedAuth(wrap))
    })
}