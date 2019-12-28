import { IceteaWeb3 } from "@iceteachain/web3";

const instances = {}
const contracts = {}

const MAIN_URL = process.env.REACT_APP_RPC
const WS_URL = process.env.REACT_APP_WS_RPC
const HTTP_URL = process.env.REACT_APP_HTTP_RPC
let CONTRACT = process.env.REACT_APP_CONTRACT

export const getWeb3 = (url = MAIN_URL) => {
    if (!instances[url]) {
        instances[url] = new IceteaWeb3(process.env.REACT_APP_RPC)
    }
    return instances[url]
}

export const getWsWeb3 = () => getWeb3(WS_URL)
export const getHttpWeb3 = () => getWeb3(HTTP_URL)

export const getContract = (address = CONTRACT) => {
    if (!contracts[address]) {
        contracts[address] = getWeb3().contract(address)
    }
    return contracts[address]
}

export const getAliasContract = () => getContract('system.alias')
export const getDidContract = () => getContract('system.did')

export const grantAccessToken = (mainAddress, tokenAddress, remember, sendType = 'sendCommit') => {
    const did = getDidContract().methods;
    const expire = remember ? process.env.REACT_APP_TIME_EXPIRE : process.env.REACT_APP_DEFAULT_TIME_EXPIRE;

    const method = did.grantAccessToken(mainAddress, [process.env.REACT_APP_CONTRACT, 'system.did'], tokenAddress, +expire)
    return method[sendType]({ from: mainAddress })
}

// ensure contract address
export const ensureContract = () => {
    const contract = CONTRACT
    if (contract.indexOf('.') < 0) return Promise.resolve(getContract(contract))
    return getAliasContract().methods.resolve(contract).call().then(c => {
        CONTRACT = c
        const contractObject = getWeb3().contract(c)
        contracts[contract] = contracts[c] = contractObject
        return contractObject
    })
}

export default getWeb3;
