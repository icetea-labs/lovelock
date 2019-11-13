import { getContract } from '../service/tweb3'
import { useSelector, useDispatch } from 'react-redux';
import { setNeedAuth } from '../store/actions/account';

/* usage

const tx = useTx(address) // address is optional
tx.sendCommit
tx.sendAsync
tx.sendSync

*/
export function useTx(address) {
    const ms = getContract(address).methods
    const tokenKey = useSelector(state => state.account.tokenKey)
    const from = useSelector(state => state.account.address)
    const signers = useSelector(state => state.account.tokenAddress)
    const dispatch = useDispatch()

    const make = m => (method, ...params) => {
        const send = ms[method](...params)[m]
        if (tokenKey) {
            return send(from, signers)
        }

        return new Promise((resolve, reject) => {
            const sendTx = () => {
                return send(from, signers).then(resolve).catch(reject)
            }
            dispatch(setNeedAuth(sendTx))
        })
    }

    return ['sendCommit', 'sendAsync', 'sendSync'].reduce((o, m) => {
        o[m] = make(m)
        return o
    }, {})
}