import { IceteaWeb3 } from "@iceteachain/web3";
const tweb3 = new IceteaWeb3(process.env.REACT_APP_RPC);
tweb3.wallet.importAccount(process.env.privateKey1);
tweb3.wallet.importAccount(process.env.privateKey2);
export default tweb3;